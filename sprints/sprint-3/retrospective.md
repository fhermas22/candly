# Rétrospective Technique — Sprint 3 : Sécurité, Déploiement & Monitoring
**Projet :** Candly Platform  
**Auteur :** Hermas Francisco  
**Rôle :** Développeur Full-Stack / DevOps  
**Période :** Juillet 2026 

---

## 🎯 Objectifs du Sprint & Contexte
Suite à un audit critique mené par l'auditeur Reza , le lancement de la plateforme Candly a été reporté afin de corriger 5 vulnérabilités majeures:
1. Absence de chiffrement des flux (Pas de HTTPS).
2. Fuite d'informations système (Versions PHP/Nginx visibles dans les en-têtes HTTP).
3. Fuite potentielle de secrets dans l'historique CI/CD.
4. Processus de déploiement 100% manuel et sujet aux erreurs.
5. Opacité totale de l'infrastructure en production (Aucun outil de monitoring).

---

## 🛠️ Réalisations techniques par Axe

### 1. Sécurité Applicative (Shift-Left)
* **Middleware de Sécurité :** Implémentation du middleware `SecurityHeaders.php` dans l'API Laravel pour injecter les en-têtes de sécurité essentiels (`Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`).
* **Masquage d'Identité :** Suppression complète des en-têtes révélateurs `X-Powered-By` et `Server` pour limiter l'empreinte logicielle accessible aux attaquants.
* **Rate Limiting :** Durcissement des routes critiques `/auth/login` et `/auth/register` (limitation à 10 requêtes par minute) pour bloquer les attaques par force brute.
* **Audit de Secrets :** Analyse approfondie de l'historique Git (`git log -p`) confirmant l'absence totale de clés d'API ou de mots de passe codés en dur.

### 2. Infrastructure Conteneurisée & VPS
* **Pivot Cloud :** Déploiement opéré avec succès sur **AWS Amazon Lightsail** (Debian Linux) en remplacement de la cible Linode initialement envisagée.
* **Dockerisation de Production :** 
  * Création d'un `Dockerfile.prod` multi-stage optimisé pour le frontend React (image finale Nginx alpine ultra-légère).
  * Création d'un `Dockerfile.prod` pour Laravel incluant OPcache et l'exclusion des dépendances de développement (`--no-dev`).
* **Gestion des Contraintes de Ressources :** L'instance AWS Lightsail disposant de ressources RAM limitées, une **partition SWAP** a été configurée pour stabiliser les phases de build Docker et éviter les blocages système.
* **Orchestration & Healthchecks :** Déploiement d'un cluster à 3 services via `docker-compose.prod.yml` intégrant des politiques de redémarrage automatique et des `healthchecks` stricts avec `mysqladmin` pour garantir la résilience de la base de données avant le démarrage de l'API Laravel.

### 3. Automatisation CI/CD (GitHub Actions)
* **Pipeline à 4 Jobs :** Conception et validation du workflow `.github/workflows/ci-cd.yml` comprenant les étapes de tests backend (Pest), tests frontend (Lint + Build React), construction des images Docker et déploiement automatisé.
* **Logique Conditionnelle :** Configuration du job `deploy` pour s'exécuter de manière strictement séquentielle, uniquement après validation des 3 jobs précédents, et ciblant exclusivement les événements `push` ou `merge` sur la branche `main`.
* **Gestion des Secrets & SSH :** Intégration de `appleboy/ssh-action` sécurisée par les GitHub Secrets. Résolution à chaud du blocage lié aux clés privées SSH protégées par passphrase grâce à l'implémentation du paramètre dédié `passphrase` lié à un secret GitHub.

### 4. Monitoring & Alerting (Uptime Kuma)
* **Surveillance Proactive :** Installation réussie d'Uptime Kuma dans un conteneur Docker indépendant.
* **Sondage de Santé :** Configuration d'un moniteur HTTP(s) pointant vers l'endpoint `/api/health` de l'API de production, validant en temps réel la connexion à la base de données MySQL et la réactivité du cache.
* **Notification Instantanée :** Couplage réussi d'Uptime Kuma avec un relais **SMTP Gmail** sécurisé par un *Mot de passe d'application Google*, assurant une alerte mail instantanée en cas de dégradation ou de panne de la plateforme.

---

## 📈 Métriques & Résultats Finaux
* **Statut des conteneurs :** 3 services Docker fonctionnels et marqués `healthy` en production.
* **Sécurité Transport :** Chiffrement SSL/TLS complet validé via Certbot (Let's Encrypt), avec redirection automatique stricte du trafic HTTP vers HTTPS.
* **Pipeline :** Validation complète du run CI/CD, affichant **4 jobs au vert** en un temps optimisé.
* **Disponibilité :** Tableau de bord Uptime Kuma opérationnel et affichant le monitor `/api/health` au vert.

---

## 🧠 Leçons Apprises & Bonnes Pratiques
1. **L'importance de la SWAP sur les petits VPS :** Dans un environnement cloud à faible RAM, la configuration d'une mémoire d'échange est indispensable pour éviter que le démon Docker ne s'arrête brutalement lors des builds.
2. **Découplage Composer en CI/CD :** L'utilisation du drapeau `--no-scripts` lors du `composer install` dans le Dockerfile de production est une pratique DevOps essentielle pour dissocier l'installation des dépendances de la configuration logicielle dépendante de l'environnement (fichiers d'environnement non encore présents au build).
3. **Sécurisation de la CI :** Les secrets GitHub doivent englober toutes les facettes de l'authentification réseau, y compris les passphrases des clés privées, pour maintenir un flux de déploiement automatique sans friction et sans intervention humaine.

---
**Sprint 3 Validé — La plateforme Candly est officiellement sécurisée, automatisée et sous surveillance. Prête pour la production.** 🚀🔥