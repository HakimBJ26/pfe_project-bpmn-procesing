# Application de Traitement de Processus BPMN avec Microservices Spring Boot

Ce projet implémente une architecture microservices complète pour la gestion et l'exécution de processus BPMN, avec une application frontend React et un backend basé sur Spring Boot et Camunda, le tout conteneurisé avec Docker.

## Architecture du Projet

![Architecture Microservices](https://miro.medium.com/max/1400/1*I4Ak4uYpkz-m1GFWrWF1sg.png)

### Services inclus et leurs rôles:

- **Eureka Server (Port 8761)**: Service de découverte permettant aux microservices de s'enregistrer et de se localiser mutuellement sans configuration en dur des adresses IP.

- **Config Server (Port 8888)**: Gestion centralisée de la configuration pour tous les services. Permet de modifier la configuration sans redémarrer les services.

- **API Gateway (Port 8080)**: Point d'entrée unique pour toutes les requêtes clients. Gère le routage des requêtes vers les services appropriés et la sécurité globale.

- **Auth Service (Port 8999)**: Responsable de l'authentification des utilisateurs et de la génération des tokens JWT utilisés pour sécuriser les API.

- **User Service (Port 8996)**: Gère les profils utilisateurs, les rôles et les autorisations.

- **Camunda Service (Port 8998)**: Moteur de workflow BPMN permettant la création, le déploiement et l'exécution de processus métier.

- **MySQL**: Base de données relationnelle partagée par tous les microservices.

- **Frontend React (Port 3000)**: Application web moderne pour interagir avec les processus BPMN et gérer les utilisateurs. Déployée dans un conteneur Docker avec Nginx.

### Technologies utilisées:

- **Spring Boot**: Framework Java pour le développement de microservices robustes
- **Spring Cloud**: Composants pour systèmes distribués (Eureka, Config Server, Gateway)
- **Spring Security** et **JWT**: Authentification et autorisation sécurisées
- **Camunda Engine**: Moteur de workflow BPMN avec API REST
- **React/TypeScript**: Framework frontend moderne avec typage fort
- **Docker & Docker Compose**: Conteneurisation et orchestration des services
- **MySQL**: Base de données relationnelle robuste

## Prérequis

- Docker Desktop (avec Docker Compose)
- PowerShell (Windows) ou Terminal (Linux/macOS)
- Un navigateur web moderne (Chrome, Firefox, Edge, etc.)

## Démarrage rapide avec les scripts

Des scripts de démarrage et d'arrêt ont été créés pour faciliter la gestion de l'application complète :

### 1. Démarrer l'application complète

```powershell
# À la racine du projet, exécutez :
.\starting-project.ps1
```

Ce script va :
- Démarrer tous les microservices backend dans l'ordre approprié
- Attendre que les services critiques soient disponibles (Eureka, Gateway)
- Démarrer l'application frontend
- Afficher les URLs d'accès aux différents services

### 2. Arrêter l'application complète

```powershell
# À la racine du projet, exécutez :
.\stopping-project.ps1
```

Ce script arrête proprement tous les conteneurs Docker des services backend et frontend.

## Démarrage manuel avec Docker Compose

Si vous préférez démarrer les services manuellement, suivez ces étapes :

### 1. Démarrer les services backend

```powershell
# Accéder au répertoire du backend
cd spring-boot-microservices-main

# Démarrer les services
docker-compose up -d
```

L'ordre de démarrage et les dépendances sont configurés dans le fichier `docker-compose.yml`. Les services seront démarrés dans cet ordre :
1. MySQL (base de données)
2. Eureka Server (découverte de services)
3. Config Server (configuration)
4. Les microservices applicatifs (auth-service, user-service, camunda-service)
5. API Gateway

### 2. Démarrer le frontend

```powershell
# Accéder au répertoire du frontend
cd ..\PFE-SE08-FRONTEND-1\PFE-SE08-FRONTEND-1

# Démarrer le service frontend
docker-compose up -d
```

### 3. Vérifier l'état des services

```powershell
# Vérifier l'état des services backend
cd ..\..\spring-boot-microservices-main
docker-compose ps

# Vérifier l'état du frontend
cd ..\PFE-SE08-FRONTEND-1\PFE-SE08-FRONTEND-1
docker-compose ps

# Vérifier l'enregistrement des services dans Eureka
# Accédez à http://localhost:8761 dans votre navigateur
```

## Structure du projet

```
spring-boot-microservices-main/   # Répertoire principal du backend
│├─ auth-service/             # Service d'authentification et d'autorisation
│├─ camunda-service/          # Moteur de workflow BPMN
│├─ config-server/            # Serveur de configuration centralisée
│├─ config/                   # Fichiers de configuration pour Config Server
│├─ eureka-server/            # Service de découverte pour l'enregistrement des microservices
│├─ gateway/                  # API Gateway pour le routage des requêtes
│├─ user-service/             # Service de gestion des utilisateurs
│├─ docker-compose.yml         # Configuration Docker Compose pour le backend
│├─ starting-project.ps1      # Script de démarrage de tous les services
│└─ stopping-project.ps1       # Script d'arrêt de tous les services

PFE-SE08-FRONTEND-1/
└─ PFE-SE08-FRONTEND-1/       # Application frontend React/TypeScript
    ├─ src/                    # Code source de l'application frontend
    ├─ Dockerfile              # Configuration pour construire l'image Docker du frontend
    └─ docker-compose.yml      # Configuration Docker Compose pour le frontend
```

## Utilisation de l'application

Une fois les services démarrés, vous pouvez accéder aux différentes interfaces :

### 1. Application Frontend

- **URL**: http://localhost:3000
- **Description**: Interface utilisateur principale pour interagir avec l'application.
- **Fonctionnalités**:
  - Authentification (Login/Register)
  - Gestion des processus BPMN
  - Visualisation et exécution des tâches
  - Interface d'administration

### 2. Eureka Dashboard

- **URL**: http://localhost:8761
- **Description**: Interface de surveillance pour vérifier l'enregistrement des services.

### 3. Camunda Cockpit

- **URL**: http://localhost:8998
- **Description**: Interface d'administration Camunda pour la gestion des processus BPMN.
- **Identifiants par défaut**: demo / demo

## Fonctionnalités

- **Authentification sécurisée**: JWT, gestion des sessions, contrôle d'accès basé sur les rôles (ADMIN, USER)
- **Gestion des utilisateurs**: Inscription, connexion, profils utilisateurs, modification des informations personnelles
- **Modélisation BPMN**: Création, modification et déploiement de diagrammes de processus BPMN
- **Exécution de processus**: Démarrage et suivi des instances de processus
- **Gestion des tâches**: Liste des tâches, attribution, complétion
- **Communication entre services**: Communication synchrone via API REST et asynchrone via événements
- **Configuration centralisée**: Gestion des propriétés des services via Config Server
- **Découverte de services**: Enregistrement et découverte automatique des services via Eureka

## Dépannage

### Problèmes courants et solutions

1. **Problèmes de connexion aux services**:
   - Vérifiez que tous les services sont en cours d'exécution avec `docker-compose ps`
   - Consultez les logs des services avec `docker-compose logs <service-name>`
   - Vérifiez l'enregistrement des services dans Eureka (http://localhost:8761)

2. **Erreurs CORS dans le frontend**:
   - Assurez-vous que la configuration CORS est correcte dans tous les services
   - Vérifiez les origines autorisées dans les fichiers WebConfig.java

3. **Problèmes de connexion à la base de données**:
   - Vérifiez que MySQL est en cours d'exécution: `docker-compose ps mysql`
   - Vérifiez les logs MySQL: `docker-compose logs mysql`
   - Assurez-vous que les paramètres de connexion sont corrects dans les fichiers application.properties

4. **Service ne s'enregistre pas dans Eureka**:
   - Vérifiez que le service a la configuration Eureka correcte
   - Assurez-vous que le nom du service est en minuscules
   - Redémarrez le service: `docker-compose restart <service-name>`

## Nettoyage

Pour arrêter et supprimer tous les conteneurs Docker:

```powershell
# Arrêter tous les services
.\stopping-project.ps1

# OU manuellement
cd spring-boot-microservices-main
docker-compose down

cd ..\PFE-SE08-FRONTEND-1\PFE-SE08-FRONTEND-1
docker-compose down

# Pour supprimer également les volumes (attention, cela supprimera les données MySQL)
docker-compose down -v
```

## Références

- [Documentation Spring Boot](https://spring.io/projects/spring-boot)
- [Documentation Spring Cloud](https://spring.io/projects/spring-cloud)
- [Documentation Camunda](https://docs.camunda.org/)
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation React](https://reactjs.org/docs/getting-started.html)
