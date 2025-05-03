pipeline {
    agent any
    
    stages {
        stage('Test Docker Connection') {
            steps {
                // Test simple pour vérifier si Docker est accessible
                sh '''
                echo "=== Test simple de Docker ==="
                docker version || echo "Docker inaccessible - vérifiez la configuration"
                '''
            }
        }
        
        // Si le premier test passe, on essaie quelque chose de plus complet
        stage('Test Docker Build') {
            when {
                // Ne s'exécute que si l'étape précédente est réussie
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                // Création d'un Dockerfile minimal
                sh '''
                echo "FROM alpine:latest" > Dockerfile.test
                echo "CMD [\"echo\", \"Test Docker dans Jenkins réussi!\"]" >> Dockerfile.test
                
                # Construire l'image avec un nom unique
                docker build -f Dockerfile.test -t jenkins-docker-test:latest .
                
                # Exécuter l'image pour vérifier qu'elle fonctionne
                docker run --rm jenkins-docker-test:latest
                
                # Nettoyage
                rm -f Dockerfile.test
                '''
            }
        }
    }
    
    post {
        success {
            echo "Docker fonctionne correctement dans Jenkins!"
        }
        failure {
            echo "Docker n'est pas configuré correctement. Suivez les étapes du guide docker-jenkins-solution.md"
        }
    }
}
