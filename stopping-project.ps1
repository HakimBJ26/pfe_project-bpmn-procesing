# Script d'arrêt de l'application complète (Backend + Frontend)
Write-Host "=== Arrêt de l'application BPMN Processing ===" -ForegroundColor Cyan

# Définir les chemins des projets
$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendPath = Join-Path -Path $rootPath -ChildPath "spring-boot-microservices-main"
$frontendPath = Join-Path -Path $rootPath -ChildPath "PFE-SE08-FRONTEND-1\PFE-SE08-FRONTEND-1"

# Vérifier l'état de Docker
try {
    $dockerStatus = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Docker n'est pas installé ou n'est pas accessible. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Arrêter le frontend
Write-Host "`n=== Arrêt du frontend ===" -ForegroundColor Cyan
if (Test-Path $frontendPath) {
    Set-Location -Path $frontendPath
    docker-compose down
} else {
    Write-Host "Le répertoire frontend n'existe pas: $frontendPath" -ForegroundColor Yellow
}

# Arrêter le backend
Write-Host "`n=== Arrêt des microservices backend ===" -ForegroundColor Cyan
if (Test-Path $backendPath) {
    Set-Location -Path $backendPath
    docker-compose down
} else {
    Write-Host "Le répertoire backend n'existe pas: $backendPath" -ForegroundColor Yellow
}

# Revenir au répertoire d'origine
Set-Location -Path $rootPath

# Afficher le statut final
Write-Host "`n=== Application arrêtée avec succès! ===" -ForegroundColor Green
Write-Host "Tous les conteneurs ont été arrêtés." -ForegroundColor Cyan
Write-Host "`nPour démarrer l'application, exécutez: .\starting-project.ps1" -ForegroundColor Yellow
