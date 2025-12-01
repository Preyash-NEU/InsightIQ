# InsightIQ - System Architecture & Design
**Version:** 1.0  
**Last Updated:** November 30, 2024  
**Environment:** Windows 11 + Docker + VS Code

---

## 📋 Table of Contents
1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Design](#api-design)
5. [Authentication & Security](#authentication--security)
6. [Data Flow](#data-flow)
7. [File Storage Strategy](#file-storage-strategy)
8. [External Integrations](#external-integrations)
9. [Deployment Architecture](#deployment-architecture)

---

## 🛠️ Technology Stack

### Backend
```yaml
Language: Python 3.11+
Framework: FastAPI 0.104+
ORM: SQLAlchemy 2.0+
Database: PostgreSQL 15+
Cache: Redis 7+
Task Queue: Celery (optional for async tasks)
AI/ML: OpenAI API (GPT-4 for natural language queries)
Data Processing: Pandas, NumPy
```

### Frontend
```yaml
Framework: React 18+
Language: TypeScript 5+
Build Tool: Vite 5+
State Management: React Context API / Zustand
Styling: Tailwind CSS 3+
Icons: Lucide React
Charts: Recharts / Chart.js
HTTP Client: Axios
```

### DevOps & Infrastructure
```yaml
Containerization: Docker + Docker Compose
Reverse Proxy: Nginx (production)
Process Manager: PM2 / Gunicorn
Environment: Development (local) → Cloud (later)
Version Control: Git + GitHub
```

### External Services
```yaml
AI Provider: OpenAI API
File Storage: Local (dev) → AWS S3 / Azure Blob (prod)
Google Sheets: Google Sheets API
Email: SendGrid / SMTP
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   React Frontend (TypeScript + Tailwind CSS)        │   │
│  │   - Landing, Auth, Dashboard, Analysis, Settings   │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         FastAPI Backend (Python)                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │ Auth Service │  │ Data Service │  │ AI Service│ │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │ Query Engine │  │ File Handler │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────┬────────────────┬─────────────────────────────┘
               │                │
               ▼                ▼
┌──────────────────────┐  ┌──────────────────────┐
│   DATABASE TIER      │  │   CACHE TIER         │
│  ┌────────────────┐  │  │  ┌────────────────┐  │
│  │  PostgreSQL    │  │  │  │     Redis      │  │
│  │  - Users       │  │  │  │  - Sessions    │  │
│  │  - DataSources │  │  │  │  - Query Cache │  │
│  │  - Queries     │  │  │  └────────────────┘  │
│  └────────────────┘  │  └──────────────────────┘
└──────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│           FILE STORAGE                       │
│  - CSV Files                                 │
│  - Uploaded Documents                        │
│  - Processed Data                            │
└──────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│        EXTERNAL SERVICES                     │
│  - OpenAI API (GPT-4)                       │
│  - Google Sheets API                        │
│  - Third-party APIs                         │
└──────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│     users       │         │  data_sources   │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │────────<│ user_id (FK)    │
│ email           │    1:N  │ id (PK)         │
│ password_hash   │         │ name            │
│ full_name       │         │ type            │
│ created_at      │         │ status          │
│ updated_at      │         │ file_path       │
│ is_active       │         │ connection_info │
│ is_verified     │         │ row_count       │
└─────────────────┘         │ file_size       │
                            │ created_at      │
                            │ updated_at      │
                            └─────────────────┘
                                     │
                                     │ 1:N
                                     ▼
                            ┌─────────────────┐
                            │    queries      │
                            ├─────────────────┤
                            │ id (PK)         │
                            │ user_id (FK)    │
                            │ data_source_id  │
                            │ query_text      │
                            │ query_type      │
                            │ result_data     │
                            │ execution_time  │
                            │ is_saved        │
                            │ created_at      │
                            └─────────────────┘
                                     │
                                     │ 1:N
                                     ▼
                            ┌─────────────────┐
                            │ visualizations  │
                            ├─────────────────┤
                            │ id (PK)         │
                            │ query_id (FK)   │
                            │ chart_type      │
                            │ config_json     │
                            │ created_at      │
                            └─────────────────┘
```

### Table Definitions

#### **users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### **data_sources**
```sql
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'csv', 'google_sheets', 'api', 'database'
    status VARCHAR(50) DEFAULT 'connected', -- 'connected', 'syncing', 'error', 'disconnected'
    file_path TEXT, -- For CSV files
    connection_info JSONB, -- For API/Database connections
    row_count INTEGER,
    file_size BIGINT, -- In bytes
    columns_info JSONB, -- Column names and types
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP
);

CREATE INDEX idx_data_sources_user_id ON data_sources(user_id);
CREATE INDEX idx_data_sources_type ON data_sources(type);
CREATE INDEX idx_data_sources_status ON data_sources(status);
```

#### **queries**
```sql
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    query_type VARCHAR(50), -- 'natural_language', 'sql', 'aggregation'
    result_data JSONB, -- Store query results
    execution_time_ms INTEGER,
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_queries_user_id ON queries(user_id);
CREATE INDEX idx_queries_data_source_id ON queries(data_source_id);
CREATE INDEX idx_queries_created_at ON queries(created_at DESC);
CREATE INDEX idx_queries_is_saved ON queries(is_saved) WHERE is_saved = TRUE;
```

#### **visualizations**
```sql
CREATE TABLE visualizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    chart_type VARCHAR(50) NOT NULL, -- 'line', 'bar', 'pie', 'table', 'scatter'
    config_json JSONB NOT NULL, -- Chart configuration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visualizations_query_id ON visualizations(query_id);
```

#### **api_keys** (for user API access)
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL, -- First 8 chars for display
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
```

#### **sessions** (optional - can use Redis instead)
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## 🔌 API Design

### Base URL
```
Development: http://localhost:8000/api/v1
Production:  https://api.insightiq.com/api/v1
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

### API Endpoints

#### **Authentication**

```http
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
POST   /auth/verify-email
POST   /auth/forgot-password
POST   /auth/reset-password
```

**Example: Register**
```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}

Response 201:
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2024-11-30T12:00:00Z"
}
```

**Example: Login**
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### **Data Sources**

```http
GET    /data-sources
POST   /data-sources/upload-csv
POST   /data-sources/connect-sheets
POST   /data-sources/connect-api
GET    /data-sources/{id}
PUT    /data-sources/{id}
DELETE /data-sources/{id}
POST   /data-sources/{id}/sync
GET    /data-sources/{id}/preview
```

**Example: Upload CSV**
```http
POST /api/v1/data-sources/upload-csv
Content-Type: multipart/form-data

file: <csv_file>
name: "Sales Data Q4"

Response 201:
{
  "id": "uuid",
  "name": "Sales Data Q4",
  "type": "csv",
  "status": "connected",
  "row_count": 15234,
  "file_size": 2411520,
  "columns_info": [
    {"name": "date", "type": "datetime"},
    {"name": "revenue", "type": "float"},
    {"name": "region", "type": "string"}
  ],
  "created_at": "2024-11-30T12:00:00Z"
}
```

#### **Queries & Analysis**

```http
POST   /queries/natural-language
POST   /queries/execute
GET    /queries
GET    /queries/{id}
DELETE /queries/{id}
POST   /queries/{id}/save
GET    /queries/saved
```

**Example: Natural Language Query**
```json
POST /api/v1/queries/natural-language
{
  "data_source_id": "uuid",
  "query_text": "What was the total revenue last quarter?"
}

Response 200:
{
  "id": "uuid",
  "query_text": "What was the total revenue last quarter?",
  "interpreted_query": "SELECT SUM(revenue) FROM data WHERE date >= '2024-07-01' AND date <= '2024-09-30'",
  "result_data": {
    "total_revenue": 1234567.89,
    "rows": [...]
  },
  "visualizations": [
    {
      "type": "kpi",
      "config": {...}
    }
  ],
  "execution_time_ms": 245,
  "created_at": "2024-11-30T12:00:00Z"
}
```

#### **Visualizations**

```http
GET    /visualizations/{query_id}
POST   /visualizations
PUT    /visualizations/{id}
DELETE /visualizations/{id}
```

#### **User Profile**

```http
GET    /users/me
PUT    /users/me
PUT    /users/me/password
POST   /users/me/avatar
```

#### **Statistics & Analytics**

```http
GET    /stats/dashboard
GET    /stats/usage
```

**Example: Dashboard Stats**
```json
GET /api/v1/stats/dashboard

Response 200:
{
  "data_sources_count": 12,
  "queries_count": 247,
  "queries_this_month": 56,
  "active_datasets": 8,
  "storage_used_bytes": 25165824,
  "storage_limit_bytes": 10737418240,
  "recent_activity": [...]
}
```

---

## 🔐 Authentication & Security

### JWT Token Structure

```javascript
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890,
  "type": "access" // or "refresh"
}
```

### Token Expiration
```
Access Token:  1 hour
Refresh Token: 30 days
```

### Password Requirements
```
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
```

### Security Measures
```yaml
Password Hashing: bcrypt (cost factor: 12)
JWT Algorithm: HS256
CORS: Configured for frontend domain only
Rate Limiting: 100 requests/minute per IP
SQL Injection: Parameterized queries via SQLAlchemy
XSS Protection: Content Security Policy headers
HTTPS: Required in production
```

### Environment Variables (Security)
```bash
# Never commit these to git!
JWT_SECRET_KEY=<random_256_bit_key>
JWT_REFRESH_SECRET_KEY=<random_256_bit_key>
DATABASE_URL=postgresql://user:pass@localhost:5432/insightiq
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=sk-...
GOOGLE_SHEETS_CREDENTIALS=<json_credentials>
```

---

## 🔄 Data Flow

### 1. User Authentication Flow
```
User → Frontend → POST /auth/login
                     ↓
              Backend validates credentials
                     ↓
              Generate JWT tokens
                     ↓
              Store refresh token in Redis
                     ↓
              Return tokens to Frontend
                     ↓
              Frontend stores in memory/localStorage
                     ↓
              Include in Authorization header for requests
```

### 2. CSV Upload & Analysis Flow
```
User uploads CSV → Frontend
                     ↓
              POST /data-sources/upload-csv
                     ↓
              Backend validates file
                     ↓
              Save file to storage
                     ↓
              Parse CSV with Pandas
                     ↓
              Extract metadata (columns, types, row count)
                     ↓
              Store metadata in PostgreSQL
                     ↓
              Return data source info to Frontend
                     ↓
              User sees data source in list
```

### 3. Natural Language Query Flow
```
User types query → Frontend
                     ↓
              POST /queries/natural-language
                     ↓
              Backend receives query
                     ↓
              Send to OpenAI API (GPT-4)
                     ↓
              GPT-4 interprets query → generates pandas code
                     ↓
              Execute code safely on data
                     ↓
              Generate visualization config
                     ↓
              Store query + results in PostgreSQL
                     ↓
              Cache results in Redis (5 min)
                     ↓
              Return results + viz to Frontend
                     ↓
              Frontend renders charts with Recharts
```

### 4. Google Sheets Connection Flow
```
User initiates connection → Frontend
                              ↓
                    OAuth flow with Google
                              ↓
                    User grants permissions
                              ↓
                    Receive OAuth tokens
                              ↓
                    POST /data-sources/connect-sheets
                              ↓
                    Backend stores encrypted tokens
                              ↓
                    Fetch sheet data via Google Sheets API
                              ↓
                    Cache data in Redis
                              ↓
                    Store metadata in PostgreSQL
                              ↓
                    Return data source to Frontend
```

---

## 📁 File Storage Strategy

### Development (Local)
```
/app/storage/
  ├── uploads/
  │   ├── csv/
  │   │   └── {user_id}/
  │   │       └── {file_id}.csv
  │   └── temp/
  └── processed/
      └── {user_id}/
          └── {data_source_id}.parquet
```

### Production (Cloud)
```
AWS S3 / Azure Blob Storage Structure:

insightiq-data/
  ├── users/{user_id}/
  │   ├── uploads/
  │   │   └── {file_id}.csv
  │   └── processed/
  │       └── {data_source_id}.parquet
  └── temp/
      └── {session_id}/
```

### File Handling
```python
# Maximum file size
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# Allowed file types
ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.json'}

# File naming convention
file_name = f"{user_id}_{timestamp}_{original_name}"
```

---

## 🔗 External Integrations

### OpenAI API
```python
# Configuration
OPENAI_MODEL = "gpt-4-turbo"
MAX_TOKENS = 2000
TEMPERATURE = 0.2  # Low temperature for consistent analysis

# Usage
- Natural language query interpretation
- Data insight generation
- Anomaly detection
```

### Google Sheets API
```python
# Scopes required
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
]

# OAuth Flow
- User authorization
- Token storage (encrypted)
- Automatic refresh
```

### Future Integrations
```
- Stripe API (payments)
- Slack API (notifications)
- Zapier webhooks
- REST APIs (generic connector)
```

---

## 🚀 Deployment Architecture

### Docker Compose (Development)
```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [postgres, redis]
    
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
    
  postgres:
    image: postgres:15
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  pgadmin:
    image: dpage/pgadmin4
    ports: ["5050:80"]
```

### Production (Future)
```
Load Balancer (Nginx)
       ↓
┌──────────────────┐
│  Frontend (CDN)  │
└──────────────────┘
       ↓
┌──────────────────┐
│  API Gateway     │
└──────────────────┘
       ↓
┌──────────────────┐
│  Backend (x3)    │ ← Auto-scaling
└──────────────────┘
       ↓
┌──────────────────┐
│  PostgreSQL      │ ← Managed Database
│  (RDS/Azure DB)  │
└──────────────────┘
       ↓
┌──────────────────┐
│  Redis           │ ← Managed Cache
│  (ElastiCache)   │
└──────────────────┘
```

---

## 📊 Performance Considerations

### Database Optimization
```sql
-- Indexing strategy
- Primary keys (UUID)
- Foreign keys
- Frequently queried columns (email, created_at, user_id)
- Composite indexes for common queries

-- Query optimization
- Use EXPLAIN ANALYZE
- Avoid N+1 queries
- Pagination for large result sets
- Connection pooling (min: 10, max: 20)
```

### Caching Strategy
```
Redis Cache Layers:
1. Query Results (TTL: 5 minutes)
2. User Sessions (TTL: 30 days)
3. Data Source Previews (TTL: 1 hour)
4. API Rate Limiting

Cache Keys Format:
- query:{data_source_id}:{query_hash}
- session:{token_hash}
- preview:{data_source_id}
```

### API Rate Limiting
```python
# Rate limits per endpoint
RATE_LIMITS = {
    "auth": "5/minute",      # Login attempts
    "queries": "30/minute",  # Query executions
    "uploads": "10/hour",    # File uploads
    "default": "100/minute"  # General API
}
```

---

## 🧪 Testing Strategy

```yaml
Backend:
  - Unit Tests: pytest
  - Integration Tests: pytest + TestClient
  - Coverage Target: 80%+

Frontend:
  - Unit Tests: Vitest
  - Component Tests: React Testing Library
  - E2E Tests: Playwright (optional)

Database:
  - Migrations: Alembic
  - Fixtures: Factory pattern
  - Rollback tests
```

---

## 📈 Monitoring & Logging

```python
# Logging Levels
DEBUG:   Development detailed logs
INFO:    General application flow
WARNING: Unexpected behavior
ERROR:   Application errors
CRITICAL: System failures

# Metrics to Track
- API response times
- Database query times
- Query execution times
- Error rates
- User activity
- Resource usage (CPU, memory, disk)
```

---

## 🔄 Version Control & Branching

```
main           - Production-ready code
develop        - Development branch
feature/*      - New features
bugfix/*       - Bug fixes
hotfix/*       - Urgent production fixes
```

---

## ✅ Next Steps

1. ✅ Set up project structure
2. ✅ Configure Docker Compose
3. ✅ Initialize database with migrations
4. ✅ Implement authentication system
5. ✅ Build API endpoints
6. ✅ Integrate OpenAI for NL queries
7. ✅ Develop frontend components
8. ✅ Connect frontend to backend
9. ✅ Testing & optimization
10. ✅ Deployment preparation

---

**End of System Design Document**