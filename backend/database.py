from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import time

DATABASE_URL = "mysql+mysqlconnector://tenant_user:TenantPass123@mysql-db:3306/multi_tenant_db"

# Create engine with connection pooling and retry logic
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def test_database_connection():
    """Test database connection and create database if it doesn't exist"""
    try:
        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
        print("Database connection successful")
        return True
    except SQLAlchemyError as e:
        print(f"Database connection failed: {e}")
        # Try to create database if it doesn't exist
        try:
            base_url = "mysql+mysqlconnector://tenant_user:TenantPass123@mysql-db:3306"
            temp_engine = create_engine(base_url)
            with temp_engine.connect() as connection:
                connection.execute(text("CREATE DATABASE IF NOT EXISTS multi_tenant_db"))
                connection.commit()
            print("Database created successfully")
            return True
        except Exception as create_error:
            print(f"Failed to create database: {create_error}")
            return False
    except Exception as e:
        print(f"Unexpected database error: {e}")
        return False

def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        print(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()