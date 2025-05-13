# Déploiement de Microservices Spring Boot sur Kubernetes

Ce projet démontre comment déployer une architecture microservices Spring Boot sur Kubernetes (Minikube) avec les composants suivants:

## Architecture du Projet

![Architecture Microservices](https://miro.medium.com/max/1400/1*I4Ak4uYpkz-m1GFWrWF1sg.png)

### Services inclus:

- **Eureka Server**: Service de découverte pour l'enregistrement des microservices
- **Config Server**: Gestion centralisée de la configuration
- **API Gateway**: Point d'entrée unique pour les requêtes clients
- **Auth Service**: Gestion de l'authentification et autorisation (JWT)
- **User Service**: Gestion des utilisateurs
- **Camunda Service**: Moteur de workflow BPMN
- **Frontend React**: Application frontend pour la gestion des processus BPMN

### Technologies utilisées:

- **Spring Boot**: Framework Java pour le développement des microservices
- **Spring Cloud**: Outils pour les systèmes distribués
- **Spring Security**: Sécurité et authentification avec JWT
- **MySQL**: Base de données relationnelle
- **Kubernetes**: Orchestration de conteneurs
- **Docker**: Conteneurisation des services
- **React**: Framework frontend

## Prérequis

- Docker Desktop
- Minikube
- kubectl
- PowerShell (Windows) ou Terminal (Linux/macOS)

## Guide de déploiement

### 1. Démarrer Minikube

```powershell
# Supprimer toute instance existante de Minikube
minikube delete

# Démarrer Minikube avec Docker
minikube start --driver=docker --memory=1800 --cpus=2
```

### 2. Configurer Docker pour utiliser le daemon Docker de Minikube

```powershell
& minikube -p minikube docker-env | Invoke-Expression
```

### 3. Créer les fichiers de déploiement Kubernetes

Créez un répertoire `k8s` et ajoutez les fichiers de déploiement suivants:

- `namespace.yaml`: Définit le namespace Kubernetes pour les microservices
- `mysql-deployment.yaml`: Déploie MySQL avec un volume persistant
- `eureka-server-deployment.yaml`: Déploie le serveur Eureka
- `config-server-deployment.yaml`: Déploie le serveur de configuration
- `gateway-deployment.yaml`: Déploie l'API Gateway
- `auth-service-deployment.yaml`: Déploie le service d'authentification
- `user-service-deployment.yaml`: Déploie le service utilisateur
- `camunda-service-deployment.yaml`: Déploie le service Camunda
- `frontend-deployment.yaml`: Déploie l'application frontend

### 4. Construire les images Docker

```powershell
# Eureka Server
cd spring-boot-microservices-main\eureka-server
docker build -t eureka-server:latest .
cd ..\..

# Config Server
cd spring-boot-microservices-main\config-server
docker build -t config-server:latest .
cd ..\..

# Gateway
cd spring-boot-microservices-main\gateway
docker build -t gateway:latest .
cd ..\..

# Auth Service
cd spring-boot-microservices-main\auth-service
docker build -t auth-service:latest .
cd ..\..

# User Service
cd spring-boot-microservices-main\user-service
docker build -t user-service:latest .
cd ..\..

# Camunda Service
cd spring-boot-microservices-main\camunda-service
docker build -t camunda-service:latest .
cd ..\..

# Frontend
cd PFE-SE08-FRONTEND-1\PFE-SE08-FRONTEND-1
docker build -t frontend:latest .
cd ..\..
```

### 5. Déployer les services

```powershell
# Créer le namespace
kubectl apply -f k8s/namespace.yaml

# Déployer MySQL
kubectl apply -f k8s/mysql-deployment.yaml

# Déployer Eureka Server
kubectl apply -f k8s/eureka-server-deployment.yaml

# Déployer Config Server
kubectl apply -f k8s/config-server-deployment.yaml

# Déployer Gateway
kubectl apply -f k8s/gateway-deployment.yaml

# Déployer Auth Service
kubectl apply -f k8s/auth-service-deployment.yaml

# Déployer User Service
kubectl apply -f k8s/user-service-deployment.yaml

# Déployer Camunda Service
kubectl apply -f k8s/camunda-service-deployment.yaml

# Déployer Frontend
kubectl apply -f k8s/frontend-deployment.yaml
```

### 6. Vérifier le déploiement

```powershell
# Vérifier les pods
kubectl get pods -n microservices

# Vérifier les services
kubectl get services -n microservices
```

### 7. Accéder aux services

```powershell
# Obtenir l'URL pour accéder à Gateway
minikube service gateway -n microservices --url

# Obtenir l'URL pour accéder au Frontend
minikube service frontend -n microservices --url
```

## Structure du projet

```
spring-boot-microservices-main/
├── auth-service/         # Service d'authentification
├── camunda-service/      # Service de workflow BPMN
├── config-server/        # Serveur de configuration
├── config/               # Fichiers de configuration
├── eureka-server/        # Serveur de découverte
├── file-storage/         # Service de stockage de fichiers
├── gateway/              # API Gateway
├── job-service/          # Service de gestion des emplois
├── k8s/                  # Fichiers de déploiement Kubernetes
├── notification-service/ # Service de notification
└── user-service/         # Service de gestion des utilisateurs

PFE-SE08-FRONTEND-1/
└── PFE-SE08-FRONTEND-1/  # Application frontend React
```

## Fonctionnalités

- **Authentification et autorisation**: JWT, rôles utilisateur (ADMIN, USER)
- **Gestion des utilisateurs**: Inscription, connexion, profil
- **Workflow BPMN**: Création et exécution de processus métier
- **API Gateway**: Routage des requêtes vers les services appropriés
- **Configuration centralisée**: Gestion des propriétés des services
- **Découverte de services**: Enregistrement et découverte automatique des services

## Dépannage

### Problèmes courants et solutions

1. **Pods en état "Pending"**:
   - Vérifiez les ressources disponibles: `kubectl describe pod <nom-du-pod> -n microservices`
   - Augmentez les ressources allouées à Minikube

2. **Pods en état "CrashLoopBackOff"**:
   - Vérifiez les logs: `kubectl logs <nom-du-pod> -n microservices`
   - Vérifiez les variables d'environnement et les dépendances

3. **Services non accessibles**:
   - Vérifiez les services: `kubectl get services -n microservices`
   - Vérifiez les endpoints: `kubectl get endpoints -n microservices`

## Nettoyage

Pour supprimer tous les ressources créées:

```powershell
# Supprimer tous les déploiements dans le namespace microservices
kubectl delete namespace microservices

# Arrêter Minikube
minikube stop

# Supprimer le cluster Minikube
minikube delete
```

## Références

- [Documentation Spring Boot](https://spring.io/projects/spring-boot)
- [Documentation Kubernetes](https://kubernetes.io/docs/home/)
- [Documentation Minikube](https://minikube.sigs.k8s.io/docs/)
- [Documentation Docker](https://docs.docker.com/)
