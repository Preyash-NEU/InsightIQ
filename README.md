<div align="center">

# 🚀 InsightIQ

### AI-Powered Data Analytics Platform

*Transform your data into actionable insights with natural language queries*

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About

**InsightIQ** is a modern, AI-powered data analytics platform that allows users to:
- 📊 Upload and manage multiple data sources (CSV, Google Sheets, APIs)
- 🤖 Ask questions about data in plain English
- 📈 Get instant visualizations and insights
- ⚡ Execute custom pandas code for advanced analysis
- 📱 Track usage analytics and query history

> **No coding required** - Just ask questions like "What was the total revenue last quarter?" and get instant answers with beautiful charts.

---

## ✨ Features

### 🔐 **Authentication & Security**
- JWT-based authentication with access & refresh tokens
- Secure password hashing (bcrypt)
- User profile management
- Role-based access control ready

### 📊 **Data Management**
- **Multiple Data Sources**: CSV upload with drag-and-drop
- **Smart Validation**: Automatic data quality checks and type inference
- **Data Preview**: See your data before querying (up to 1000 rows)
- **Metadata Extraction**: Automatic column detection, types, and statistics

### 🤖 **AI-Powered Queries**
- **Natural Language**: Ask questions in plain English
- **OpenAI Integration**: Powered by GPT-3.5/4 for intelligent query interpretation
- **Pandas Code Generation**: AI converts your questions to executable Python code
- **Query Caching**: Redis-powered caching for faster repeat queries

### 📈 **Visualizations**
- Automatic chart type detection (Bar, Line, Pie, KPI cards)
- Interactive data tables
- Export results to CSV/JSON
- Customizable chart configurations

### 📊 **Analytics Dashboard**
- Real-time usage statistics
- Query history with advanced filtering
- Activity feed and insights
- Storage usage tracking

### ⚡ **Performance**
- **Redis Caching**: 5-minute cache for repeated queries (saves API costs)
- **Query Optimization**: Smart execution with pandas
- **Async Processing**: Non-blocking API operations
- **Database Indexing**: Optimized for fast lookups

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: FastAPI 0.104+ (Python 3.11+)
- **Database**: PostgreSQL 15+ with SQLAlchemy ORM
- **Cache**: Redis 7+ for query caching
- **AI/ML**: OpenAI API (GPT-3.5 Turbo / GPT-4)
- **Data Processing**: Pandas, NumPy
- **Authentication**: JWT with python-jose
- **Security**: bcrypt password hashing, CORS middleware

### **Frontend** *(Coming Soon)*
- **Framework**: React 18+ with TypeScript 5+
- **Build Tool**: Vite 5+
- **Styling**: Tailwind CSS 3+ (Navy Sage theme)
- **State Management**: Zustand / React Context
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

### **DevOps & Infrastructure**
- **Containerization**: Docker + Docker Compose
- **Database Tools**: pgAdmin 4
- **API Documentation**: Swagger UI + ReDoc
- **Logging**: Rotating file logs + console output
- **Version Control**: Git + GitHub

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT TIER                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │   React Frontend (TypeScript + Tailwind CSS)       │     │
│  │   - Navy Sage UI Design System                     │     │
│  │   - Responsive, Mobile-First                       │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS/REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │           FastAPI Backend (Python)                  │     │
│  │                                                     │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐  │     │
│  │  │ Auth Service │  │ Data Service │  │AI Service│ │     │
│  │  └──────────────┘  └──────────────┘  └─────────┘  │     │
│  │  ┌──────────────┐  ┌──────────────┐               │     │
│  │  │Query Service │  │Stats Service │               │     │
│  │  └──────────────┘  └──────────────┘               │     │
│  └────────────────────────────────────────────────────┘     │
└──────┬────────────────┬────────────────┬────────────────────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │    Redis    │  │  OpenAI API │
│  Database   │  │    Cache    │  │  (GPT-3.5)  │
└─────────────┘  └─────────────┘  └─────────────┘
```

### **Database Schema**

```
users (Authentication)
  ├─ id, email, password_hash, full_name
  ├─ created_at, is_active, is_verified
  └─ Relationships: data_sources, queries

