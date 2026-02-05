function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(items) {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of items) {
    r -= x.w;
    if (r <= 0) return x.item;
  }
  return items[items.length - 1].item;
}

function randomSeed() {
  return Math.floor(Math.random() * 1_000_000_000);
}

function normalizeText(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreKeywords(text, keywords) {
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) score += 1;
  }
  return score;
}

function classifyQuote(quoteText, author = "") {
  const t = normalizeText(`${quoteText} ${author}`);

  const themes = {
    courage: ["courage", "peur", "oser", "audace", "risque"],
    discipline: ["discipline", "effort", "travail", "perseverance"],
    wisdom: ["sagesse", "verite", "sens", "esprit", "vertu"],
    love: ["amour", "coeur", "aimer", "tendresse"],
    time: ["temps", "instant", "futur", "vie"],
    success: ["succes", "objectif", "victoire", "progres"],
    failure: ["echec", "erreur", "chute"],
    freedom: ["liberte", "choix", "responsabilite"],
    creativity: ["creer", "imaginer", "art", "inspiration"],
    humor: ["rire", "humour", "sourire"],
    serenity: ["paix", "calme", "silence", "serenite"],
  };

  const scores = Object.fromEntries(
    Object.entries(themes).map(([k, kws]) => [k, scoreKeywords(t, kws)]),
  );

  const topThemes = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, sc]) => sc > 0)
    .slice(0, 3)
    .map(([k]) => k);

  return { topThemes };
}

const STYLEPACKS = [
  {
    id: "coach",
    tone: "pragmatique et coach",
    hook: "mini-histoire",
    rhythm: "énergique",
    voice: "tu",
    bestFor: ["discipline", "success", "failure", "courage"],
  },
  {
    id: "philo",
    tone: "philosophique mais accessible",
    hook: "paradoxe",
    rhythm: "calme et profond",
    voice: "tu",
    bestFor: ["wisdom", "freedom", "time", "serenity"],
  },
  {
    id: "litteraire",
    tone: "littéraire et sensoriel",
    hook: "image poétique",
    rhythm: "métaphores légères",
    voice: "tu",
    bestFor: ["love", "creativity", "time"],
  },
  {
    id: "inspirant",
    tone: "chaleureux et inspirant",
    hook: "question directe",
    rhythm: "phrases courtes",
    voice: "tu",
    bestFor: ["courage", "love", "freedom"],
  },
  {
    id: "fun",
    tone: "conversationnel et fun",
    hook: "punchline",
    rhythm: "léger",
    voice: "tu",
    bestFor: ["humor", "creativity"],
  },
];

function chooseStylePack(quote) {
  const profile = classifyQuote(quote.quote_text, quote.quote_author);

  const weighted = STYLEPACKS.map((sp) => {
    let w = 1;
    for (const th of profile.topThemes) {
      if (sp.bestFor.includes(th)) w += 3;
    }
    return { item: sp, w };
  });

  const style = weightedPick(weighted);

  const pointBlueprints = [
    [
      "Interprétation",
      "Application concrète",
      "Piège courant",
      "Micro-habitude",
    ],
    ["Perspective", "Exemple réel", "Erreur fréquente", "Action immédiate"],
    [
      "Ce que ça révèle",
      "Impact sur tes choix",
      "Ce que ça évite",
      "Test à faire",
    ],
  ];

  return { style, blueprint: pick(pointBlueprints) };
}

function buildBannedPhrases() {
  return [
    "Découvrez comment",
    "Dans cet article",
    "Aujourd'hui, nous allons",
    "Il est important de",
    "Tout d'abord",
    "Ensuite",
    "Enfin",
  ];
}

async function generateArticle(quote, today) {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY;
  if (!apiKey) throw new Error("REACT_APP_GROQ_API_KEY manquante");

  const seed = randomSeed();
  const { style, blueprint } = chooseStylePack(quote);
  const banned = buildBannedPhrases();

  const prompt = `Écris un article de blog en français à partir de cette citation :

"${quote.quote_text}" - ${quote.quote_author}

STYLE :
- Ton : ${style.tone}
- Accroche : ${style.hook}
- Rythme : ${style.rhythm}
- Voix : tutoie le lecteur
- Interdit : ${banned.map((s) => `"${s}"`).join(", ")}

STRUCTURE OBLIGATOIRE :
intro → context → points → exercise → conclusion

POINTS (dans cet ordre d’angle) :
1. ${blueprint[0]}
2. ${blueprint[1]}
3. ${blueprint[2]}
4. ${blueprint[3]}

FORMAT JSON STRICT UNIQUEMENT :
{
  "title": "",
  "excerpt": "",
  "intro": "",
  "context": "",
  "points": ["", "", "", ""],
  "exercise": "",
  "conclusion": ""
}

Seed interne : ${seed}`;

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
          { role: "system", content: "Tu renvoies uniquement du JSON valide." },
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
        top_p: 0.9,
        seed,
      }),
    },
  );

  const data = await response.json();
  const cleaned = data.choices[0].message.content
    .replace(/```json\n?|\n?```/g, "")
    .trim();
  const articleData = JSON.parse(cleaned);

  return {
    id: quote.id,
    type: "analysis",
    title: articleData.title,
    excerpt: articleData.excerpt,
    quote_text: quote.quote_text,
    author: quote.quote_author,
    category: quote.category || "Réflexion",
    read_time: "6 min",
    published_date: today,
    content: articleData,
  };
}

// CommonJS export for server-side compatibility
module.exports = { generateArticle };
