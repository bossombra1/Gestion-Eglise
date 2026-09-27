# EcclesiaConnect — Cahier de développement
## Module Parent & Fidèle

> Branche de travail : `Parent-Fidele`

## 1. Contexte général

EcclesiaConnect est une plateforme paroissiale permettant de gérer les échanges avec les fidèles, parents, enfants, responsables de mouvements, secrétariat, trésorerie, prêtre et administration.

Une paroisse peut avoir plusieurs mouvements. Tous utilisent un socle commun : authentification, utilisateurs, paroisses, familles, enfants, inscriptions, paiements, documents, communications, notifications et permissions. Chaque mouvement pourra ensuite recevoir ses fonctionnalités métier spécifiques sans devenir une application indépendante.

Architecture :

Vue 3 → Axios → API REST → Routes → Controllers → Services → Repositories → Prisma → PostgreSQL

## 2. Rôles

- `SUPER_ADMIN` : administration globale de la plateforme et des paroisses.
- `ADMIN_PARISH` : administration opérationnelle de sa paroisse et de ses mouvements.
- `SECRETARY` : secrétariat selon permissions.
- `PRIEST` : fonctions liées au ministère selon permissions.
- `MOVEMENT_MANAGER` : gestion de son ou ses mouvements.
- `TREASURER` : fonctions financières selon permissions.
- `PARENT` : espace parent.
- `FAITHFUL` : espace fidèle.

Le frontend ne doit jamais être la seule source d'autorisation : le backend doit vérifier les droits et l'appartenance à la paroisse/mouvement.

## 3. Connexion non obligatoire

Le site ne doit pas imposer la connexion pour consulter les contenus publics. Une action nécessitant une identité déclenche connexion/inscription puis doit permettre de reprendre l'action initiale.

Exemples : demande de messe, inscription d'un enfant à un mouvement.

## 4. Mission de la branche Parent-Fidele

Cette branche développe les espaces destinés aux Parents et aux Fidèles, en parallèle des branches Administration et Responsable de mouvement.

Le module doit utiliser le socle existant et ne doit pas créer une architecture, une base de données ou une authentification séparée.

# 5. Espace Parent

Prévoir progressivement :

- Tableau de bord
- Mon profil
- Mes enfants
- Détail d'un enfant
- Inscription d'un enfant à un mouvement
- Mes inscriptions
- Mes cotisations
- Mes paiements
- Documents
- Communications
- Notifications

### Tableau de bord

Afficher, lorsque les données API sont disponibles : nombre d'enfants, inscriptions en cours/validées, cotisations à payer, paiements récents, dernières communications et notifications non lues. Ne pas conserver de fausses statistiques comme solution finale.

### Enfants

Le parent consulte uniquement ses enfants et les informations autorisées : identité, date de naissance, mouvements, inscriptions et statut.

### Inscription à un mouvement

Flux attendu :

Mes enfants → sélectionner un enfant → choisir un mouvement → renseigner les informations nécessaires → envoyer → `PENDING` → traitement par le responsable du mouvement → `APPROVED` ou `REJECTED`.

Le parent ne doit pas pouvoir modifier lui-même le statut administratif.

### Cotisations et paiements

Afficher les cotisations liées aux enfants et leurs paiements : montant, enfant, mouvement, date, statut et méthode lorsque disponible. Préparer l'architecture pour Wave, Orange Money, MTN, Moov et espèces sans mettre la logique des fournisseurs dans les composants Vue.

Statuts de paiement prévus : `PENDING`, `SUCCESS`, `FAILED`.

### Documents

Permettre de consulter uniquement les documents autorisés. Prévoir les états chargement, données disponibles, aucun document et erreur.

### Communications et notifications

Permettre de consulter les messages et notifications : inscription acceptée/refusée, cotisation, paiement, nouveau message, nouveau document, etc.

# 6. Espace Fidèle

Prévoir progressivement :

- Tableau de bord
- Mon profil
- Informations de la paroisse
- Mouvements
- Détail d'un mouvement
- Demande de messe
- Documents publics/autorisés
- Communications
- Notifications

Le fidèle peut consulter les mouvements disponibles dans sa paroisse. La consultation ne lui donne aucun droit de gestion.

### Demande de messe

Prévoir un formulaire avec au minimum l'intention, la date souhaitée et les informations complémentaires nécessaires. La demande doit être enregistrée par l'API.

# 7. Architecture frontend

Organisation recommandée :

frontend/src/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── layouts/
├── services/
│   ├── parent.service.ts
│   └── fidele.service.ts
├── stores/
│   ├── parent.ts
│   └── fidele.ts
├── types/
│   ├── parent.ts
│   └── fidele.ts
└── views/
    ├── parent/
    └── fidele/

L'organisation peut évoluer si elle améliore la cohérence du projet.

Utiliser l'Atomic Design : Atoms (boutons, inputs, badges), Molecules (champs, cartes, notifications, cartes enfant, statut de paiement), Organisms (listes d'enfants, tableaux de paiements, communications, header/sidebar), Templates (structures de dashboard et gestion).

Réutiliser les composants communs au lieu de copier-coller.

## Services API

Les appels Axios doivent rester dans les services/composables/stores appropriés, pas dispersés dans toutes les vues. Utiliser Pinia pour les états réellement partagés. Utiliser VeeValidate + Zod pour les formulaires.

# 8. Backend

Respecter impérativement :

Route → Controller → Service → Repository → Prisma → PostgreSQL

