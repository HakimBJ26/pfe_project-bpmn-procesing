pipeline {
    agent any

    stages {
        stage('Vérification Docker') {
            steps {
                echo "=== Vérification de l'installation Docker ==="
                
                // Vérifier que la commande docker existe
                sh 'docker --version'
                
                // Vérifier que le daemon docker tourne
                sh 'docker info'
                
                // Vérifier que docker peut pull une image
                sh 'docker pull hello-world'
                
                // Vérifier que docker peut exécuter un conteneur
                sh 'docker run --rm hello-world'
                
                // Lister les images disponibles
                sh 'docker images'
                
                echo "=== Docker fonctionne correctement! ==="
            }
        }
        
        stage('Test Docker Build') {
            steps {
                echo "=== Test de construction d'une image Docker simple ==="
                
                // Créer un dockerfile de test
                sh '''
                mkdir -p docker-test
                cd docker-test
                echo 'FROM alpine:latest' > Dockerfile
                echo 'CMD ["echo", "Docker build test successful!"]' >> Dockerfile
                
                # Construire l'image
                docker build -t docker-jenkins-test:latest .
                
                # Exécuter le conteneur créé
                docker run --rm docker-jenkins-test:latest
                
                # Nettoyer
                cd ..
                rm -rf docker-test
                '''
                
                echo "=== Test de construction d'image Docker réussi! ==="
            }
        }
    }
    
    post {
        success {
            echo "Docker est correctement installé et configuré dans Jenkins!"
        }
        failure {
            echo "ERREUR: Il y a un problème avec l'installation Docker dans Jenkins. Vérifiez les logs."
        }
        always {
            // Nettoyer les ressources Docker utilisées pour le test
            sh '''
            docker rmi hello-world docker-jenkins-test:latest || true
            docker system prune -f || true
            '''
        }
    }
}
