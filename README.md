# Branche Parent-Fidele

## Mission
Construire les espaces **Parent** et **Fidèle**. Les utilisateurs peuvent gérer leur profil, consulter leur famille, suivre les enfants lorsque le compte est parent, recevoir les communications et accéder aux documents autorisés.

## Espace Parent
Tableau de bord, profil, famille, enfants, fiches enfants, inscriptions, cotisations, documents, communications et notifications.

## Espace Fidèle
Tableau de bord, profil, informations personnelles, appartenance à la paroisse, communications, documents, notifications et services autorisés.

## Frontend
Vues principales :
- `frontend/src/views/fidele/`
- `frontend/src/views/auth/`

Réutiliser les composants communs. Les différences Parent/Fidèle sont gérées par rôles et permissions.

## Backend
Respecter : Routes → Controllers → Services → Repositories → Prisma.

Modules concernés : auth, users, families, faithful, children, registrations, payments, communications, documents, notifications.

## Règles
- Un utilisateur ne consulte que les données autorisées par son rôle et ses relations.
- Les contrôles de sécurité sont effectués côté backend.
- Utiliser JWT, bcrypt et Zod.
- Respecter `parish_id`.
- Préparer les endpoints pour le futur mobile.