# Docker Container Visibility Fix

## Issues Identified

1. **Docker Socket Access**: Backend container cannot access host Docker daemon
2. **Missing Docker Python API**: Only using subprocess commands
3. **Deployment Configuration**: Missing Docker socket volume mount
4. **Container Filtering**: Not properly filtering chatbot containers

## Fixes Applied

### 1. Updated Container Management (`containers.py`)
- Added Docker Python API with subprocess fallback
- Improved container filtering for chatbot containers only
- Better error handling and status reporting
- Enhanced port information display

### 2. Updated Requirements (`requirements.txt`)
- Added `docker==6.1.3` package for Python Docker API

### 3. Updated Main Application (`main.py`)
- Added Docker API support for statistics
- Improved container counting logic
- Better error handling for Docker connectivity

### 4. Updated Deployment (`deploy.yml`)
- Added Docker socket volume mount: `-v /var/run/docker.sock:/var/run/docker.sock`
- This allows the backend container to access host Docker daemon

### 5. Added Test Script (`test_docker.py`)
- Diagnostic tool to test Docker connectivity
- Tests both API and subprocess methods
- Checks Docker socket accessibility

## Deployment Steps

1. **Redeploy Backend with Docker Socket Access**:
   ```bash
   docker stop admin-backend
   docker rm admin-backend
   docker build -t admin-dashboard:latest .
   docker run -d --name admin-backend \
     --network traefik-net \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -l traefik.enable=true \
     -l traefik.http.routers.admin-backend.rule='Host(`app.kambaa.ai`) && PathPrefix(`/api`)' \
     -l traefik.http.routers.admin-backend.entrypoints=websecure \
     -l traefik.http.routers.admin-backend.tls.certresolver=myresolver \
     admin-dashboard:latest
   ```

2. **Test Docker Connectivity**:
   ```bash
   docker exec admin-backend python test_docker.py
   ```

3. **Verify Container Visibility**:
   - Check dashboard at https://dashboard.kambaa.ai
   - Navigate to Container Management section
   - Containers should now be visible with proper status

## Expected Results

After applying these fixes:
- ✅ Docker containers will be visible in dashboard
- ✅ Container status will show correctly (running/stopped/not_created)
- ✅ Container actions (start/stop/create/remove) will work
- ✅ Statistics will show accurate container counts
- ✅ Better error handling and user feedback

## Troubleshooting

If containers still not visible:

1. **Check Docker Socket Permissions**:
   ```bash
   docker exec admin-backend ls -la /var/run/docker.sock
   ```

2. **Test Docker Commands**:
   ```bash
   docker exec admin-backend docker ps
   ```

3. **Check Backend Logs**:
   ```bash
   docker logs admin-backend
   ```

4. **Run Diagnostic Script**:
   ```bash
   docker exec admin-backend python test_docker.py
   ```

The key fix is mounting the Docker socket (`/var/run/docker.sock`) into the backend container, which allows it to communicate with the host Docker daemon and manage containers.