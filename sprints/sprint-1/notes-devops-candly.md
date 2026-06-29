# Notes DevOps - Plateforme Candly (Sprint 1)

## 1. Analyse de la situation actuelle de Candly
L'équipe de Candly fait face au problème classique du "Ça marche chez moi". L'arrivée de trois nouveaux développeurs dotés de systèmes d'exploitation différents (macOS, Windows, Ubuntu) a mis en lumière l'absence de standardisation des environnements de développement. Plusieurs heures ont été perdues à configurer des versions de PHP conflictuelles, des ports MySQL bloqués et des problèmes d'extensions manquantes.

## 2. Exercice de réflexion : Où se situe Candly ?

### Étapes du cycle DevOps en souffrance
L'équipe rencontre des difficultés majeures sur les étapes suivantes :
- **CODE :** Problèmes de formatage (CRLF vs LF dans Git) et conflits de configuration.
- **BUILD :** Échecs d'installation des dépendances (`composer install` défaillant, extensions PHP absentes) et versions d'outils différents.

### Solutions apportées par Docker
Docker résoudra les problèmes liés à l'étape de **BUILD** et de configuration de l'environnement de développement. En encapsulant MySQL, l'API Laravel et le Frontend React dans des conteneurs isolés, chaque développeur aura l'assurance d'exécuter exactement les mêmes versions de logiciels, indépendamment de son système d'exploitation hôte.

### Solutions apportées par un workflow Git
Un workflow Git structuré (conventions de nommage de branches, utilisation de Pull Requests pour la revue de code) permettra d'assainir l'étape de **CODE**, de fluidifier le travail collaboratif et d'éviter les réintégrations chaotiques sur la branche principale `main`.

### Note de maturité DevOps
**Note : 2 / 10**
*Justification :* Candly est au niveau zéro de l'automatisation. Les configurations sont purement manuelles, les environnements ne sont pas documentés ou mis à jour, et la communication technique se résume à constater des blocages individuels.

## 3. Compréhension des concepts clés (Veille & Assimilation)
- **DevOps :** Ce n'est ni un outil ni un poste, mais une culture visant à unifier le Développement (Dev) et les Opérations (Ops) afin de livrer de la valeur plus rapidement et de manière plus fiable.
- **Différence entre CI et CD :**
  - *CI (Continuous Integration) :* Automatisation des phases de build et de tests à chaque push de code pour détecter les bugs au plus tôt.
  - *CD (Continuous Delivery/Deployment) :* Automatisation de la préparation du déploiement (Delivery, avec validation humaine) ou du déploiement direct en production (Deployment).