# Getting Started with VibecastAI

This guide will help you set up the VibecastAI development environment and start building.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm 8+** - Install with: `npm install -g pnpm`
- **Docker & Docker Compose** - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/mrkingsleyobi/vibecast.git
cd vibecast

# Install dependencies and setup environment
pnpm setup

# Or manually:
cp .env.example .env
pnpm install
```

### 2. Configure Environment

Edit `.env` and add your API keys:

```bash
# Required for AI features
HUGGINGFACE_API_KEY=your-key-here
OPENROUTER_API_KEY=your-key-here

# Optional for full functionality
NEWS_API_KEY=your-key-here
```

### 3. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, RabbitMQ, and other services
pnpm docker:up

# Check services are running
pnpm docker:ps

# View logs
pnpm docker:logs
```

### 4. Initialize Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Open Prisma Studio to view data
pnpm db:studio
```

### 5. Start Development Servers

```bash
# Start all apps in development mode
pnpm dev

# This will start:
# - Web app at http://localhost:3000
# - API server at http://localhost:4000
```

## 📁 Project Structure

```
vibecast/
├── apps/
│   ├── web/                # Next.js 14 frontend
│   ├── api/                # tRPC API server
│   └── strapi/             # Strapi CMS (TODO)
├── packages/
│   ├── types/              # Shared TypeScript types
│   ├── config/             # Shared configs
│   ├── database/           # Prisma schema & client
│   ├── auth/               # Auth utilities (TODO)
│   ├── ai/                 # AI services (TODO)
│   ├── mcp/                # MCP protocol (TODO)
│   └── ui/                 # Shared UI components (TODO)
├── docs/                   # Documentation
├── k8s/                    # Kubernetes manifests
├── docker-compose.yml      # Local development services
└── turbo.json              # Turborepo configuration
```

## 🛠️ Development Workflow

### Running Individual Apps

```bash
# Run only the web app
cd apps/web
pnpm dev

# Run only the API server
cd apps/api
pnpm dev
```

### Database Operations

```bash
# Create a new migration
pnpm db:migrate

# Push schema changes (dev only)
pnpm db:push

# Open database GUI
pnpm db:studio
```

### Code Quality

```bash
# Lint all code
pnpm lint

# Type check all code
pnpm typecheck

# Format all code
pnpm format
```

### Building for Production

```bash
# Build all apps
pnpm build

# Clean build artifacts
pnpm clean
```

## 🔧 Available Services (Docker Compose)

When you run `pnpm docker:up`, the following services start:

| Service | Port | Description |
|---------|------|-------------|
| **PostgreSQL** | 5432 | Main database |
| **Redis** | 6379 | Cache & sessions |
| **RabbitMQ** | 5672, 15672 | Message queue |
| **Qdrant** | 6333 | Vector database |
| **Neo4j** | 7474, 7687 | Knowledge graph |
| **Meilisearch** | 7700 | Search engine |
| **Kong** | 8000, 8001 | API gateway |
| **Logto** | 3001, 3002 | Authentication |

Access management UIs:
- **RabbitMQ**: http://localhost:15672 (vibecast/vibecast123)
- **Neo4j**: http://localhost:7474 (neo4j/vibecast123)
- **Logto Admin**: http://localhost:3002

## 🎯 Next Steps

### Week 1: Foundation
- [x] Set up monorepo structure
- [x] Initialize Next.js frontend
- [x] Initialize tRPC API
- [x] Configure Prisma database
- [ ] Implement authentication with Logto
- [ ] Create basic UI components
- [ ] Set up CI/CD pipeline

### Week 2: Core Features
- [ ] Build research creation form
- [ ] Implement first tRPC endpoints
- [ ] Create dashboard layout
- [ ] Add user management

### Week 5-8: AI Integration
- [ ] Integrate claude-flow for agents
- [ ] Set up AgentDB for vector search
- [ ] Implement HuggingFace models
- [ ] Build knowledge graph with Neo4j

See [ROADMAP.md](docs/ROADMAP.md) for the complete 12-week plan.

## 📚 Documentation

- [Project Overview](docs/PROJECT_OVERVIEW.md) - Vision and goals
- [Technical Architecture](docs/ARCHITECTURE.md) - System design
- [Product Requirements](docs/PRD.md) - Detailed features
- [Implementation Roadmap](docs/ROADMAP.md) - 12-week plan
- [Blog Post Ideas](docs/BLOG_IDEAS.md) - Content strategy

## 🐛 Troubleshooting

### Docker Services Won't Start

```bash
# Stop all services
pnpm docker:down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Restart
pnpm docker:up
```

### Port Already in Use

If port 3000 or 4000 is already in use:

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pnpm docker:ps

# View PostgreSQL logs
docker-compose logs postgres

# Reset database
pnpm db:push --force-reset
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
pnpm db:generate

# Clear node_modules and reinstall
pnpm clean
pnpm install
pnpm db:generate
```

## 💬 Getting Help

- **Documentation**: Check the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/mrkingsleyobi/vibecast/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mrkingsleyobi/vibecast/discussions)

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Ready to build?** Start with `pnpm dev` and open http://localhost:3000! 🚀
