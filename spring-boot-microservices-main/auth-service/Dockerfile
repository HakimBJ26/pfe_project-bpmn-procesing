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

# Create application.properties for standalone mode if needed
RUN echo "server.port=8999" > /app/application.properties && \
    echo "application-title=Auth Service" >> /app/application.properties && \
    echo "spring.application.name=auth-service" >> /app/application.properties && \
    echo "spring.config.import=optional:configserver:http://config-server:8888/" >> /app/application.properties && \
    echo "eureka.client.serviceUrl.defaultZone=http://eureka-server:8761/eureka/" >> /app/application.properties

# Expose the port the application runs on
EXPOSE 8999

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
