import quotesData from "../assets/quotes.json" with { type: "json" };
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function migrateQuotes() {
  console.log(`🚀 Migration de ${quotesData.length} citations...`);

  // Batch insert (500 à la fois pour éviter les limites)
  const batchSize = 500;
  let migrated = 0;

  for (let i = 0; i < quotesData.length; i += batchSize) {
    const batch = quotesData.slice(i, i + batchSize).map((q) => ({
      quote_text: q.quoteText,
      quote_author: q.quoteAuthor,
      category: q.category,
      image_id: q.id,
    }));

    const { data, error } = await supabase.from("quotes").insert(batch);

    if (error) {
      console.error(`❌ Erreur batch ${i}:`, error);
    } else {
      migrated += batch.length;
      console.log(`✅ ${migrated}/${quotesData.length} citations migrées`);
      console.debug("Inserted Row Preview", data);
    }
  }

  console.log("🎉 Migration terminée !");
}

// Lance la migration
migrateQuotes();
