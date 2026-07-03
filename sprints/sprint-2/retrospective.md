# Rétrospective du Sprint 2 - Sécurisation Applicative & Automatisation CI/CD (Candly)

## 1. Objectifs du Sprint
L'objectif central de ce second sprint était de transformer la plateforme de recrutement Candly en une véritable forteresse automatisée. Suite à un incident critique en production où le formulaire d'inscription est resté en panne pendant 66 heures à cause d'une inversion de syntaxe (`confirmed` au lieu de `confirmation`) entraînant la perte sèche de 3 candidats à fort potentiel, il était impératif de mettre en place une stratégie de tests globale et un pipeline d'intégration continue.

## 2. Ce qui s'est bien passé (Points forts)
* **Design de la stratégie de test (Backend & Frontend) :** Assimilation et mise en pratique réussie du pattern **Arrange / Act / Assert (AAA)** pour structurer proprement l'ensemble des cas de test.
* **Fiabilisation du Backend (Pest PHP) :** Écriture et automatisation de la suite de tests unitaires et fonctionnels côté API Laravel, couvrant les cas nominaux et d'erreurs (notamment sur l'authentification et l'inscription).
* **Robustesse du Frontend (Vitest & ESLint) :** Implémentation des tests d'interaction utilisateur et de composants React. Résolution efficace d'un faux négatif sur la page de Login (`Auth.test.jsx`) en adoptant la bonne pratique d'accessibilité `getByRole` pour cibler sémantiquement les titres de niveau.
* **Orchestration GitHub Actions :** Création réussie d'un pipeline d'intégration continue distribué dans `.github/workflows/ci.yml`, articulant de manière séquentielle les jobs de peluchage (Lint), de tests automatisés et de simulation de build de production.

## 3. Difficultés rencontrées & Résolutions (Galères du terrain)
* **Friction d'infrastructure sur la base de données éphémère (Jour 4) :** 
  * *Problème :* Lors du lancement du job de test backend sur GitHub Actions, le pipeline s'est brisé avec l'erreur récurrente `SQLSTATE[HY000] [1045] Access denied for user`. Laravel tentait d'exécuter les migrations (`php artisan migrate`) mais se heurtait à des identifiants invalides ou un manque de privilèges au sein du conteneur MySQL temporaire de la CI.
  * *Résolution :* Alignement minutieux des variables d'environnement injectées dans le runner et des configurations définies dans le bloc `services`. Pour contourner définitivement les conflits de droits de lecture/écriture sur une base volatile (`candly_test`), le choix technique s'est porté sur l'utilisation sécurisée de l'utilisateur `root`.

## 4. Enseignements & Gouvernance (Règles métiers)
* **La Règle d'or de Yann :** "Aucune PR ne peut être mergée si les tests n'ont pas passé. Si un test échoue, on corrige le code — jamais on ne supprime le test.". Le pipeline rouge est un blocage absolu, garantissant la stabilité collective du code.
* **Loi économique du coût d'un bug (Pyramide des tests) :** Ce sprint a ancré l'importance de détecter les anomalies au plus tôt. Un bug corrigé en phase de développement (coût relatif `x1`) évite un impact business déastrateur en production (coût relatif `x100` : perte d'acquisition, audit d'urgence, hotfix).

## 5. Plan d'action pour le prochain Sprint
* **Évolution vers le Déploiement Continu (CD) :** Étendre le pipeline actuel (CI) pour automatiser la livraison et le déploiement de l'application vers un environnement de staging, puis de production, dès lors que tous les voyants GitHub Actions sont au vert sur la branche `main`.
* **Maintien de la Definition of Done (DoD) :** Systématiser l'écriture de tests fonctionnels associés pour toute nouvelle fonctionnalité frontend ou endpoint API développé par l'équipe.