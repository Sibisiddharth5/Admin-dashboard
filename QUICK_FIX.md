# Quick Docker Fix

## Problem
Container has Docker socket mounted but no Docker CLI installed, causing:
- `Docker API failed: Not supported URL scheme http+docker`
- `Docker subprocess failed: [Errno 2] No such file or directory: 'docker'`

## Quick Solution

### Option 1: Rebuild Container (Recommended)
```bash
# Stop current container
docker stop admin-backend
docker rm admin-backend

# Rebuild with Docker CLI
cd /path/to/admin-dashboard/backend
docker build -t admin-dashboard:latest .

# Run with updated image
docker run -d \
  --name admin-backend \
  --network traefik \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e DOCKER_HOST=unix:///var/run/docker.sock \
  --user root \
  -l "traefik.enable=true" \
  -l "traefik.http.routers.admin-backend.rule=Host(\`app.kambaa.ai\`)" \
  -l "traefik.http.routers.admin-backend.tls=true" \
  -l "traefik.http.routers.admin-backend.tls.certresolver=letsencrypt" \
  -l "traefik.http.services.admin-backend.loadbalancer.server.port=8004" \
  admin-dashboard:latest
```

### Option 2: Install Docker in Running Container
```bash
# Enter container
docker exec -it admin-backend bash

# Install Docker CLI
apt-get update
apt-get install -y curl
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Test Docker access
docker ps

# Exit and restart container
exit
docker restart admin-backend
```

### Option 3: Use Docker Compose
```bash
cd /path/to/admin-dashboard/backend
docker-compose down
docker-compose build
docker-compose up -d
```

## Verify Fix
```bash
# Check if Docker works in container
docker exec admin-backend docker ps

# Test API
curl https://app.kambaa.ai/api/containers/
```

## Expected Result
Container management will show:
- Real container IDs instead of "N/A"
- Actual status instead of "Docker N/A"
- Working action buttons