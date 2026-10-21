const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Internal Server Error" });
  }

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=600"
  );

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id } = req.query || {};

    if (id) {
      const sanitizedId = String(id).replace(/[^0-9a-zA-Z_-]/g, "");
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id, title, excerpt, author, category, read_time, published_date, content"
        )
        .eq("id", sanitizedId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) {
        return res.status(404).json({ error: "Article not found" });
      }
      return res.status(200).json({ data });
    }

    const limit = Math.min(50, Math.max(1, parseInt(req.query?.limit, 10) || 50));
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, excerpt, author, category, published_date, read_time")
      .order("published_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return res.status(200).json({ data: data || [] });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Articles API error:", error.message);
    }
    return res.status(500).json({ error: "Failed to fetch articles" });
  }
};
