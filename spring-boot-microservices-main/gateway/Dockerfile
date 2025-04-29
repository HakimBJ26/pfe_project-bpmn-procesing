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

# Create a standalone configuration if needed
RUN mkdir -p /app/config
COPY src/main/resources/application.yml /app/config/

# Expose the port the application runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
