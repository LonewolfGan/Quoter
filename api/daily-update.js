const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY // ✅ Corrigé
);

module.exports = async (req, res) => {
  // Log de debug
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    ip: req.headers["x-forwarded-for"] || req.headers["x-real-ip"],
    userAgent: req.headers["user-agent"],
    hasAuth: !!req.headers.authorization,
  };

  console.log("📥 Requête reçue:", JSON.stringify(logData, null, 2));

  // Sécurité : vérifie le token secret
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("❌ Authentification échouée");
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("✅ Authentification réussie");

  try {
    const today = new Date().toISOString().split("T")[0];
    console.log(`🕐 Cron job lancé pour ${today}`);

    // 1. Récupère la quote du jour
    const { count, error: countError } = await supabase
      .from("quotes")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - startOfYear) / 86400000);
    const index = dayOfYear % count;

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .range(index, index)
      .single();

    if (quoteError) throw quoteError;

    console.log(`✅ Quote récupérée: "${quote.quote_text}"`);

    // 2. Vérifie si l'article existe déjà
    const { data: existingArticle } = await supabase
      .from("articles")
      .select("*")
      .eq("published_date", today)
      .maybeSingle();

    if (existingArticle) {
      console.log("ℹ️ Article déjà existant");
      return res.status(200).json({
        message: "Article already exists for today",
        quote: quote.quote_text,
        article: existingArticle.title,
      });
    }

    // 3. Génère l'article avec Groq
    console.log("🤖 Génération de l'article...");
    const article = await generateArticle(quote, today);

    // 4. Sauvegarde dans Supabase
    const { data: savedArticle, error: saveError } = await supabase
      .from("articles")
      .insert([article])
      .select()
      .single();

    if (saveError) throw saveError;

    console.log(`✅ Article généré et sauvegardé: "${savedArticle.title}"`);

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
    console.error("❌ Erreur cron job:", error);
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

async function generateArticle(quote, today) {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY; // ✅ Sans REACT_APP_

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
        messages: [
          {
            role: "user",
            content: `Écris un article de blog complet et captivant en français sur cette citation :

"${quote.quote_text}" - ${quote.quote_author}

L'article doit contenir :
1. Un titre accrocheur et inspirant
2. Une introduction engageante (2-3 phrases)
3. Le contexte historique de la citation
4. 4 points clés d'analyse ou d'application pratique
5. Un exercice pratique pour le lecteur
6. Une conclusion inspirante

Format ta réponse UNIQUEMENT en JSON strict (sans texte avant ou après) :
{
  "title": "Titre de l'article",
  "excerpt": "Court résumé en 1-2 phrases",
  "intro": "Introduction",
  "context": "Contexte historique",
  "points": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "exercise": "Exercice pratique",
  "conclusion": "Conclusion"
}`,
          },
        ],
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  const articleData = JSON.parse(cleaned);

  return {
    id: quote.id,
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
