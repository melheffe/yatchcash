# 🛥️ YachtCash Local Development Setup

## Prerequisites

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create a database user (optional - uses your system user by default)
createuser -s postgres
```

**macOS (using Postgres.app):**
1. Download and install [Postgres.app](https://postgresapp.com/)
2. Start Postgres.app
3. Click "Initialize" to create a new server

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user

### 2. Create YachtCash Database

**Method 1: Using psql command line**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE yachtcash_dev;

# Create user (optional)
CREATE USER yachtcash WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE yachtcash_dev TO yachtcash;

# Exit psql
\q
```

**Method 2: Using PostgreSQL GUI (pgAdmin, TablePlus, etc.)**
1. Connect to your local PostgreSQL server
2. Create a new database named `yachtcash_dev`

## Project Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project
cd yachtcash

# Install dependencies
npm install

# Build shared packages
npm run build:shared
```

### 2. Configure Environment Variables

The project should already have a `.env` file, but verify it contains:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/yachtcash_dev"

# API Configuration
NODE_ENV=development
PORT=3001
JWT_SECRET="development-jwt-secret-change-in-production"
```

**Update the DATABASE_URL with your actual credentials:**
- Replace `postgres` with your PostgreSQL username
- Replace `password` with your PostgreSQL password  
- Replace `localhost:5432` if using different host/port
- Replace `yachtcash_dev` with your database name

### 3. Set Up Database Schema

```bash
# Navigate to API package
cd packages/api

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 4. Seed Demo Data

```bash
# Start the API server first (in one terminal)
npm run dev:api

# In another terminal, seed demo data
curl -X POST http://localhost:3001/api/seed-demo
```

### 5. Start Development Servers

```bash
# Start all services at once
npm run dev

# Or start individually:
npm run dev:api      # API server (port 3001)
npm run dev:admin    # Super admin panel (port 3000)  
npm run dev:tenant   # Tenant dashboard (port 3002)
npm run dev:captain  # Captain PWA (port 3003)
```

## Access the Application

### URLs
- **API Server**: http://localhost:3001
- **Super Admin Panel**: http://localhost:3001/admin/
- **Tenant Dashboard**: http://localhost:3001/tenant/
- **Captain PWA**: http://localhost:3003
- **API Documentation**: http://localhost:3001/docs (if available)

### Demo Login Credentials

After seeding demo data, you can login with:

**Super Admin Panel** (`/admin/`):
- Any existing user credentials from your database

**Tenant Dashboard** (`/tenant/`):
- Email: `owner@yachtcash.com`
- Password: `any_password` (demo mode accepts any password)

## Troubleshooting

### Database Connection Issues

1. **"role does not exist"** or **"password authentication failed"**
   ```bash
   # Check PostgreSQL is running
   brew services list | grep postgresql
   
   # Or check with systemctl on Linux
   sudo systemctl status postgresql
   
   # Verify your credentials can connect
   psql -U postgres -d yachtcash_dev
   ```

2. **"database does not exist"**
   ```bash
   # Create the database
   createdb -U postgres yachtcash_dev
   ```

3. **"Environment variable not found: DATABASE_URL"**
   - Ensure `.env` file exists in both project root and `packages/api/`
   - Check the DATABASE_URL format matches your PostgreSQL setup

### API Server Issues

1. **Port already in use**
   ```bash
   # Find what's using port 3001
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   ```

2. **TypeScript/Node errors**
   - The project is configured to use `minimal-server.js` for development
   - No TypeScript compilation needed for local development

### Prisma Issues

1. **Schema out of sync**
   ```bash
   # Reset database and reapply migrations
   npx prisma migrate reset
   npx prisma migrate dev
   ```

2. **Client generation issues**
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   ```

## Development Workflow

### Making Database Changes

1. Edit `packages/api/prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name your_change_name`
3. Restart API server

### Testing API Endpoints

```bash
# Test API health
curl http://localhost:3001/health

# Test super admin stats
curl http://localhost:3001/api/super-admin/stats

# Test tenant login
curl -X POST http://localhost:3001/api/tenant/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@yachtcash.com","password":"test"}'
```

### Database Management

```bash
# Open Prisma Studio (visual database browser)
cd packages/api && npx prisma studio

# View database with psql
psql -U postgres -d yachtcash_dev

# Backup database
pg_dump -U postgres yachtcash_dev > backup.sql

# Restore database
psql -U postgres yachtcash_dev < backup.sql
```

## Production Notes

- Change `JWT_SECRET` to a secure random string
- Use environment-specific database URLs
- Enable SSL for database connections
- Set `NODE_ENV=production`
- Configure proper CORS origins

## Success! 🎉

Once everything is running, you'll have:

✅ **PostgreSQL database** with full YachtCash schema  
✅ **API server** with multitenant endpoints  
✅ **Super Admin Panel** for platform management  
✅ **Tenant Dashboard** for customer accounts  
✅ **Demo data** with sample yachts and users  

Your local YachtCash development environment is ready for maritime companies! 🛥️⚓ 