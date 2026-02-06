/**
 * Image Helper - Gère les URLs Cloudinary et les transformations sécurisées
 * Centralise la gestion des images pour éviter l'exposition directe des URLs
 */

const CLOUDINARY_CONFIG = {
  cloud: "dbkjpn2db",
  folder: "quote_images",
};

/**
 * Construit une URL Cloudinary sécurisée avec transformations
 * @param {string} quoteId - L'ID de la citation
 * @param {object} options - Options de transformation
 * @returns {string} URL Cloudinary complète
 */
export const buildCloudinaryUrl = (quoteId, options = {}) => {
  const {
    width = "auto",
    height = "auto",
    quality = "auto",
    format = "auto",
    crop = "limit",
    gravity = "auto",
    background = "none",
    denyPublicId = false,
  } = options;

  // Construction des transformations
  const transforms = [];

  if (format !== "none") transforms.push(`f_${format}`);
  if (quality !== "none") transforms.push(`q_${quality}`);
  if (width !== "none" || height !== "none") {
    if (width !== "none") transforms.push(`w_${width}`);
    if (height !== "none") transforms.push(`h_${height}`);
    if (crop !== "none") transforms.push(`c_${crop}`);
    if (gravity !== "none" && crop === "fill") transforms.push(`g_${gravity}`);
  }
  if (background !== "none") transforms.push(`b_${background}`);

  // Si denyPublicId est true, on ajoute une protection pour empêcher l'accès direct
  if (denyPublicId) {
    transforms.push("fl_layer_apply");
  }

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud}/image/upload`;
  const transformString =
    transforms.length > 0 ? `/${transforms.join(",")}` : "";

  return `${baseUrl}${transformString}/${CLOUDINARY_CONFIG.folder}/${quoteId}.png`;
};

/**
 * Obtient l'URL pour l'affichage optimisé en modal/galerie
 * @param {string} quoteId - L'ID de la citation
 * @returns {string} URL optimisée pour l'affichage
 */
export const getDisplayUrl = (quoteId, width = 1200) => {
  return buildCloudinaryUrl(quoteId, {
    width: width.toString(),
    height: "none",
    quality: "auto",
    format: "auto",
    crop: "limit",
  });
};

/**
 * Obtient l'URL pour les prévisualisations en galerie
 * @param {string} quoteId - L'ID de la citation
 * @param {number} size - Taille de la prévisualisation
 * @returns {string} URL pour la prévisualisation
 */
export const getThumbnailUrl = (quoteId, size = 350) => {
  return buildCloudinaryUrl(quoteId, {
    width: size.toString(),
    height: "none",
    quality: "auto",
    format: "auto",
    crop: "limit",
    gravity: "none",
  });
};

/**
 * Génère un srcSet Cloudinary pour l'affichage
 * @param {string} quoteId
 * @param {number[]} widths
 * @returns {string}
 */
export const getDisplaySrcSet = (quoteId, widths = [480, 700, 1200]) => {
  return widths.map((w) => `${getDisplayUrl(quoteId, w)} ${w}w`).join(", ");
};

/**
 * Génère un srcSet Cloudinary pour les thumbnails
 * @param {string} quoteId
 * @param {number[]} widths
 * @returns {string}
 */
export const getThumbnailSrcSet = (quoteId, widths = [200, 280, 350]) => {
  return widths.map((w) => `${getThumbnailUrl(quoteId, w)} ${w}w`).join(", ");
};

/**
 * URLs carrées (padding auto) pour éviter les ratios incorrects
 * @param {string} quoteId
 * @param {number} size
 * @returns {string}
 */
export const getSquareUrl = (quoteId, size = 350) => {
  return buildCloudinaryUrl(quoteId, {
    width: size.toString(),
    height: size.toString(),
    quality: "auto",
    format: "auto",
    crop: "pad",
    gravity: "none",
    background: "auto",
  });
};

/**
 * srcSet carré (padding auto)
 * @param {string} quoteId
 * @param {number[]} widths
 * @returns {string}
 */
export const getSquareSrcSet = (quoteId, widths = [200, 280, 350]) => {
  return widths.map((w) => `${getSquareUrl(quoteId, w)} ${w}w`).join(", ");
};

/**
 * Construit un srcSet pour les auteurs à partir du fichier d'origine
 * @param {string} src - chemin original /authors/Name.webp
 * @param {number[]} widths
 * @returns {{src: string, srcSet: string, sizes: string}}
 */
export const getAuthorSrcSet = (
  src,
  widths = [320, 640],
  sizes = "(max-width: 768px) 70vw, 350px",
) => {
  if (!src) return { src: "", srcSet: "", sizes };
  const file = src.split("/").pop();
  const srcSet = widths
    .map((w) => `/authors/${w}/${file} ${w}w`)
    .join(", ");
  const fallback = `/authors/${widths[widths.length - 1]}/${file}`;
  return { src: fallback, srcSet, sizes };
};

/**
 * Obtient l'URL par défaut (fallback)
 * @param {string} quoteId - L'ID de la citation
 * @returns {string} URL par défaut
 */
export const getDefaultUrl = (quoteId) => {
  return buildCloudinaryUrl(quoteId, {
    width: "none",
    height: "none",
    quality: "auto",
    format: "auto",
  });
};

/**
 * Génère un nom de fichier court mais intelligent basé sur la citation
 * Format: quoter_auteur_date_id.png
 * @param {object} quote - L'objet citation
 * @param {string} fileType - Type de fichier (png, jpg, etc.)
 * @returns {string} Nom de fichier formaté
 */
export const generateFileName = (quote, fileType = "png") => {
  if (!quote) return `quoter_${Date.now()}.${fileType}`;

  // Auteur court (max 10 caractères)
  const author = (quote.quote_author || "quote")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 10)
    .toLowerCase();

  // Date compacte (DDMMYY)
  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getFullYear()).slice(-2)}`;

  // ID court unique (5 premiers caractères ou timestamp)
  const id =
    String(quote.id || "")
      .substring(0, 5)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || Math.random().toString(36).substring(2, 7);

  return `quoter_${author}_${date}_${id}.${fileType}`;
};

