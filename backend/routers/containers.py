from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import subprocess
import json
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
        result = subprocess.run(
            ["docker", "ps", "-a", "--format", "json"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0 and result.stdout.strip():
            for line in result.stdout.strip().split('\n'):
                if line.strip():
                    try:
                        container_data = json.loads(line)
                        name = container_data.get("Names", "")
                        docker_containers[name] = {
                            "id": container_data.get("ID", "")[:12],
                            "name": name,
                            "image": container_data.get("Image", ""),
                            "status": container_data.get("State", ""),
                            "ports": container_data.get("Ports", ""),
                            "created": container_data.get("CreatedAt", "")
                        }
                    except json.JSONDecodeError:
                        continue
    except:
        docker_available = False
    
    users = db.query(models.User).all()
    containers_with_users = []
    
    for user in users:
        container_name = f"chatbot_{user.id}"
        
        if docker_available:
            container_info = docker_containers.get(container_name, {
                "id": "N/A",
                "name": container_name,
                "image": "N/A",
                "status": "not_created",
                "ports": "N/A",
                "created": "N/A"
            })
        else:
            container_info = {
                "id": "N/A",
                "name": container_name,
                "image": "Docker not available",
                "status": "unknown",
                "ports": "N/A",
                "created": "N/A"
            }
        
        containers_with_users.append({
            **container_info,
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
        check_result = subprocess.run(
            ["docker", "ps", "-a", "--filter", f"name={container_name}", "--format", "{{.Names}}"],
            capture_output=True,
            text=True
        )
        
        if container_name not in check_result.stdout:
            raise HTTPException(status_code=404, detail=f"Container {container_name} not found")
        
        subprocess.run(["docker", "start", container_name], check=True, capture_output=True)
        return {"success": True, "message": f"Container {container_name} started successfully"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to start container: {e}")

@router.post("/{container_name}/stop")
def stop_container(container_name: str, admin: str = Depends(verify_admin_token)):
    """Stop a specific container"""
    try:
        subprocess.run(["docker", "stop", container_name], check=True, capture_output=True)
        return {"success": True, "message": f"Container {container_name} stopped successfully"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop container: {e}")

@router.post("/{container_name}/remove")
def remove_container(container_name: str, admin: str = Depends(verify_admin_token)):
    """Remove a container"""
    try:
        subprocess.run(["docker", "stop", container_name], capture_output=True)
        subprocess.run(["docker", "rm", "-f", container_name], check=True, capture_output=True)
        return {"success": True, "message": f"Container {container_name} removed successfully"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove container: {e}")

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
        
        subprocess.run([
            "docker", "run", "-d",
            "--name", container_name,
            "-p", f"808{user_id}:80",
            "nginx:alpine"
        ], check=True, capture_output=True)
        
        return {"success": True, "message": f"Container {container_name} created for user {user.username}"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to create container: {e}")