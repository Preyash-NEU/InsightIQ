# InsightIQ

AI-Powered Data Analytics Platform

## Overview
InsightIQ allows users to upload data, ask questions in natural language, and get instant AI-powered visualizations.

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React + TypeScript + Tailwind CSS
- **Database:** PostgreSQL
- **Cache:** Redis
- **AI:** OpenAI GPT-4

## Getting Started

### Prerequisites
- Docker Desktop
- Git
- Python 3.11+
- Node.js 18+

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/InsightIQ.git
cd InsightIQ
\`\`\`

2. Start Docker services
\`\`\`bash
docker-compose up -d
\`\`\`

3. Access services
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- pgAdmin: http://localhost:5050

## Project Structure
See `docs/PROJECT-STRUCTURE.md` for detailed structure.

## Documentation
- [UI Design System](docs/UI-DESIGN-SYSTEM.md)
- [System Architecture](docs/SYSTEM-ARCHITECTURE.md)
- [Development Roadmap](docs/DEVELOPMENT-ROADMAP.md)

## License
MIT