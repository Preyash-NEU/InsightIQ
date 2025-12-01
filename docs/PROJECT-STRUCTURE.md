# InsightIQ - Project Structure & Setup Guide
**Version:** 1.0  
**Last Updated:** November 30, 2024  
**Environment:** Windows 11 + Docker + VS Code

---

## 📁 Complete Project Structure

```
InsightIQ/
├── .git/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
│
├── docs/
│   ├── UI-DESIGN-SYSTEM.md          # UI specifications
│   ├── SYSTEM-ARCHITECTURE.md       # System design
│   ├── PROJECT-STRUCTURE.md         # This document
│   ├── DEVELOPMENT-ROADMAP.md       # Feature priorities & timeline
│   └── API-DOCUMENTATION.md         # API docs (auto-generated)
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entry
│   │   ├── config.py                # Configuration settings
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py              # Dependencies (auth, db)
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py        # Main router
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           ├── auth.py      # Authentication endpoints
│   │   │           ├── users.py     # User management
│   │   │           ├── data_sources.py
│   │   │           ├── queries.py
│   │   │           ├── visualizations.py
│   │   │           └── stats.py
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py          # JWT, password hashing
│   │   │   ├── config.py            # Settings from env vars
│   │   │   └── logging.py           # Logging configuration
│   │   │
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # SQLAlchemy base
│   │   │   ├── session.py           # Database session
│   │   │   └── init_db.py           # Database initialization
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User model
│   │   │   ├── data_source.py       # DataSource model
│   │   │   ├── query.py             # Query model
│   │   │   ├── visualization.py     # Visualization model
│   │   │   └── api_key.py           # API Key model
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # Pydantic schemas
│   │   │   ├── data_source.py
│   │   │   ├── query.py
│   │   │   ├── visualization.py
│   │   │   └── token.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py      # Authentication logic
│   │   │   ├── data_service.py      # Data processing
│   │   │   ├── ai_service.py        # OpenAI integration
│   │   │   ├── query_engine.py      # Query execution
│   │   │   └── file_handler.py      # File upload/processing
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── validators.py        # Input validation
│   │   │   ├── helpers.py           # Helper functions
│   │   │   └── exceptions.py        # Custom exceptions
│   │   │
│   │   └── storage/
│   │       └── uploads/             # Local file storage (dev)
│   │
│   ├── alembic/
│   │   ├── versions/                # Database migrations
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py              # Pytest configuration
│   │   ├── test_auth.py
│   │   ├── test_data_sources.py
│   │   ├── test_queries.py
│   │   └── test_api/
│   │
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── main.tsx                 # Application entry
│   │   ├── App.tsx                  # Root component
│   │   ├── index.css                # Global styles
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   │
│   │   ├── components/
│   │   │   ├── common/              # Reusable components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── ProtectedLayout.tsx
│   │   │   │
│   │   │   └── features/            # Feature-specific components
│   │   │       ├── auth/
│   │   │       │   ├── LoginForm.tsx
│   │   │       │   └── RegisterForm.tsx
│   │   │       ├── dashboard/
│   │   │       │   ├── StatCard.tsx
│   │   │       │   ├── ActivityFeed.tsx
│   │   │       │   └── InsightsCard.tsx
│   │   │       ├── data-sources/
│   │   │       │   ├── DataSourceCard.tsx
│   │   │       │   └── UploadModal.tsx
│   │   │       └── analysis/
│   │   │           ├── QueryInput.tsx
│   │   │           └── ChartRenderer.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DataSources.tsx
│   │   │   ├── Analysis.tsx
│   │   │   ├── History.tsx
│   │   │   └── Settings.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts               # Axios instance
│   │   │   ├── authService.ts       # Auth API calls
│   │   │   ├── dataSourceService.ts
│   │   │   └── queryService.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Authentication hook
│   │   │   ├── useDataSources.ts
│   │   │   └── useQueries.ts
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # Global auth state
│   │   │   └── ThemeContext.tsx
│   │   │
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   ├── user.ts
│   │   │   ├── dataSource.ts
│   │   │   └── query.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── routes/
│   │       └── index.tsx            # Route configuration
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml               # Docker services configuration
├── .gitignore                       # Root gitignore
├── README.md                        # Project documentation
└── LICENSE

```

---

## 🔧 Environment Variables

### Backend `.env.example`

```bash
# Application
APP_NAME=InsightIQ
APP_VERSION=1.0.0
ENVIRONMENT=development  # development, staging, production
DEBUG=True

# Server
HOST=0.0.0.0
PORT=8000
RELOAD=True

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET_KEY=your-super-secret-refresh-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# Database
DATABASE_URL=postgresql://insightiq_user:insightiq_password@postgres:5432/insightiq_db
POSTGRES_USER=insightiq_user
POSTGRES_PASSWORD=insightiq_password
POSTGRES_DB=insightiq_db
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.2

# Google Sheets (OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# File Storage
MAX_FILE_SIZE_MB=100
ALLOWED_FILE_EXTENSIONS=.csv,.xlsx,.json
UPLOAD_DIR=/app/storage/uploads

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@insightiq.com

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_ALLOW_CREDENTIALS=True

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100

# Logging
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FILE=logs/app.log
```

