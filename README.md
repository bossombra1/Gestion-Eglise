# EcclesiaConnect

Plateforme web de gestion et de communication pour une église/parroisse. Le projet centralise les paroisses, utilisateurs, familles, fidèles, enfants, mouvements, inscriptions, cotisations, documents, communications et notifications.

Le projet est API-first : le frontend Vue consomme une API REST Node/Express et le futur client mobile pourra réutiliser le même backend.

---

# 1. Stack technique

## Frontend

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Tailwind CSS
- Axios
- VueUse
- VeeValidate
- Zod
- Lucide Vue
- Vitest
- Vue Test Utils
- ESLint / Prettier

## Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma 7
- JWT
- bcrypt
- Zod
- Helmet
- CORS
- Pino
- Multer
- Vitest
- Supertest

## Architecture

Frontend :

    Vue -> Axios -> API REST

Backend :

    Routes
      ↓
    Controllers
      ↓
    Services
      ↓
    Repositories
      ↓
    Prisma
      ↓
    PostgreSQL

La logique métier doit rester dans les services. Les contrôleurs orchestrent les requêtes/réponses. Les repositories communiquent avec Prisma.

Le système est multi-paroisse : les données métier doivent rester isolées par parishId.

Pour les mouvements, l'accès doit également être contrôlé par le contexte :

    Utilisateur + Paroisse + Mouvement + Rôle

---

# 2. Organisation des branches

Le dépôt utilise plusieurs branches de travail :

| Branche | Responsable | Domaine |
|---|---|---|
| main | Intégration | Branche principale / référence |
| Administration | Développeur Administration | Administration et gestion des paroisses |
| Parent-Fidele | Développeur Parent/Fidèle | Espaces Parent et Fidèle |
| responsable-mouvement | Responsable mouvement | Mouvements, enfants, parents, inscriptions, cotisations |

## Règle fondamentale

NE JAMAIS développer directement sur main.

main sert de branche d'intégration et de référence.

Chaque développeur travaille uniquement sur sa branche fonctionnelle.

Avant toute modification :

    git status
    git branch --show-current
    git fetch origin

Vérifier que vous êtes bien sur votre branche.

---

# 3. Prérequis

Installer :

- Git
- Node.js
- npm
- PostgreSQL
- éventuellement VS Code

Versions utilisées pendant le développement :

    Node.js : 24.x
    npm     : 11.x
    PostgreSQL : 18.x

Vérifier :

    node --version
    npm --version
    git --version
    psql --version

---

# 4. Récupérer le projet pour la première fois

## 4.1 Cloner le dépôt

    git clone https://github.com/bossombra1/Gestion-Eglise.git
    cd Gestion-Eglise

Vérifier les branches :

    git branch -a

Mettre à jour les références :

    git fetch --all --prune

---

# 5. Récupérer sa branche de travail

## Administration

    git fetch origin
    git switch --track origin/Administration

Si la branche existe déjà localement :

    git switch Administration
    git pull --ff-only origin Administration

## Parent-Fidele

    git fetch origin
    git switch --track origin/Parent-Fidele

Si elle existe déjà localement :

    git switch Parent-Fidele
    git pull --ff-only origin Parent-Fidele

## Responsable de mouvement

    git fetch origin
    git switch --track origin/responsable-mouvement

Si elle existe déjà localement :

    git switch responsable-mouvement
    git pull --ff-only origin responsable-mouvement

Toujours vérifier :

    git branch --show-current
    git status

---

# 6. Installer les dépendances

## Backend

    cd backend
    npm install

## Frontend

Dans un deuxième terminal :

    cd frontend
    npm install

---

# 7. Configuration de l'environnement

Créer :

    backend/.env

Si backend/.env.example existe :

PowerShell :

    Copy-Item backend/.env.example backend/.env

Sinon créer manuellement backend/.env :

    NODE_ENV=development
    PORT=3000
    DATABASE_URL=postgresql://postgres@localhost:5432/ecclesiaconnect
    JWT_SECRET=change-this-secret-to-a-long-random-value

IMPORTANT : backend/.env ne doit jamais être commité.

En production, utiliser un vrai secret JWT long et aléatoire.

---

# 8. Créer ou récupérer PostgreSQL

La base actuelle s'appelle :

    ecclesiaconnect

Tester PostgreSQL :

    psql -U postgres -h localhost

Depuis psql, créer la base si elle n'existe pas :

    CREATE DATABASE ecclesiaconnect;

Puis :

    \q

Ou directement :

    createdb -U postgres -h localhost ecclesiaconnect

Si la base existe déjà, ne pas la recréer.

---

# 9. Récupérer la structure de la base avec Prisma

La base complète n'est pas stockée comme un dump dans Git.

Le dépôt contient :

    backend/prisma/schema.prisma
    backend/prisma/migrations/

Ces migrations permettent de reconstruire la structure de la base.

Depuis backend :

    npm install
    npx prisma generate
    npx prisma migrate deploy

