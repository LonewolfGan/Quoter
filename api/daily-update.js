const crypto = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(500).json({
      error: "Server misconfigured: missing CRON_SECRET",
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(cronSecret);

  if (
    tokenBuf.length !== secretBuf.length ||
    !crypto.timingSafeEqual(tokenBuf, secretBuf)
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: "Server misconfigured: missing Supabase server credentials",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

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

    // 3. Genere l'article avec le générateur serveur
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
      triggered_by: "Cron trigger",
    });
  } catch (error) {
    console.error("Cron execution error:", error.message);
    return res.status(500).json({ error: "Internal generation error" });
  }
};
