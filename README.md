<div align="center">

# 🚀 InsightIQ

### AI-Powered Data Analytics Platform

*Transform your data into actionable insights with natural language queries*

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3+-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Screenshots](#-screenshots) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation)

</div>

---

## 📖 About

**InsightIQ** is a modern, full-stack AI-powered data analytics platform that allows users to:
- 🔐 **Sign up** with email/password, Google, or GitHub OAuth
- 📊 **Upload** multiple data sources (CSV, Excel, JSON, Parquet, TSV)
- 🗄️ **Connect** live databases (PostgreSQL, MySQL, SQLite)
- 🤖 **Ask questions** about data in plain English
- 📈 **Get instant** AI-powered visualizations and insights
- ⭐ **Save** and manage query favorites
- 📜 **Review** complete query history with advanced filtering
- ⚙️ **Manage** profile, security, and account settings
- 📱 **Access** from any device (fully responsive)

> **No coding required** - Just ask questions like "What was the total revenue last quarter?" and get instant answers with beautiful charts powered by OpenAI GPT.

---

## ✨ Features

### 🔐 **Authentication & Security**
- **Multiple Sign-in Options**:
  - Email/password with secure JWT tokens
  - Google OAuth (one-click login)
  - GitHub OAuth (one-click login)
  - Auto token refresh (1hr access, 30d refresh)
- **Security Features**:
  - bcrypt password hashing (cost factor 12)
  - Protected routes with middleware
  - Rate limiting (5/min login, 30/min queries, 10/hr uploads)
  - CORS protection
  - SQL injection prevention
  - XSS protection

### 🎨 **Modern Frontend UI**
- **Navy Sage Design System**:
  - Professional dark theme with cyan accents
  - Glass morphism effects (backdrop blur)
  - Smooth animations and transitions
  - Gradient borders with glow effects
  - Responsive mobile-first design
- **8 Complete Pages**:
  - Landing page with hero section
  - Login/Signup with OAuth integration
  - Real-time Dashboard
  - Data Sources management
  - AI-powered Analysis workspace
  - Complete Query History
  - Comprehensive Settings
  - OAuth callback handling

### 📊 **Data Sources Management**
- **File Upload** (Drag & Drop):
  - CSV (.csv)
  - Excel (.xlsx, .xls) with multi-sheet selection
  - JSON (.json)
  - Parquet (.parquet)
  - TSV/Tab-delimited (.tsv, .txt)
  - Max 100MB per file
- **Database Connections**:
  - PostgreSQL (with connection testing)
  - MySQL/MariaDB (with connection testing)
  - SQLite (local files)
  - Direct table querying
  - Encrypted credential storage
- **Management Features**:
  - Preview data (up to 1000 rows in modal)
  - Search and filter sources
  - Color-coded file type indicators
  - Status badges (Connected, Syncing, Error)
  - Delete with confirmation
  - Navigate to analysis from any source

### 🤖 **AI-Powered Analysis**
- **Natural Language Queries**:
  - Ask questions in plain English
  - OpenAI GPT-3.5/4 interpretation
  - Automatic pandas code generation
  - Safe sandboxed execution
  - Example query suggestions (clickable)
  - Keyboard shortcuts (Ctrl+Enter)
- **Smart Visualizations**:
  - Auto-detection based on result type
  - KPI cards for single values (large gradient numbers)
  - Bar charts for categorical data
  - Line charts for time series
  - Pie charts for distributions
  - Interactive data tables
  - Recharts integration with dark theme
- **Query Management**:
  - Save favorite queries (star button)
  - Export results (CSV, JSON)
  - Recent queries sidebar (last 10 in session)
  - Re-run with one click
  - View execution time and metadata

### 📜 **Query History**
- **Comprehensive Timeline**:
  - All queries with full details
  - Query text, type, data source
  - Execution time tracking
  - Result previews (inline)
  - Timestamps (relative: "2 hours ago")
- **Advanced Filtering**:
  - Filter by type (All, Saved, Natural Language, Direct Code)
  - Filter by data source (dropdown with all sources)
  - Search by query text (case-insensitive)
  - Sort options (Newest, Oldest, Fastest, Slowest)
- **Query Actions**:
  - Save/unsave (toggle star)
  - View full details in modal
  - Re-run query (pre-fills Analysis page)
  - Delete with confirmation
  - Color-coded type badges

### 📊 **Real-Time Dashboard**
- **Live Statistics** (from backend):
  - Data Sources count (updates on upload)
  - Total Queries executed
  - Active Datasets syncing
  - Storage usage (GB) with percentage
- **Quick Actions** (4 buttons):
  - Upload File → Opens Data Sources with upload modal
  - Connect Database → Opens database connection modal
  - Connect Sheets (planned)
  - New Analysis → Opens Analysis page
- **Recent Activity Feed**:
  - Real uploads and queries (from backend)
  - Type icons (query, upload, database)
  - Timestamps and descriptions
  - "View All" link to History
- **Data Source Preview**:
  - First 3 sources displayed as cards
  - Real names, types, row counts
  - Click to manage all sources
- **Getting Started Checklist**:
  - Account created ✅
  - Upload data source (checks if done)
  - Run first query (checks if done)
  - Share insight

### ⚙️ **Comprehensive Settings**
- **Profile Management**:
  - Edit full name
  - Edit email (for email accounts)
  - View OAuth provider info
  - Member since date
  - Verification status badge
  - Avatar display (OAuth or initials)
- **Security Settings**:
  - Change password (email accounts only)
  - **Password strength meter** (6 levels with color bar)
  - Requirements checklist (turns green as met)
  - Show/hide password toggles
  - Current password verification
  - OAuth account detection
  - Login activity tracking
- **Account Information**:
  - Usage statistics (queries, sources, storage)
  - Email notification preferences
  - Auto-save queries toggle
  - Preference switches
- **Danger Zone**:
  - Delete account (with double confirmation)
  - Must type "DELETE MY ACCOUNT"
  - Password verification required
  - Lists what will be deleted
  - Immediate logout after deletion

### ⚡ **Performance & Optimization**
- **Redis Caching**: 5-minute cache for repeated queries (saves API costs)
- **Query Optimization**: Smart execution with pandas
- **Async Processing**: Non-blocking API operations
- **Database Indexing**: Optimized for fast lookups
- **Connection Pooling**: Efficient database connections (min: 5, max: 20)
- **Rate Limiting**: Protects against abuse and controls costs
- **NaN Handling**: Proper null value serialization for JSON
- **Code Splitting**: Lazy loading for optimal bundle size
- **Responsive Charts**: Recharts with performance optimization

### 🛡️ **Rate Limiting**
- **Authentication**: 5 login attempts per minute (prevents brute-force)
- **Queries**: 30 AI queries per minute (controls OpenAI costs)
- **Uploads**: 10 file uploads per hour (prevents storage abuse)
- **General API**: 100 requests per minute
- **Real-time Tracking**: Check remaining requests via API
- **Custom Headers**: X-RateLimit-* headers in all responses

---

## 🖼️ Screenshots

### Landing Page
Modern hero section with animated backgrounds, features showcase, and call-to-action.

### Dashboard
Real-time statistics, data source preview, recent activity feed, and quick actions.

### Data Sources
Upload files or connect databases with preview, search, filter, and management tools.

### Analysis
AI-powered query input with automatic visualizations, recent queries sidebar, and save functionality.

### History  
Complete query timeline with advanced filtering, search, save/unsave, re-run, and delete.

### Settings
Profile editing, password change with strength meter, usage stats, and account deletion.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: FastAPI 0.104+ (Python 3.11+)
- **Database**: PostgreSQL 15+ with SQLAlchemy ORM
- **Cache**: Redis 7+ for query caching and rate limiting
- **AI/ML**: OpenAI API (GPT-3.5 Turbo / GPT-4)
- **Data Processing**: Pandas, NumPy
- **File Formats**: openpyxl (Excel), pyarrow (Parquet), JSON
- **Database Connectors**: psycopg2 (PostgreSQL), PyMySQL (MySQL)
- **Authentication**: JWT with python-jose, OAuth 2.0 (Google, GitHub)
- **Security**: bcrypt password hashing, CORS middleware
- **Validation**: Pydantic schemas with enhanced type detection

### **Frontend**
- **Framework**: React 18+ with TypeScript 5+
- **Build Tool**: Vite 5+ (fast HMR)
- **Styling**: Tailwind CSS 3+ (Navy Sage custom theme)
- **State Management**: React Context API (Auth, User state)
- **Routing**: React Router DOM 6+ (protected routes)
- **Charts**: Recharts 2+ (interactive visualizations)
- **Icons**: Lucide React 0.294+ (consistent icon system)
- **HTTP Client**: Axios 1.6+ (with interceptors for auth)
- **Forms**: Controlled components with validation
- **OAuth**: Google + GitHub integration with PKCE

### **DevOps & Infrastructure**
- **Containerization**: Docker + Docker Compose
- **Database Tools**: pgAdmin 4 (visual management)
- **API Documentation**: Swagger UI + ReDoc (interactive)
- **Logging**: Rotating file logs + console output (10MB max, 5 backups)
- **Version Control**: Git + GitHub
- **Development**: Hot reload (backend + frontend)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT TIER                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │   React Frontend (TypeScript + Tailwind CSS)       │     │
│  │   ✅ 8 Complete Pages:                             │     │
│  │   - Landing, Login/Signup (OAuth)                  │     │
│  │   - Dashboard (Real-time stats)                    │     │
│  │   - Data Sources (Upload + Database)               │     │
│  │   - Analysis (AI Queries + Viz)                    │     │
│  │   - History (Query Management)                     │     │
│  │   - Settings (Profile + Security)                  │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS/REST API (35 Endpoints)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │           FastAPI Backend (Python)                  │     │
│  │                                                     │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐  │     │
│  │  │ Auth Service │  │ Data Service │  │AI Service│ │     │
│  │  │  - JWT       │  │  - 5 Formats │  │ - GPT   │ │     │
│  │  │  - OAuth     │  │  - 3 DBs     │  │ - Pandas│ │     │
│  │  └──────────────┘  └──────────────┘  └─────────┘  │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐  │     │
│  │  │Query Service │  │Stats Service │  │Rate Limit│ │     │
│  │  │  - NL Query  │  │  - Analytics │  │ - Redis │ │     │
│  │  └──────────────┘  └──────────────┘  └─────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└──────┬────────────────┬────────────────┬────────────────────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │    Redis    │  │  OpenAI API │
│  Database   │  │    Cache    │  │  (GPT-3.5)  │
│             │  │  + Rate     │  └─────────────┘
│ - Users     │  │  Limiting   │
│ - Sources   │  │             │
│ - Queries   │  │  5min TTL   │
└─────────────┘  └─────────────┘
```

---

## ✨ Complete Feature List

### 🎨 **Frontend Application (100% Complete)**

#### **Landing Page**
- Modern hero section with gradient text
- Animated background effects (floating orbs)
- Features showcase (3 cards)
- Professional footer
- Fully responsive design
- Call-to-action buttons

#### **Authentication Pages**
- **Login Page**:
  - Email/password authentication
  - Google OAuth (one-click login)
  - GitHub OAuth (one-click login)
  - Glass morphism design
  - "Remember me" checkbox
  - Forgot password link
  - Beautiful animations
- **Signup Page**:
  - Email/password registration
  - Google/GitHub OAuth signup
  - Real-time email validation
  - Password strength requirements
  - Matching design with Login
  - Auto-login after registration

#### **Dashboard**
- **Real-Time Statistics** (4 cards):
  - Data Sources count (live from backend)
  - Total Queries executed
  - Active Datasets syncing
  - Storage Used (GB with percentage)
  - Animated on load with gradient glows
- **Quick Actions** (4 buttons):
  - Upload File → Opens Data Sources page with upload modal
  - Connect Database → Opens database connection modal
  - Connect Sheets (planned)
  - New Analysis → Opens Analysis page
- **Recent Activity Feed**:
  - Real queries and uploads from backend
  - Type-specific icons (query, upload, database)
  - Relative timestamps ("2 hours ago")
  - Click to view all in History
- **Data Source Preview**:
  - First 3 sources displayed as cards
  - Real names, types, row counts from your data
  - Click to navigate to Data Sources
- **Getting Started Checklist**:
  - Account created ✅
  - Upload data source (checks backend)
  - Run first query (checks backend)
  - Share insight

#### **Data Sources Page**
- **File Upload**:
  - Drag & drop zone with visual feedback
  - Browse files button
  - Supports: CSV, Excel, JSON, Parquet, TSV
  - Excel sheet selector (multi-sheet support)
  - File size validation (max 100MB)
  - Custom naming option
  - Upload progress indicator
- **Database Connections**:
  - PostgreSQL connection form
  - MySQL/MariaDB connection form
  - SQLite file path
  - Test connection before saving
  - Connection success/error feedback
  - Auto-port selection (5432 for PostgreSQL, 3306 for MySQL)
  - Optional table selection
  - 2-column form layout (desktop), stacked (mobile)
- **Data Source Grid**:
  - Card layout with hover effects
  - Color-coded by type (green: CSV, blue: DB, etc.)
  - Status badges (Connected, Syncing, Error)
  - Stats display (rows, file size, date added)
  - Actions: Preview, Analyze, Delete
- **Preview Modal**:
  - Full-width scrollable table
  - Shows first 100 rows
  - All columns visible
  - Null value handling
  - Row count indicator
- **Search & Filter**:
  - Real-time search by name
  - Filter by file type (dropdown)
  - Dynamic filter options
- **Empty States**:
  - Helpful messages for new users
  - Quick action buttons
  - Different states for no sources vs. no search results

#### **Analysis Page** (AI-Powered)
- **Data Source Selector**:
  - Dropdown with all uploaded sources
  - Shows type and row count
  - Auto-selects from URL parameter
  - Empty state with "Upload" button
- **AI Query Input**:
  - Large textarea with animated Sparkles icon
  - Natural language placeholder
  - 3 example query buttons (quick-fill)
  - Keyboard shortcut (Ctrl+Enter to execute)
  - Loading state during execution
- **Results Display**:
  - Success header with metadata
  - Query text, data source, execution time
  - Timestamps (relative format)
  - Action buttons: Save (star), Export, Clear
- **Auto-Visualizations**:
  - **KPI Cards**: Single values with huge gradient numbers
  - **Data Tables**: JSON formatted with syntax highlighting
  - **Bar Charts**: Array data with Recharts
  - **Line Charts**: Time series detection
  - **Pie Charts**: Distribution data
  - Responsive chart sizing
  - Dark theme compatible
- **Recent Queries Sidebar**:
  - Last 10 queries in session
  - Click to re-run
  - Timestamps
  - Scrollable list
- **Quick Tips Card**:
  - Usage reminders
  - Keyboard shortcuts
  - Best practices

#### **History Page**
- **Query Timeline**:
  - All queries in chronological order
  - Query cards with full information
  - Expandable result previews
  - Color-coded type badges
- **Advanced Filtering**:
  - Type filter (All, Saved, Natural Language, Direct)
  - Data source filter (dropdown)
  - Search by text
  - Sort options (4 choices)
  - Server-side filtering (fast with 1000s of queries)
- **Query Actions** (4 buttons per query):
  - Save/Unsave (star, filled when saved)
  - View Details (opens full modal)
  - Re-run Query (navigates to Analysis)
  - Delete (confirmation modal)
- **Details Modal**:
  - Full query text
  - Complete results (formatted JSON)
  - Metadata grid (4 items)
  - Re-run button
- **Delete Confirmation**:
  - Shows query text
  - "Cannot be undone" warning
  - Confirm/Cancel buttons
- **Empty States**:
  - No queries message
  - "Start Analyzing" button
  - Different message for filtered results

#### **Settings Page**
- **4 Tabbed Sections**:
  
  **Profile Tab**:
  - Display user avatar (OAuth image or initials)
  - Full name (editable)
  - Email address (editable for email accounts)
  - Account type badge (OAuth or Email/Password)
  - Member since date
  - Edit mode with Save/Cancel buttons
  - Real-time updates
  
  **Security Tab**:
  - Change Password (email accounts):
    - Current password field (with show/hide)
    - New password field (with show/hide)
    - Confirm password field
    - **Password Strength Meter** (6 levels: Very Weak → Excellent)
    - Animated progress bar (changes color)
    - Requirements checklist (4 items, turn green when met)
    - Validation: Must be different, must be strong
  - OAuth Account Info:
    - Explanation message
    - No password section shown
  - Login Activity:
    - Current session display
    - Last login timestamp
    - Active badge
  
  **Account Tab**:
  - **Usage Statistics** (3 cards):
    - Total Queries (with icon)
    - Total Data Sources (with icon)
    - Storage Used MB (with icon)
  - **Preferences** (toggle switches):
    - Email notifications (on/off)
    - Auto-save queries (on/off)
  - Real data from backend
  
  **Danger Zone Tab**:
  - Red warning banner
  - Delete account section
  - Lists what will be deleted
  - Delete button (opens modal)
  - **Delete Confirmation Modal**:
    - Animated red glow (pulsing)
    - Must type "DELETE MY ACCOUNT" exactly
    - Must enter password
    - Both required to enable deletion
    - Multiple warnings
    - "Cannot be undone" message
    - Immediate logout after deletion

### 📱 **Responsive Design**
- **Mobile-First Approach**:
  - Collapsible sidebar with overlay
  - Touch-friendly buttons (min 44px)
  - Stacked layouts on small screens
  - Horizontal scrollable tabs
  - Full-screen modals
  - Dark backdrop overlays
- **Desktop Enhancements**:
  - Multi-column grids (2-4 columns)
  - Sidebar toggle (expanded/icon-only)
  - Larger charts and visualizations
  - Keyboard shortcuts
  - Advanced filters visible
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: 1024px+
  - Large: 1280px+

---

## 🏗️ System Architecture

### **Database Schema**

```
users (Authentication)
  ├─ id, email, password_hash, full_name
  ├─ created_at, is_active, is_verified, last_login
  ├─ oauth_provider, oauth_id, avatar_url (OAuth support)
  └─ Relationships: data_sources, queries

data_sources (Data Management)
  ├─ id, user_id, name, type, status
  ├─ file_path, row_count, file_size
  ├─ columns_info (JSONB), connection_info (JSONB)
  ├─ Supports: CSV, Excel, JSON, Parquet, TSV, Database connections
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
- [Node.js 18+](https://nodejs.org/) (for frontend development)
- [OpenAI API Key](https://platform.openai.com/api-keys)
- [Google OAuth Credentials](https://console.cloud.google.com/) (optional)
- [GitHub OAuth App](https://github.com/settings/developers) (optional)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Preyash-NEU/InsightIQ.git
   cd InsightIQ
   ```

2. **Set up backend environment**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   
   # Edit backend/.env and add:
   # - OPENAI_API_KEY=sk-your-key-here
   # - GOOGLE_CLIENT_ID=your-google-client-id (optional)
   # - GOOGLE_CLIENT_SECRET=your-google-secret (optional)
   # - GITHUB_CLIENT_ID=your-github-client-id (optional)
   # - GITHUB_CLIENT_SECRET=your-github-secret (optional)
   ```

3. **Set up frontend environment**
   ```bash
   # Copy environment template
   cp frontend/.env.example frontend/.env
   
   # Default values should work for local development
   ```

4. **Start all services with Docker**
   ```bash
   docker-compose up -d
   ```

5. **Wait for services to be healthy** (~30 seconds)
   ```bash
   docker-compose ps
   ```

6. **Run database migrations**
   ```bash
   docker exec -it insightiq_backend alembic upgrade head
   ```

7. **Install frontend dependencies and start**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### **Access the Application**

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend Application** | http://localhost:3000 | Sign up to create account |
| **Backend API** | http://localhost:8000 | - |
| **API Documentation (Swagger)** | http://localhost:8000/docs | - |
| **API Documentation (ReDoc)** | http://localhost:8000/redoc | - |
| **pgAdmin (Database)** | http://localhost:5050 | admin@insightiq.com / admin |

### **First Steps**

1. **Sign Up**: Go to http://localhost:3000 and create an account
   - Use email/password, or
   - Click "Continue with Google", or
   - Click "Continue with GitHub"

2. **Upload Data**: Navigate to Data Sources
   - Upload a CSV or Excel file, or
   - Connect to a database

3. **Ask Questions**: Go to Analysis
   - Select your data source
   - Type: "What is the sum of the revenue column?"
   - Click "Analyze"
   - See instant AI-powered results! ✨

---

## 📚 API Documentation

### **35 RESTful Endpoints**

#### **Authentication** (5 endpoints)
```
POST   /api/v1/auth/register          # Create new account
POST   /api/v1/auth/login             # Login with JWT (rate limited: 5/min)
POST   /api/v1/auth/refresh           # Refresh access token
POST   /api/v1/auth/logout            # Logout user
GET    /api/v1/auth/me                # Get current user
```

#### **OAuth** (4 endpoints)
```
GET    /api/v1/auth/google            # Initiate Google OAuth
GET    /api/v1/auth/google/callback   # Handle Google callback
GET    /api/v1/auth/github            # Initiate GitHub OAuth
GET    /api/v1/auth/github/callback   # Handle GitHub callback
```

#### **User Management** (5 endpoints)
```
GET    /api/v1/users/me               # Get profile
PUT    /api/v1/users/me               # Update profile
POST   /api/v1/users/me/change-password  # Change password
GET    /api/v1/users/me/stats         # Get user statistics
DELETE /api/v1/users/me               # Delete account
```

#### **Data Sources** (9 endpoints)
```
POST   /api/v1/data-sources/upload            # Upload file (multi-format)
POST   /api/v1/data-sources/excel/sheets      # Get Excel sheets
GET    /api/v1/data-sources                   # List all sources
GET    /api/v1/data-sources/{id}              # Get single source
PUT    /api/v1/data-sources/{id}              # Update source
DELETE /api/v1/data-sources/{id}              # Delete source
GET    /api/v1/data-sources/{id}/preview      # Preview data
POST   /api/v1/data-sources/database/test     # Test DB connection
POST   /api/v1/data-sources/database/connect  # Connect database
```

#### **Queries & Analysis** (6 endpoints)
```
POST   /api/v1/queries/natural-language     # AI-powered query (rate limited)
POST   /api/v1/queries/execute              # Execute pandas code
GET    /api/v1/queries                      # List queries (with filters)
GET    /api/v1/queries/{id}                 # Get single query
POST   /api/v1/queries/{id}/save            # Save/favorite query
DELETE /api/v1/queries/{id}                 # Delete query
```

#### **Statistics & Analytics** (6 endpoints)
```
GET    /api/v1/stats/dashboard        # Dashboard overview
GET    /api/v1/stats/usage             # Usage analytics
GET    /api/v1/stats/activity          # Recent activity
GET    /api/v1/stats/insights          # AI insights
GET    /api/v1/stats/rate-limits       # Get rate limit status
```

---

## 🤖 AI Integration Details

### **How It Works**

1. **User asks a question** in natural language:
   ```
   "What was the total revenue last quarter?"
   ```

2. **AI interprets the query** using OpenAI GPT:
   - Analyzes column names and types
   - Generates safe pandas code
   ```python
   result = df[df['date'] >= '2024-07-01']['revenue'].sum()
   ```

3. **Secure execution**:
   - Sandboxed environment
   - Banned keywords (import, eval, os, etc.)
   - Timeout protection (30 seconds)

4. **Results + Visualization**:
   - Returns result data
   - Auto-suggests chart type (KPI, bar, line, pie, table)
   - Frontend renders beautiful visualization

### **Supported Query Types**

| Query Type | Example | Output |
|------------|---------|--------|
| **Aggregation** | "What's the total sales?" | KPI card with number |
| **Filtering** | "Show me sales > $1000" | Data table |
| **Grouping** | "Sales by region" | Bar chart |
| **Time Series** | "Revenue over time" | Line chart |
| **Statistics** | "Average order value" | Number with trend |
| **Top N** | "Top 10 products" | Table + Bar chart |

### **Caching Strategy**

- **Cache Key**: MD5 hash of (data_source_id + query_text)
- **TTL**: 5 minutes
- **Benefits**: 
  - Instant results for repeat queries
  - Reduced OpenAI API costs
  - Better user experience
  - Lower backend load

---

## 📁 Project Structure

```
InsightIQ/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/endpoints/  # API routes (auth, users, data, queries, stats)
│   │   ├── core/              # Security, config, rate limiting
│   │   ├── db/                # Database connection
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helpers, validators, parsers
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Unit & integration tests
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── DashboardLayout.tsx     # Main layout with sidebar
│   │   │   ├── ProtectedRoute.tsx      # Auth guard
│   │   │   └── DatabaseConnectionModal.tsx
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.tsx         # Auth state management
│   │   ├── pages/             # Page components (8 pages)
│   │   │   ├── Landing.tsx             # Homepage
│   │   │   ├── Login.tsx               # Login with OAuth
│   │   │   ├── SignUp.tsx              # Signup with OAuth
│   │   │   ├── OAuthCallback.tsx       # OAuth handler
│   │   │   ├── Dashboard.tsx           # Real-time dashboard
│   │   │   ├── DataSources.tsx         # Data management
│   │   │   ├── Analysis.tsx            # AI queries
│   │   │   ├── History.tsx             # Query history
│   │   │   └── Settings.tsx            # User settings
│   │   ├── services/          # API clients
│   │   │   ├── api.ts                  # Axios instance
│   │   │   ├── authService.ts          # Auth API calls
│   │   │   ├── oauthService.ts         # OAuth flow
│   │   │   ├── dataSourceService.ts    # Data API calls
│   │   │   └── queryService.ts         # Query API calls
│   │   ├── types/             # TypeScript types
│   │   │   ├── index.ts                # Central exports
│   │   │   ├── dataSource.ts           # Data types
│   │   │   ├── query.ts                # Query types
│   │   │   └── visualization.ts        # Chart types
│   │   ├── App.tsx            # Router configuration
│   │   └── main.tsx           # Application entry
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docs/                      # Documentation
│   ├── UI-DESIGN-SYSTEM.md
│   ├── SYSTEM-ARCHITECTURE.md
│   ├── PROJECT-STRUCTURE.md
│   └── DEVELOPMENT-ROADMAP.md
│
├── docker-compose.yml         # Multi-container setup
└── README.md                  # This file
```

---

## 🧑‍💻 Development

### **Backend Development**

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend Development**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### **Database Management**

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history
```

### **Useful Commands**

```bash
# View logs (all services)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

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

# View backend logs
docker exec -it insightiq_backend tail -f /app/logs/insightiq.log
```

---

## 🧪 Testing

### **Backend Tests**

```bash
# Run all tests
cd backend
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/test_auth.py

# Verbose output
pytest -v
```

### **Frontend Tests** (Setup ready)

```bash
# Run tests
cd frontend
npm test

# Coverage
npm run test:coverage

# E2E tests (when configured)
npm run test:e2e
```

---

## 🎨 UI Design System

### **Navy Sage Theme**

A professional, modern dark theme with subtle cyan/blue accents.

**Color Palette:**
- **Primary Gradient**: Slate 700 (#334155) → Cyan 700 (#0e7490)
- **Background**: Slate 950 (#0f172a) → Slate 900 (#0f172a)
- **Cards**: Slate 900/50 with backdrop-blur-xl (glass morphism)
- **Borders**: Slate 700/30 (subtle)
- **Accent**: Cyan 400 (#22d3ee) for interactive elements
- **Text Primary**: Slate 50 (#f8fafc)
- **Text Secondary**: Slate 400 (#94a3b8)

**Design Principles:**
- Glass morphism effects (backdrop blur)
- Smooth transitions (300ms)
- Gradient borders with glow on hover
- Rounded corners (8px - 20px)
- Centered, balanced layouts
- Subtle animations
- Consistent spacing

**Components:**
- Buttons: Primary (gradient), Secondary (slate), Danger (red gradient)
- Cards: Glass effect with border glow
- Inputs: Dark with cyan focus states
- Modals: Full-screen overlay with backdrop
- Tables: Scrollable with hover rows
- Charts: Dark theme with cyan/blue colors

See [UI-DESIGN-SYSTEM.md](docs/UI-DESIGN-SYSTEM.md) for complete specifications.

---

## 🔐 Security Features

- **Password Hashing**: bcrypt with cost factor 12
- **JWT Tokens**: HS256 algorithm with expiration (1hr access, 30d refresh)
- **OAuth 2.0**: Google and GitHub integration with PKCE
- **Rate Limiting**: Redis-based, per-user and per-IP
- **CORS**: Configured for specific origins only
- **SQL Injection**: Prevented via SQLAlchemy ORM (parameterized queries)
- **Code Execution**: Sandboxed with banned keywords
- **Input Validation**: Pydantic schemas for all endpoints
- **Environment Variables**: Secrets never committed to Git
- **Database Connections**: Encrypted credentials in production
- **XSS Protection**: Content Security Policy headers
- **Session Management**: Secure token storage and refresh

---

## 📊 Performance Optimizations

**Backend:**
- **Redis Caching**: Query results cached for 5 minutes
- **Database Indexing**: All foreign keys and frequent lookups indexed
- **Connection Pooling**: SQLAlchemy pool (min: 5, max: 20)
- **Async Operations**: Non-blocking API calls with FastAPI
- **Pagination**: All list endpoints support skip/limit
- **File Size Limits**: 100MB max for uploads
- **Query Timeout**: 30 seconds max execution time
- **Rate Limiting**: Prevents resource exhaustion
- **NaN Handling**: Proper null value serialization for JSON

**Frontend:**
- **Code Splitting**: Lazy loading for optimal bundle size
- **Tree Shaking**: Removes unused code (Vite)
- **Asset Optimization**: Image compression and lazy loading
- **Memoization**: React.memo for expensive components
- **Debouncing**: Search and filter inputs
- **Virtual Scrolling**: For large lists (future)
- **Service Worker**: Offline support (future)

---

## 🌟 Key Highlights

### **What Makes InsightIQ Special**

✨ **No Code Required**: Ask questions in plain English  
🚀 **Fast**: Redis caching + optimized queries + Vite build  
🔒 **Secure**: Enterprise-grade auth with OAuth + rate limiting  
📊 **Smart**: AI-powered query interpretation (OpenAI GPT)  
🎨 **Beautiful**: Professional Navy Sage UI with animations  
📈 **Scalable**: Microservices-ready architecture  
🧪 **Production-Ready**: Logging, monitoring, error handling  
📱 **Responsive**: Perfect mobile experience with overlay sidebar  
🗄️ **Versatile**: 5 file formats + 3 database types  
🛡️ **Protected**: Rate limiting prevents abuse and controls costs  
⚡ **Complete**: 8 fully-functional pages with 35+ API endpoints  

---

## 📖 Documentation

- **API Documentation**: http://localhost:8000/docs (Swagger UI - Interactive)
- **API Documentation**: http://localhost:8000/redoc (ReDoc - Clean)
- **Architecture**: [docs/SYSTEM-ARCHITECTURE.md](docs/SYSTEM-ARCHITECTURE.md)
- **UI Design System**: [docs/UI-DESIGN-SYSTEM.md](docs/UI-DESIGN-SYSTEM.md)
- **Project Structure**: [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md)
- **Development Roadmap**: [docs/DEVELOPMENT-ROADMAP.md](docs/DEVELOPMENT-ROADMAP.md)

---

## 🗺️ Roadmap

### **Phase 1: MVP** ✅ 
- [x] Authentication system with JWT
- [x] Multi-format file upload (CSV, Excel, JSON, Parquet, TSV)
- [x] Database connections (PostgreSQL, MySQL, SQLite)
- [x] AI-powered natural language queries
- [x] Query history and favorites
- [x] Dashboard analytics
- [x] Redis caching for performance
- [x] User profile management
- [x] Rate limiting for security
- [x] Enhanced data validation
- [x] Comprehensive logging

### **Phase 2: Frontend & OAuth** ✅
- [x] React frontend with TypeScript
- [x] Navy Sage UI design system
- [x] Google OAuth integration
- [x] GitHub OAuth integration
- [x] 8 complete pages (Landing, Auth, Dashboard, Data, Analysis, History, Settings)
- [x] Real-time dashboard with live stats
- [x] Data source management (upload + database)
- [x] AI analysis with visualizations
- [x] Query history with filtering
- [x] User settings with security
- [x] Responsive mobile design
- [x] Advanced filtering and search
- [x] Password strength meter
- [x] Account deletion flow

### **Phase 3: Enhanced Features** 🚧 (In Progress)
- [ ] Google Sheets integration
- [ ] Advanced visualizations (scatter, heatmap, funnel)
- [ ] Email notifications
- [ ] Password reset flow (email-based)
- [ ] Query export (PDF, Excel)
- [ ] Scheduled queries
- [ ] API key management UI
- [ ] Team collaboration (workspaces)

### **Phase 4: Advanced Features** 📋 (Planned)
- [ ] REST API connectors (generic)
- [ ] Webhook integrations
- [ ] Real-time data streaming
- [ ] MongoDB integration
- [ ] Custom dashboards (drag & drop)
- [ ] White-labeling options
- [ ] Multi-language support
- [ ] Advanced analytics (ML insights)

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
- **TypeScript**: Strict mode enabled
- **Commits**: Use conventional commits (feat, fix, docs, etc.)
- **Documentation**: Update README and docs for new features
- **Testing**: Add tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Preyash Mehta**
- GitHub: [@Preyash-NEU](https://github.com/Preyash-NEU)
- LinkedIn: [Preyash Mehta](https://www.linkedin.com/in/preyash-mehta/)
- Email: preyash.mehta.12@gmail.com

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [OpenAI](https://openai.com/) - AI-powered query interpretation
- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - React charting library
- [PostgreSQL](https://www.postgresql.org/) - Robust relational database
- [Redis](https://redis.io/) - High-performance caching
- [Lucide Icons](https://lucide.dev/) - Beautiful icon system
- [Vite](https://vitejs.dev/) - Next-generation frontend tooling

---

<div align="center">

**Made with ❤️ and ☕**

*InsightIQ - Transform Data into Actionable Insights*

**Full-Stack AI Data Analytics Platform**  
Frontend ✅ | Backend ✅ | Database ✅ | OAuth ✅ | AI ✅ | Mobile ✅

[⬆ Back to Top](#-insightiq)

</div>
