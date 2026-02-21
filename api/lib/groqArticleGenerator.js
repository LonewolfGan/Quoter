async function generateArticle(quote, today) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

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
            content: `Ecris un article de blog complet et captivant en francais sur cette citation :
"${quote.quote_text}" - ${quote.quote_author}

L'article doit contenir :
1. Un titre accrocheur et inspirant
2. Une introduction engageante (2-3 phrases)
3. Le contexte historique de la citation
4. 4 points cles d'analyse ou d'application pratique
5. Un exercice pratique pour le lecteur
6. Une conclusion inspirante
7. Un excerpt original, sans phrases generiques ou toutes faites

Format ta reponse UNIQUEMENT en JSON strict (sans texte avant ou apres) :
{
  "title": "Titre de l'article",
  "excerpt": "Court resume en 1-2 phrases (original, pas de phrase generique)",
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
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  const articleData = JSON.parse(cleaned);

  return {
    id: quote.id,
    type: "analysis",
    title: articleData.title,
    excerpt: articleData.excerpt,
    quote_text: quote.quote_text,
    author: quote.quote_author,
    category: quote.category || "Reflexion",
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
}

module.exports = { generateArticle };
