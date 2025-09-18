#!/usr/bin/env python3
"""
Migration script to hash existing plain text passwords in adminList table
"""
import database
import models
from routers.auth import hash_password

def migrate_passwords():
    db = next(database.get_db())
    try:
        admins = db.query(models.Admin).all()
        updated_count = 0
        
        for admin in admins:
            # Check if password is not already hashed
            if not admin.password.startswith('$2b$'):
                print(f"Hashing password for admin: {admin.username}")
                admin.password = hash_password(admin.password)
                updated_count += 1
        
        if updated_count > 0:
            db.commit()
            print(f"Successfully hashed {updated_count} passwords")
        else:
            print("All passwords are already hashed")
            
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_passwords()