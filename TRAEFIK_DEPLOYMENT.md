# Traefik Deployment with Docker Socket Access

## Current Issue
Your backend container can't access Docker because it lacks Docker socket access.

## Solution: Update with Traefik + Docker Socket

### 1. Stop Current Containers
```bash
docker stop admin-backend admin-frontend
docker rm admin-backend admin-frontend
```

### 2. Deploy with Docker Compose
```bash
cd /path/to/admin-dashboard/backend
docker-compose up -d
```

### 3. Alternative: Manual Docker Run with Traefik
```bash
# Backend with Docker socket + Traefik labels
docker run -d \
  --name admin-backend \
  --network traefik \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -l "traefik.enable=true" \
  -l "traefik.http.routers.admin-backend.rule=Host(\`app.kambaa.ai\`)" \
  -l "traefik.http.routers.admin-backend.tls=true" \
  -l "traefik.http.routers.admin-backend.tls.certresolver=letsencrypt" \
  -l "traefik.http.services.admin-backend.loadbalancer.server.port=8004" \
  admin-dashboard:latest

# Frontend with Traefik labels
docker run -d \
  --name admin-frontend \
  --network traefik \
  -l "traefik.enable=true" \
  -l "traefik.http.routers.admin-frontend.rule=Host(\`dashboard.kambaa.ai\`)" \
  -l "traefik.http.routers.admin-frontend.tls=true" \
  -l "traefik.http.routers.admin-frontend.tls.certresolver=letsencrypt" \
  -l "traefik.http.services.admin-frontend.loadbalancer.server.port=80" \
  admin-dashboard-frontend:latest
```

## Key Changes
- ✅ **Docker Socket Access**: `-v /var/run/docker.sock:/var/run/docker.sock`
- ✅ **Domain Routing**: Traefik labels for `app.kambaa.ai` and `dashboard.kambaa.ai`
- ✅ **SSL/TLS**: Automatic HTTPS with Let's Encrypt
- ✅ **Network**: Connected to existing `traefik` network

## Verify Deployment
```bash
# Check containers
docker ps | grep admin

# Test backend API
curl https://app.kambaa.ai/api/containers/

# Test frontend
curl https://dashboard.kambaa.ai
```

## Expected Result
- Backend: `https://app.kambaa.ai` with working Docker container management
- Frontend: `https://dashboard.kambaa.ai` with full functionality
- Container management showing real Docker data instead of "Docker N/A"