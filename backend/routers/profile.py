from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database
import models
from routers.auth import verify_admin_token

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("/me")
def get_current_user(admin_username: str = Depends(verify_admin_token), db: Session = Depends(database.get_db)):
    admin = db.query(models.Admin).filter(models.Admin.username == admin_username).first()
    return {"username": admin.username, "id": admin.id, "created_at": admin.created_at}