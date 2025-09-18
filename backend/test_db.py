#!/usr/bin/env python3
"""
Database Connection Test Script
Run this to verify your database connection before starting the main application.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import test_database_connection, engine
from sqlalchemy import text
import models

def main():
    print("=" * 50)
    print("🔍 Database Connection Test")
    print("=" * 50)
    
    # Test basic connection
    print("1. Testing database connection...")
    if test_database_connection():
        print("   ✓ Connection successful")
    else:
        print("   ✗ Connection failed")
        return False
    
    # Test table creation
    print("\n2. Testing table creation...")
    try:
        models.Base.metadata.create_all(bind=engine)
        print("   ✓ Tables created/verified successfully")
    except Exception as e:
        print(f"   ✗ Table creation failed: {e}")
        return False
    
    # Test basic query
    print("\n3. Testing basic query...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT COUNT(*) as count FROM users"))
            count = result.fetchone()[0]
            print(f"   ✓ Query successful - Found {count} users in database")
    except Exception as e:
        print(f"   ✗ Query failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All database tests passed!")
    print("Your database is ready for the admin dashboard.")
    print("=" * 50)
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Database test failed. Please check your MySQL/XAMPP setup.")
        print("Make sure:")
        print("1. MySQL/XAMPP is running")
        print("2. Database 'dashboard_db' exists")
        print("3. Connection string is correct")
        sys.exit(1)