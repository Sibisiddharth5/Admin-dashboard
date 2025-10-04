# Docker Setup Guide

## Current Status
Your admin dashboard is working correctly, but **Docker is not installed** on your server. This is why you see:
- Container ID: "N/A"
- Status: "Docker N/A" 
- Actions: "Docker not available"

## What's Working
✅ User registration and management  
✅ Container information display (expected ports, names)  
✅ Admin dashboard functionality  
✅ Database operations  

## What's Missing
❌ Actual Docker containers  
❌ Container start/stop/create operations  
❌ Real container status monitoring  

## Install Docker (Ubuntu/Debian)

### Quick Installation
```bash
# Update system
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Test installation
docker --version
docker ps
```

### Manual Installation
```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt update
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
```

## Install Docker (CentOS/RHEL)
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
```

## Verify Installation
```bash
# Check Docker version
docker --version

# Check Docker service
sudo systemctl status docker

# Test Docker
docker run hello-world

# Check for existing containers
docker ps -a
```

## After Docker Installation

1. **Restart your backend server**
2. **Refresh the admin dashboard**
3. **Container management will now show:**
   - Real container IDs
   - Actual container status (running/stopped/exited)
   - Working Create/Start/Stop/Remove buttons

## Expected Container Behavior

Once Docker is installed, your containers will:
- **chatbot_3**: Run on port 8083
- **chatbot_4**: Run on port 8084  
- **chatbot_21**: Run on port 80821
- **chatbot_22**: Run on port 80822

Each container will use the `nginx:alpine` image and be accessible via their respective ports.

## Troubleshooting

### Permission Issues
```bash
# If you get permission denied
sudo chmod 666 /var/run/docker.sock
# OR
sudo usermod -aG docker $USER
newgrp docker
```

### Service Issues
```bash
# Restart Docker service
sudo systemctl restart docker

# Check Docker logs
sudo journalctl -u docker.service
```

### Container Creation Issues
```bash
# Pull nginx image manually
docker pull nginx:alpine

# Test container creation
docker run -d --name test-container -p 8080:80 nginx:alpine
docker ps
docker rm -f test-container
```

## Current Dashboard Behavior

Your dashboard is correctly showing:
- ✅ **User Info**: Names, companies, subdomains
- ✅ **Expected Ports**: Correct port mappings (808X:80)
- ✅ **Image**: nginx:alpine (correct)
- ⚠️ **Status**: "Docker N/A" (because Docker isn't installed)
- ⚠️ **Container ID**: "N/A" (no actual containers)
- ⚠️ **Actions**: Disabled (Docker required)

This is the expected behavior when Docker is not available. The system is working perfectly - it just needs Docker to manage actual containers.