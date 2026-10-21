import { useEffect, useState } from "react";

export const useGet = ({
  query,
  name,
  category,
  page,
  limit,
  enabled = true,
} = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchQuotes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = [];
        if (query) {
          params.push(`query=${encodeURIComponent(query)}`);
        }
        if (name) {
          params.push(`name=${encodeURIComponent(name)}`);
        }
        if (category) {
          params.push(`category=${encodeURIComponent(category)}`);
        }
        if (page !== undefined && page !== null) {
          params.push(`page=${encodeURIComponent(page)}`);
        }
        if (limit !== undefined && limit !== null) {
          params.push(`limit=${encodeURIComponent(limit)}`);
        }

        const queryString = params.join("&");
        const url = queryString ? `/api/quotes?${queryString}` : "/api/quotes";

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          let errorMessage = `HTTP error ${res.status}`;
          try {
            const errorBody = await res.json();
            if (errorBody && errorBody.error) {
              errorMessage = errorBody.error;
            }
          } catch (_) {}
          throw new Error(errorMessage);
        }

        const json = await res.json();
        setData(json.data || []);
        setCount(typeof json.count === "number" ? json.count : 0);
        setIsLoading(false);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        console.error("Erreur useGet:", err);
        setError(err.message || "Failed to fetch quotes");
        setData([]);
        setCount(0);
        setIsLoading(false);
      }
    };

    fetchQuotes();

    return () => {
      controller.abort();
    };
  }, [query, name, category, page, limit, enabled]);

  return { data, isLoading, error, count };
};
