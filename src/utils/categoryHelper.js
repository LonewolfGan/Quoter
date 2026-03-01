export const CATEGORIES_LIST = [
  "Amour",
  "Amitié",
  "Bonheur",
  "Vie",
  "Motivation",
  "Réussite",
  "Philosophie",
  "Sagesse",
  "Liberté",
  "Espoir",
].sort();

/**
 * Transforme un nom avec accents en slug propre pour l'URL
 */
export const slugify = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
};

/**
 * Retrouve le nom original (avec accents) à partir d'un slug
 */
export const getOriginalCategory = (slug) => {
  if (!slug) return "";
  const found = CATEGORIES_LIST.find(
    (cat) => slugify(cat) === slug.toLowerCase(),
  );
  return found || slug;
};