data_sources (Data Management)
  ├─ id, user_id, name, type, status
  ├─ file_path, row_count, file_size
  ├─ columns_info (JSONB), connection_info (JSONB)
  └─ Relationships: queries

queries (Query History)
  ├─ id, user_id, data_source_id
  ├─ query_text, query_type, result_data (JSONB)
  ├─ execution_time_ms, is_saved
  └─ Relationships: visualizations

visualizations (Chart Configs)
  ├─ id, query_id
  ├─ chart_type, config_json (JSONB)
  └─ Relationships: query
```

---

## 🚀 Quick Start

### **Prerequisites**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- [Git](https://git-scm.com/)
- [OpenAI API Key](https://platform.openai.com/api-keys) (optional for development)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/InsightIQ.git
   cd InsightIQ
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Edit backend/.env and add your OpenAI API key
   # OPENAI_API_KEY=sk-your-key-here
   ```

3. **Start all services with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Wait for services to be healthy** (~30 seconds)
   ```bash
   docker-compose ps
   ```

5. **Run database migrations**
   ```bash
   docker exec -it insightiq_backend alembic upgrade head
   ```

### **Access the Application**

| Service | URL | Credentials |
|---------|-----|-------------|
| **Backend API** | http://localhost:8000 | - |
| **API Documentation (Swagger)** | http://localhost:8000/docs | - |
| **API Documentation (ReDoc)** | http://localhost:8000/redoc | - |
| **pgAdmin (Database)** | http://localhost:5050 | admin@insightiq.com / admin |
| **Frontend** *(Coming Soon)* | http://localhost:3000 | - |

### **Quick Test**

1. Open Swagger UI: http://localhost:8000/docs
2. Register a new user: `POST /api/v1/auth/register`
3. Login: `POST /api/v1/auth/login` (copy the access token)
4. Click "Authorize" button (top right) and paste token
5. Upload a CSV: `POST /api/v1/data-sources/upload-csv`
6. Ask a question: `POST /api/v1/queries/natural-language`

**Example query**: "What is the total sum of the revenue column?"

---

## 📚 API Documentation

### **26 RESTful Endpoints**

#### **Authentication** (5 endpoints)
```
POST   /api/v1/auth/register          # Create new account
POST   /api/v1/auth/login             # Login with JWT
POST   /api/v1/auth/refresh           # Refresh access token
POST   /api/v1/auth/logout            # Logout user
GET    /api/v1/auth/me                # Get current user
```

#### **User Management** (5 endpoints)
```
GET    /api/v1/users/me               # Get profile
PUT    /api/v1/users/me               # Update profile
POST   /api/v1/users/me/change-password  # Change password
GET    /api/v1/users/me/stats         # Get user statistics
DELETE /api/v1/users/me               # Delete account
```

#### **Data Sources** (6 endpoints)
```
POST   /api/v1/data-sources/upload-csv      # Upload CSV file
GET    /api/v1/data-sources                 # List all sources
GET    /api/v1/data-sources/{id}            # Get single source
PUT    /api/v1/data-sources/{id}            # Update source
DELETE /api/v1/data-sources/{id}            # Delete source
GET    /api/v1/data-sources/{id}/preview    # Preview data
```

#### **Queries & Analysis** (6 endpoints)
```
POST   /api/v1/queries/natural-language     # AI-powered query
POST   /api/v1/queries/execute              # Execute pandas code
GET    /api/v1/queries                      # List queries (with filters)
GET    /api/v1/queries/{id}                 # Get single query
POST   /api/v1/queries/{id}/save            # Save/favorite query
DELETE /api/v1/queries/{id}                 # Delete query
```

#### **Statistics & Analytics** (4 endpoints)
```
GET    /api/v1/stats/dashboard        # Dashboard overview
GET    /api/v1/stats/usage             # Usage analytics
GET    /api/v1/stats/activity          # Recent activity
GET    /api/v1/stats/insights          # AI insights
```

### **Interactive API Documentation**

- **Swagger UI**: http://localhost:8000/docs
  - Try out all endpoints
  - See request/response schemas
  - Built-in authentication
  
- **ReDoc**: http://localhost:8000/redoc
  - Clean, searchable documentation
  - Better for reading/sharing

---

## 🤖 AI Integration Details

### **How It Works**

