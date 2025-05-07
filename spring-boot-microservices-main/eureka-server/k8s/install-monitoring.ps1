# Script d'installation de Prometheus et Grafana

# Créer le namespace monitoring
Write-Host "Création du namespace monitoring..."
kubectl apply -f monitoring-namespace.yaml

# Ajouter le repo Helm Prometheus community
Write-Host "Ajout du repo Helm pour Prometheus..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Installer Prometheus Stack (inclut Prometheus, Alertmanager et Grafana)
Write-Host "Installation de Prometheus Stack..."
helm install prometheus prometheus-community/kube-prometheus-stack `
  --namespace monitoring `
  --set prometheus.service.type=NodePort `
  --set prometheus.service.nodePort=30900 `
  --set grafana.service.type=NodePort `
  --set grafana.service.nodePort=30880 `
  --set grafana.adminPassword=admin

# Attendre que les pods soient prêts
Write-Host "Attente que les pods soient prêts..."
Start-Sleep -Seconds 30

# Afficher les services créés
Write-Host "Services de monitoring créés:"
kubectl get services -n monitoring

# Afficher les informations d'accès
Write-Host "`nAccès à Prometheus: http://localhost:30900"
Write-Host "Accès à Grafana: http://localhost:30880"
Write-Host "Identifiants Grafana: admin / admin"

# Instructions pour le déploiement de l'application
Write-Host "`nPour déployer Eureka Server avec monitoring:"
Write-Host "kubectl apply -f deployment.yaml"
Write-Host "kubectl apply -f service.yaml"
Write-Host "kubectl apply -f servicemonitor.yaml"
