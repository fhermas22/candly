# Validation des Livrables - Lundi (Sprint 2)
Compte-rendu d'analyse - Hermas Francisco

## 1. Analyse de l'Étude de Cas (Fiche Problème)
* **Constat :** Le bug d'inversion de règle de validation ('confirmed' transformé en 'confirmation') par le dev junior a bloqué l'inscription pendant 66 heures, causant la perte de 3 candidats.
* **Impact DevOps :** Ce problème met en évidence l'absence d'un filet de sécurité automatisé (CI/CD). Le lead dev a validé visuellement sans tester l'impact réel en isolation.

## 2. Assimilation Théorique (Pyramide des Tests)
* **Concept clé :** L'anomalie aurait dû être capturée à la base de la pyramide (Test d'intégration/Feature sur l'endpoint `POST /api/auth/register`).
* **Règle du coût d'un bug :** Détecté en phase de développement, le coût est de x1 (quelques minutes pour corriger la faute de frappe). En production, le coût passe à x100 (66 heures de rupture de service, perte de clients, impact sur la réputation).

## 3. Audit Technique du Code Existant
J'ai analysé les tests de l'API Laravel dans `candly-api/tests/Feature/` :
* `ApplicationTest.php`
* `JobTest.php`
* `MediaTest.php`

* **Observation du Pattern :** Les tests actuels suivent rigoureusement la structure **AAA (Arrange, Act, Assert)**. Ils initialisent les Factories (Arrange), exécutent la requête HTTP (Act), puis vérifient le statut de la réponse et l'état de la base de données (Assert).