Pour une base locale de développement sur laquelle vous devez créer une nouvelle migration :

    npx prisma migrate dev

Ne lancez pas migrate dev au hasard sur une base contenant des données importantes.

---

# 10. Données de test / seed

Le projet doit progressivement fournir un seed officiel.

Lorsque le script de seed est configuré dans backend/package.json :

    npx prisma db seed

Si aucun seed n'est configuré, ne pas inventer de comptes ou de données.

---

# 11. Vérifier et lancer le backend

Depuis backend :

    npx prisma generate
    npm run type-check
    npm run build
    npm run dev

L'API est normalement disponible sur :

    http://localhost:3000

Endpoint de santé :

    http://localhost:3000/api/health

Réponse attendue :

    {
      "success": true,
      "message": "EcclesiaConnect API is running"
    }

---

# 12. Lancer le frontend

Dans un autre terminal :

    cd frontend
    npm install
    npm run dev

Vite affiche l'adresse locale, généralement :

    http://localhost:5173

Le backend doit fonctionner en parallèle.

---

# 13. Installation complète recommandée

Terminal 1 :

    cd "D:\GESTION EGLISE\ECCLESIA\backend"
    npm install
    npx prisma generate
    npx prisma migrate deploy
    npm run type-check
    npm run dev

Terminal 2 :

    cd "D:\GESTION EGLISE\ECCLESIA\frontend"
    npm install
    npm run dev

---

# 14. Procédure complète nouveau développeur

    git clone https://github.com/bossombra1/Gestion-Eglise.git
    cd Gestion-Eglise
    git fetch --all --prune

Choisir sa branche, par exemple :

    git switch --track origin/responsable-mouvement

Puis :

    cd backend
    npm install
    npx prisma generate
    npx prisma migrate deploy
    npm run type-check
    npm run build

Créer et configurer :

    backend/.env

Puis :

    npm run dev

Dans un autre terminal :

    cd frontend
    npm install
    npm run dev

---

# 15. Récupérer les dernières modifications

Avant de travailler :

    git status
    git branch --show-current
    git fetch origin
    git pull --ff-only origin MA_BRANCHE

Exemple :

    git pull --ff-only origin responsable-mouvement

Si Git refuse le pull, ne forcez pas. Vérifiez :

    git status
    git log --oneline --decorate -10

---

# 16. Ne pas travailler sur main

Vérifier :

    git branch --show-current

Si le résultat est main et que vous devez développer :

    git switch responsable-mouvement

Puis :

    git pull --ff-only origin responsable-mouvement

Ne pas faire :

    git push origin main

pour du développement courant.

---

# 17. Commit et push

Après les modifications :

    git status
    git diff
    git branch --show-current

Ajouter uniquement les fichiers nécessaires :

    git add chemin/du/fichier

Vérifier :

    git status

Commit :

    git commit -m "feat: description de la fonctionnalité"

Push sur sa branche :

    git push origin MA_BRANCHE

Exemple :

    git push origin responsable-mouvement

---

# 18. Ne pas modifier inutilement le travail des autres

Les trois développeurs travaillent en parallèle.

Organisation :

    Administration
        ↓
    Administration / paroisses / gestion globale

    Parent-Fidele
        ↓
    Parent / Fidèle

    responsable-mouvement
        ↓
    Mouvements / enfants / parents / inscriptions / cotisations

Les fichiers communs peuvent être modifiés lorsqu'ils sont nécessaires à l'intégration, mais éviter les modifications inutiles qui provoquent des conflits.

---

# 19. Intégration dans main

Workflow recommandé :

    Développeur
        ↓
    Branche fonctionnelle
        ↓
    Commit
        ↓
    Push
        ↓
    Pull Request
        ↓
    Vérification / tests
        ↓
    Intégration dans main

Exemple :

    responsable-mouvement
            ↓
       Pull Request
            ↓
           main

Même principe pour Administration et Parent-Fidele.

---

# 20. Secrets

Ne jamais commiter :

- backend/.env
- mots de passe PostgreSQL
- JWT secrets
- clés API
- identifiants externes
- secrets de paiement
- tokens

Avant chaque commit :

    git status

---

# 21. Modifier le schéma Prisma

Lorsqu'un développeur modifie backend/prisma/schema.prisma :

    cd backend
    npx prisma migrate dev --name description_de_la_modification

Puis :

    npx prisma generate
    npm run type-check
    npm run build

Versionner la migration :

    git add backend/prisma/schema.prisma
    git add backend/prisma/migrations/
    git add backend/package-lock.json

Puis :

    git commit -m "feat: ajouter les migrations nécessaires"
    git push origin MA_BRANCHE

Les autres développeurs récupèrent :

    git pull --ff-only origin MA_BRANCHE

Puis :

    cd backend
    npx prisma migrate deploy
    npx prisma generate

---

# 22. Migration et sauvegarde sont différentes

Les migrations décrivent la structure de la base. Elles ne remplacent pas une sauvegarde des données.

