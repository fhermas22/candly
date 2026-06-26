# Rétrospective du Sprint 1 - DevOps & Conteneurisation (Candly)

## 1. Objectifs du Sprint
L'objectif principal de ce premier sprint était de résoudre définitivement le problème du « Ça marche chez moi » rencontré au sein de l'équipe de la plateforme de recrutement Candly. Avec l'arrivée de développeurs travaillant sur des systèmes hétérogènes (Mac, Windows et Ubuntu), il était crucial de standardiser l'environnement de développement complet (MySQL, Laravel API, React Frontend) via une architecture multi-conteneurs robuste pilotable par une commande unique : `docker compose up`.

## 2. Ce qui s'est bien passé (Points forts)
* **Standardisation de l'environnement :** Réussite de la conteneurisation isolée avec la création de fichiers `Dockerfile` optimisés pour l'API Laravel (`candly-api`) et le frontend React (`candly-frontend`).
* **Orchestration efficace :** Rédaction d'un fichier `docker-compose.yml` complet unifiant les services Backend, Frontend et la base de données MySQL, assurant la persistance des données et la communication inter-services.
* **Workflow Git collaboratif :** Adoption de bonnes pratiques de gouvernance de code avec la gestion avancée des branches (notamment `feat/docker-setup`), l'ouverture de Pull Requests et la résolution propre des conflits de fusion (sur les fichiers d'environnement comme `.env.example`).
* **Utilisation des Bind Mounts :** Intégration du rechargement à chaud (Hot-Reloading) actif pour le développement en direct sans besoin de rebâtir l'image à chaque modification de code.

## 3. Difficultés rencontrées & Défis techniques
* **Friction réseau et DNS lors du Build :** Blocage lors de la construction de l'image de `candly-api` à l'étape du gestionnaire de paquets Alpine (`apk add`). Docker n'arrivait pas à résoudre l'adresse internet de l'index des paquets (`DNS: transient error`), interrompant le build.
* **Incompatibilité et cache de configuration (Laravel & Composer) :** Erreurs liées à la compatibilité des dépendances dans le fichier `composer.lock` sur la plateforme de build ainsi que des décalages de cache empêchant la bonne lecture des variables d'environnement unifiées.
* **Connexion aux outils externes (DBeaver) :** Problème classique d'authentification et de pilote avec MySQL 8 lors de la tentative de connexion depuis la machine hôte vers le conteneur de base de données.

## 4. Solutions apportées & Enseignements
* **Résolution des erreurs DNS :** Le problème a été contourné en redémarrant le démon Docker et en forçant temporairement l'utilisation du réseau hôte (`--network=host`) pour partager la configuration DNS de la machine physique, ou en injectant directement des DNS fixes (comme `8.8.8.8`) dans le fichier de configuration du *Docker Engine*.
* **Optimisation Laravel :** Nettoyage rigoureux du cache de configuration interne de Laravel (`php artisan config:clear`) pour s'assurer que l'API lise correctement les identifiants unifiés de la base de données.
* **Configuration DBeaver / MySQL 8 :** Ajustement des propriétés du pilote dans DBeaver en passant la variable `allowPublicKeyRetrieval` à `true` et `useSSL` à `false` afin de lever les verrous de sécurité spécifiques à MySQL 8.
* **Leçon clé :** L'isolement complet des dépendances (Node et Composer) au sein même des conteneurs sécurise le projet et évite les conflits de versions globales sur les machines des développeurs.

## 5. Plan d'action pour les Sprints Futurs
* **Automatisation (CI/CD) :** Profiter de la gouvernance stricte par variables d'environnement mise en place dans ce sprint pour préparer l'intégration de pipelines d'Intégration Continue (CI) et de Déploiement Continu (CD).
* **Maintenance des configurations :** Nettoyer et mettre à jour régulièrement le fichier `.gitignore` (via la branche dédiée `feat/gitignore-update`) pour éviter de pousser par mégarde des fichiers de configuration locaux ou sensibles.