const fs = require("fs").promises;
const path = require("path");
const { v2: cloudinary } = require("cloudinary");

/* =========================
   CONFIG CLOUDINARY
========================= */
cloudinary.config({
  cloud_name: "dbkjpn2db",
  api_key: "863354367227281",
  api_secret: "j5B066SZJzusD3-u7SIoa8ZQIxU",
});

/* =========================
   CONFIGURATION
========================= */
const CONFIG = {
  imagesDir: "./src/assets/quote_images",
  outputFile: "./public/quote_images-mapping.json",
  progressFile: "./upload-progress.json",
  folderName: "quote_images",
  rateLimitDelay: 400, // 400ms entre chaque upload
  maxRetries: 3,
  retryDelay: 2000,
  saveInterval: 50, // Sauvegarde tous les 50 images
};

/* =========================
   UTILITAIRES
========================= */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableError(error) {
  const retryableCodes = [408, 429, 500, 502, 503, 504];
  return (
    retryableCodes.includes(error.http_code) ||
    error.code === "ECONNRESET" ||
    error.code === "ETIMEDOUT" ||
    error.code === "ENOTFOUND"
  );
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

/* =========================
   GESTION DE LA PROGRESSION
========================= */
async function loadProgress() {
  try {
    const data = await fs.readFile(CONFIG.progressFile, "utf8");
    return JSON.parse(data);
  } catch {
    return { lastIndex: -1, stats: { uploaded: 0, failed: 0 } };
  }
}

async function saveProgress(lastIndex, stats) {
  await fs.writeFile(
    CONFIG.progressFile,
    JSON.stringify(
      { lastIndex, stats, savedAt: new Date().toISOString() },
      null,
      2
    )
  );
}

async function saveMapping(results) {
  const successfulUploads = results.filter((r) => r.success);
  await fs.writeFile(
    CONFIG.outputFile,
    JSON.stringify(successfulUploads, null, 2)
  );
}

/* =========================
   UPLOAD UNE IMAGE
========================= */
async function uploadImage(filePath, fileName, retryCount = 0) {
  const nameWithoutExt = path.parse(fileName).name;
  const publicId = `${CONFIG.folderName}/${nameWithoutExt}`;

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: CONFIG.folderName,
      public_id: nameWithoutExt,
      resource_type: "image",
      overwrite: false,
      unique_filename: false,
    });

    return {
      success: true,
      original: fileName,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    // Retry sur erreurs temporaires
    if (retryCount < CONFIG.maxRetries && isRetryableError(error)) {
      console.log(`   ⚠️  Retry ${retryCount + 1}/${CONFIG.maxRetries}...`);
      await delay(CONFIG.retryDelay);
      return uploadImage(filePath, fileName, retryCount + 1);
    }

    // Échec définitif
    console.error(`   ❌ Erreur: ${error.error?.message || error.message}`);
    return {
      failed: true,
      fileName,
      error: error.error?.message || error.message || "Unknown error",
    };
  }
}

/* =========================
   AFFICHAGE PROGRESSION
========================= */
function displayProgress(current, total, stats, startTime) {
  const percentage = ((current / total) * 100).toFixed(1);
  const barLength = 30;
  const filled = Math.floor((current / total) * barLength);
  const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

  // Calcul temps restant
  const elapsed = (Date.now() - startTime) / 1000;
  const avgTime = elapsed / current;
  const remaining = (total - current) * avgTime;
  const eta = remaining > 0 ? ` | ETA: ${formatTime(remaining)}` : "";

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(
    `[${bar}] ${percentage}% | ${current}/${total} | ✅ ${stats.uploaded} ❌ ${stats.failed}${eta}`
  );
}

