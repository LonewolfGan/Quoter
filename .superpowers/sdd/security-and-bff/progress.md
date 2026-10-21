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
- [x] Task 8: BFF Articles (`api/articles.js`) & Découplage total frontend Supabase
- [x] Task 9: Décomposition Anti-Monolithe des 5 composants (>300 lignes -> <300 lignes)
- [x] Task 10: Accessibilité WCAG 2.1 AA (Focus visible SVG, balises sémantiques, modales dialog)
- [x] Task 11: Audit Essaim Multi-Agents exhaustif sur `main` (3/3 PASS : Security, CWV, Code Quality)

## Rulings
- Ruling 1: Architecture BFF choisie pour supprimer définitivement `REACT_APP_SUPABASE_KEY` du bundle client Webpack et éliminer le risque de scraping/DDoS sur Supabase.
- Ruling 2: Utilisation de `x-goog-api-key` en en-tête HTTP pour Google Gemini afin d'empêcher toute fuite de clé dans les URLs d'erreurs fetch.
- Ruling 3: Preload sélectif DM Sans/Playfair Display et suppression de l'@import bloquant dans index.css.
- Ruling 4: Suppression du hook orphelin `useLazyLoadImages.js` et libération GPU systématique dans `useShare.js`.
- Ruling 5: Découplage complet de toutes les requêtes frontend vers le BFF Vercel (`/api/quotes`, `/api/articles`).
- Ruling 6: Strict respect des invariants Cockpit ECC (tous les fichiers exécutables < 300 lignes, zéro code mort, routage RTK).
