# Admin Dashboard - Complete Full Stack Application

A complete admin dashboard with user registration and container management with proper frontend/backend separation.

## 📁 Project Structure

```
admin-dashboard/
├── backend/
│   ├── routers/
│   │   ├── auth.py          # Authentication logic
│   │   ├── containers.py    # Container management
│   │   ├── registration.py  # User registration
│   │   └── users.py         # User management
│   ├── database.py          # Database configuration
│   ├── main.py              # FastAPI main application
│   ├── models.py            # Database models
│   ├── requirements.txt     # Python dependencies
│   └── start_backend.bat    # Backend startup script
├── frontend/
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContainerList.js  # Container management UI
│   │   │   ├── Modal.js          # Modal components
│   │   │   └── Sidebar.js        # Navigation sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.js      # Main dashboard
│   │   │   ├── Login.js          # Login page
│   │   │   └── Registration.js   # Registration form
│   │   ├── App.js           # Main React app
│   │   ├── index.css        # Global styles
│   │   └── index.js         # React entry point
│   ├── package.json         # Node.js dependencies
│   └── start_frontend.bat   # Frontend startup script
├── README.md                # This file
└── start_all.bat           # Start both frontend and backend
```

## 🚀 How to Run

### Prerequisites
1. **Python 3.8+** installed
2. **MySQL/XAMPP** running on localhost:3306
3. **Docker** installed (for container management)

### Database Setup
1. Start XAMPP MySQL service
2. Create database:
   ```sql
   CREATE DATABASE dashboard_db;
   ```

### Quick Start (Recommended)
1. **Double-click `start_all.bat`** - This will start both backend and frontend automatically

### Manual Setup

#### Backend Setup & Run
1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the backend:
   ```bash
   python main.py
   ```
   OR double-click `start_backend.bat`

#### Frontend Setup & Run
1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the frontend:
   ```bash
   npm start
   ```
   OR double-click `start_frontend.bat`

## 🔐 Access Information

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **API Documentation**: http://localhost:8002/docs
- **Admin Login**: 
  - Username: `admin`
  - Password: `admin123`

## ✨ Features

### Complete Admin Dashboard
- **Statistics Dashboard**: User count, container status overview
- **User Management**: View, search, and delete users
- **Container Management**: Start/stop/create/remove containers with search
- **User Registration**: Create new users with automatic container setup
- **Modern UI**: Glass morphism design with smooth animations
- **Search Functionality**: Real-time search for both users and containers
- **Date Display**: Current date in sidebar

### Technical Features
- **Single File Backend**: All FastAPI routes, models, auth in one file
- **Single File Frontend**: All React components in one file
- **JWT Authentication**: Secure admin authentication
- **Password Validation**: Strong password requirements
- **Container Integration**: Docker container lifecycle management
- **Database Integration**: MySQL with SQLAlchemy ORM
- **Real-time Updates**: Automatic data refresh
- **Custom Modals**: No browser popups, custom modal system

## 🛠️ API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Admin login

### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics

### User Management
- `GET /api/users/` - List all users
- `DELETE /api/users/{id}` - Delete user and container

### Container Management
- `GET /api/containers/` - List containers with user info
- `POST /api/containers/{name}/start` - Start container
- `POST /api/containers/{name}/stop` - Stop container
- `POST /api/containers/{name}/create` - Create container
- `POST /api/containers/{name}/remove` - Remove container

### Registration
- `POST /api/registration/register` - Register new user

## 🗄️ Database Schema

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🐳 Container Details

- **Naming Convention**: `chatbot_{user_id}`
- **Port Mapping**: `808{user_id}:80`
- **Base Image**: `nginx:alpine`
- **Auto Creation**: Containers created during user registration

## 🎨 UI Components

- **Sidebar**: Navigation with date display and smooth hover effects
- **Search Bars**: Real-time filtering for users and containers
- **Modal System**: Custom modals for alerts and confirmations
- **Responsive Design**: Works on different screen sizes
- **Glass Morphism**: Modern translucent design elements

## 🔧 Customization

### Change Admin Credentials
Edit in `main.py`:
```python
ADMIN_USERS = {"admin": "admin123"}  # Change these
```

### Change Database Connection
Edit in `main.py`:
```python
DATABASE_URL = "mysql+mysqlconnector://root:@localhost:3306/dashboard_db"
```

### Change Ports
- Backend: Change `port=8002` in `backend/main.py`
- Frontend: Change port in `frontend/package.json` scripts
- Update API URLs in frontend components accordingly

## 🚨 Troubleshooting

### Common Issues
1. **Database Connection Failed**: Ensure MySQL is running and database exists
2. **Docker Commands Fail**: Ensure Docker Desktop is running
3. **CORS Errors**: Check if backend is running on port 8002
4. **Login Issues**: Verify admin credentials in `main.py`

### Dependencies Issues

**Backend:**
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

**Frontend:**
```bash
cd frontend
npm cache clean --force
npm install
```

## 📝 Notes

- **Single File Architecture**: Everything consolidated for easy deployment
- **No Build Process**: Frontend runs directly in browser
- **Minimal Dependencies**: Only essential packages included
- **Production Ready**: Includes error handling and validation
- **Docker Integration**: Full container lifecycle management
- **Search Functionality**: Comprehensive search across all fields

## 🎯 Quick Start Summary

1. Start MySQL/XAMPP
2. Create `dashboard_db` database
3. **Double-click `start_all.bat`** (starts both backend and frontend)
4. Wait for both servers to start:
   - Backend: http://localhost:8002
   - Frontend: http://localhost:3000
5. Open http://localhost:3000 in browser
6. Login with `admin` / `admin123`

That's it! Your complete admin dashboard is ready to use.

## 📝 Additional Notes

- **Modular Architecture**: Clean separation between frontend and backend
- **Development Ready**: Hot reload for both React and FastAPI
- **Production Ready**: Easy to deploy frontend and backend separately
- **Maintainable**: Organized file structure for easy development