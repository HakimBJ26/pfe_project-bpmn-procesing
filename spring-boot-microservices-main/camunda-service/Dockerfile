# Stage 1: Build the application
FROM maven:3.8.4-openjdk-17-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the project's pom.xml and source code into the container
COPY pom.xml /app
COPY src /app/src

# Package the application
RUN mvn -f /app/pom.xml clean package -DskipTests

# Stage 2: Create the runtime image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the packaged jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Create application.properties for standalone mode
RUN echo "spring.cloud.config.enabled=false" > /app/application.properties && \
    echo "spring.config.import=optional:file:./application.properties" >> /app/application.properties && \
    echo "eureka.client.enabled=false" >> /app/application.properties && \
    echo "eureka.client.register-with-eureka=false" >> /app/application.properties && \
    echo "eureka.client.fetch-registry=false" >> /app/application.properties && \
    echo "spring.flyway.enabled=false" >> /app/application.properties && \
    echo "camunda.bpm.database.schema-update=true" >> /app/application.properties && \
    echo "camunda.bpm.database.type=mysql" >> /app/application.properties && \
    echo "spring.jpa.hibernate.ddl-auto=update" >> /app/application.properties && \
    echo "spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver" >> /app/application.properties && \
    echo "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect" >> /app/application.properties

# Expose the port the application runs on
EXPOSE 8998

# Run the application with external config
ENTRYPOINT ["java", "-jar", "app.jar"]