/* =========================
   FONCTION PRINCIPALE
========================= */
async function uploadAll() {
  console.log("🚀 Démarrage de l'upload vers Cloudinary\n");
  const startTime = Date.now();

  try {
    // Si un argument est fourni, uploader ce fichier unique
    const singleFilePath = process.argv[2];
    let imageFiles, filePaths;

    if (singleFilePath) {
      // Upload d'un seul fichier
      const fileName = path.basename(singleFilePath);
      imageFiles = [fileName];
      filePaths = [singleFilePath];
      console.log(`📁 Upload d'un seul fichier: ${fileName}\n`);
    } else {
      // Upload de tous les fichiers du dossier
      const files = await fs.readdir(CONFIG.imagesDir);
      imageFiles = files
        .filter((f) => /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f))
        .sort();
      filePaths = imageFiles.map((f) => path.join(CONFIG.imagesDir, f));
      console.log(`📁 ${imageFiles.length} images détectées\n`);
    }

    if (imageFiles.length === 0) {
      console.log("⚠️  Aucune image trouvée");
      return;
    }

    // Chargement progression
    const progress = await loadProgress();
    const results = [];
    let stats = { ...progress.stats };
    const startIndex = singleFilePath ? 0 : progress.lastIndex + 1;

    if (startIndex > 0 && !singleFilePath) {
      console.log(`♻️  Reprise depuis l'image ${startIndex + 1}\n`);
    }

    // Upload de chaque image
    for (let i = startIndex; i < imageFiles.length; i++) {
      const fileName = imageFiles[i];
      const filePath = filePaths[i];

      // Upload
      console.log(`[${i + 1}/${imageFiles.length}] 📤 ${fileName}`);
      const result = await uploadImage(filePath, fileName);

      // Mise à jour stats
      if (result.success) {
        results.push(result);
        stats.uploaded++;
        console.log(`   ✅ Uploadé avec succès`);
      } else if (result.failed) {
        stats.failed++;
      }

      // Affichage progression
      displayProgress(i + 1, imageFiles.length, stats, startTime);

      // Sauvegarde périodique
      if ((i + 1) % CONFIG.saveInterval === 0 || i === imageFiles.length - 1) {
        await saveProgress(i, stats);
        await saveMapping(results);
      }

      // Rate limiting (sauf dernière image)
      if (i < imageFiles.length - 1) {
        await delay(CONFIG.rateLimitDelay);
      }
    }

    // Calcul temps total
    const duration = (Date.now() - startTime) / 1000;
    const speed = (imageFiles.length / duration) * 60;

    // Résumé final
    console.log("\n\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ DE L'UPLOAD");
    console.log("=".repeat(60));
    console.log(`✅ Uploadées avec succès: ${stats.uploaded}`);
    console.log(`❌ Échecs:                ${stats.failed}`);
    console.log(`📝 Total dans mapping:    ${results.length}`);
    console.log(`⏱️  Durée totale:          ${formatTime(duration)}`);
    console.log(`⚡ Vitesse moyenne:       ${speed.toFixed(1)} images/min`);
    console.log("=".repeat(60));
    console.log(`\n💾 Mapping sauvegardé: ${CONFIG.outputFile}\n`);

    // Nettoyage
    if (stats.uploaded + stats.failed === imageFiles.length) {
      await fs.unlink(CONFIG.progressFile).catch(() => {});
      console.log("🧹 Fichier de progression nettoyé\n");
    }

    if (stats.failed > 0) {
      console.log(
        "⚠️  Certaines images ont échoué. Relancez le script pour réessayer.\n"
      );
    } else {
      console.log("🎉 Tous les uploads sont terminés avec succès !\n");
    }
  } catch (error) {
    console.error("\n\n💥 Erreur fatale:", error.message);
    console.log(
      "💡 La progression a été sauvegardée. Relancez le script pour continuer.\n"
    );
    process.exit(1);
  }
}

/* =========================
   GESTION INTERRUPTION
========================= */
process.on("SIGINT", async () => {
  console.log("\n\n⚠️  Upload interrompu");
  console.log("💡 Progression sauvegardée. Relancez pour continuer.\n");
  process.exit(0);
});

/* =========================
   LANCEMENT
========================= */
if (require.main === module) {
  uploadAll().catch((error) => {
    console.error("\n💥 Erreur:", error.message);
    process.exit(1);
  });
}

module.exports = { uploadAll };
