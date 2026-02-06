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

      // Filtre par auteur (partial match) - Gestion des accents
      if (name) {
        const normalizedName = normalize(name);
        supabaseQuery = supabaseQuery.ilike(
          "quote_author",
          `%${normalizedName}%`
        );
      }

      // Filtre par catégorie (partial match) - Gestion des accents
      if (category) {
        const normalizedCategory = normalize(category);
        supabaseQuery = supabaseQuery.ilike(
          "category",
          `%${normalizedCategory}%`
        );
      }

      // Recherche textuelle
      if (query && query.trim().length > 0) {
        const searchTerm = query.trim();
        const normalizedSearch = normalize(searchTerm);

        // Construction de la requête OR avec le terme normalisé (plus robuste selon le retour utilisateur)
        supabaseQuery = supabaseQuery.or(
          `quote_text.ilike.%${normalizedSearch}%,quote_author.ilike.%${normalizedSearch}%,category.ilike.%${normalizedSearch}%`
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
    if (!enabled) return;
    fetchQuotes();
  }, [fetchQuotes, enabled]);

  return { data, isLoading, error, count: data?.length || 0 };
};