1. **User asks a question** in natural language
   ```
   "What was the total revenue last quarter?"
   ```

2. **AI interprets the query** using OpenAI GPT
   - Analyzes column names and types
   - Generates pandas code
   ```python
   result = df[df['date'] >= '2024-07-01']['revenue'].sum()
   ```

3. **Secure execution**
   - Sandboxed environment
   - Banned keywords (import, eval, os, etc.)
   - Timeout protection

4. **Results + Visualization**
   - Returns result data
   - Suggests chart type
   - Generates chart configuration

### **Supported Query Types**

| Query Type | Example | Output |
|------------|---------|--------|
| **Aggregation** | "What's the total sales?" | Single number (KPI card) |
| **Filtering** | "Show me sales > $1000" | Data table |
| **Grouping** | "Sales by region" | Bar chart |
| **Time Series** | "Revenue over time" | Line chart |
| **Statistics** | "Average order value" | Number + trend |

### **Caching Strategy**

- **Cache Key**: MD5 hash of (data_source_id + query_text)
- **TTL**: 5 minutes
- **Benefits**: 
  - Faster repeat queries (instant vs. ~2-5 seconds)
  - Reduced OpenAI API costs (saves $$ on popular queries)
  - Better user experience

---

## 📁 Project Structure

```
InsightIQ/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── config.py          # Settings & environment
│   │   │
│   │   ├── api/               # API layer
│   │   │   ├── deps.py        # Dependencies (auth, db)
│   │   │   └── v1/
│   │   │       ├── router.py  # Main API router
│   │   │       └── endpoints/ # Route handlers
│   │   │           ├── auth.py
│   │   │           ├── users.py
│   │   │           ├── data_sources.py
│   │   │           ├── queries.py
│   │   │           └── stats.py
│   │   │
│   │   ├── models/            # Database models (SQLAlchemy)
│   │   │   ├── user.py
│   │   │   ├── data_source.py
│   │   │   ├── query.py
│   │   │   └── visualization.py
│   │   │
│   │   ├── schemas/           # Request/Response models (Pydantic)
│   │   │   ├── user.py
│   │   │   ├── token.py
│   │   │   ├── data_source.py
│   │   │   └── query.py
│   │   │
│   │   ├── services/          # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── data_service.py
│   │   │   ├── query_service.py
│   │   │   ├── ai_service.py
│   │   │   └── stats_service.py
│   │   │
│   │   ├── core/              # Core utilities
│   │   │   ├── security.py    # JWT, password hashing
│   │   │   └── logging_config.py
│   │   │
│   │   ├── utils/             # Helper functions
│   │   │   └── validators.py
│   │   │
│   │   └── db/                # Database
│   │       └── session.py     # DB connection
│   │
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Unit & integration tests
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend container
│   └── .env.example          # Environment template
│
├── frontend/                  # React Frontend (Coming Soon)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API calls
│   │   ├── hooks/            # Custom hooks
│   │   └── types/            # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docs/                      # Documentation
│   ├── UI-DESIGN-SYSTEM.md   # Navy Sage theme specs
│   ├── SYSTEM-ARCHITECTURE.md
│   ├── PROJECT-STRUCTURE.md
│   └── DEVELOPMENT-ROADMAP.md
│
├── docker-compose.yml         # Multi-container setup
├── .gitignore
├── LICENSE
└── README.md                  # This file
```

---

## 🔧 Development

### **Backend Development**

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend Development** *(Coming Soon)*

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Database Management**

```bash
# Create new migration
alembic revision -m "description"

# Run migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history
```

### **Useful Commands**

```bash
# View logs
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Rebuild containers
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (deletes data!)
docker-compose down -v

# Access PostgreSQL CLI
docker exec -it insightiq_postgres psql -U insightiq_user -d insightiq_db

# Access backend shell
docker exec -it insightiq_backend bash
```

---

## 🧪 Testing

### **Run Tests**

```bash
# Backend tests
cd backend
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/test_auth.py

# Verbose output
pytest -v
```

---

## 🎨 UI Design System

### **Navy Sage Theme**

A professional, modern dark theme with subtle cyan accents.

