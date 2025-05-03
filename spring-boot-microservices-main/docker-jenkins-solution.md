# Configuration de Docker dans Jenkins - Guide complet

## Problème identifié
L'erreur que vous rencontrez (`process apparently never started`) indique que Jenkins ne peut pas exécuter Docker car il n'a pas accès au daemon Docker.

## Solution recommandée pour votre architecture

### 1. Vérification de votre architecture Jenkins

Votre Jenkins s'exécute dans un conteneur (indiqué par le chemin `/var/jenkins_home`). Pour utiliser Docker dans ce conteneur, vous devez:

- Monter le socket Docker de l'hôte
- Configurer les permissions correctes
- Installer le client Docker dans le conteneur Jenkins

### 2. Modification du conteneur Jenkins

```bash
# Arrêter votre conteneur Jenkins actuel
docker stop jenkins

# Le redémarrer avec les bonnes montages
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --group-add $(stat -c '%g' /var/run/docker.sock) \
  --name jenkins \
  jenkins/jenkins:lts
```

### 3. Installation du client Docker dans le conteneur Jenkins

```bash
# Accéder au conteneur
docker exec -it jenkins bash

# Installer Docker CLI (pour Debian/Ubuntu)
apt-get update
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce-cli

# Vérifier l'installation
docker --version
```

### 4. Correction des permissions

```bash
# Dans le conteneur Jenkins
# Trouver l'ID du groupe docker sur l'hôte
ls -la /var/run/docker.sock
# Exemple de résultat: srw-rw---- 1 root docker 0 May 03 10:00 /var/run/docker.sock

# Ajouter l'utilisateur jenkins à ce groupe
usermod -aG docker jenkins

# Redémarrer le service Jenkins
kill -USR2 1
```

### 5. Pipeline de test simplifié

```groovy
pipeline {
    agent any
    
    stages {
        stage('Test Docker') {
            steps {
                sh 'docker --version'
            }
        }
    }
}
```

## Alternative adaptée à votre projet (basée sur vos problèmes précédents)

Si la configuration directe de Docker dans Jenkins pose trop de problèmes (comme ceux que vous avez rencontrés avec Camunda), vous pouvez:

### Option 1: Utiliser Maven pour construire l'image Docker

Modifiez vos pom.xml pour ajouter le plugin Jib ou Spotify Docker Maven Plugin:

```xml
<plugin>
    <groupId>com.google.cloud.tools</groupId>
    <artifactId>jib-maven-plugin</artifactId>
    <version>3.3.1</version>
    <configuration>
        <to>
            <image>votre-registre/nom-service:latest</image>
        </to>
    </configuration>
</plugin>
```

Puis dans votre Jenkinsfile:

```groovy
stage('Build Docker Image') {
    steps {
        dir('spring-boot-microservices-main/auth-service') {
            sh 'mvn compile jib:build -DskipTests'
        }
    }
}
```

### Option 2: Utiliser un agent dédié

Créez un agent Jenkins spécifique pour les builds Docker:

```groovy
pipeline {
    agent {
        label 'docker-agent'
    }
    
    stages {
        // vos étapes
    }
}
```

## Recommandations pour vos microservices

Basé sur vos problèmes antérieurs:

1. Désactivez les tests problématiques lors de la construction Docker, comme vous l'avez fait pour Camunda
2. Utilisez `-Dspring.cloud.config.enabled=false` comme vous l'avez fait précédemment
3. Considérez l'utilisation de Jib qui ne nécessite pas de démon Docker pour construire des images
4. Documentez bien les paramètres nécessaires pour chaque service (particulièrement Camunda qui a posé des problèmes)