/**
 * Formate le nom du fichier pour le téléchargement
 * @param {object} quote - L'objet citation
 * @returns {string} Nom formaté pour le téléchargement
 */
export const getDownloadFileName = (quote) => {
  return generateFileName(quote, "png");
};

/**
 * Formate le nom du fichier pour le partage
 * @param {object} quote - L'objet citation
 * @returns {string} Nom formaté pour le partage
 */
export const getShareFileName = (quote) => {
  return generateFileName(quote, "png");
};

/**
 * Valide si une URL est une URL Cloudinary valide
 * @param {string} url - URL à valider
 * @returns {boolean}
 */
export const isValidCloudinaryUrl = (url) => {
  if (!url) return false;
  return url.includes(`res.cloudinary.com/${CLOUDINARY_CONFIG.cloud}`);
};

/**
 * Extrait l'ID de la citation depuis une URL Cloudinary
 * @param {string} url - URL Cloudinary
 * @returns {string|null} ID de la citation ou null
 */
export const extractQuoteIdFromUrl = (url) => {
  if (!isValidCloudinaryUrl(url)) return null;

  const match = url.match(/quote_images\/([^.]+)\.png/);
  return match ? match[1] : null;
};

const imageHelperUtils = {
  buildCloudinaryUrl,
  getDisplayUrl,
  getThumbnailUrl,
  getDisplaySrcSet,
  getThumbnailSrcSet,
  getSquareUrl,
  getSquareSrcSet,
  getAuthorSrcSet,
  getDefaultUrl,
  generateFileName,
  getDownloadFileName,
  getShareFileName,
  isValidCloudinaryUrl,
  extractQuoteIdFromUrl,
};

export default imageHelperUtils;
