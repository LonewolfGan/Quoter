---
id: "0002-bff-and-gemini-security"
title: "Architecture BFF et Sécurisation Complète (Gemini, Cron, Supabase)"
date: "2026-10-21"
harness: "antigravity"
stack: "React Tailwind Node.js Vercel Supabase"
status: "ACCEPTED"
---

# Décision d'Architecture : BFF & Sécurisation Globale

## Contexte
1. Révocation du modèle `llama-3.3-70b-versatile` par Groq à la mi-août 2026, bloquant les générations quotidiennes d'articles.
2. Défaillance d'authentification sur `/api/daily-update` permettant l'usurpation via `User-Agent: vercel-cron` sans clé secrète.
3. Exposition publique de `REACT_APP_SUPABASE_KEY` dans le bundle client Webpack, créant des risques de scraping total et d'épuisement de quotas Supabase.
4. Fuite potentielle de `GEMINI_API_KEY` dans les URLs et logs via query params (`?key=...`).
5. Absence de validation de schéma et race conditions dans `useGet.js`.

## Décision
1. **Architecture BFF (Backend-For-Frontend)** : Création de `/api/quotes.js` côté serveur Vercel. Le client ne contacte plus Supabase directement. `useGet` utilise `fetch('/api/quotes')` avec `AbortController`.
2. **Étanchéité des Clés** : Clés Supabase et Gemini confinées 100% côté serveur. Clé Gemini transmise via l'en-tête `x-goog-api-key` (zéro leak dans l'URL).
3. **Verrouillage Cryptographique du Cron** : Comparaison en temps constant `crypto.timingSafeEqual` sur `Authorization: Bearer <CRON_SECRET>`. Suppression des contournements `User-Agent`.
4. **Protection Anti-Injection LLM** : Encapsulation des citations dans `<quote_data>` avec neutralisation des balises fermantes et consigne stricte de passivité des données.
5. **Résilience & Schéma** : Validation stricte des champs du JSON extrait (`title`, `intro`, `points` array non vide).

## Conséquences
- Zéro clé Supabase requise côté client navigateur (élimination des risques de scraping direct et DDoS).
- Plus aucun déni de service possible via le cron quotidien.
- Qualité supérieure des articles via `gemini-2.5-flash` avec repli automatique sur Groq.
- Conforme aux règles Cockpit ECC (Anti-Monolithe < 300 lignes, tests Dual-Agent TDD passants).
