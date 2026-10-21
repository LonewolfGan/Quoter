# Progress Ledger: Sécurisation & Architecture BFF

Plan: `docs/superpowers/plans/2026-10-21-security-and-bff-architecture.md`
Created: 2026-10-21
Status: COMPLETE

## Tasks
- [x] Task 1: Durcissement Sécurité du Générateur IA (`groqArticleGenerator.js`)
- [x] Task 2: Verrouillage Cryptographique du Cron (`api/daily-update.js`)
- [x] Task 3: Création de la Route API BFF (`/api/quotes.js`)
- [x] Task 4: Adaptation du Hook Frontend `useGet.js` & Nettoyage des Clés
- [x] Task 5: Formalisation de l'ADR dans `.ecc/memory/`
- [x] Task 6: Core Web Vitals (Fonts non bloquantes, cache vercel.json, passive listeners, memoization)
- [x] Task 7: Hygiène & Anti-Zombie (bitmap.close GPU leak fix, montage Footer, purge useLazyLoadImages)

## Rulings
- Ruling 1: Architecture BFF choisie pour supprimer définitivement `REACT_APP_SUPABASE_KEY` du bundle client Webpack et éliminer le risque de scraping/DDoS sur Supabase.
- Ruling 2: Utilisation de `x-goog-api-key` en en-tête HTTP pour Google Gemini afin d'empêcher toute fuite de clé dans les URLs d'erreurs fetch.
- Ruling 3: Preload sélectif DM Sans/Playfair Display et suppression de l'@import bloquant dans index.css.
- Ruling 4: Suppression du hook orphelin `useLazyLoadImages.js` et libération GPU systématique dans `useShare.js`.
