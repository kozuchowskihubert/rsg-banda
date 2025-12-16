# 🏗️ RSG Platform Architecture

## Overview

RSG Platform is a modern full-stack web application built for the hip-hop community. This document describes the system architecture, components, and design decisions.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Devices                          │
│         (Desktop, Mobile, Tablet - All Browsers)             │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ├── HTTPS
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                    CDN / Load Balancer                       │
│              (Vercel Edge / Azure CDN)                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
        ▼                      ▼
┌──────────────┐      ┌──────────────────┐
│   Frontend   │      │   API Backend    │
│              │      │                  │
│  HTML/CSS/JS │◄────►│   Node.js +     │
│              │      │   Express        │
│  Static      │      │                  │
│  Assets      │      │  Routes:         │
│              │      │  - /api/auth     │
│              │      │  - /api/beats    │
│              │      │  - /api/content  │
│              │      │  - /api/health   │
└──────────────┘      └────────┬─────────┘
                               │
                               │
                      ┌────────▼─────────┐
                      │   PostgreSQL     │
                      │   Database       │
                      │                  │
                      │  Tables:         │
                      │  - users         │
                      │  - beats         │
                      │  - content       │
                      │  - sessions      │
                      │  - comments      │
                      │  - api_keys      │
                      └──────────────────┘
```

---

## Component Details

### Frontend Layer

**Technology:** Vanilla JavaScript, HTML5, CSS3

**Pages:**
- `index.html` - Landing page with hero section
- `dashboard.html` - User dashboard with stats
- `login.html` - Authentication page
- `register.html` - User registration
- `beats.html` - Beat marketplace (to be implemented)
- `community.html` - Community hub (to be implemented)

**Features:**
- Responsive design (mobile-first)
- Dark theme with RSG color scheme
- Client-side routing
- Local storage for preferences
- Fetch API for backend communication

### Backend Layer

**Technology:** Node.js 18+ with Express.js

**Structure:**
```
app/
├── server.js           # Entry point, HTTP server
├── app.js             # Express configuration
├── config/
│   └── database.js    # PostgreSQL connection pool
├── routes/
│   ├── index.js       # Route aggregator
│   ├── auth.js        # Authentication
│   ├── beats.js       # Beat management
│   ├── content.js     # Content management
│   └── health.js      # Health checks
└── utils/
    └── db-init.js     # Database initialization
```

**Middleware Stack:**
1. Helmet - Security headers
2. CORS - Cross-origin resource sharing
3. Rate Limiter - DDoS protection
4. Body Parser - JSON/URL encoded
5. Session Manager - User sessions
6. Static File Server - Frontend assets

### Database Layer

**Technology:** PostgreSQL 14+ (Azure Flexible Server)

**Schema:**

```sql
users
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- password_hash (VARCHAR)
- username (VARCHAR UNIQUE)
- display_name (VARCHAR)
- bio (TEXT)
- avatar_url (TEXT)
- role (VARCHAR)
- created_at (TIMESTAMP)

beats
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK)
- title (VARCHAR)
- artist_name (VARCHAR)
- bpm (INTEGER)
- genre (VARCHAR)
- audio_url (TEXT)
- downloads (INTEGER)
- plays (INTEGER)
- likes (INTEGER)
- created_at (TIMESTAMP)

content
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK)
- title (VARCHAR)
- content (TEXT)
- content_type (VARCHAR)
- tags (TEXT[])
- views (INTEGER)
- likes (INTEGER)
- created_at (TIMESTAMP)

sessions
- sid (VARCHAR PRIMARY KEY)
- sess (JSON)
- expire (TIMESTAMP)

comments
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK)
- content_id (INTEGER FK)
- parent_id (INTEGER FK)
- comment_text (TEXT)
- likes (INTEGER)
- created_at (TIMESTAMP)

api_keys
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK)
- key_name (VARCHAR)
- api_key (VARCHAR UNIQUE)
- permissions (TEXT[])
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

---

## Infrastructure

### Deployment Options

#### Option 1: Vercel (Serverless)

```
Vercel Platform
├── Edge Functions (API Routes)
├── Static File CDN
├── Automatic HTTPS
├── Environment Variables
└── Logs & Analytics
```

**Pros:**
- Zero configuration
- Automatic scaling
- Built-in CDN
- Free tier available

**Cons:**
- Function execution limits
- Cold starts
- Limited server customization

#### Option 2: Azure (Traditional)

```
Azure Infrastructure
├── Resource Group
├── Virtual Network
├── App Service (Linux)
│   ├── Node.js 18 runtime
│   ├── Auto-scaling
│   └── VNet integration
├── PostgreSQL Flexible Server
│   ├── Private networking
│   ├── Automated backups
│   └── High availability
└── Application Insights
    ├── Performance monitoring
    ├── Error tracking
    └── Usage analytics
```

**Managed by Terraform:**
- Infrastructure as Code
- Version controlled
- Reproducible deployments
- State management

---

## Security Architecture

### Authentication Flow

```
1. User submits credentials
   └─> POST /api/auth/login

2. Server validates credentials
   ├─> Check user exists
   ├─> Verify password hash (bcrypt)
   └─> Create session

3. Session stored in database
   └─> PostgreSQL sessions table

4. Session cookie sent to client
   ├─> HTTP-only flag
   ├─> Secure flag (HTTPS)
   └─> 7-day expiration

5. Subsequent requests include cookie
   └─> Server validates session
```

