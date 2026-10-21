const { createClient } = require("@supabase/supabase-js");

function normalizeAccents(str) {
  return typeof str === "string"
    ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    : "";
}

function sanitizePostgrest(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[,()"\\]/g, " ").replace(/\s+/g, " ").trim();
}

module.exports = async function handler(req, res) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Internal Server Error" });
  }

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=600"
  );

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const queryParams = req.query || {};
    const { category, name, query } = queryParams;

    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 8));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let supabaseQuery = supabase
      .from("quotes")
      .select("id, quote_text, quote_author, category", { count: "exact" });

    if (category && category.trim().length > 0) {
      const cleanCategory = sanitizePostgrest(category);
      if (cleanCategory) {
        const normalizedCategory = normalizeAccents(cleanCategory);
        if (normalizedCategory !== cleanCategory) {
          supabaseQuery = supabaseQuery.or(
            `category.ilike.%${cleanCategory}% , category.ilike.%${normalizedCategory}%`
          );
        } else {
          supabaseQuery = supabaseQuery.ilike("category", `%${cleanCategory}%`);
        }
      }
    }

    if (name && name.trim().length > 0) {
      const cleanName = sanitizePostgrest(name);
      if (cleanName) {
        const normalizedName = normalizeAccents(cleanName);
        if (normalizedName !== cleanName) {
          supabaseQuery = supabaseQuery.or(
            `quote_author.ilike.%${cleanName}% , quote_author.ilike.%${normalizedName}%`
          );
        } else {
          supabaseQuery = supabaseQuery.ilike("quote_author", `%${cleanName}%`);
        }
      }
    }

    if (query && query.trim().length > 0) {
      const cleanQuery = sanitizePostgrest(query);
      if (cleanQuery) {
        const normalizedSearch = normalizeAccents(cleanQuery);
        const terms =
          normalizedSearch !== cleanQuery
            ? [cleanQuery, normalizedSearch]
            : [cleanQuery];

        const filterStr = terms
          .map(
            (term) =>
              `quote_text.ilike.%${term}% , quote_author.ilike.%${term}% , category.ilike.%${term}%`
          )
          .join(" , ");

        supabaseQuery = supabaseQuery.or(filterStr);
      }
    }

    supabaseQuery = supabaseQuery.range(from, to);

    const { data: results, count, error: queryError } = await supabaseQuery;

    if (queryError) {
      console.error("Quotes API error:", queryError.message || queryError);
      return res.status(500).json({ error: "Failed to fetch quotes" });
    }

    return res.status(200).json({
      data: results || [],
      count: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Quotes API error:", error.message || error);
    return res.status(500).json({ error: "Failed to fetch quotes" });
  }
};
