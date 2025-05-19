# Script de démarrage de l'application complète (Backend + Frontend)
Write-Host "=== Démarrage de l'application BPMN Processing ===" -ForegroundColor Cyan

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

# Vérifier si les répertoires existent
if (-not (Test-Path $backendPath)) {
    Write-Host "Erreur: Le répertoire backend n'existe pas: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "Erreur: Le répertoire frontend n'existe pas: $frontendPath" -ForegroundColor Red
    exit 1
}

# Fonction pour vérifier si un service est accessible
function Test-ServiceAvailability {
    param (
        [string]$ServiceName,
        [string]$Url,
        [int]$TimeoutSeconds = 120
    )
    
    $startTime = Get-Date
    $timeout = New-TimeSpan -Seconds $TimeoutSeconds
    
    Write-Host "Attente du démarrage de $ServiceName à $Url (timeout: ${TimeoutSeconds}s)..." -ForegroundColor Yellow
    
    while ((Get-Date) - $startTime -lt $timeout) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName est disponible!" -ForegroundColor Green
                return $true
            }
        } catch {
            # Attendre et réessayer
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "❌ $ServiceName n'est pas disponible après ${TimeoutSeconds} secondes." -ForegroundColor Red
    return $false
}

# Démarrer le backend
Write-Host "`n=== Démarrage des microservices backend ===" -ForegroundColor Cyan
Set-Location -Path $backendPath
docker-compose down 2>&1 | Out-Null
docker-compose up -d

# Vérifier le statut des conteneurs
Start-Sleep -Seconds 5
Write-Host "`nStatut des conteneurs backend:" -ForegroundColor Cyan
docker-compose ps

# Attendre que Eureka soit disponible
Test-ServiceAvailability -ServiceName "Eureka Server" -Url "http://localhost:8761" -TimeoutSeconds 90

# Attendre que la Gateway soit disponible
Test-ServiceAvailability -ServiceName "API Gateway" -Url "http://localhost:8080/actuator/health" -TimeoutSeconds 90

# Démarrer le frontend
Write-Host "`n=== Démarrage du frontend ===" -ForegroundColor Cyan
Set-Location -Path $frontendPath
docker-compose down 2>&1 | Out-Null
docker-compose up -d

# Vérifier le statut des conteneurs frontend
Start-Sleep -Seconds 5
Write-Host "`nStatut des conteneurs frontend:" -ForegroundColor Cyan
docker-compose ps

# Revenir au répertoire d'origine
Set-Location -Path $rootPath

# Afficher les URLs d'accès
Write-Host "`n=== Application démarrée avec succès! ===" -ForegroundColor Green
Write-Host "URLs d'accès:"
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "- Backend API Gateway: http://localhost:8080" -ForegroundColor Cyan
Write-Host "- Eureka Server: http://localhost:8761" -ForegroundColor Cyan
Write-Host "- Camunda: http://localhost:8998" -ForegroundColor Cyan

Write-Host "`nPour arrêter l'application, exécutez: .\stopping-project.ps1" -ForegroundColor Yellow
