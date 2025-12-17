import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../utils/supabaseClient";

const QuoteContext = createContext();

export const QuoteProvider = ({ children }) => {
  const [dailyQuote, setDailyQuote] = useState(null);
  const [dailyArticle, setDailyArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /* =====================================================
     FALLBACK ARTICLE
  ===================================================== */
  const createFallbackArticle = useCallback((quote, today) => {
    return {
      id: quote.id,
      type: "analysis",
      title: `Analyse : "${quote.quote_text}"`,
      excerpt: `Découvrez le sens profond de cette citation de ${quote.quote_author}`,
      quote_text: quote.quote_text,
      author: quote.quote_author,
      category: quote.category,
      read_time: "5 min",
      published_date: today,
      content: {
        intro: `Cette citation de ${quote.quote_author} nous invite à réfléchir sur un aspect fondamental de la vie.`,
        context: `${quote.quote_author} est reconnu pour sa sagesse et sa perspicacité unique.`,
        points: [
          "Réflexion approfondie sur le sens des mots",
          "Application pratique dans la vie quotidienne",
          "Contexte historique et culturel de l'époque",
          "Pertinence et impact aujourd'hui",
        ],
        exercise:
          "Prenez 5 minutes pour méditer sur cette citation et notez ce qu'elle évoque pour vous personnellement.",
        conclusion:
          "Cette citation continue d'inspirer et de guider des générations.",
      },
    };
  }, []);

  /* =====================================================
     GENERATE ARTICLE (GROQ)
  ===================================================== */
  const generateArticle = useCallback(
    async (quote, today) => {
      const apiKey = process.env.REACT_APP_GROQ_API_KEY;

      try {
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
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();

        const articleData = JSON.parse(cleaned);

        const generatedArticle = {
          id: quote.id,
          type: "analysis",
          title: articleData.title,
          excerpt: articleData.excerpt,
          quote_text: quote.quote_text,
          author: quote.quote_author,
          category: quote.category,
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

        const { data: savedArticle, error } = await supabase
          .from("articles")
          .upsert([generatedArticle], { onConflict: "id" })
          .select()
          .single();

        if (error) {
          console.error("❌ Erreur Supabase upsert:", error);
          throw error;
        }

        localStorage.setItem(
          "dailyArticle",
          JSON.stringify({ date: today, article: savedArticle })
        );

        return savedArticle;
      } catch (err) {
        console.error("❌ Erreur génération:", err);

        // Crée et sauvegarde le fallback
        const fallback = createFallbackArticle(quote, today);

        try {
          const { data: savedFallback, error: fallbackError } = await supabase
            .from("articles")
            .upsert([fallback], { onConflict: "id" })
            .select()
            .single();

          if (fallbackError) {
            console.error("❌ Erreur sauvegarde fallback:", fallbackError);
            return fallback;
          }

          return savedFallback;
        } catch (fallbackErr) {
          console.error("❌ Erreur fallback:", fallbackErr);
          return fallback;
        }
      }
    },
    [createFallbackArticle]
  );

  /* =====================================================
     LOAD DAILY QUOTE
  ===================================================== */
  const loadDailyQuote = useCallback(async (today) => {
    const cached = localStorage.getItem("dailyQuote");
    if (cached) {
      try {
        const { date, quote } = JSON.parse(cached);
        if (date === today) {
          setDailyQuote(quote);
          setIsLoading(false);
          return quote;
        }
      } catch (e) {
        localStorage.removeItem("dailyQuote");
      }
    }

    try {
      const { count, error: countError } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const dayOfYear = Math.floor((now - startOfYear) / 86400000);
      const index = dayOfYear % count;

      const { data, error: fetchError } = await supabase
        .from("quotes")
        .select("*")
        .range(index, index)
        .single();

      if (fetchError) throw fetchError;

      localStorage.setItem(
        "dailyQuote",
        JSON.stringify({ date: today, quote: data })
      );

      setDailyQuote(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error("❌ Erreur chargement quote:", err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, []);

  /* =====================================================
     LOAD OR GENERATE ARTICLE
  ===================================================== */
  const loadOrGenerateArticle = useCallback(
    async (today, quote) => {
      // Vérifie le cache
      const cached = localStorage.getItem("dailyArticle");
      if (cached) {
        try {
          const { date, article } = JSON.parse(cached);
          if (date === today) {
            setDailyArticle(article);
            return;
          }
        } catch (e) {
          localStorage.removeItem("dailyArticle");
        }
      }

      // Vérifie dans Supabase
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("published_date", today) // ✅ Corrigé : published_date
          .single();

        // Article trouvé
        if (data && !error) {
          setDailyArticle(data);
          localStorage.setItem(
            "dailyArticle",
            JSON.stringify({ date: today, article: data })
          );
          return;
        }

        // Article n'existe pas (erreur PGRST116)
        if (error && error.code === "PGRST116") {
          setIsGenerating(true);
          const article = await generateArticle(quote, today);
          setDailyArticle(article);
          setIsGenerating(false);
          return;
        }

        // Autre erreur
        if (error) {
          throw error;
        }
      } catch (err) {
        console.error("❌ Erreur loadOrGenerateArticle:", err);

        // En cas d'erreur, génère quand même
        setIsGenerating(true);
        const article = await generateArticle(quote, today);
        setDailyArticle(article);
        setIsGenerating(false);
      }
    },
    [generateArticle]
  );

  /* =====================================================
     LOAD DAILY CONTENT
  ===================================================== */
  const loadDailyContent = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const quote = await loadDailyQuote(today);
    if (quote) {
      await loadOrGenerateArticle(today, quote);
    }
  }, [loadDailyQuote, loadOrGenerateArticle]);

  /* =====================================================
     EFFECT
  ===================================================== */
  useEffect(() => {
    loadDailyContent();

    const interval = setInterval(() => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== currentDate) {
        setCurrentDate(today);
        localStorage.removeItem("dailyQuote");
        localStorage.removeItem("dailyArticle");
        loadDailyContent();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentDate, loadDailyContent]);

  return (
    <QuoteContext.Provider
      value={{
        dailyQuote,
        dailyArticle,
        isLoading,
        isGenerating,
        error,
        currentDate,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
};