Ne pas placer des requêtes Prisma directement dans les controllers.

Si une nouvelle fonctionnalité backend est nécessaire, créer les couches correspondantes, par exemple `parent.routes.ts`, `parent.controller.ts`, `parent.service.ts`, `parent.repository.ts`, `parent.schema.ts`, et même principe pour le fidèle.

Avant toute modification de `backend/prisma/schema.prisma`, prévenir l'équipe et expliquer pourquoi elle est nécessaire.

# 9. Sécurité et isolation

Un parent ne consulte que ses propres informations, ses propres enfants, leurs inscriptions et les données auxquelles son compte a droit. Un fidèle ne consulte pas les données privées d'un autre utilisateur.

Un changement d'identifiant dans une URL ne doit jamais permettre d'accéder aux données d'une autre personne. Les contrôles sont faits côté backend. Respecter l'isolation par paroisse et les relations utilisateur-enfant-mouvement.

Utiliser JWT, bcrypt et Zod conformément au socle existant. Les endpoints doivent être réutilisables par le futur client mobile.

# 10. Design

Le dossier `REF-MAQUETTE/` est une référence visuelle, pas une spécification fonctionnelle définitive.

Respecter le style EcclesiaConnect : `#0B1F3A`, `#14345E`, `#24548F`, `#C25A34`, `#A84A28`, `#D99A2B`, `#F7F5F2`, `#2E2925`, `#6B655D`. Utiliser Source Serif 4 pour les grands titres et Noto Sans pour l'interface.

Prévoir responsive téléphone/tablette/desktop, avec une attention particulière au mobile pour Parent/Fidèle. Prévoir labels, focus visible, erreurs compréhensibles, chargement, états vides, navigation clavier et contraste correct. Ne pas utiliser uniquement la couleur pour communiquer un statut.

# 11. Fichiers à ne pas modifier sans accord

Pour limiter les conflits, ne pas modifier inutilement :

- `backend/prisma/schema.prisma`
- `backend/src/lib/`
- `backend/src/middlewares/`
- `backend/src/config/`
- `frontend/src/main.ts`
- `frontend/src/router/`
- `frontend/src/layouts/`
- `frontend/src/components/organisms/`
- `frontend/src/components/templates/`
- `frontend/src/views/mouvement/`

Si une modification du socle commun est réellement nécessaire : expliquer le besoin à l'équipe avant de la faire.

# 12. Tests

Tester progressivement : authentification, accès Parent, accès Fidèle, isolation des données, enfants, inscriptions, paiements, communications et permissions.

Frontend : Vitest + Vue Test Utils. Backend : Vitest + Supertest.

# 13. Git et collaboration

La branche de travail est `Parent-Fidele`.

Avant de commencer :

```powershell
git checkout Parent-Fidele
git pull origin Parent-Fidele
git status
```

Faire des commits courts et cohérents, puis pousser sur la branche :

```powershell
git add .
git commit -m "feat: ajouter tableau de bord parent"
git push origin Parent-Fidele
```

Exemples : `feat: ajouter gestion des enfants parent`, `feat: ajouter inscription enfant mouvement`, `feat: ajouter espace fidèle`, `feat: ajouter communications parent`, `fix: corriger affichage inscription parent`, `test: ajouter tests espace parent`.

Avant chaque push, au minimum :

```powershell
git status
npm run build
```

Ne pas développer directement sur `main` et ne pas fusionner la branche dans `main` sans validation de l'équipe.

# 14. Ordre de développement conseillé

## Phase 1 — Structure

1. préparer les vues Parent ;
2. préparer les vues Fidèle ;
3. préparer services, stores et types ;
4. intégrer les routes nécessaires.

## Phase 2 — Parent

1. Tableau de bord ;
2. Profil ;
3. Enfants ;
4. Détail enfant ;
5. Inscription ;
6. Suivi des inscriptions ;
7. Cotisations ;
8. Paiements ;
9. Documents ;
10. Communications ;
11. Notifications.

## Phase 3 — Fidèle

1. Tableau de bord ;
2. Profil ;
3. Mouvements ;
4. Détail mouvement ;
5. Demande de messe ;
6. Documents ;
7. Communications ;
8. Notifications.

## Phase 4 — API réelle

Remplacer progressivement les données temporaires par les données de l'API réelle.

## Phase 5 — Tests

Tester sécurité, permissions, isolation, formulaires et principales fonctionnalités métier.

# 15. Vision finale

EcclesiaConnect doit rester une plateforme modulaire :

ECCLESIACONNECT
├── SOCLE COMMUN
│   ├── Authentification
│   ├── Paroisses
│   ├── Utilisateurs
│   ├── Parents
│   ├── Fidèles
│   ├── Enfants
│   ├── Inscriptions
│   ├── Paiements
│   ├── Documents
│   ├── Communications
│   └── Notifications
└── MODULES DES MOUVEMENTS
    ├── Scout
    ├── Chorale
    ├── Jeunesse
    └── autres mouvements

Le module spécifique d'un mouvement sera ajouté ultérieurement selon ses besoins métier, sans casser le socle commun.

# 16. Première action

Commencer par :

```powershell
git checkout Parent-Fidele
git pull origin Parent-Fidele
git status
```

Puis analyser la structure actuelle avant de créer de nouveaux fichiers. Ne pas repartir de zéro et ne pas supprimer le travail existant.

Objectif : développer un module Parent/Fidèle propre, sécurisé, modulaire et intégrable au reste d'EcclesiaConnect.
