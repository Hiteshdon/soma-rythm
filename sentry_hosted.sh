#!/bin/bash

set -e

echo "🚀 Starting Sentry setup..."

# -------------------------------
# 1. Update system
# -------------------------------
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# -------------------------------
# 2. Install dependencies
# -------------------------------
echo "🔧 Installing dependencies..."
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    build-essential

# -------------------------------
# 3. Install Docker
# -------------------------------
echo "🐳 Installing Docker..."

sudo mkdir -p /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
"deb [arch=$(dpkg --print-architecture) \
signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

echo "⚠️ Please log out and log back in after this script for Docker permissions."

# -------------------------------
# 4. Clone Sentry repo
# -------------------------------
echo "📥 Cloning Sentry..."
git clone https://github.com/getsentry/self-hosted.git
cd self-hosted

# -------------------------------
# 5. Run installation
# -------------------------------
echo "⚙️ Running Sentry install..."
./install.sh

# -------------------------------
# 6. Start Sentry
# -------------------------------
echo "🔥 Starting Sentry..."
docker compose up -d

# -------------------------------
# 7. Done
# -------------------------------
echo "✅ Sentry is running!"
echo "👉 Open: http://localhost:9000"