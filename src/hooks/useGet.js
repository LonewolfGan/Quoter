import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export const useGet = ({ query, name, category, enabled = true }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fonction de normalisation pour gérer les accents
      const normalize = (str) =>
        str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

      const selectFields = "id, quote_text, quote_author, category";
      let supabaseQuery = supabase.from("quotes").select(selectFields);

      // Construction des filtres
      if (name) {
        const normalizedName = normalize(name);
        if (normalizedName !== name) {
          // Si on a des accents, on cherche les deux
          supabaseQuery = supabaseQuery.or(
            `quote_author.ilike.%${name}%,quote_author.ilike.%${normalizedName}%`,
          );
        } else {
          supabaseQuery = supabaseQuery.ilike("quote_author", `%${name}%`);
        }
      }

      if (category) {
        const normalizedCategory = normalize(category);
        if (normalizedCategory !== category) {
          // Si on a des accents, on cherche les deux versions (ex: "Amitié" et "Amitie")
          supabaseQuery = supabaseQuery.or(
            `category.ilike.%${category}%,category.ilike.%${normalizedCategory}%`,
          );
        } else {
          supabaseQuery = supabaseQuery.ilike("category", `%${category}%`);
        }
      }

      if (query && query.trim().length > 0) {
        const searchTerm = query.trim();
        const normalizedSearch = normalize(searchTerm);

        if (normalizedSearch !== searchTerm) {
          // Recherche très large incluant les versions accentuées et non-accentuées
          const terms = [searchTerm, normalizedSearch];
          const filterStr = terms
            .map(
              (term) =>
                `quote_text.ilike.%${term}%,quote_author.ilike.%${term}%,category.ilike.%${term}%`,
            )
            .join(",");
          supabaseQuery = supabaseQuery.or(filterStr);
        } else {
          supabaseQuery = supabaseQuery.or(
            `quote_text.ilike.%${searchTerm}%,quote_author.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`,
          );
        }
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
    if (!enabled) return;
    fetchQuotes();
  }, [fetchQuotes, enabled]);

  return { data, isLoading, error, count: data?.length || 0 };
};
