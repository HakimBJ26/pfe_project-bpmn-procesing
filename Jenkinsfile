pipeline {
    agent any
    
    tools {
        jdk 'JDK17'
        maven 'Maven3'
        nodejs 'Node20'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Backend - Build & Test') {
            steps {
                dir('spring-boot-microservices-main') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        
        stage('Backend - Unit Tests') {
            steps {
                dir('spring-boot-microservices-main') {
                    sh 'mvn test'
                }
            }
        }
        
        stage('Frontend - Install Dependencies') {
            steps {
                dir('camunda_front_bpmn') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Frontend - Build') {
            steps {
                dir('camunda_front_bpmn') {
                    sh 'npm run build'
                }
            }
        }
        
        stage('Frontend - Test') {
            steps {
                dir('camunda_front_bpmn') {
                    sh 'npm test -- --watchAll=false || true'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}