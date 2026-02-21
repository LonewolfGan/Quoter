const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

module.exports = async (req, res) => {
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: "Server misconfigured: missing Supabase server credentials",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const isVercelCron = req.headers["user-agent"]?.includes("vercel-cron");
  const hasVercelOIDC = !!req.headers["x-vercel-oidc-token"];
  const isManualWithToken = req.query.token === process.env.CRON_SECRET;

  if (!isVercelCron && !hasVercelOIDC && !isManualWithToken) {
    return res.status(401).json({
      error: "Unauthorized",
      hint: "Use Vercel Cron or provide valid token",
    });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

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

    // 2. Vérifie si l'article existe déjà
    const { data: existingArticle } = await supabase
      .from("articles")
      .select("*")
      .eq("published_date", today)
      .maybeSingle();

    if (existingArticle) {
      return res.status(200).json({
        message: "Article already exists for today",
        article: existingArticle.title,
      });
    }

    // 3. Genere l'article avec Groq (server only)
    const { generateArticle } = require("./lib/groqArticleGenerator");
    const article = await generateArticle(quote, today);

    // 4. Sauvegarde dans Supabase
    const { data: savedArticle, error: saveError } = await supabase
      .from("articles")
      .insert([article])
      .select()
      .single();

    if (saveError) throw saveError;

    return res.status(200).json({
      success: true,
      date: today,
      quote: quote.quote_text,
      article: savedArticle.title,
      triggered_by: isVercelCron ? "Vercel Cron" : "Manual trigger",
    });
  } catch (error) {
    console.error("Erreur:", error);
    return res.status(500).json({ error: error.message });
  }
};
