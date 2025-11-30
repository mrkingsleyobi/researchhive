# 🚀 ResearchHive Production Deployment Guide

**Complete guide for deploying ResearchHive to production for beta launch**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring Setup](#monitoring-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services

#### Core Infrastructure
- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 8.0.0
- **PostgreSQL** ≥ 14.0 (production database)
- **Redis** ≥ 7.0 (caching layer)
- **Neo4j** ≥ 5.0 (knowledge graph)

#### Optional Services
- **RabbitMQ** ≥ 3.12 (message queue)
- **Qdrant** ≥ 1.7 (vector database)
- **Meilisearch** ≥ 1.5 (full-text search)

#### External APIs (Required)
- **Anthropic API Key** - Claude AI research agent
- **Logto Account** - Authentication service

#### External APIs (Optional)
- **NewsAPI** - News aggregation
- **Twitter API v2** - Social media research
- **Reddit API** - Social media research
- **Google Custom Search API** - Web scraping
- **HuggingFace API** - NLP models

#### Monitoring & Analytics
- **Sentry Account** - Error tracking
- **PostHog Account** - Product analytics
- **Resend Account** - Email notifications

---

## Infrastructure Setup

### 1. PostgreSQL Setup

#### Option A: Managed Service (Recommended)

**Providers:**
- [Supabase](https://supabase.com) - Free tier available
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [AWS RDS](https://aws.amazon.com/rds/) - Enterprise grade
- [Railway](https://railway.app) - Simple deployment

**Example (Supabase):**
```bash
# 1. Create project at https://supabase.com
# 2. Get connection string from Settings > Database
# Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

#### Option B: Self-Hosted

```bash
# Install PostgreSQL 14+
sudo apt-get update
sudo apt-get install postgresql-14

# Create database and user
sudo -u postgres psql
CREATE DATABASE researchhive;
CREATE USER researchhive WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE researchhive TO researchhive;
\q

# Configure connection
DATABASE_URL="postgresql://researchhive:secure_password_here@localhost:5432/researchhive"
```

### 2. Redis Setup

#### Option A: Managed Service (Recommended)

**Providers:**
- [Upstash](https://upstash.com) - Serverless Redis, free tier
- [Redis Cloud](https://redis.com/cloud/) - Official managed service
- [AWS ElastiCache](https://aws.amazon.com/elasticache/) - Enterprise

**Example (Upstash):**
```bash
# 1. Create database at https://console.upstash.com
# 2. Copy connection string

REDIS_URL="redis://default:password@region.upstash.io:6379"
```

#### Option B: Self-Hosted

```bash
# Install Redis 7+
sudo apt-get install redis-server

# Configure with password
sudo nano /etc/redis/redis.conf
# Add: requirepass your_secure_password

# Restart Redis
sudo systemctl restart redis-server

# Test connection
redis-cli
AUTH your_secure_password
PING

REDIS_URL="redis://:your_secure_password@localhost:6379"
```

### 3. Neo4j Setup

#### Option A: Managed Service (Recommended)

**Providers:**
- [Neo4j Aura](https://neo4j.com/cloud/aura/) - Official managed service
- [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-aai4pwq5m6qt4) - Self-managed

**Example (Neo4j Aura):**
```bash
# 1. Create free instance at https://console.neo4j.io
# 2. Download credentials

NEO4J_URL="neo4j+s://xxx.databases.neo4j.io"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="your-generated-password"
```

#### Option B: Self-Hosted

```bash
# Install Neo4j Community Edition
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list
sudo apt-get update
sudo apt-get install neo4j

# Start Neo4j
sudo systemctl enable neo4j
sudo systemctl start neo4j

# Set initial password at http://localhost:7474

NEO4J_URL="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="your_password"
```

### 4. Optional: Qdrant (Vector Database)

```bash
# Docker deployment (recommended)
docker run -p 6333:6333 qdrant/qdrant

QDRANT_URL="http://localhost:6333"
```

### 5. Optional: Meilisearch (Full-text Search)

```bash
# Docker deployment
docker run -p 7700:7700 getmeili/meilisearch:latest --master-key="masterKey"

MEILISEARCH_URL="http://localhost:7700"
MEILISEARCH_KEY="masterKey"
```

---

## Environment Configuration

### 1. External API Keys

#### Anthropic API (Required)

```bash
# Get API key from https://console.anthropic.com
# Free tier: $5 credit
# Pay-as-you-go: ~$0.003/1K input tokens, ~$0.015/1K output tokens

ANTHROPIC_API_KEY="sk-ant-api03-xxx"
```

#### Logto Authentication (Required)

```bash
# 1. Create account at https://logto.io
# 2. Create application
# 3. Get credentials

LOGTO_ENDPOINT="https://your-tenant.logto.app"
LOGTO_APP_ID="your-app-id"
LOGTO_APP_SECRET="your-app-secret"

# Generate secure NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL="https://your-domain.com"
```

#### NewsAPI (Optional)

```bash
# Get API key from https://newsapi.org
# Free tier: 100 requests/day

NEWS_API_KEY="your-newsapi-key"
```

#### Twitter API v2 (Optional)

```bash
# Get Bearer token from https://developer.twitter.com
# Essential tier: Free (limited)

TWITTER_BEARER_TOKEN="your-twitter-bearer-token"
```

#### Reddit API (Optional)

```bash
# Create app at https://www.reddit.com/prefs/apps
# Script type application

REDDIT_CLIENT_ID="your-reddit-client-id"
REDDIT_CLIENT_SECRET="your-reddit-client-secret"
```

#### Google Custom Search (Optional)

```bash
# 1. Create project in Google Cloud Console
# 2. Enable Custom Search API
# 3. Create API key
# 4. Create Custom Search Engine at https://cse.google.com

GOOGLE_SEARCH_API_KEY="your-google-api-key"
GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"
```

#### HuggingFace API (Optional)

```bash
# Get token from https://huggingface.co/settings/tokens
# Free tier available

HUGGINGFACE_API_KEY="hf_xxx"
```

### 2. Monitoring & Analytics

#### Sentry (Error Tracking)

```bash
# 1. Create project at https://sentry.io
# 2. Get DSN from Settings > Client Keys

SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_RELEASE="researchhive@1.0.0"
```

#### PostHog (Product Analytics)

```bash
# 1. Create project at https://posthog.com
# 2. Get API key from Settings

NEXT_PUBLIC_POSTHOG_KEY="phc_xxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

#### Resend (Email Notifications)

```bash
# 1. Create account at https://resend.com
# 2. Add domain and verify DNS
# 3. Create API key

RESEND_API_KEY="re_xxx"
```

### 3. Complete .env File

Create `.env` in project root:

```bash
# ===========================================
# Application
# ===========================================
NODE_ENV=production

# ===========================================
# Web App (Next.js)
# ===========================================
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com
NEXT_PUBLIC_MCP_URL=https://api.your-domain.com/api/mcp

# ===========================================
# API Server
# ===========================================
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=https://your-domain.com

# ===========================================
# Database
# ===========================================
DATABASE_URL=postgresql://user:password@host:5432/researchhive

# ===========================================
# Redis
# ===========================================
REDIS_URL=redis://:password@host:6379

# ===========================================
# RabbitMQ (Optional)
# ===========================================
RABBITMQ_URL=amqp://user:password@host:5672

# ===========================================
# Qdrant Vector Database (Optional)
# ===========================================
QDRANT_URL=http://localhost:6333

# ===========================================
# Neo4j Knowledge Graph
# ===========================================
NEO4J_URL=neo4j+s://xxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# ===========================================
# Meilisearch (Optional)
# ===========================================
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=masterKey

# ===========================================
# Authentication (Logto)
# ===========================================
LOGTO_ENDPOINT=https://your-tenant.logto.app
LOGTO_APP_ID=your-app-id
LOGTO_APP_SECRET=your-app-secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-generated-secret

# ===========================================
# AI Services
# ===========================================
ANTHROPIC_API_KEY=sk-ant-xxx
HUGGINGFACE_API_KEY=hf_xxx
OPENROUTER_API_KEY=your-openrouter-key

# Claude Flow
AGENTDB_ENABLED=true
CLAUDE_FLOW_ENABLED=true

# ===========================================
# External APIs
# ===========================================
NEWS_API_KEY=your-newsapi-key
TWITTER_BEARER_TOKEN=your-twitter-token
REDDIT_CLIENT_ID=your-reddit-id
REDDIT_CLIENT_SECRET=your-reddit-secret
GOOGLE_SEARCH_API_KEY=your-google-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# ===========================================
# Monitoring & Analytics
# ===========================================
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_RELEASE=researchhive@1.0.0

NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

RESEND_API_KEY=re_xxx

# ===========================================
# Production
# ===========================================
LOG_LEVEL=info
```

---

## Database Setup

### 1. Run Migrations

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Apply database schema
pnpm db:migrate deploy

# Verify migration
pnpm db:studio
```

### 2. Seed Initial Data (Optional)

```bash
# Create seed script if needed
pnpm db:seed
```

---

## Application Deployment

### Option 1: Vercel (Recommended for Next.js)

#### Deploy Web App

```bash
# 1. Install Vercel CLI
pnpm add -g vercel

# 2. Login
vercel login

# 3. Configure environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_WS_URL production
# ... add all NEXT_PUBLIC_* variables

# 4. Deploy
cd apps/web
vercel --prod
```

#### Deploy API Server

**Note:** Vercel doesn't support WebSocket. Use Railway or Render for API.

### Option 2: Railway (Full-Stack)

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Create new project
railway init

# 4. Add environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set REDIS_URL="redis://..."
# ... add all variables

# 5. Deploy
railway up
```

### Option 3: Docker Deployment

#### Build Images

```bash
# Build API
docker build -f apps/api/Dockerfile -t researchhive-api .

# Build Web
docker build -f apps/web/Dockerfile -t researchhive-web .
```

#### Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  api:
    image: researchhive-api:latest
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    env_file:
      - .env
    restart: unless-stopped
    depends_on:
      - postgres
      - redis

  web:
    image: researchhive-web:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:4000
    env_file:
      - .env
    restart: unless-stopped
    depends_on:
      - api

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: researchhive
      POSTGRES_USER: researchhive
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  neo4j:
    image: neo4j:5-community
    environment:
      NEO4J_AUTH: neo4j/${NEO4J_PASSWORD}
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  neo4j_data:
```

#### Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 4: VPS (DigitalOcean, AWS EC2, etc.)

```bash
# 1. SSH into server
ssh root@your-server-ip

# 2. Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install pnpm
npm install -g pnpm

# 4. Clone repository
git clone https://github.com/mrkingsleyobi/researchhive.git
cd researchhive

# 5. Install dependencies
pnpm install

# 6. Create .env file
nano .env
# Paste production environment variables

# 7. Build applications
pnpm build

# 8. Setup process manager (PM2)
npm install -g pm2

# 9. Start API
cd apps/api
pm2 start dist/index.js --name researchhive-api

# 10. Start Web
cd ../web
pm2 start npm --name researchhive-web -- start

# 11. Save PM2 process list
pm2 save
pm2 startup

# 12. Setup nginx reverse proxy
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/researchhive
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/researchhive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# API health check
curl https://api.your-domain.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}

# Web app check
curl https://your-domain.com

# tRPC endpoint check
curl https://api.your-domain.com/trpc/research.getAll
```

### 2. Database Connection

```bash
# Connect to database
psql $DATABASE_URL

# Verify tables exist
\dt

# Expected tables:
# Research, Source, Citation, User, etc.
\q
```

### 3. Redis Connection

```bash
# Test Redis
redis-cli -u $REDIS_URL
PING
# Expected: PONG
```

### 4. Test Research Creation

```bash
# Create test research
curl -X POST https://api.your-domain.com/trpc/research.create \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "topic": "Test Research",
      "depth": "quick",
      "description": "Production deployment test"
    }
  }'

# Expected: Research ID returned
# {"result":{"data":{"json":{"id":"xxx","topic":"Test Research",...}}}}
```

### 5. Monitor Logs

```bash
# PM2 logs
pm2 logs researchhive-api
pm2 logs researchhive-web

# Docker logs
docker-compose logs -f api
docker-compose logs -f web

# Check for errors
tail -f /var/log/nginx/error.log
```

---

## Monitoring Setup

### 1. Sentry Error Tracking

Sentry is already integrated in the codebase. Verify it's working:

```bash
# Check Sentry dashboard at https://sentry.io
# You should see events appearing after deployment

# Test error tracking
curl -X POST https://api.your-domain.com/trpc/test.throwError
# Check Sentry for captured error
```

### 2. Prometheus Metrics

Metrics are exposed at `/metrics` endpoint:

```bash
# View metrics
curl https://api.your-domain.com/metrics

# Expected metrics:
# http_request_duration_seconds
# research_created_total
# research_duration_seconds
# cache_hits_total
# cache_misses_total
# ai_api_calls_total
# ... and more
```

**Setup Grafana Dashboard (Optional):**

```bash
# Install Prometheus
docker run -d -p 9090:9090 prom/prometheus

# Configure prometheus.yml
scrape_configs:
  - job_name: 'researchhive'
    static_configs:
      - targets: ['api.your-domain.com']

# Install Grafana
docker run -d -p 3001:3000 grafana/grafana

# Access Grafana at http://localhost:3001
# Default credentials: admin/admin
# Add Prometheus data source
# Import dashboard from packages/monitoring/grafana-dashboard.json
```

### 3. PostHog Analytics

PostHog is already integrated. Verify:

```bash
# Visit PostHog dashboard at https://app.posthog.com
# Check "Events" tab for incoming events:
# - research_started
# - research_completed
# - research_failed
# - knowledge_graph_viewed
# - export_generated
```

### 4. Uptime Monitoring

**Setup UptimeRobot or Pingdom:**

```bash
# Monitor these endpoints:
# - https://your-domain.com (HTTP 200)
# - https://api.your-domain.com/health (HTTP 200, contains "ok")
# - https://api.your-domain.com/trpc/health (HTTP 200)

# Set up alerts for downtime (email, Slack, etc.)
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Error: "Can't reach database server"
# Solution: Check DATABASE_URL format and firewall rules

# Test connection
psql $DATABASE_URL

# If using managed service, whitelist your server IP
# Supabase: Settings > Database > Connection pooling
```

#### 2. Redis Connection Errors

```bash
# Error: "ECONNREFUSED"
# Solution: Check REDIS_URL and Redis server status

# Test connection
redis-cli -u $REDIS_URL PING

# Check Redis is running
sudo systemctl status redis-server
```

#### 3. Anthropic API Errors

```bash
# Error: "Invalid API key"
# Solution: Verify ANTHROPIC_API_KEY in .env

# Test API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4.5-20250929",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

#### 4. JWT Authentication Errors

```bash
# Error: "Token expired" or "Invalid token"
# Solutions:
# 1. Check LOGTO_ENDPOINT matches your tenant URL
# 2. Verify LOGTO_APP_ID is correct
# 3. Ensure NEXTAUTH_SECRET is set
# 4. Check system time is synchronized (NTP)

# Verify Logto configuration
curl $LOGTO_ENDPOINT/.well-known/openid-configuration
```

#### 5. Build Errors

```bash
# Error: "Cannot find module" during build
# Solution: Clear cache and reinstall

rm -rf node_modules
rm -rf .turbo
rm -rf apps/*/node_modules
rm pnpm-lock.yaml
pnpm install
pnpm build
```

#### 6. Memory Issues

```bash
# Error: "JavaScript heap out of memory"
# Solution: Increase Node.js memory limit

# For PM2
pm2 start dist/index.js --name api --node-args="--max-old-space-size=4096"

# For Docker
environment:
  - NODE_OPTIONS=--max-old-space-size=4096
```

#### 7. WebSocket Connection Errors

```bash
# Error: "WebSocket connection failed"
# Solutions:
# 1. Ensure nginx is configured for WebSocket
# 2. Check NEXT_PUBLIC_WS_URL uses wss:// not http://

# Nginx WebSocket config
location /socket.io/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug pnpm dev

# Or in .env
LOG_LEVEL=debug

# View detailed logs
pm2 logs --lines 1000
```

### Performance Issues

```bash
# Check Redis cache hit rate
redis-cli -u $REDIS_URL INFO stats
# Look for keyspace_hits vs keyspace_misses

# Check database slow queries
# PostgreSQL:
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# Monitor CPU/Memory
htop
pm2 monit
```

---

## Beta Launch Checklist

### Pre-Launch

- [ ] All environment variables configured
- [ ] PostgreSQL database connected and migrated
- [ ] Redis cache operational
- [ ] Neo4j knowledge graph running
- [ ] Anthropic API key valid and tested
- [ ] Logto authentication configured
- [ ] SSL certificates installed (HTTPS)
- [ ] Domain DNS configured
- [ ] Sentry error tracking active
- [ ] PostHog analytics tracking
- [ ] Email notifications tested
- [ ] Load testing completed (K6 scripts)
- [ ] Database backups configured
- [ ] Monitoring dashboards set up
- [ ] Documentation reviewed

### Launch Day

- [ ] Deploy to production
- [ ] Run health checks on all endpoints
- [ ] Create test research to verify functionality
- [ ] Monitor Sentry for errors (first hour)
- [ ] Check PostHog for user events
- [ ] Verify email notifications working
- [ ] Test authentication flow
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Check application logs for warnings
- [ ] Verify knowledge graph visualization

### Post-Launch (Week 1)

- [ ] Daily error rate monitoring (Sentry)
- [ ] Daily active user tracking (PostHog)
- [ ] Database performance monitoring
- [ ] API response time tracking
- [ ] Cache hit rate optimization
- [ ] User feedback collection
- [ ] Bug triage and prioritization
- [ ] Performance optimization if needed

---

## Security Checklist

### Application Security

- [ ] All secrets in environment variables (not code)
- [ ] HTTPS enabled on all domains
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled on API endpoints
- [ ] JWT tokens validated (expiration, issuer, audience)
- [ ] SQL injection protection (Prisma ORM)
- [ ] XSS protection (React escaping)
- [ ] CSRF protection (Next.js built-in)
- [ ] Dependency vulnerability scanning (`pnpm audit`)

### Infrastructure Security

- [ ] PostgreSQL password is strong and unique
- [ ] Redis password enabled
- [ ] Neo4j authentication enabled
- [ ] Firewall configured (only necessary ports open)
- [ ] SSH key-based authentication (no password login)
- [ ] Regular security updates scheduled
- [ ] Database backups encrypted
- [ ] API keys rotated regularly
- [ ] Logging enabled for security events

---

## Scaling Considerations

### Horizontal Scaling

```bash
# Use load balancer (e.g., nginx, AWS ALB)
# Run multiple API instances

# PM2 cluster mode
pm2 start dist/index.js -i max --name api-cluster

# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml researchhive
```

### Database Scaling

```bash
# Enable connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"

# Add read replicas for reporting queries
# Use Prisma replica extension
```

### Caching Strategy

```bash
# Cache research results for 1 hour
# Cache knowledge graphs for 30 minutes
# Cache user sessions in Redis
# Use Redis cluster for high availability
```

---

## Support

### Getting Help

- **Documentation:** [/docs](/docs)
- **GitHub Issues:** https://github.com/mrkingsleyobi/researchhive/issues
- **Community:** https://github.com/mrkingsleyobi/researchhive/discussions

### Emergency Contacts

- **DevOps Lead:** [Your contact]
- **Database Admin:** [Your contact]
- **Security Team:** [Your contact]

---

## Appendix

### Useful Commands

```bash
# Quick health check
curl https://api.your-domain.com/health && echo " ✅ API OK"

# View all PM2 processes
pm2 list

# Restart services
pm2 restart all

# View resource usage
pm2 monit

# Database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Redis backup
redis-cli -u $REDIS_URL SAVE

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory
free -h

# Check running processes
ps aux | grep node
```

### Rollback Procedure

```bash
# If deployment fails:

# 1. Rollback git deploy
git log --oneline
git reset --hard <previous-commit-hash>

# 2. Rebuild and redeploy
pnpm build
pm2 restart all

# 3. Rollback database migration (if needed)
pnpm db:migrate rollback

# 4. Check logs
pm2 logs --err --lines 100
```

---

**🚀 You're now ready to launch ResearchHive to production!**

For additional support, consult the [main documentation](/docs) or open an issue on GitHub.
