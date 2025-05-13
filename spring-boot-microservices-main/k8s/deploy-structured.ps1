#!/usr/bin/env pwsh
# Script de déploiement pour l'architecture microservices sur Kubernetes/Minikube
# Version structurée avec répertoires séparés

# Vérifier si Minikube est en cours d'exécution
Write-Host "Vérification de l'état de Minikube..." -ForegroundColor Cyan
$minikubeStatus = minikube status | Out-String

if (-not ($minikubeStatus -like "*host: Running*")) {
    Write-Host "Minikube n'est pas démarré. Démarrage en cours..." -ForegroundColor Yellow
    minikube start
    Write-Host "Minikube a été démarré." -ForegroundColor Green
} else {
    Write-Host "Minikube est déjà en cours d'exécution." -ForegroundColor Green
}

# Création du namespace
Write-Host "`nCréation du namespace microservices..." -ForegroundColor Cyan
kubectl apply -f namespace.yaml
Write-Host "Namespace créé." -ForegroundColor Green

# Déploiement du Config Server
Write-Host "`nDéploiement du Config Server..." -ForegroundColor Cyan
kubectl apply -f deployments/config-server-deployment.yaml
kubectl apply -f services/config-server-service.yaml
Write-Host "Config Server déployé." -ForegroundColor Green

# Attendre quelques secondes pour que le Config Server démarre
Write-Host "Attente de 10 secondes pour initialisation..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Déploiement du Eureka Server
Write-Host "`nDéploiement du Eureka Server..." -ForegroundColor Cyan
kubectl apply -f deployments/eureka-server-deployment.yaml
kubectl apply -f services/eureka-server-service.yaml
kubectl apply -f services/eureka-server-external-service.yaml
Write-Host "Eureka Server déployé." -ForegroundColor Green

# Attendre quelques secondes pour que le Eureka Server démarre
Write-Host "Attente de 30 secondes pour l'initialisation du Eureka Server..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Déploiement des services
Write-Host "`nDéploiement des services (API Gateway, Auth Service, User Service)..." -ForegroundColor Cyan
kubectl apply -f deployments/gateway-deployment.yaml
kubectl apply -f services/gateway-service.yaml
kubectl apply -f services/gateway-external-service.yaml

kubectl apply -f deployments/auth-service-deployment.yaml
kubectl apply -f services/auth-service-service.yaml

kubectl apply -f deployments/user-service-deployment.yaml
kubectl apply -f services/user-service-service.yaml
Write-Host "Services déployés." -ForegroundColor Green

# Attendre quelques secondes
Write-Host "Attente de 10 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Déploiement du service Camunda
Write-Host "`nDéploiement du service Camunda..." -ForegroundColor Cyan
kubectl apply -f deployments/camunda-service-deployment.yaml
kubectl apply -f services/camunda-service-service.yaml
kubectl apply -f services/camunda-service-external-service.yaml
Write-Host "Service Camunda déployé." -ForegroundColor Green

# Déploiement du monitoring
Write-Host "`nDéploiement des outils de monitoring (Prometheus et Grafana)..." -ForegroundColor Cyan
kubectl apply -f monitoring/prometheus-configmap.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl apply -f monitoring/prometheus-service.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
kubectl apply -f monitoring/grafana-service.yaml
Write-Host "Outils de monitoring déployés." -ForegroundColor Green

# Vérification des déploiements
Write-Host "`nVérification de l'état des pods..." -ForegroundColor Cyan
kubectl get pods -n microservices

Write-Host "`nVérification des services..." -ForegroundColor Cyan
kubectl get services -n microservices

# Informations d'accès
Write-Host "`n----------------------------------------------------" -ForegroundColor Green
Write-Host "INFORMATIONS D'ACCÈS AUX SERVICES" -ForegroundColor Green
Write-Host "----------------------------------------------------" -ForegroundColor Green
Write-Host "Eureka Server: http://$(minikube ip):30761" -ForegroundColor Cyan
Write-Host "API Gateway: http://$(minikube ip):30080" -ForegroundColor Cyan
Write-Host "Camunda Service: http://$(minikube ip):30081" -ForegroundColor Cyan
Write-Host "Prometheus: http://$(minikube ip):30900" -ForegroundColor Cyan
Write-Host "Grafana: http://$(minikube ip):30300" -ForegroundColor Cyan
Write-Host "  Identifiants Grafana: admin / admin" -ForegroundColor Yellow
Write-Host "----------------------------------------------------" -ForegroundColor Green

Write-Host "`nL'architecture microservices a été déployée avec succès sur Kubernetes!" -ForegroundColor Green
Write-Host "Utilisez 'kubectl get pods -n microservices' pour vérifier l'état des services." -ForegroundColor Yellow
Write-Host "Utilisez 'kubectl logs -n microservices [nom-du-pod]' pour voir les logs d'un service." -ForegroundColor Yellow

Write-Host "`nConfiguration de Grafana:" -ForegroundColor Magenta
Write-Host "1. Accédez à Grafana via http://$(minikube ip):30300" -ForegroundColor Yellow
Write-Host "2. Connectez-vous avec admin/admin" -ForegroundColor Yellow
Write-Host "3. Ajoutez Prometheus comme source de données:" -ForegroundColor Yellow
Write-Host "   - URL: http://prometheus:9090" -ForegroundColor Yellow
Write-Host "   - Access: Server (default)" -ForegroundColor Yellow
Write-Host "4. Importez les tableaux de bord pour Spring Boot (ID: 4701, 11378)" -ForegroundColor Yellow
