from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
import database
import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

security = HTTPBearer()
SECRET_KEY = "admin-dashboard-secret-key-2024"

def verify_admin_credentials(username: str, password: str, db: Session):
    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    if not admin:
        return False
    
    # Check if password is already hashed (starts with $2b$ for bcrypt)
    if admin.password.startswith('$2b$'):
        return pwd_context.verify(password, admin.password)
    else:
        # Plain text password - verify and update to hashed
        if admin.password == password:
            admin.password = hash_password(password)
            db.commit()
            return True
        return False

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")
        admin = db.query(models.Admin).filter(models.Admin.username == username).first()
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def create_admin_token(username: str):
    token_data = {"sub": username, "exp": datetime.utcnow() + timedelta(hours=24)}
    return jwt.encode(token_data, SECRET_KEY, algorithm="HS256")

def hash_password(password: str):
    return pwd_context.hash(password)

def create_default_admin(db: Session):
    existing_admin = db.query(models.Admin).filter(models.Admin.username == "admin").first()
    if not existing_admin:
        hashed_password = hash_password("admin123")
        default_admin = models.Admin(username="admin", password=hashed_password)
        db.add(default_admin)
        db.commit()
        print("Default admin created: admin/admin123")