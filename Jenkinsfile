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

        stage('Debug - List Files') {
            steps {
                sh 'pwd'
                sh 'ls -la'
                sh 'find . -name "pom.xml" | sort'
            }
        }
        
        stage('Backend - Build') {
            parallel {
                stage('auth-service') {
                    steps {
                        dir('spring-boot-microservices-main/auth-service') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
                stage('job-service') {
                    steps {
                        dir('spring-boot-microservices-main/job-service') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
                stage('config-server') {
                    steps {
                        dir('spring-boot-microservices-main/config-server') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
                stage('eureka-server') {
                    steps {
                        dir('spring-boot-microservices-main/eureka-server') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
                stage('file-storage') {
                    steps {
                        dir('spring-boot-microservices-main/file-storage') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
                stage('gateway') {
                    steps {
                        dir('spring-boot-microservices-main/gateway') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
                stage('notification-service') {
                    steps {
                        dir('spring-boot-microservices-main/notification-service') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
                stage('user-service') {
                    steps {
                        dir('spring-boot-microservices-main/user-service') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
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