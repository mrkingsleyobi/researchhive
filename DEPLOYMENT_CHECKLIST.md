# ✅ ResearchHive Beta Launch Deployment Checklist

**Quick reference checklist for production deployment**

Print this document and check off items as you complete them during deployment.

---

## Phase 1: Infrastructure Setup

### Required Services Setup

- [ ] **PostgreSQL Database**
  - [ ] Service provisioned (Supabase/Neon/Railway/Self-hosted)
  - [ ] Database created: `researchhive`
  - [ ] User created with full privileges
  - [ ] Connection string obtained
  - [ ] Connection tested successfully

- [ ] **Redis Cache**
  - [ ] Service provisioned (Upstash/Redis Cloud/Self-hosted)
  - [ ] Password configured
  - [ ] Connection string obtained
  - [ ] Connection tested successfully

- [ ] **Neo4j Graph Database**
  - [ ] Service provisioned (Neo4j Aura/Self-hosted)
  - [ ] Initial password set
  - [ ] Connection URL obtained (bolt:// or neo4j+s://)
  - [ ] Connection tested successfully

### Optional Services Setup

- [ ] **RabbitMQ** (if using message queue)
- [ ] **Qdrant** (if using vector search)
- [ ] **Meilisearch** (if using full-text search)

---

## Phase 2: External API Keys

### Required APIs

- [ ] **Anthropic API**
  - [ ] Account created at console.anthropic.com
  - [ ] API key generated
  - [ ] Free $5 credit confirmed OR billing configured
  - [ ] Key tested with test request

- [ ] **Logto Authentication**
  - [ ] Account created at logto.io
  - [ ] Application created
  - [ ] Callback URLs configured
  - [ ] App ID obtained
  - [ ] App secret obtained
  - [ ] Endpoint URL obtained

### Optional Research APIs

- [ ] **NewsAPI** (news aggregation)
  - [ ] API key obtained from newsapi.org
  - [ ] Free tier limits confirmed (100 req/day)

- [ ] **Twitter API v2** (social research)
  - [ ] Developer account created
  - [ ] Bearer token obtained
  - [ ] Essential tier limits confirmed

- [ ] **Reddit API** (social research)
  - [ ] App created at reddit.com/prefs/apps
  - [ ] Client ID obtained
  - [ ] Client secret obtained

- [ ] **Google Custom Search** (web scraping)
  - [ ] Google Cloud project created
  - [ ] Custom Search API enabled
  - [ ] API key obtained
  - [ ] Search engine ID created

- [ ] **HuggingFace API** (NLP models)
  - [ ] Account created
  - [ ] API token generated

### Monitoring & Analytics APIs

- [ ] **Sentry** (error tracking)
  - [ ] Project created at sentry.io
  - [ ] DSN obtained from Client Keys settings
  - [ ] Release version noted: `researchhive@1.0.0`

- [ ] **PostHog** (analytics)
  - [ ] Project created at posthog.com
  - [ ] API key obtained
  - [ ] Host URL confirmed: https://app.posthog.com

- [ ] **Resend** (email notifications)
  - [ ] Account created at resend.com
  - [ ] Domain added and verified
  - [ ] API key generated

---

## Phase 3: Environment Configuration

- [ ] **Create .env file in project root**
- [ ] **Copy template from .env.example**
- [ ] **Fill in all required variables (38 total)**

### Application (4 variables)
- [ ] `NODE_ENV=production`
- [ ] `PORT=4000`
- [ ] `HOST=0.0.0.0`
- [ ] `CORS_ORIGIN=https://your-domain.com`

### Frontend URLs (3 variables)
- [ ] `NEXT_PUBLIC_API_URL=https://api.your-domain.com`
- [ ] `NEXT_PUBLIC_WS_URL=wss://api.your-domain.com`
- [ ] `NEXT_PUBLIC_MCP_URL=https://api.your-domain.com/api/mcp`

### Database (1 variable)
- [ ] `DATABASE_URL=postgresql://user:pass@host:5432/researchhive`

### Redis (1 variable)
- [ ] `REDIS_URL=redis://:password@host:6379`

### Neo4j (3 variables)
- [ ] `NEO4J_URL=bolt://localhost:7687` or `neo4j+s://...`
- [ ] `NEO4J_USER=neo4j`
- [ ] `NEO4J_PASSWORD=your-password`

### Authentication (4 variables)
- [ ] `LOGTO_ENDPOINT=https://your-tenant.logto.app`
- [ ] `LOGTO_APP_ID=your-app-id`
- [ ] `LOGTO_APP_SECRET=your-app-secret`
- [ ] `NEXTAUTH_URL=https://your-domain.com`
- [ ] `NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>`

### AI Services (3 variables)
- [ ] `ANTHROPIC_API_KEY=sk-ant-xxx`
- [ ] `AGENTDB_ENABLED=true`
- [ ] `CLAUDE_FLOW_ENABLED=true`

### Monitoring (4 variables)
- [ ] `SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx`
- [ ] `SENTRY_RELEASE=researchhive@1.0.0`
- [ ] `NEXT_PUBLIC_POSTHOG_KEY=phc_xxx`
- [ ] `NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com`

### Email (1 variable)
- [ ] `RESEND_API_KEY=re_xxx`

### Optional APIs (10 variables - skip if not using)
- [ ] `NEWS_API_KEY=`
- [ ] `TWITTER_BEARER_TOKEN=`
- [ ] `REDDIT_CLIENT_ID=`
- [ ] `REDDIT_CLIENT_SECRET=`
- [ ] `GOOGLE_SEARCH_API_KEY=`
- [ ] `GOOGLE_SEARCH_ENGINE_ID=`
- [ ] `HUGGINGFACE_API_KEY=`
- [ ] `OPENROUTER_API_KEY=`
- [ ] `RABBITMQ_URL=`
- [ ] `QDRANT_URL=`
- [ ] `MEILISEARCH_URL=`
- [ ] `MEILISEARCH_KEY=`

### Development (1 variable)
- [ ] `LOG_LEVEL=info`

---

## Phase 4: Database Migration

- [ ] **Install dependencies**
  ```bash
  pnpm install
  ```

- [ ] **Generate Prisma client**
  ```bash
  pnpm db:generate
  ```

- [ ] **Run database migrations**
  ```bash
  pnpm db:migrate deploy
  ```

- [ ] **Verify schema in database**
  ```bash
  pnpm db:studio
  ```
  - [ ] Tables created: Research, Source, Citation, User, etc.

---

## Phase 5: Application Build

- [ ] **Build all packages**
  ```bash
  pnpm build
  ```
  - [ ] No TypeScript errors
  - [ ] No build failures
  - [ ] All packages built successfully

- [ ] **Test build locally** (optional)
  ```bash
  NODE_ENV=production pnpm start
  ```

---

## Phase 6: Deployment

### Choose ONE deployment method:

#### Option A: Vercel + Railway
- [ ] **Deploy API to Railway**
  - [ ] Project created
  - [ ] Environment variables added
  - [ ] Deployed successfully
  - [ ] URL obtained: `https://xxx.railway.app`

- [ ] **Deploy Web to Vercel**
  - [ ] Project created
  - [ ] Environment variables added (NEXT_PUBLIC_*)
  - [ ] Deployed successfully
  - [ ] URL obtained: `https://xxx.vercel.app`

#### Option B: Docker Compose
- [ ] **Build Docker images**
  ```bash
  docker build -f apps/api/Dockerfile -t researchhive-api .
  docker build -f apps/web/Dockerfile -t researchhive-web .
  ```

- [ ] **Deploy with docker-compose**
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  ```

#### Option C: VPS (DigitalOcean, AWS EC2, etc.)
- [ ] **Server provisioned**
  - [ ] SSH access configured
  - [ ] Node.js 20+ installed
  - [ ] pnpm installed globally

- [ ] **Repository cloned**
  ```bash
  git clone https://github.com/mrkingsleyobi/researchhive.git
  cd researchhive
  ```

- [ ] **Dependencies installed**
  ```bash
  pnpm install
  ```

- [ ] **.env file created with production values**

- [ ] **Application built**
  ```bash
  pnpm build
  ```

- [ ] **PM2 installed and configured**
  ```bash
  npm install -g pm2
  pm2 start apps/api/dist/index.js --name researchhive-api
  pm2 start apps/web --name researchhive-web -- start
  pm2 save
  pm2 startup
  ```

- [ ] **Nginx configured**
  - [ ] Reverse proxy for frontend (port 3000)
  - [ ] Reverse proxy for API (port 4000)
  - [ ] WebSocket support configured
  - [ ] Configuration tested: `sudo nginx -t`
  - [ ] Nginx restarted: `sudo systemctl restart nginx`

- [ ] **SSL certificates installed**
  ```bash
  sudo certbot --nginx -d your-domain.com -d api.your-domain.com
  ```

---

## Phase 7: DNS Configuration

- [ ] **A Records created**
  - [ ] `your-domain.com` → Server IP
  - [ ] `api.your-domain.com` → Server IP (or different)

- [ ] **DNS propagation confirmed**
  ```bash
  nslookup your-domain.com
  nslookup api.your-domain.com
  ```

- [ ] **HTTPS working for both domains**
  - [ ] https://your-domain.com
  - [ ] https://api.your-domain.com

---

## Phase 8: Post-Deployment Verification

### Health Checks

- [ ] **API health endpoint**
  ```bash
  curl https://api.your-domain.com/health
  ```
  Expected: `{"status":"ok","timestamp":"..."}`

- [ ] **Web app loads**
  - [ ] Visit https://your-domain.com
  - [ ] Page renders without errors
  - [ ] No console errors in browser DevTools

- [ ] **tRPC endpoint responds**
  ```bash
  curl https://api.your-domain.com/trpc/research.getAll
  ```

### Database Verification

- [ ] **PostgreSQL connection**
  ```bash
  psql $DATABASE_URL -c "\dt"
  ```
  - [ ] All tables present

- [ ] **Redis connection**
  ```bash
  redis-cli -u $REDIS_URL PING
  ```
  Expected: `PONG`

- [ ] **Neo4j connection**
  - [ ] Access Neo4j Browser (if using Aura: web console)
  - [ ] Run query: `MATCH (n) RETURN count(n)`

### Functional Tests

- [ ] **Create test research**
  1. Visit https://your-domain.com
  2. Click "New Research"
  3. Enter topic: "Production Deployment Test"
  4. Select depth: "Quick"
  5. Submit
  6. Verify research starts
  7. Wait for completion (~3-5 seconds)
  8. Verify results appear with sources

- [ ] **Test authentication** (if Logto configured)
  1. Click "Sign In"
  2. Complete Logto flow
  3. Verify redirect back to app
  4. Verify user session persists

- [ ] **Test knowledge graph**
  1. Open completed research
  2. Click "Knowledge Graph" tab
  3. Verify graph visualization loads
  4. Verify no console errors

### Monitoring Verification

- [ ] **Sentry receiving events**
  - [ ] Visit https://sentry.io project
  - [ ] Confirm events appearing
  - [ ] Test error: create invalid research (verify error captured)

- [ ] **PostHog tracking events**
  - [ ] Visit https://app.posthog.com project
  - [ ] Check "Events" tab
  - [ ] Verify `research_started`, `research_completed` events

- [ ] **Prometheus metrics accessible**
  ```bash
  curl https://api.your-domain.com/metrics
  ```
  - [ ] Metrics returned (http_request_duration_seconds, etc.)

- [ ] **Email notifications working**
  - [ ] Complete a research
  - [ ] Check configured email address
  - [ ] Verify "Research Complete" email received

### Performance Checks

- [ ] **API response times acceptable**
  - [ ] Health endpoint < 100ms
  - [ ] Research creation < 200ms
  - [ ] Results retrieval < 500ms

- [ ] **Cache working**
  ```bash
  redis-cli -u $REDIS_URL INFO stats
  ```
  - [ ] `keyspace_hits` increasing (indicates cache usage)

- [ ] **No memory leaks**
  ```bash
  # PM2
  pm2 monit

  # Docker
  docker stats
  ```
  - [ ] Memory usage stable after multiple requests

---

## Phase 9: Load Testing (Optional but Recommended)

- [ ] **Install K6**
  ```bash
  brew install k6  # macOS
  # or download from k6.io
  ```

- [ ] **Run load test**
  ```bash
  cd k6
  k6 run load-test.js --env API_URL=https://api.your-domain.com
  ```
  - [ ] 95th percentile < 500ms
  - [ ] 99th percentile < 1000ms
  - [ ] No failed requests

- [ ] **Run stress test**
  ```bash
  k6 run stress-test.js --env API_URL=https://api.your-domain.com
  ```
  - [ ] System stable under load
  - [ ] Error rate < 1%

---

## Phase 10: Security Checklist

- [ ] **Secrets not in code**
  - [ ] .env file not committed to git
  - [ ] .gitignore includes .env

- [ ] **HTTPS enabled**
  - [ ] SSL certificates valid
  - [ ] HTTP redirects to HTTPS
  - [ ] A+ rating on ssllabs.com (optional)

- [ ] **Authentication working**
  - [ ] JWT validation functional
  - [ ] Protected routes require authentication
  - [ ] Demo mode works when Logto not configured

- [ ] **CORS configured**
  - [ ] `CORS_ORIGIN` set to specific domain (not `*`)
  - [ ] OPTIONS requests handled correctly

- [ ] **Rate limiting active** (if implemented)
  - [ ] API endpoints have rate limits
  - [ ] Test exceeding limit returns 429

- [ ] **Dependencies scanned**
  ```bash
  pnpm audit
  ```
  - [ ] No critical vulnerabilities
  - [ ] High/medium vulnerabilities reviewed

- [ ] **Database security**
  - [ ] PostgreSQL password is strong (20+ chars)
  - [ ] Redis password enabled
  - [ ] Neo4j authentication enabled
  - [ ] Databases not publicly accessible (firewall rules)

- [ ] **Firewall configured**
  - [ ] Only necessary ports open (80, 443, 22)
  - [ ] Database ports not publicly accessible
  - [ ] SSH with key-based auth only

---

## Phase 11: Backup Configuration

- [ ] **Database backups**
  ```bash
  # Set up daily PostgreSQL backups
  pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

  # Add to cron:
  0 2 * * * /path/to/backup-script.sh
  ```

- [ ] **Redis backups**
  ```bash
  # Configure Redis persistence (AOF or RDB)
  # or use managed service auto-backups
  ```

- [ ] **Code backups**
  - [ ] Repository backed up (GitHub/GitLab)
  - [ ] Environment variables documented separately
  - [ ] Deployment scripts version controlled

- [ ] **Backup restoration tested**
  - [ ] Test restoring from database backup
  - [ ] Verify data integrity after restore

---

## Phase 12: Monitoring & Alerting Setup

- [ ] **Uptime monitoring**
  - [ ] UptimeRobot or Pingdom configured
  - [ ] Monitor: https://your-domain.com
  - [ ] Monitor: https://api.your-domain.com/health
  - [ ] Alert contacts configured (email, Slack, SMS)

- [ ] **Error alerting**
  - [ ] Sentry alerts configured
  - [ ] Alert on: New issues, spike in errors
  - [ ] Alert contacts configured

- [ ] **Performance monitoring**
  - [ ] Grafana dashboard created (if using Prometheus)
  - [ ] Key metrics tracked:
    - [ ] API response times
    - [ ] Research creation rate
    - [ ] Cache hit rate
    - [ ] Error rate
    - [ ] Active users (PostHog)

- [ ] **Server monitoring**
  - [ ] CPU usage alerts
  - [ ] Memory usage alerts
  - [ ] Disk space alerts
  - [ ] Network traffic monitoring

---

## Phase 13: Documentation & Communication

- [ ] **Update documentation**
  - [ ] Production URLs documented
  - [ ] API endpoints documented
  - [ ] Known issues documented

- [ ] **Create runbook**
  - [ ] Deployment procedure
  - [ ] Rollback procedure
  - [ ] Common issues & solutions
  - [ ] Emergency contacts

- [ ] **Team communication**
  - [ ] Beta launch announced to team
  - [ ] Support team briefed
  - [ ] Bug reporting process communicated
  - [ ] Feedback collection method established

- [ ] **User communication** (if applicable)
  - [ ] Beta users invited
  - [ ] Getting started guide shared
  - [ ] Support channels communicated
  - [ ] Feedback form created

---

## Phase 14: Post-Launch Monitoring (Day 1)

### First Hour

- [ ] **Monitor Sentry** (check every 15 min)
  - [ ] Error rate normal
  - [ ] No critical errors

- [ ] **Monitor PostHog** (check every 15 min)
  - [ ] Events flowing
  - [ ] User sessions tracked

- [ ] **Monitor server resources**
  ```bash
  pm2 monit  # or docker stats
  ```
  - [ ] CPU < 80%
  - [ ] Memory < 80%
  - [ ] No crashes

### First Day

- [ ] **Review metrics** (hourly)
  - [ ] Total researches created
  - [ ] Average research duration
  - [ ] Error rate
  - [ ] Active users
  - [ ] API response times

- [ ] **Review logs**
  ```bash
  pm2 logs --lines 100
  # or
  docker-compose logs --tail=100
  ```
  - [ ] No unexpected warnings
  - [ ] No database connection issues
  - [ ] No API timeout errors

- [ ] **User feedback**
  - [ ] Monitor support channels
  - [ ] Triage reported bugs
  - [ ] Document feature requests

### First Week

- [ ] **Daily metrics review**
  - [ ] DAU (daily active users)
  - [ ] Research completion rate
  - [ ] Error rate trend
  - [ ] Cache hit rate optimization

- [ ] **Performance optimization**
  - [ ] Identify slow queries
  - [ ] Optimize database indexes
  - [ ] Adjust cache TTLs
  - [ ] Review rate limits

- [ ] **Bug fixes**
  - [ ] Prioritize critical bugs
  - [ ] Deploy hotfixes as needed
  - [ ] Update documentation

---

## Emergency Contacts

**Fill in during deployment:**

- **DevOps Lead:** ___________________________
- **Backend Developer:** ___________________________
- **Frontend Developer:** ___________________________
- **Database Admin:** ___________________________
- **Security Contact:** ___________________________

---

## Rollback Procedure

**If critical issues occur:**

1. **Immediate Actions**
   - [ ] Stop new user signups (if possible)
   - [ ] Display maintenance message
   - [ ] Notify team in Slack/Discord

2. **Rollback Steps**
   ```bash
   # Stop services
   pm2 stop all  # or docker-compose down

   # Revert to previous version
   git log --oneline
   git reset --hard <previous-commit>

   # Rollback database migration (if needed)
   pnpm db:migrate rollback

   # Rebuild
   pnpm build

   # Restart services
   pm2 restart all  # or docker-compose up -d
   ```

3. **Post-Rollback**
   - [ ] Verify health endpoints
   - [ ] Test core functionality
   - [ ] Communicate status to users
   - [ ] Document what went wrong
   - [ ] Plan fix for next deployment

---

## Final Sign-Off

**Deployment completed by:** _____________________________

**Date:** _____________________________

**Production URLs:**
- **Web App:** _____________________________
- **API:** _____________________________

**Notes:**

_________________________________________________________

_________________________________________________________

_________________________________________________________

---

**🎉 Congratulations! ResearchHive is now live in production!**

For ongoing support, refer to:
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [Troubleshooting Guide](docs/DEPLOYMENT_GUIDE.md#troubleshooting)
