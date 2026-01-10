import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  
  const isLoadingRef = useRef(false);

  /* =====================================================
     FALLBACK QUOTE
  ===================================================== */
  const getFallbackQuote = () => ({
    id: 'fallback-quote-' + Date.now(),
    quote_text: "La persévérance est la clé du succès, même face aux obstacles techniques.",
    quote_author: "Sagesse Tech",
    category: "Motivation"
  });

  /* =====================================================
     FALLBACK ARTICLE
  ===================================================== */
  const createFallbackArticle = (quote, today) => ({
    id: quote?.id || 'fallback-article-' + Date.now(),
    type: "analysis",
    title: `Analyse : "${quote?.quote_text || 'Citation inspirante'}"`,
    excerpt: `Découvrez le sens profond de cette citation${quote?.quote_author ? ` de ${quote.quote_author}` : ''}`,
    quote_text: quote?.quote_text || "",
    author: quote?.quote_author || "Auteur inconnu",
    category: quote?.category || "Inspiration",
    read_time: "5 min",
    published_date: today,
    content: {
      intro: `Cette citation${quote?.quote_author ? ` de ${quote.quote_author}` : ''} nous invite à réfléchir sur un aspect fondamental de la vie.`,
      context: quote?.quote_author ? `${quote.quote_author} est reconnu pour sa sagesse et sa perspicacité unique.` : "Une pensée profonde qui mérite réflexion.",
      points: [
        "Réflexion approfondie sur le sens des mots",
        "Application pratique dans la vie quotidienne",
        "Contexte historique et culturel de l'époque",
        "Pertinence et impact aujourd'hui",
      ],
      exercise: "Prenez 5 minutes pour méditer sur cette citation et notez ce qu'elle évoque pour vous personnellement.",
      conclusion: "Cette citation continue d'inspirer et de guider des générations.",
    },
  });

  /* =====================================================
     GENERATE ARTICLE (GROQ)
  ===================================================== */
  const generateArticle = useCallback(async (quote, today) => {
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
        throw new Error(`API Error ${response.status}`);
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

      if (error) throw error;

      localStorage.setItem(
        "dailyArticle",
        JSON.stringify({ date: today, article: savedArticle })
      );

      return savedArticle;
    } catch (err) {
      const fallback = createFallbackArticle(quote, today);

      try {
        const { data: savedFallback, error: fallbackError } = await supabase
          .from("articles")
          .upsert([fallback], { onConflict: "id" })
          .select()
          .single();

        if (!fallbackError) return savedFallback;
      } catch (fallbackErr) {
        // Ignore fallback errors
      }

      return fallback;
    }
  }, []);

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
          return quote;
        }
      } catch (e) {
        localStorage.removeItem("dailyQuote");
      }
    }

    try {
      const { data: quotes, error: fetchError } = await supabase
        .from("quotes")
        .select("*")
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;
      if (!quotes || quotes.length === 0) {
        throw new Error('Aucune citation disponible');
      }

      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const dayOfYear = Math.floor((now - startOfYear) / 86400000);
      const index = dayOfYear % quotes.length;
      const quote = quotes[index];

      if (!quote) throw new Error('Citation invalide');

      localStorage.setItem(
        "dailyQuote",
        JSON.stringify({ date: today, quote })
      );

      setDailyQuote(quote);
      return quote;

    } catch (err) {
      const isNetworkError = 
        !navigator.onLine || 
        err.message?.includes('Failed to fetch') || 
        err.message?.includes('NetworkError') ||
        err.message?.includes('CORS') ||
        err.message?.includes('Network request failed');
      
      if (!isNetworkError) {
        setError(err.message || "Impossible de charger la citation du jour");
      }

      const fallbackQuote = getFallbackQuote();
      setDailyQuote(fallbackQuote);
      return fallbackQuote;
    }
  }, []);

  /* =====================================================
     LOAD OR GENERATE ARTICLE
  ===================================================== */
  const loadOrGenerateArticle = useCallback(async (today, quote) => {
    if (!quote) return;

    const cached = localStorage.getItem("dailyArticle");
    if (cached) {
      try {
        const { date, article } = JSON.parse(cached);
        if (date === today && article.id === quote.id) {
          setDailyArticle(article);
          return;
        }
      } catch (e) {
        localStorage.removeItem("dailyArticle");
      }
    }

    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", quote.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setDailyArticle(data);
        localStorage.setItem(
          "dailyArticle",
          JSON.stringify({ date: today, article: data })
        );
        return;
      }

      setIsGenerating(true);
      try {
        const article = await generateArticle(quote, today);
        setDailyArticle(article);
      } catch (genError) {
        const fallbackArticle = createFallbackArticle(quote, today);
        setDailyArticle(fallbackArticle);
      } finally {
        setIsGenerating(false);
      }

    } catch (err) {
      const fallbackArticle = createFallbackArticle(quote, today);
      setDailyArticle(fallbackArticle);
    }
  }, [generateArticle]);

  /* =====================================================
     EFFECT - CHARGEMENT INITIAL ET CHANGEMENT DE JOUR
  ===================================================== */
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      
      const today = new Date().toISOString().split("T")[0];
      
      try {
        const quote = await loadDailyQuote(today);
        if (isMounted && quote) {
          await loadOrGenerateArticle(today, quote);
        }
      } catch (err) {
        if (isMounted) {
          setError('Erreur lors du chargement');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      }
    };
    
    loadData();
    
    const checkForNewDay = () => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== currentDate && isMounted) {
        setCurrentDate(today);
        setIsLoading(true);
        localStorage.removeItem("dailyQuote");
        localStorage.removeItem("dailyArticle");
        isLoadingRef.current = false;
        loadData();
      }
    };
    
    const interval = setInterval(checkForNewDay, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
      isLoadingRef.current = false;
    };
  }, [currentDate, loadDailyQuote, loadOrGenerateArticle]);

  useEffect(() => {
    const checkDate = () => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== currentDate) {
        setCurrentDate(today);
      }
    };
    
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

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