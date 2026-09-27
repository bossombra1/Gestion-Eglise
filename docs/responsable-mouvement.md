# Périmètre Responsable de mouvement

Ce document décrit le travail attendu sur la branche `responsable-mouvement`.

## Mission
Construire le périmètre Responsable de mouvement : gérer le mouvement, les enfants inscrits, les parents associés, les inscriptions, les cotisations, les documents et les communications.

## Fonctionnalités
- Tableau de bord du mouvement
- Mon mouvement
- Enfants inscrits
- Fiches enfants
- Parents associés
- Inscriptions
- Cotisations
- Documents
- Communications
- Notifications

## API cible
- `/api/movements`
- `/api/movements/:id/children`
- `/api/movements/:id/parents`
- `/api/movements/:id/registrations`
- `/api/movements/:id/payments`
- `/api/movements/:id/documents`
- `/api/movements/:id/communications`

## Frontend
Vues principales : `frontend/src/views/mouvement/`.

Respecter Atomic Design et réutiliser les composants partagés.

## Backend
Respecter : Routes → Controllers → Services → Repositories → Prisma.

Le rôle principal est `MOVEMENT_MANAGER`.

## Règles métier
- Le responsable ne gère que les mouvements auxquels il est autorisé.
- Respecter l'isolation par `parish_id`.
- Vérifier les permissions côté backend.
- Les paiements doivent être conçus derrière une abstraction pour préparer Wave, Orange Money, MTN, Moov et Cash.
- Les documents doivent passer par une abstraction de stockage extensible vers le cloud.
- Les endpoints doivent rester réutilisables par le futur mobile.

## Livrable
Chaque fonctionnalité doit couvrir le parcours frontend, l'API/backend nécessaire, les validations, les contrôles d'accès et les tests pertinents.
