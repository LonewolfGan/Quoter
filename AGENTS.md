# Guide Agent & Cockpit ECC (/home/lonewolf/WebstormProjects/Quoter)

## 1. Stack Technique
- Gestionnaire de paquets : `pnpm`
- Technologies détectées : React Tailwind

## 2. Invariants Cockpit & Vérité Terrain
- **La Machine fait foi** : Le filesystem, les tests et les logs détiennent la vérité. Zéro hypothèse non vérifiée, preuve avant affirmation.
- **Protocole ADHD** : Action d'abord, zéro remplissage de politesse, maximum 5 puces par section.
- **Optimisation RTK** : Toutes les commandes (`git`, `pnpm`, `docker`, `find`, `grep`) sont automatiquement routées via le proxy RTK.

## 3. Cycle Superpowers & Dual-Agent TDD 3-Phase
- **Règle des 1%** : Dès qu'une tâche démarre, invoquer le skill adapté en amont (`interview-me` -> `brainstorming` -> `spec-driven-development` -> `writing-plans` -> `subagent-driven-development`).
- **Dual-Agent TDD 3-Phase** :
  - **Phase RED** : `test-engineer` écrit la suite de tests avec les cas limites et valeurs adversariales (tests rouges obligatoires).
  - **Phase GREEN** : `implementer` écrit le code minimal en worktree Git isolé (`Workspace: "branch"`) pour passer au vert sans tricher.
  - **Phase REFACTOR** : `code-simplification` + `clean-code` réduisent la complexité sans altérer le comportement.
- **Règles Anti-Monolithe & Anti-Zombie** : Fichiers strictement limités à 300 lignes, zéro code mort commenté.
- **Autonomie par Rulings & Vérité** : Arbitrages techniques vérifiés via `doubt-driven-development` et `source-driven-development`, enregistrés dans `.superpowers/sdd/<plan>/progress.md` et persistés dans `.ecc/memory/`.

## 4. Triptyque UI & Anti-Slop
- **Conception (Awwwards)** : Approche poster-first, typographies typées, hairlines 1px, zéro card-slop (MCPs `mobbin` / `design-oracle` / `StitchMCP` au besoin).
- **Hygiène (Anti-Slop)** : Éradication des clichés d'IA via l'essaim des 5 agents (`anti-slop-ui`, `anti-slop-copywriting`, `anti-slop-human`, `anti-slop-layoutmobile`, `anti-slop-code`).
- **Jury Gate Runtime** : Validation visuelle et inspection DevTools (`browser-testing-with-devtools` + `/jury`) bloquantes pour toute modification d'interface.

## 5. Sentinelles Mécaniques (Pre-Push & Sécurité)
- **AgentShield** : Blocage physique silencieux de toute tentative d'écriture de secret ou clé API (`sk-`, `ghp_`, `AKIA`, certificats).
- **Security-Sentinel** : Toute modification sur des modules sensibles (`auth`, `crypto`, `token`, `session`, `payment`) force l'audit par `security-auditor`.
- **Universal Pre-Push Gate** : Tout `git push` (sur main ou branche worktree) est bloqué tant que l'audit de sécurité (`security-auditor`) et de web-performance (`web-performance-auditor`, si UI) n'est pas validé.
- **PreDeploy-Gate** : Déploiement et push production bloqués tant que l'audit complet `/ecc-deploy-check` n'est pas validé.
