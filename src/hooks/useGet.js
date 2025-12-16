import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export const useGet = ({ query, name, category }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let supabaseQuery = supabase.from("quotes").select("*");

      // Filtre par auteur (partial match)
      if (name) {
        supabaseQuery = supabaseQuery.ilike("quote_author", `%${name}%`);
      }

      // Filtre par catégorie (partial match)
      if (category) {
        supabaseQuery = supabaseQuery.ilike("category", `%${category}%`);
      }

      // Recherche textuelle
      if (query && query.trim().length > 0) {
        const searchTerm = query.trim();
        supabaseQuery = supabaseQuery.or(
          `quote_text.ilike.%${searchTerm}%,quote_author.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
        );
      }

      const { data: results, error: queryError } = await supabaseQuery;

      if (queryError) throw queryError;

      setData(results);
      setIsLoading(false);
    } catch (err) {
      console.error("Erreur Supabase:", err);
      setError(err.message);
      setData([]);
      setIsLoading(false);
    }
  }, [query, name, category]);
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return { data, isLoading, error, count: data?.length || 0 };
};
