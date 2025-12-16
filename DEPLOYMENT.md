# 🚀 RSG BANDA - Deployment Guide

## 🎯 RECOMMENDED: Cloudflare + Vercel Deployment

**Domain:** rsgbanda.pl  
**Cost:** ~39 zł/year (~$10/year)  
**Time to deploy:** 30 minutes

---

## 📋 Quick Start

### 1. Register Domain (5 min)
- Go to: https://www.ovh.pl/domeny/
- Register: `rsgbanda.pl` for 39 zł/year
- Wait for activation (2-24h)

### 2. Add to Cloudflare (10 min)
- Login: https://dash.cloudflare.com
- Add Site: `rsgbanda.pl`
- Plan: Free ($0/month)
- Copy the 2 nameservers Cloudflare gives you

### 3. Change Nameservers at OVH (5 min)
- OVH Panel → Domains → rsgbanda.pl → DNS Servers
- Replace with Cloudflare nameservers
- Wait for propagation (2-48h, usually 4h)

### 4. Deploy to Vercel (10 min)
```bash
# Push to GitHub first
cd /Users/haos/azure-rsg
git add .
git commit -m "RSG Banda - ready for deployment"
git push

# Then deploy via Vercel dashboard:
# 1. https://vercel.com → New Project
# 2. Import from GitHub
# 3. Deploy!
```

### 5. Configure DNS in Cloudflare
Add CNAME record:
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy: ON (orange cloud ☁️)
```

### 6. Add Domain in Vercel
Vercel Project Settings → Domains → Add `rsgbanda.pl`

**DONE! 🎉** Visit: https://rsgbanda.pl

---

## 📋 Detailed Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Deployment](#vercel-deployment)
3. [Azure Deployment](#azure-deployment)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [CI/CD Setup](#cicd-setup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Git** ([Download](https://git-scm.com/))
- **Vercel CLI** (for Vercel deployment)
- **Azure CLI** (for Azure deployment)
- **Terraform** 1.0+ (for infrastructure)

### Accounts Needed

- GitHub account
- Vercel account (free tier available)
- Azure account (with active subscription)
- PostgreSQL database (Vercel Postgres, Azure, or other)

---

## 🌐 Vercel Deployment

Vercel provides the fastest deployment option with automatic CI/CD.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Environment Variables

Create a Vercel project and add environment variables:

```bash
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add NODE_ENV
```

Or via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your-random-secret-here
NODE_ENV=production
ENABLE_AUTHENTICATION=true
ENABLE_COLLABORATION=true
```

### Step 4: Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Step 5: Set up Database

After deployment, run the migration endpoint:

```bash
curl -X POST https://your-app.vercel.app/api/migrate
```

---

## ☁️ Azure Deployment

Azure deployment uses Terraform for infrastructure provisioning.

### Step 1: Install Required Tools

```bash
# Install Azure CLI
# macOS
brew install azure-cli

# Windows (via winget)
winget install Microsoft.AzureCLI

# Install Terraform
# macOS
brew install terraform

# Windows (via chocolatey)
choco install terraform
```

### Step 2: Login to Azure

```bash
az login
az account set --subscription "Your Subscription Name"
```

### Step 3: Configure Terraform Variables

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
project_name        = "rsg-platform"
resource_group_name = "rsg-platform-rg"
location            = "westus2"
environment         = "production"

db_admin_username = "rsgadmin"
db_admin_password = "YourSecurePassword123!"
database_name     = "rsg_db"
db_sku_name       = "B_Standard_B1ms"

app_service_sku = "B1"
session_secret  = "your-random-session-secret"
```

### Step 4: Initialize Terraform

```bash
terraform init
```

### Step 5: Preview Infrastructure

```bash
terraform plan
```

### Step 6: Apply Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will create:
- Resource Group
- Virtual Network
- PostgreSQL Flexible Server
- App Service Plan
- Linux Web App
- Application Insights

### Step 7: Get Deployment Info

```bash
terraform output
```

Note the `app_service_url` for your application.

### Step 8: Deploy Application

```bash
cd ..
az webapp up \
  --name rsg-platform-app \
  --resource-group rsg-platform-rg \
  --runtime "NODE:18-lts"
```

---

## 🗄️ Database Setup

### Option 1: Vercel Postgres

```bash
# Create database
vercel postgres create rsg-platform-db

# Link to project
vercel link

