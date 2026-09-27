# Périmètre Administration

Ce document décrit le travail attendu sur la branche `Administration`.

## Mission
Construire le périmètre Administration d'EcclesiaConnect : paroisses, utilisateurs, rôles, permissions, paramètres, familles, communications et indicateurs.

## Fonctionnalités
- Tableau de bord administration
- Gestion des paroisses
- Gestion des utilisateurs
- Rôles et permissions
- Gestion des familles
- Référentiels et paramètres
- Communications administratives
- Documents administratifs
- Notifications
- Statistiques et indicateurs

## Frontend
Vues principales : `frontend/src/views/administration/`.

Respecter Atomic Design : atoms → molecules → organisms → templates. Utiliser Pinia pour l'état global et Axios pour l'API.

## Backend
Respecter : Routes → Controllers → Services → Repositories → Prisma.

Modules concernés : users, parishes, families, dashboard, communications, documents, notifications.

## Règles
- Vérifier les rôles et permissions côté backend.
- Isoler les données par `parish_id`.
- Valider les entrées avec Zod.
- Ne pas mettre de logique métier dans les contrôleurs.
- Préparer les endpoints pour le futur mobile.
- Ne pas casser les contrats API des autres branches.

## Livrable
Une fonctionnalité terminée possède son interface, son API nécessaire, ses contrôles d'accès, ses validations et les tests pertinents.
