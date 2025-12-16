const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "src",
  "assets",
  "quotes_translated_categorized.json"
);

try {
  const rawData = fs.readFileSync(filePath, "utf8");
  const quotes = JSON.parse(rawData);

  if (!Array.isArray(quotes)) {
    console.error("Error: The file does not contain a JSON array.");
    process.exit(1);
  }

  const updatedQuotes = quotes.map((quote, index) => {
    return {
      id: index + 1,
      ...quote,
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(updatedQuotes, null, 4), "utf8");
  console.log(`Successfully added IDs to ${updatedQuotes.length} quotes.`);
} catch (err) {
  console.error("An error occurred:", err);
}