# Get connection string
vercel env pull .env.local
```

### Option 2: Azure PostgreSQL (via Terraform)

Database is automatically created when you run `terraform apply`.

Connection string will be available in outputs:

```bash
terraform output postgres_fqdn
```

### Option 3: External PostgreSQL (Neon, Supabase, etc.)

1. Create a database on your provider
2. Get the connection string
3. Add to environment variables

### Initialize Database Schema

**Via API endpoint (Vercel):**
```bash
curl -X POST https://your-app.vercel.app/api/migrate
```

**Via local script:**
```bash
cd app
npm run migrate
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment name | `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Session encryption key | Random 32+ char string |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_AUTHENTICATION` | Enable auth features | `true` |
| `ENABLE_COLLABORATION` | Enable real-time features | `true` |
| `DATABASE_SSL` | Require SSL for DB | `true` |

### Generating Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate DB_ADMIN_PASSWORD
openssl rand -base64 32
```

---

## 🔄 CI/CD Setup

### GitHub Actions Setup

1. **Fork or clone the repository**

2. **Add GitHub Secrets:**

Go to: `Settings > Secrets and variables > Actions`

**For Vercel:**
- `VERCEL_TOKEN` - From vercel.com/account/tokens
- `VERCEL_ORG_ID` - From .vercel/project.json
- `VERCEL_PROJECT_ID` - From .vercel/project.json

**For Azure:**
- `AZURE_CLIENT_ID` - Service principal client ID
- `AZURE_CLIENT_SECRET` - Service principal secret
- `AZURE_SUBSCRIPTION_ID` - Your subscription ID
- `AZURE_TENANT_ID` - Your tenant ID
- `DB_ADMIN_PASSWORD` - Database password
- `SESSION_SECRET` - Session secret

3. **Create Azure Service Principal:**

```bash
az ad sp create-for-rbac \
  --name "rsg-platform-github" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/rsg-platform-rg \
  --sdk-auth
```

Copy the JSON output and add values to GitHub secrets.

4. **Push to main branch:**

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

GitHub Actions will automatically:
- Run tests
- Deploy to Vercel
- Provision Azure infrastructure (if changed)

---

## 🐛 Troubleshooting

### Vercel Deployment Issues

**Issue:** "MODULE_NOT_FOUND"
```bash
# Solution: Ensure package.json is in correct location
vercel --debug
```

**Issue:** Database connection fails
```bash
# Check environment variables
vercel env ls
# Verify DATABASE_URL format
```

### Azure Deployment Issues

**Issue:** Terraform authentication fails
```bash
# Re-login to Azure
az login
az account show
```

**Issue:** PostgreSQL connection timeout
```bash
# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group rsg-platform-rg \
  --name rsg-platform-postgres
```

**Issue:** App Service not starting
```bash
# Check logs
az webapp log tail \
  --name rsg-platform-app \
  --resource-group rsg-platform-rg
```

### Database Issues

**Issue:** Migration fails
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Run migration manually
cd app
npm run migrate
```

**Issue:** "relation does not exist"
```bash
# Database not initialized - run migration
curl -X POST https://your-app.vercel.app/api/migrate
```

### Common Errors

**Port already in use:**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

**Permission denied:**
```bash
# Use sudo or run as administrator
sudo npm install -g vercel
```

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Generate strong SESSION_SECRET
- [ ] Enable HTTPS enforcement
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Azure Application Insights
- [ ] Configure backup retention
- [ ] Review firewall rules
- [ ] Enable database SSL
- [ ] Set up monitoring alerts

---

## 📊 Post-Deployment Verification

### 1. Health Check

```bash
curl https://your-app.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-12-13T..."
}
```

### 2. Test Authentication

```bash
# Register a test user
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'
```

### 3. Access Dashboard

Visit `https://your-app.vercel.app/dashboard.html`

---

## 🎯 Performance Optimization

### Vercel

- Use Edge Functions for API routes
- Enable caching headers
- Optimize images with Vercel Image Optimization

### Azure

- Enable Azure CDN for static assets
- Configure Application Gateway for load balancing
- Use Azure Redis Cache for sessions

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs
3. Check Azure Portal logs
4. Open an issue on GitHub

---

## 🎉 Success!

Your RSG Platform should now be live and running!

**Next Steps:**
- Set up custom domain
- Configure SSL certificate
- Add analytics tracking
- Set up monitoring alerts
- Create backup strategy

---

<div align="center">

**🎤 Welcome to the RSG Platform! 🎤**

[Back to README](README.md)

</div>
