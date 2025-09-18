from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi import Depends
import subprocess
import database
import models
from routers import registration, users, containers, auth, admin_management, profile

app = FastAPI(title="Admin Dashboard API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://dashboard.kambaa.ai"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(registration.router)
app.include_router(users.router)
app.include_router(containers.router)
app.include_router(admin_management.router)
app.include_router(profile.router)

@app.post("/api/admin/login")
def admin_login(credentials: dict, db: Session = Depends(database.get_db)):
    username = credentials.get("username")
    password = credentials.get("password")
    
    if not username or not password:
        raise HTTPException(status_code=401, detail="Username and password required")
    
    if not auth.verify_admin_credentials(username, password, db):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = auth.create_admin_token(username)
    return {"token": token}

@app.get("/api/admin/stats")
def get_dashboard_stats(admin: str = Depends(auth.verify_admin_token), db: Session = Depends(database.get_db)):
    """Get dashboard statistics"""
    total_users = db.query(models.User).count()
    running_containers = 0
    total_containers = 0
    
    try:
        result = subprocess.run(
            ["docker", "ps", "--format", "{{.Names}}"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            running_containers = len([line for line in result.stdout.strip().split('\n') 
                                    if line.strip() and line.startswith('chatbot_')])
        
        result_all = subprocess.run(
            ["docker", "ps", "-a", "--format", "{{.Names}}"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result_all.returncode == 0:
            total_containers = len([line for line in result_all.stdout.strip().split('\n') 
                                  if line.strip() and line.startswith('chatbot_')])
        
    except:
        pass
    
    return {
        "total_users": total_users,
        "running_containers": running_containers,
        "total_containers": total_containers,
        "stopped_containers": max(0, total_containers - running_containers)
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Admin Dashboard API is running"}

def startup_event():
    try:
        # Test database connection first
        if database.test_database_connection():
            models.Base.metadata.create_all(bind=database.engine)
            print("Database tables created/verified")
            
            # Create default admin if not exists and migrate passwords
            db = next(database.get_db())
            auth.create_default_admin(db)
            
            # Migrate any existing plain text passwords
            admins = db.query(models.Admin).all()
            for admin in admins:
                if not admin.password.startswith('$2b$'):
                    admin.password = auth.hash_password(admin.password)
            db.commit()
            db.close()
        else:
            print("Database connection failed - API will run with limited functionality")
    except Exception as e:
        print(f"Database startup error: {e}")

if __name__ == "__main__":
    import uvicorn
    print("="*50)
    print("Starting Admin Dashboard API v2.0")
    print("URL: http://localhost:8004")
    print("Docs: http://localhost:8004/docs")
    print("Check database for admin credentials")
    print("="*50)
    
    # Initialize database on startup
    startup_event()
    
    uvicorn.run(app, host="0.0.0.0", port=8004)