Sauvegarder :

    pg_dump -U postgres -h localhost -d ecclesiaconnect -F c -f ecclesiaconnect.backup

Restaurer :

    pg_restore -U postgres -h localhost -d ecclesiaconnect --clean --if-exists ecclesiaconnect.backup

Ne pas restaurer une sauvegarde de production sur une base de développement sans vérifier son contenu.

---

# 23. Réinitialiser une base locale

Uniquement sur une base de développement que vous pouvez supprimer :

    cd backend
    npx prisma migrate reset

Cette commande peut supprimer toutes les données de la base.

---

# 24. Vérification finale

Backend :

    cd backend
    npx prisma generate
    npm run type-check
    npm run build

Frontend :

    cd frontend
    npm run build

Git :

    cd ..
    git status
    git branch --show-current
    git remote -v

Vérifier :

- bonne branche de travail ;
- PostgreSQL fonctionnel ;
- base ecclesiaconnect existante ;
- backend/.env configuré ;
- migrations appliquées ;
- Prisma Client généré ;
- backend compilé ;
- frontend compilé ;
- /api/health accessible.

---

# 25. Architecture fonctionnelle

Rôles :

    SUPER_ADMIN
    ADMIN_PARISH
    SECRETARY
    PRIEST
    MOVEMENT_MANAGER
    TREASURER
    PARENT
    FAITHFUL

Hiérarchie :

    SUPER_ADMIN
        │
        ├── Paroisse A
        │      └── ADMIN_PARISH
        │             ├── Mouvement A
        │             ├── Mouvement B
        │             └── Mouvement C
        │
        └── Paroisse B
               └── ADMIN_PARISH
                      └── Mouvements

Un responsable de mouvement ne peut gérer que les mouvements auxquels il est autorisé.

Modifier un movementId dans une requête ne doit jamais permettre d'accéder à un mouvement non autorisé.

---

# 26. Vision des mouvements

Une paroisse peut posséder plusieurs mouvements :

    PAROISSE
    ├── Mouvement A
    │   └── Interface spécifique
    ├── Mouvement B
    │   └── Interface spécifique
    └── Mouvement C
        └── Interface spécifique

Le développement commence par une interface commune aux mouvements.

Chaque mouvement pourra ensuite recevoir ses propres fonctions métier sans créer une application séparée.

---

# 27. Authentification

Le site n'impose pas une connexion globale.

Les visiteurs peuvent consulter les fonctionnalités publiques.

Une action nécessitant une identité déclenche la connexion ou l'inscription.

Exemple :

    Visiteur
       ↓
    Demande de messe
       ↓
    Connexion / inscription
       ↓
    Retour vers l'action demandée

Même principe pour les inscriptions d'enfants et les espaces privés.

---

# 28. Documents de référence

Documents :

    docs/administration.md
    docs/parent-fidele.md
    docs/responsable-mouvement.md

Maquettes visuelles :

    REF-MAQUETTE/

Les maquettes servent de référence visuelle et UX, pas de spécification fonctionnelle absolue.

---

# 29. État actuel

La fondation Vue/TypeScript + Node/Express/TypeScript + PostgreSQL/Prisma est opérationnelle.

Déjà en place notamment :

- authentification JWT ;
- contexte paroisse ;
- mouvements ;
- tableau de bord responsable ;
- inscriptions ;
- validation/rejet des inscriptions ;
- cotisations ;
- paiements ;
- migrations Prisma ;
- listes enfants ;
- listes parents ;
- filtrage par mouvement ;
- architecture Atomic Design ;
- séparation Routes / Controllers / Services / Repositories.

Les prochaines évolutions doivent respecter l'isolation :

    Paroisse → Mouvement → Utilisateur/Rôle → Données métier

---

# 30. Mémo des commandes

## Première installation

    git clone https://github.com/bossombra1/Gestion-Eglise.git
    cd Gestion-Eglise
    git fetch --all --prune
    git switch --track origin/MA_BRANCHE

    cd backend
    npm install
    npx prisma generate
    npx prisma migrate deploy
    npm run type-check
    npm run build
    npm run dev

Dans un autre terminal :

    cd frontend
    npm install
    npm run dev

## Début de journée

    git status
    git branch --show-current
    git fetch origin
    git pull --ff-only origin MA_BRANCHE

## Fin de fonctionnalité

    git status
    git diff
    git add .
    git commit -m "feat: ma fonctionnalité"
    git push origin MA_BRANCHE

## Après récupération d'une migration

    cd backend
    npm install
    npx prisma migrate deploy
    npx prisma generate
    npm run type-check
    npm run build

---

# 31. Règle d'or

Chaque développeur :

1. travaille sur sa branche ;
2. vérifie sa branche avant de coder ;
3. récupère les dernières modifications avant de commencer ;
4. ne committe jamais les secrets ;
5. ne pousse jamais directement son travail sur main ;
6. passe par une Pull Request pour intégrer son travail dans main.

    main
     ↑
     │ Pull Request
     │
    branche de travail
     ↑
     │
    Développement local
