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

# Create a directory for config files
RUN mkdir -p /app/config

# Copy the config files if needed
# COPY ../config /app/config/

# Create application.properties for standalone mode
RUN echo "spring.application.name=config-server" > /app/application.properties && \
    echo "server.port=8888" >> /app/application.properties && \
    echo "spring.profiles.active=native" >> /app/application.properties && \
    echo "spring.cloud.config.server.native.search-locations=file:///app/config" >> /app/application.properties

# Expose the port the application runs on
EXPOSE 8888

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
