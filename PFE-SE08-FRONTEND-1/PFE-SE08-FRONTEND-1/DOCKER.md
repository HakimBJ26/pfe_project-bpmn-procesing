# Docker Setup for BPMN Process Manager

This document provides instructions for containerizing and running the BPMN Process Manager application using Docker and Docker Compose.

## Prerequisites

- Docker Engine (20.10.0+)
- Docker Compose (2.0.0+)

## Configuration

The Docker setup is configurable through environment variables. You can set these variables in the following ways:

1. Using a `.env` file (copy from `.env.docker` and modify as needed)
2. Setting environment variables in your shell before running docker-compose
3. Passing variables directly to the docker-compose command

### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DOCKER_REGISTRY` | Docker registry for pushing/pulling images | `bpmn` |
| `TAG` | Docker image tag | `latest` |
| `CONTAINER_NAME` | Docker container name | `bpmn-process-manager` |
| `FRONTEND_PORT` | Port to expose the frontend application | `81` |
| `VITE_API_URL` | URL of the backend API | `http://localhost:8080` |

## Building and Running

### Development

```bash
# Build and start containers
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

### Production

For production deployments, use the production configuration:

```bash
# Set environment variables from .env.docker
export $(grep -v '^#' .env.docker | xargs)

# Build and start containers
docker-compose up -d --build
```

## Deployment

### 1. Build the Image

```bash
docker-compose build
```

### 2. Push to a Registry (Optional)

```bash
docker-compose push
```

### 3. Deploy on a Server

```bash
# Pull the latest image
docker-compose pull

# Start the services
docker-compose up -d
```

## Health Checks

The Docker containers include health checks to verify the applications are running correctly. You can check the status with:

```bash
docker-compose ps
```

## Logs

View application logs:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

## Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes as well
docker-compose down -v

# Remove images as well
docker-compose down -v --rmi all
```

## Troubleshooting

If you encounter any issues:

1. Check that the Docker daemon is running
2. Verify your environment variables are set correctly
3. Check container logs for errors
4. Ensure ports are not already in use by other services
5. If networking issues occur, try restarting Docker

## Security Considerations

- The production Docker setup uses Nginx with security headers
- Sensitive environment variables should be stored securely
- Consider using Docker secrets for production deployments
- The containers run as non-root users when possible 