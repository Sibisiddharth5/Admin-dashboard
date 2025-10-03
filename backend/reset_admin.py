#!/usr/bin/env python3
"""
Reset admin password script
"""
import database
import models
from routers.auth import hash_password

def reset_admin_password():
    """Reset admin password to a simple one"""
    try:
        db = next(database.get_db())
        
        # Find admin user
        admin = db.query(models.Admin).filter(models.Admin.username == "admin").first()
        
        if admin:
            # Set simple password
            new_password = "admin123"
            admin.password = hash_password(new_password)
            db.commit()
            print(f"✓ Admin password reset to: {new_password}")
        else:
            # Create new admin
            new_password = "admin123"
            hashed_password = hash_password(new_password)
            new_admin = models.Admin(username="admin", password=hashed_password)
            db.add(new_admin)
            db.commit()
            print(f"✓ New admin created with password: {new_password}")
        
        db.close()
        
    except Exception as e:
        print(f"✗ Error resetting admin password: {e}")

if __name__ == "__main__":
    print("Resetting admin password...")
    reset_admin_password()