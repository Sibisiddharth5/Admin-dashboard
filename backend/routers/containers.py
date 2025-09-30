from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import subprocess
import json
import docker
from docker.errors import DockerException
import docker.errors
import database
import models
from .auth import verify_admin_token

router = APIRouter(prefix="/api/containers", tags=["containers"])

@router.get("/")
def get_containers(admin: str = Depends(verify_admin_token), db: Session = Depends(database.get_db)):
    """Get all containers with associated user information"""
    docker_containers = {}
    docker_available = True
    
    try:
        # Try Docker API first
        client = docker.from_env()
        containers = client.containers.list(all=True)
        
        for container in containers:
            name = container.name
            if name.startswith('chatbot_'):
                ports_info = "N/A"
                if container.ports:
                    ports_list = []
                    for port, bindings in container.ports.items():
                        if bindings:
                            for binding in bindings:
                                ports_list.append(f"{binding['HostPort']}:{port}")
                    ports_info = ", ".join(ports_list) if ports_list else "N/A"
                
                # Get image name properly
                image_name = "nginx:alpine"
                if container.image.tags:
                    image_name = container.image.tags[0]
                elif hasattr(container.image, 'attrs') and 'RepoTags' in container.image.attrs:
                    repo_tags = container.image.attrs['RepoTags']
                    if repo_tags:
                        image_name = repo_tags[0]
                
                docker_containers[name] = {
                    "id": container.id[:12],
                    "name": name,
                    "image": image_name,
                    "status": container.status,
                    "ports": ports_info,
                    "created": container.attrs['Created'][:19].replace('T', ' ') if 'Created' in container.attrs else "N/A"
                }
        
    except DockerException as e:
        print(f"Docker API failed: {e}")
        # Fallback to subprocess if Docker API fails
        try:
            # Check if docker command exists
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode != 0:
                docker_available = False
            else:
                # Get container list using subprocess
                result = subprocess.run(
                    ["docker", "ps", "-a", "--format", "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.CreatedAt}}"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0 and result.stdout.strip():
                    lines = result.stdout.strip().split('\n')[1:]  # Skip header
                    for line in lines:
                        if line.strip():
                            parts = line.split('\t')
                            if len(parts) >= 6:
                                container_id, name, image, status, ports, created = parts[:6]
                                if name.startswith('chatbot_'):
                                    docker_containers[name] = {
                                        "id": container_id[:12],
                                        "name": name,
                                        "image": image,
                                        "status": status.split()[0].lower(),  # Get first word and lowercase
                                        "ports": ports if ports.strip() else "N/A",
                                        "created": created
                                    }
        except Exception as e:
            print(f"Docker subprocess failed: {e}")
            docker_available = False
    
    users = db.query(models.User).all()
    containers_with_users = []
    
    for user in users:
        container_name = f"chatbot_{user.id}"
        expected_port = f"808{user.id}:80"
        
        if docker_available:
            container_info = docker_containers.get(container_name, {
                "id": "N/A",
                "name": container_name,
                "image": "nginx:alpine",
                "status": "not_created",
                "ports": expected_port,
                "created": "N/A"
            })
        else:
            container_info = {
                "id": "N/A",
                "name": container_name,
                "image": "nginx:alpine",
                "status": "docker_unavailable",
                "ports": expected_port,
                "created": "N/A"
            }
        
        containers_with_users.append({
            **container_info,
            "docker_available": docker_available,
            "user_info": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "username": user.username,
                "company_name": user.company_name,
                "subdomain": user.subdomain,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        })
    
    return containers_with_users

@router.post("/{container_name}/start")
def start_container(container_name: str, admin: str = Depends(verify_admin_token)):
    """Start a specific container"""
    try:
        # Try Docker API first
        client = docker.from_env()
        container = client.containers.get(container_name)
        if container.status != 'running':
            container.start()
            return {"success": True, "message": f"Container {container_name} started successfully"}
        else:
            return {"success": True, "message": f"Container {container_name} is already running"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail=f"Container {container_name} not found")
    except DockerException as e:
        print(f"Docker API failed for container start: {e}")
        # Fallback to subprocess
        try:
            check_result = subprocess.run(
                ["docker", "ps", "-a", "--filter", f"name={container_name}", "--format", "{{.Names}}"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if container_name not in check_result.stdout:
                raise HTTPException(status_code=404, detail=f"Container {container_name} not found")
            
            result = subprocess.run(["docker", "start", container_name], 
                                  check=True, capture_output=True, text=True, timeout=15)
            return {"success": True, "message": f"Container {container_name} started successfully"}
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode() if e.stderr else str(e)
            raise HTTPException(status_code=500, detail=f"Failed to start container: {error_msg}")

@router.post("/{container_name}/stop")
def stop_container(container_name: str, admin: str = Depends(verify_admin_token)):
    """Stop a specific container"""
    try:
        # Try Docker API first
        client = docker.from_env()
        container = client.containers.get(container_name)
        if container.status == 'running':
            container.stop(timeout=10)
            return {"success": True, "message": f"Container {container_name} stopped successfully"}
        else:
            return {"success": True, "message": f"Container {container_name} is already stopped"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail=f"Container {container_name} not found")
    except DockerException as e:
        print(f"Docker API failed for container stop: {e}")
        # Fallback to subprocess
        try:
            result = subprocess.run(["docker", "stop", container_name], 
                                  check=True, capture_output=True, text=True, timeout=15)
            return {"success": True, "message": f"Container {container_name} stopped successfully"}
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode() if e.stderr else str(e)
            raise HTTPException(status_code=500, detail=f"Failed to stop container: {error_msg}")

@router.post("/{container_name}/remove")
def remove_container(container_name: str, admin: str = Depends(verify_admin_token)):
    """Remove a container"""
    try:
        # Try Docker API first
        client = docker.from_env()
        container = client.containers.get(container_name)
        if container.status == 'running':
            container.stop(timeout=10)
        container.remove(force=True)
        return {"success": True, "message": f"Container {container_name} removed successfully"}
    except docker.errors.NotFound:
        return {"success": True, "message": f"Container {container_name} was already removed"}
    except DockerException as e:
        print(f"Docker API failed for container removal: {e}")
        # Fallback to subprocess
        try:
            # Stop first (ignore errors if already stopped)
            subprocess.run(["docker", "stop", container_name], 
                         capture_output=True, text=True, timeout=15)
            # Remove with force
            result = subprocess.run(["docker", "rm", "-f", container_name], 
                                  check=True, capture_output=True, text=True, timeout=15)
            return {"success": True, "message": f"Container {container_name} removed successfully"}
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode() if e.stderr else str(e)
            # If container doesn't exist, that's actually success
            if "No such container" in error_msg:
                return {"success": True, "message": f"Container {container_name} was already removed"}
            raise HTTPException(status_code=500, detail=f"Failed to remove container: {error_msg}")

@router.post("/{container_name}/create")
def create_container(container_name: str, admin: str = Depends(verify_admin_token), db: Session = Depends(database.get_db)):
    """Create and start a new container for a user"""
    try:
        if not container_name.startswith("chatbot_"):
            raise HTTPException(status_code=400, detail="Invalid container name format")
        
        user_id = container_name.split("_")[1]
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        port_mapping = f"808{user_id}:80"
        
        # Try Docker API first
        try:
            client = docker.from_env()
            
            # Check if container already exists
            try:
                existing = client.containers.get(container_name)
                if existing:
                    return {"success": False, "message": f"Container {container_name} already exists"}
            except docker.errors.NotFound:
                pass  # Container doesn't exist, which is what we want
            
            container = client.containers.run(
                "nginx:alpine",
                name=container_name,
                ports={'80/tcp': f"808{user_id}"},
                detach=True,
                restart_policy={"Name": "unless-stopped"}
            )
            return {"success": True, "message": f"Container {container_name} created successfully with port {port_mapping}"}
            
        except DockerException as e:
            print(f"Docker API failed for container creation: {e}")
            # Fallback to subprocess
            try:
                # Check if container exists first
                check_result = subprocess.run(
                    ["docker", "ps", "-a", "--filter", f"name={container_name}", "--format", "{{.Names}}"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if container_name in check_result.stdout:
                    return {"success": False, "message": f"Container {container_name} already exists"}
                
                # Create the container
                result = subprocess.run([
                    "docker", "run", "-d",
                    "--name", container_name,
                    "-p", port_mapping,
                    "--restart", "unless-stopped",
                    "nginx:alpine"
                ], check=True, capture_output=True, text=True, timeout=30)
                
                return {"success": True, "message": f"Container {container_name} created successfully with port {port_mapping}"}
                
            except subprocess.CalledProcessError as e:
                error_msg = e.stderr.decode() if e.stderr else str(e)
                raise HTTPException(status_code=500, detail=f"Failed to create container via subprocess: {error_msg}")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create container: {str(e)}")