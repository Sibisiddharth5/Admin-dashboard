from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import database
import models
from routers.auth import verify_admin_token, hash_password

router = APIRouter(prefix="/api/admin-management", tags=["admin-management"])

class AdminCreate(BaseModel):
    username: str
    password: str

@router.get("/admins")
def get_admins(admin: str = Depends(verify_admin_token), db: Session = Depends(database.get_db)):
    admins = db.query(models.Admin).all()
    return [{"id": admin.id, "username": admin.username, "created_at": admin.created_at} for admin in admins]

@router.post("/admins")
def create_admin(admin_data: AdminCreate, admin: str = Depends(verify_admin_token), db: Session = Depends(database.get_db)):
    existing_admin = db.query(models.Admin).filter(models.Admin.username == admin_data.username).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = hash_password(admin_data.password)
    new_admin = models.Admin(username=admin_data.username, password=hashed_password)
    db.add(new_admin)
    db.commit()
    return {"message": f"Admin '{admin_data.username}' created successfully"}

@router.delete("/admins/{admin_id}")
def delete_admin(admin_id: int, admin: str = Depends(verify_admin_token), db: Session = Depends(database.get_db)):
    admin_to_delete = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin_to_delete:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if admin_to_delete.username == admin:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(admin_to_delete)
    db.commit()
    return {"message": "Admin deleted successfully"}