### Frontend `.env.example`

```bash
# API
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=30000

# Application
VITE_APP_NAME=InsightIQ
VITE_APP_VERSION=1.0.0

# Google OAuth (Frontend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_GOOGLE_SHEETS=true
```

---

## 📝 .gitignore Files

### Root `.gitignore`

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Docker
docker-compose.override.yml
```

### Backend `.gitignore`

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# Virtual Environment
venv/
env/
ENV/
.venv

# Distribution / packaging
build/
dist/
*.egg-info/

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# Database
*.db
*.sqlite3

# Uploads (local development)
app/storage/uploads/*
!app/storage/uploads/.gitkeep

# Environment
.env
.env.*

# IDE
.vscode/
.idea/
*.swp

# Logs
*.log
logs/

# Alembic
alembic/versions/*.pyc
```

### Frontend `.gitignore`

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build output
dist/
build/
.vite/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/
```

---

## 🐳 Docker Configuration

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: insightiq_postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-insightiq_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-insightiq_password}
      POSTGRES_DB: ${POSTGRES_DB:-insightiq_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - insightiq_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U insightiq_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: insightiq_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - insightiq_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: insightiq_backend
    env_file:
      - ./backend/.env
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - backend_storage:/app/storage
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - insightiq_network
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: insightiq_frontend
    env_file:
      - ./frontend/.env
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - insightiq_network
    command: npm run dev

  # pgAdmin (Database Management UI)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: insightiq_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@insightiq.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - insightiq_network
    depends_on:
      - postgres

networks:
  insightiq_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  backend_storage:
  pgadmin_data:
```

---

## ✅ Initial Setup Checklist

### Prerequisites
```
□ Windows 11 installed
□ Visual Studio Code installed
□ Docker Desktop installed and running
□ Git installed
□ Node.js 18+ installed (for local development)
□ Python 3.11+ installed (for local development)
```

### Step-by-Step Setup

#### 1. Clone/Create Repository
```bash
# Create new repository
mkdir InsightIQ
cd InsightIQ
git init

# Or clone existing
git clone https://github.com/yourusername/InsightIQ.git
cd InsightIQ
```

#### 2. Create Folder Structure
```bash
# Create main directories
mkdir -p docs backend frontend

# Create backend structure
cd backend
mkdir -p app/{api/v1/endpoints,core,db,models,schemas,services,utils,storage/uploads}
mkdir -p tests alembic/versions

# Create frontend structure
cd ../frontend
mkdir -p src/{assets,components/{common,layout,features},pages,services,hooks,context,types,utils,routes}

cd ..
```

#### 3. Set Up Environment Files
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your values
code backend/.env
code frontend/.env
```

#### 4. Install Backend Dependencies
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 5. Install Frontend Dependencies
```bash
cd ../frontend

# Install npm packages
npm install
```

#### 6. Start Docker Services
```bash
# From project root
docker-compose up -d postgres redis pgadmin

# Verify services are running
docker-compose ps
```

#### 7. Initialize Database
```bash
cd backend

# Run migrations
alembic upgrade head

# (Optional) Seed initial data
python -m app.db.init_db
```

#### 8. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 9. Verify Installation
```
□ Backend API: http://localhost:8000/docs
□ Frontend: http://localhost:3000
□ pgAdmin: http://localhost:5050
□ PostgreSQL: localhost:5432
□ Redis: localhost:6379
```

---

## 🔍 Verification Commands

### Check Docker Services
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check Database Connection
```bash
# Connect to PostgreSQL
docker exec -it insightiq_postgres psql -U insightiq_user -d insightiq_db

# List tables
\dt

# Exit
\q
```

### Check Redis
```bash
# Connect to Redis
docker exec -it insightiq_redis redis-cli

# Test
PING  # Should return PONG

# Exit
exit
```

---

## 🛠️ Development Tools

### VS Code Extensions (Recommended)
```
- Python (Microsoft)
- Pylance
- Docker
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client (API testing)
- PostgreSQL (Chris Kolkman)
```

### VS Code Settings (`.vscode/settings.json`)
```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 📦 Package Management

### Backend `requirements.txt` (Initial)
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
redis==5.0.1
pandas==2.1.3
numpy==1.26.2
openai==1.3.7
python-dotenv==1.0.0
```

### Frontend `package.json` (Initial)
```json
{
  "name": "insightiq-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "recharts": "^2.10.3",
    "lucide-react": "^0.294.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.7",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## 🚀 Quick Start Commands

```bash
# Start everything with Docker
docker-compose up -d

# Stop everything
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f

# Reset everything (WARNING: deletes data)
docker-compose down -v
```

---

## 📞 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill process (Windows)
taskkill /PID <process_id> /F
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend Not Loading
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

**End of Project Structure & Setup Guide**