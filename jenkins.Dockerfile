FROM jenkins/jenkins:lts

USER root

# Install necessary packages including coreutils (provides cat command)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    coreutils \
    git \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set permissions for Docker socket
RUN chmod 666 /var/run/docker.sock || true

# Keep container running as root to avoid permission issues with Docker socket
USER root 