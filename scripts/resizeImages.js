const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const AUTHORS_DIR = path.join(ROOT, "public", "authors");
const BG_DIR = path.join(ROOT, "public", "bg_images");

const AUTHOR_SIZES = [320, 640];
const BG_SIZES = [640, 1280];

const WEBP_QUALITY = 80;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listWebpFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".webp"))
    .map((e) => e.name);
}

async function shouldSkip(inputPath, outputPath) {
  try {
    const [inputStat, outputStat] = await Promise.all([
      fs.stat(inputPath),
      fs.stat(outputPath),
    ]);
    return outputStat.mtime >= inputStat.mtime;
  } catch {
    return false;
  }
}

async function resizeSet(srcDir, sizes) {
  const files = await listWebpFiles(srcDir);
  if (!files.length) return;

  for (const size of sizes) {
    const outDir = path.join(srcDir, String(size));
    await ensureDir(outDir);

    for (const file of files) {
      const inputPath = path.join(srcDir, file);
      const outputPath = path.join(outDir, file);

      if (await shouldSkip(inputPath, outputPath)) {
        continue;
      }

      await sharp(inputPath)
        .resize({ width: size, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toFile(outputPath);
    }
  }
}

async function run() {
  await resizeSet(AUTHORS_DIR, AUTHOR_SIZES);
  await resizeSet(BG_DIR, BG_SIZES);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
