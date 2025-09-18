from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from passlib.context import CryptContext
import subprocess
import secrets
import string
import re
import urllib.parse
import database
import models

router = APIRouter(prefix="/api/registration", tags=["registration"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration - adjust these as needed
TRAEFIK_NETWORK = "traefik_default"
DOMAIN = "kambaa.ai"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    username: str
    password: str
    company_name: str
    subdomain: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8 or len(v) > 22:
            raise ValueError('Password must be 8-22 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least 1 uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least 1 number')
        if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', v):
            raise ValueError('Password must contain at least 1 special character')
        return v

    @validator('subdomain')
    def validate_subdomain(cls, v):
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError('Subdomain must contain only lowercase letters, numbers, and dashes')
        return v

# Password generator
def generate_password(length=16):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

# Mock function for schema creation
def create_schema_for_user(username: str, password: str):
    db_user = f"user_{username}"
    schema_name = f"schema_{username}"
    return db_user, schema_name

# Docker container creation
def create_user_container(subdomain: str, user_id: str, db_user: str, db_pass: str, schema: str):
    container_name = f"chatbot_{user_id}"
    image_name = "fastapi_app:latest"

    # URL-encode DB password
    safe_pass = urllib.parse.quote_plus(db_pass)
    db_url = f"mysql+mysqlconnector://{db_user}:{safe_pass}@mysql-db:3306/multi_tenant_db"

    # Remove existing container if it exists
    subprocess.run(["docker", "rm", "-f", container_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Run new container
    cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "--network", TRAEFIK_NETWORK,
        "-l", "traefik.enable=true",
        "-l", f"traefik.http.routers.{container_name}.rule=Host(`{subdomain}.{DOMAIN}`)",
        "-l", f"traefik.http.routers.{container_name}.entrypoints=websecure",
        "-l", f"traefik.http.routers.{container_name}.tls.certresolver=myresolver",
        "-e", f"DB_URL={db_url}",
        image_name
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Failed to create container {container_name}: {result.stderr}")

    return result.stdout.strip()

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(database.get_db)):
    """Register a new user and create their container"""
    # Check for existing user
    existing = db.query(models.User).filter(
        (models.User.username == user.username) | 
        (models.User.subdomain == user.subdomain) |
        (models.User.email == user.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username, email, or subdomain already exists")
    
    # Save user to database
    hashed_password = pwd_context.hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        username=user.username,
        password=hashed_password,
        company_name=user.company_name,
        subdomain=user.subdomain,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate password for DB user
    db_pass = generate_password()
    
    try:
        # Create database schema for user
        db_user, schema = create_schema_for_user(user.subdomain, db_pass)
        
        # Create Docker container with isolated database
        create_user_container(user.subdomain, str(new_user.id), db_user, db_pass, schema)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user environment: {str(e)}")
    
    return {
        "message": f"Dashboard created at https://{user.subdomain}.{DOMAIN}"
    }