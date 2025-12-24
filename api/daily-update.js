const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");

// ==================== SUPABASE CLIENT ====================
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

// ==================== CRON HANDLER ====================
module.exports = async (req, res) => {
  // 🔐 Sécurité Cron
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    console.log(`🕐 Cron lancé pour ${today}`);

    // ==================== 1. COUNT QUOTES ====================
    const { count, error: countError } = await supabase
      .from("quotes")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;
    if (!count || count === 0) {
      throw new Error("Aucune citation disponible");
    }

    // ==================== 2. SELECT QUOTE ====================
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - startOfYear) / 86400000);
    const index = dayOfYear % count;

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .range(index, index)
      .single(); // ✅ OBLIGATOIRE

    if (quoteError) throw quoteError;
    console.log(`✅ Quote: "${quote.quote_text}"`);

    // ==================== 3. CHECK ARTICLE EXISTENCE ====================
    const { data: existingArticle, error: articleCheckError } = await supabase
      .from("articles")
      .select("*")
      .eq("published_date", today)
      .maybeSingle(); // ✅ IMPORTANT

    if (articleCheckError) throw articleCheckError;

    if (existingArticle) {
      console.log("ℹ️ Article déjà existant");
      return res.status(200).json({
        message: "Article already exists",
        article: existingArticle.title,
      });
    }

    // ==================== 4. GENERATE ARTICLE ====================
    console.log("🤖 Génération de l’article...");
    const article = await generateArticle(quote, today);

    // ==================== 5. SAVE ARTICLE ====================
    const { data: savedArticle, error: saveError } = await supabase
      .from("articles")
      .insert([article])
      .select()
      .single(); // ✅ OBLIGATOIRE

    if (saveError) throw saveError;

    console.log(`✅ Article sauvegardé: "${savedArticle.title}"`);

    return res.status(200).json({
      success: true,
      date: today,
      quote: {
        text: quote.quote_text,
        author: quote.quote_author,
      },
      article: {
        id: savedArticle.id,
        title: savedArticle.title,
      },
    });
  } catch (error) {
    console.error("❌ Cron error:", error);

    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ==================== GROQ GENERATION ====================
async function generateArticle(quote, today) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY manquante");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `Écris un article de blog en français à partir de cette citation :

"${quote.quote_text}" - ${quote.quote_author}

Réponds UNIQUEMENT en JSON strict :
{
  "title": "",
  "excerpt": "",
  "intro": "",
  "context": "",
  "points": ["", "", "", ""],
  "exercise": "",
  "conclusion": ""
}`,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content;

  const cleaned = raw.replace(/```json|```/g, "").trim();
  const articleData = JSON.parse(cleaned);

  return {
    id: `${today}-${quote.id}`,
    type: "analysis",
    title: articleData.title,
    excerpt: articleData.excerpt,
    quote_text: quote.quote_text,
    author: quote.quote_author,
    category: quote.category || "Réflexion",
    read_time: "6 min",
    published_date: today,
    content: {
      intro: articleData.intro,
      context: articleData.context,
      points: articleData.points,
      exercise: articleData.exercise,
      conclusion: articleData.conclusion,
    },
  };
}
