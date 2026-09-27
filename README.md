# EcclesiaConnect

## Présentation
EcclesiaConnect est une plateforme web de gestion et de communication pour une église/parroisse. Elle centralise les paroisses, utilisateurs, familles, fidèles, enfants, mouvements, inscriptions, cotisations, documents, communications et notifications.

Le projet est API-first afin que le futur client mobile réutilise le même backend.

## Stack
### Frontend
Vue 3, TypeScript, Vite, Vue Router, Pinia, Tailwind CSS, Axios, VueUse, VeeValidate, Zod, Lucide Vue, Vitest et Vue Test Utils.

### Backend
Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, Zod, Helmet, CORS, rate limiting, Pino, Vitest et Supertest.

## Architecture
Frontend : Vue → Axios → API REST.

Backend : Routes → Controllers → Services → Repositories → Prisma → PostgreSQL.

La logique métier reste dans les services. Les contrôleurs orchestrent les requêtes et réponses. Les données sont isolées par paroisse avec `parish_id`.

## Organisation Git
- `main` : branche d'intégration et référence globale.
- `Administration` : administration de la plateforme et des paroisses.
- `Parent-Fidele` : espaces parent et fidèle.
- `responsable-mouvement` : gestion des mouvements.

## Rôles
SUPER_ADMIN, ADMIN_PARISH, SECRETARY, PRIEST, MOVEMENT_MANAGER, TREASURER, PARENT, FAITHFUL.

## Modules
Authentification, administration, paroisses, utilisateurs, familles, fidèles, enfants, mouvements, inscriptions, cotisations/paiements, communications, documents, notifications et tableau de bord.

## Principes
1. API REST commune au web et au futur mobile.
2. Architecture multi-paroisse avec `parish_id`.
3. Validation des entrées avec Zod.
4. JWT et bcrypt pour l'authentification.
5. Stockage des fichiers derrière un service extensible vers le cloud.
6. Paiements derrière une abstraction pour Wave, Orange Money, MTN, Moov et Cash.
7. Frontend organisé en Atomic Design : atoms → molecules → organisms → templates.
8. Aucun secret dans Git.
9. Les permissions sont contrôlées côté backend.

## Développement
Chaque développeur travaille sur sa branche fonctionnelle. Avant intégration dans `main`, le code doit être compilable, typé et testé lorsque nécessaire.

## État
La fondation frontend/backend est en place. PostgreSQL/Prisma et les premiers modules fonctionnels constituent la prochaine étape.