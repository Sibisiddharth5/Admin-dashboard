from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import database
import models
from .auth import verify_admin_token

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
def get_users(admin: str = Depends(verify_admin_token), db: Session = Depends(database.get_db)):
    """Get all registered users"""
    users = db.query(models.User).all()
    return [{
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "username": user.username,
        "company_name": user.company_name,
        "subdomain": user.subdomain,
        "created_at": user.created_at.isoformat() if user.created_at else None
    } for user in users]

@router.delete("/{user_id}")
def delete_user(user_id: int, admin: str = Depends(verify_admin_token), db: Session = Depends(database.get_db)):
    """Delete a user and their associated container"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    import subprocess
    container_name = f"chatbot_{user_id}"
    
    try:
        subprocess.run(["docker", "stop", container_name], capture_output=True)
        subprocess.run(["docker", "rm", "-f", container_name], capture_output=True)
    except:
        pass
    
    db.delete(user)
    db.commit()
    
    return {"success": True, "message": f"User {user.username} deleted successfully"}