**Colors:**
- Primary: Navy Slate (#1e293b) → Soft Cyan (#0891b2)
- Background: Slate 900 (#0f172a)
- Cards: Slate 800/50 with backdrop blur
- Accent: Cyan 400 (#22d3ee)
- Text: Slate 50 (#f8fafc) / Slate 400 (#94a3b8)

**Components:**
- Glassmorphism effects
- Smooth transitions (300ms)
- Rounded corners (8px - 20px)
- Subtle shadows with cyan glow
- Centered, balanced layouts

See [UI-DESIGN-SYSTEM.md](docs/UI-DESIGN-SYSTEM.md) for complete specifications.

---

## 🔐 Security Features

- **Password Hashing**: bcrypt with cost factor 12
- **JWT Tokens**: HS256 algorithm with expiration
- **CORS**: Configured for specific origins only
- **SQL Injection**: Prevented via SQLAlchemy ORM
- **Code Execution**: Sandboxed with banned keywords
- **Rate Limiting**: Ready for implementation
- **Input Validation**: Pydantic schemas for all endpoints
- **Environment Variables**: Secrets never committed to Git

---

## 📊 Performance Optimizations

- **Redis Caching**: Query results cached for 5 minutes
- **Database Indexing**: All foreign keys and frequent lookups indexed
- **Connection Pooling**: SQLAlchemy pool (min: 5, max: 20)
- **Async Operations**: Non-blocking API calls
- **Pagination**: All list endpoints support skip/limit
- **File Size Limits**: 100MB max for uploads
- **Query Timeout**: 30 seconds max execution time

---

## 🌟 Key Highlights

### **What Makes InsightIQ Special**

✨ **No Code Required**: Ask questions in plain English  
🚀 **Fast**: Redis caching + optimized queries  
🔒 **Secure**: Enterprise-grade authentication & authorization  
📊 **Smart**: AI-powered query interpretation  
🎨 **Beautiful**: Modern Navy Sage UI design  
📈 **Scalable**: Microservices-ready architecture  
🧪 **Production-Ready**: Logging, monitoring, error handling  
📱 **Mobile-First**: Responsive design (frontend)  

---

## 📖 Documentation

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Architecture**: [docs/SYSTEM-ARCHITECTURE.md](docs/SYSTEM-ARCHITECTURE.md)
- **UI Design System**: [docs/UI-DESIGN-SYSTEM.md](docs/UI-DESIGN-SYSTEM.md)
- **Project Structure**: [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md)
- **Development Roadmap**: [docs/DEVELOPMENT-ROADMAP.md](docs/DEVELOPMENT-ROADMAP.md)

---

## 🗺️ Roadmap

### **Phase 1: MVP** ✅ (Complete)
- [x] Authentication system
- [x] CSV data upload
- [x] AI-powered natural language queries
- [x] Query history and favorites
- [x] Dashboard analytics
- [x] Redis caching
- [x] User profile management

### **Phase 2: Enhanced Features** 🚧 (In Progress)
- [ ] React frontend with Navy Sage theme
- [ ] Google Sheets integration
- [ ] Excel file support
- [ ] Advanced visualizations
- [ ] Email notifications
- [ ] Password reset flow

### **Phase 3: Advanced Features** 📋 (Planned)
- [ ] Database connections (MySQL, PostgreSQL)
- [ ] REST API connectors
- [ ] Team collaboration features
- [ ] Scheduled queries
- [ ] Custom dashboards
- [ ] White-labeling options

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Coding Standards**

- **Backend**: Follow PEP 8 (use `black` formatter)
- **Frontend**: Follow Airbnb style guide (use `prettier`)
- **Commits**: Use conventional commits (feat, fix, docs, etc.)
- **Documentation**: Update README and docs for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/Preyash-NEU)
- LinkedIn: [Your LinkedIn]([https://linkedin.com/in/yourprofile](https://www.linkedin.com/in/preyash-mehta/))
- Email: preyash.mehta.12@gmail.com

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [OpenAI](https://openai.com/) - AI-powered query interpretation
- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [PostgreSQL](https://www.postgresql.org/) - Robust relational database
- [Redis](https://redis.io/) - High-performance caching

---


<div align="center">

**Made with ❤️ and ☕**

*InsightIQ - Transform Data into Insights*

[⬆ Back to Top](#-insightiq)

</div>