### Security Measures

1. **Password Security:**
   - bcrypt hashing (10 rounds)
   - No plaintext storage
   - Minimum length requirements

2. **Session Security:**
   - HTTP-only cookies
   - Secure flag in production
   - Short expiration (7 days)
   - Database-backed sessions

3. **API Security:**
   - Rate limiting (100 req/15min)
   - CORS restrictions
   - Helmet security headers
   - SQL injection prevention

4. **Infrastructure Security:**
   - Private networking for database
   - SSL/TLS enforcement
   - Firewall rules
   - Regular security updates

---

## Data Flow

### User Registration

```
Client                 Backend                Database
  │                      │                      │
  ├─POST /api/auth/register─>                   │
  │                      │                      │
  │                      ├─Validate input       │
  │                      ├─Hash password        │
  │                      ├─INSERT INTO users───>│
  │                      │                      │
  │                      │<──User created───────┤
  │                      │                      │
  │                      ├─Create session       │
  │                      ├─INSERT INTO session─>│
  │                      │                      │
  │<──Set-Cookie (session)──────────────────────┤
  │                      │                      │
  ├─Redirect to /dashboard                     │
```

### Beat Upload

```
Client                 Backend                Database
  │                      │                      │
  ├─POST /api/beats────>│                      │
  │  (with auth cookie)  │                      │
  │                      │                      │
  │                      ├─Verify session       │
  │                      ├─Validate data        │
  │                      ├─INSERT INTO beats───>│
  │                      │                      │
  │                      │<──Beat created───────┤
  │                      │                      │
  │<──201 Created────────│                      │
  │  (beat data)         │                      │
```

---

## Performance Optimization

### Frontend Optimizations

1. **Asset Optimization:**
   - Minified CSS/JS
   - Compressed images
   - Font subsetting
   - Lazy loading

2. **Caching Strategy:**
   - Browser caching headers
   - Service worker caching (future)
   - LocalStorage for preferences

3. **Network Optimization:**
   - CDN for static assets
   - HTTP/2 support
   - Gzip compression

### Backend Optimizations

1. **Database:**
   - Connection pooling (max 20)
   - Indexed columns (user_id, content_type)
   - Prepared statements
   - Query optimization

2. **Caching:**
   - Session caching
   - Static file caching
   - API response caching (future)

3. **Scaling:**
   - Horizontal scaling (Azure)
   - Auto-scaling rules
   - Load balancing

---

## Monitoring & Observability

### Metrics Tracked

1. **Application Metrics:**
   - Request rate
   - Response time
   - Error rate
   - Active users

2. **Infrastructure Metrics:**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

3. **Business Metrics:**
   - User registrations
   - Beat uploads
   - Play counts
   - Download counts

### Logging

**Structured Logging:**
```javascript
{
  timestamp: "2025-12-13T...",
  level: "info",
  message: "User logged in",
  userId: 123,
  ip: "1.2.3.4"
}
```

**Log Levels:**
- ERROR - Critical failures
- WARN - Non-critical issues
- INFO - Important events
- DEBUG - Detailed debugging

---

## Disaster Recovery

### Backup Strategy

1. **Database Backups:**
   - Automated daily backups (Azure)
   - 7-day retention
   - Point-in-time recovery
   - Geo-redundant storage (optional)

2. **Application Backups:**
   - Git repository (source code)
   - Environment variables (encrypted)
   - Configuration files

### Recovery Procedures

1. **Database Failure:**
   - Restore from latest backup
   - Verify data integrity
   - Update connection strings
   - Test application

2. **Application Failure:**
   - Redeploy from Git
   - Verify environment variables
   - Run health checks
   - Monitor logs

---

## Future Enhancements

### Planned Features

1. **Real-time Features:**
   - WebSocket integration
   - Live collaboration
   - Real-time notifications

2. **Advanced Features:**
   - AI-powered recommendations
   - Audio streaming
   - Video integration
   - Payment processing

3. **Infrastructure:**
   - Multi-region deployment
   - Redis caching layer
   - Message queue (RabbitMQ/Kafka)
   - Elasticsearch for search

---

## Technology Choices

### Why Node.js?

- Fast development
- JavaScript everywhere
- Large ecosystem (npm)
- Excellent for I/O operations
- Great community support

### Why PostgreSQL?

- ACID compliance
- JSON support (JSONB)
- Full-text search
- Mature and stable
- Azure integration

### Why Express?

- Minimal and flexible
- Large middleware ecosystem
- Well-documented
- Industry standard
- Easy to test

### Why Terraform?

- Infrastructure as Code
- Cloud-agnostic
- Version controlled
- Reproducible deployments
- State management

---

## Development Workflow

```
Local Development
    │
    ├─> Code changes
    ├─> Run tests
    ├─> Lint code
    │
    ▼
Git Push
    │
    ▼
GitHub Actions
    │
    ├─> Run CI tests
    ├─> Security scan
    ├─> Build application
    │
    ▼
Deploy
    │
    ├─> Vercel (frontend + API)
    └─> Azure (full stack)
```

---

## Conclusion

The RSG Platform architecture is designed for scalability, security, and maintainability. The modular structure allows for easy updates and feature additions while maintaining performance and reliability.

For more information, see:
- [README.md](README.md) - Project overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

---

<div align="center">

**Built with ❤️ for the hip-hop community**

</div>
