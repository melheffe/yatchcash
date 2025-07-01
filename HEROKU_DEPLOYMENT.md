# 🚀 YachtCash Heroku Deployment Guide

## 🎯 Quick Deploy

### Option 1: One-Click Deploy (Recommended)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Option 2: Manual Deploy via CLI

```bash
# 1. Install Heroku CLI
# Visit: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create new Heroku app
heroku create your-yachtcash-app

# 4. Add PostgreSQL database
heroku addons:create heroku-postgresql:mini

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set API_PORT=3001
heroku config:set FRONTEND_URL=https://your-yachtcash-app.herokuapp.com

# 6. Deploy
git init
git add .
git commit -m "Initial YachtCash deployment"
heroku git:remote -a your-yachtcash-app
git push heroku main
```

## 🏗️ Architecture on Heroku

```
your-app.herokuapp.com/
├── /                    → Redirects to /admin/
├── /admin/              → Admin Panel (React SPA)
├── /captain/            → Captain PWA (React PWA)
├── /api/auth/           → Authentication API
├── /api/users/          → User Management API
├── /api/yachts/         → Yacht Management API
├── /api/transactions/   → Transaction API
└── /health              → Health Check
```

## 🔧 Configuration

### Required Environment Variables
```bash
# Core Settings
NODE_ENV=production
DATABASE_URL=<automatically set by Heroku Postgres>

# Security (Auto-generated or set manually)
JWT_SECRET=<secure-random-string>
BCRYPT_ROUNDS=12

# Server Configuration
API_PORT=3001
MAX_FILE_SIZE=10485760

# Frontend URL for CORS
FRONTEND_URL=https://your-app.herokuapp.com
```

### Optional Environment Variables
```bash
# Email (for notifications)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# External APIs
EXCHANGE_RATE_API_KEY=
```

## 📋 Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All packages build successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] CORS origins updated for production

### ✅ Heroku Setup
- [ ] Heroku account created
- [ ] Heroku CLI installed
- [ ] PostgreSQL addon added
- [ ] Environment variables set

### ✅ Security Check
- [ ] JWT_SECRET is secure and unique
- [ ] No sensitive data in code
- [ ] Database credentials secured
- [ ] CORS properly configured

## 🚢 Deployment Process

### What Happens During Deploy

1. **heroku-prebuild**: Installs dependencies and builds shared package
2. **heroku-postbuild**: Builds all packages (API + frontend)
3. **Database Setup**: Runs Prisma migrations
4. **Server Start**: Starts API server with Procfile

### Build Process
```bash
npm run setup           # Install deps + build shared
npm run build          # Build all packages
  ├── shared           # TypeScript types and schemas
  ├── api              # Fastify server
  ├── admin-panel      # React admin dashboard  
  └── captain-pwa      # React PWA for captains
```

## 🔍 Monitoring & Debugging

### Check Deployment Status
```bash
heroku logs --tail                    # Real-time logs
heroku ps                            # Check dyno status
heroku config                        # View environment variables
heroku pg:info                       # Database information
```

### Common Issues & Solutions

#### ❌ Build Failures
```bash
# Check build logs
heroku logs --source=app --dyno=web

# Common fixes:
heroku config:set NODE_ENV=production
heroku restart
```

#### ❌ Database Connection Issues
```bash
# Check database URL
heroku config:get DATABASE_URL

# Reset database connection
heroku pg:reset DATABASE_URL --confirm your-app-name
heroku run "cd packages/api && npx prisma migrate deploy"
```

#### ❌ Application Errors
```bash
# Check application logs
heroku logs --source=app --tail

# Restart application
heroku restart

# Check health endpoint
curl https://your-app.herokuapp.com/health
```

## 🎯 Post-Deployment Steps

### 1. Verify Deployment
```bash
# Check health endpoint
curl https://your-app.herokuapp.com/health

# Should return:
{
  "status": "ok",
  "timestamp": "2024-06-30T...",
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. Create Initial Admin User
```bash
# Connect to Heroku console
heroku run bash

# Run database seed
cd packages/api && npx prisma db seed
```

### 3. Test Core Functionality
- [ ] Admin login works
- [ ] Database queries successful
- [ ] File uploads working
- [ ] PWA installable on mobile

## 🔄 Updates & Maintenance

### Deploy Updates
```bash
git add .
git commit -m "Update: your changes"
git push heroku main
```

### Database Migrations
```bash
# Run new migrations
heroku run "cd packages/api && npx prisma migrate deploy"

# Check database schema
heroku run "cd packages/api && npx prisma db pull"
```

### Scaling (if needed)
```bash
# Scale up dynos
heroku ps:scale web=2

# Upgrade database
heroku addons:upgrade DATABASE_URL:standard-0
```

## 💰 Cost Estimates

### Free Tier (Development)
- **Dyno**: Free (sleeps after 30min)
- **Database**: Free PostgreSQL (10,000 rows)
- **Total**: $0/month

### Production Tier
- **Dyno**: Hobby ($7/month)  
- **Database**: Standard-0 ($9/month)
- **Total**: ~$16/month

## 🆘 Support

### Heroku Resources
- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [PostgreSQL on Heroku](https://devcenter.heroku.com/articles/heroku-postgresql)

### YachtCash Support
- Check logs: `heroku logs --tail`
- Database status: `heroku pg:info`
- Health check: `https://your-app.herokuapp.com/health` 