# YachtCash Setup Guide

This guide will help you set up the complete YachtCash development environment.

## Prerequisites

- **Node.js** 18+ and npm 9+
- **PostgreSQL** 12+ (or Docker)
- **Git**

## Quick Start

```bash
# 1. Clone and install
git clone <your-repo>
cd yachtcash
npm install

# 2. Setup database
cp packages/api/.env.example packages/api/.env
# Edit packages/api/.env with your database URL

# 3. Setup database
npm run db:migrate
npm run db:seed

# 4. Start all services
npm run dev
```

**Services will be available at:**
- API: http://localhost:3001
- Admin Panel: http://localhost:3000  
- Captain PWA: http://localhost:3002

## Detailed Setup

### 1. Database Setup

#### Option A: PostgreSQL with Docker (Recommended)
```bash
# Start PostgreSQL container
docker run --name yacht-postgres \
  -e POSTGRES_DB=yachtcash \
  -e POSTGRES_USER=yacht \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Database URL for .env
DATABASE_URL="postgresql://yacht:password@localhost:5432/yachtcash?schema=public"
```

#### Option B: Local PostgreSQL
```bash
# Create database
createdb yachtcash

# Database URL for .env
DATABASE_URL="postgresql://username:password@localhost:5432/yachtcash?schema=public"
```

### 2. Environment Configuration

Copy and configure environment files:

```bash
# API environment
cp packages/api/.env.example packages/api/.env
```

Edit `packages/api/.env`:
```env
DATABASE_URL="postgresql://yacht:password@localhost:5432/yachtcash?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
HOST=localhost
NODE_ENV=development
```

### 3. Database Migration & Seeding

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed with default data
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Development Workflow

#### Start All Services
```bash
npm run dev
```
This starts:
- API server on port 3001
- Admin panel on port 3000
- Captain PWA on port 3002

#### Individual Services
```bash
# Start only API
npm run dev:api

# Start only admin panel
npm run dev:admin

# Start only captain PWA
npm run dev:captain
```

### 5. Default Users & Access

After seeding, you can login with:

**System Admin:**
- Email: `admin@yachtcash.com`
- Password: `admin123`
- Access: Full system administration

**Yacht Manager:**
- Email: `manager@yachtcash.com`
- Password: `manager123`
- Access: Yacht operations and oversight

**Captain:**
- Email: `captain@yachtcash.com`
- Password: `captain123`
- Access: Transaction creation and cash management

## Project Structure

```
yachtcash/
├── packages/
│   ├── shared/           # Shared types and utilities
│   │   ├── src/types/    # TypeScript interfaces
│   │   └── src/schemas/  # Zod validation schemas
│   ├── api/              # Fastify backend API
│   │   ├── src/routes/   # API endpoints
│   │   ├── src/plugins/  # Fastify plugins
│   │   └── prisma/       # Database schema & migrations
│   ├── admin-panel/      # React + Refine admin interface
│   │   ├── src/pages/    # Admin pages
│   │   └── src/components/ # Admin components
│   └── captain-pwa/      # React PWA for captains
│       ├── src/pages/    # Captain interfaces
│       └── src/components/ # PWA components
└── docs/                 # Documentation
```

## Development Features

### API Features
- **Fastify** with TypeScript
- **Prisma ORM** with PostgreSQL
- **JWT Authentication** with role-based access
- **File upload** for receipts
- **API documentation** at `/docs`
- **Comprehensive validation** with Zod schemas

### Admin Panel Features
- **Refine framework** for rapid admin development
- **Mantine UI** components
- **User & role management**
- **Yacht fleet oversight**
- **Transaction monitoring**
- **System configuration**

### Captain PWA Features
- **Mobile-optimized** interface
- **Offline support** for poor connectivity
- **Receipt capture** with camera
- **Quick transaction entry**
- **Cash balance tracking**
- **Recipient management**

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user info

### Users & Roles
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/admin/roles` - List roles
- `POST /api/admin/roles` - Create role

### Yachts
- `GET /api/yachts` - List yachts
- `POST /api/yachts` - Create yacht
- `GET /api/yachts/:id/balance` - Cash balances

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/:id/receipt` - Upload receipt

Full API documentation available at: http://localhost:3001/docs

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL container
docker restart yacht-postgres

# Reset database
npm run db:reset
```

### Port Conflicts
```bash
# Check what's using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Dependency Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild shared package
cd packages/shared
npm run build
```

### PWA Not Loading
```bash
# Clear service workers in browser dev tools
# Application > Storage > Clear storage

# Force reload with cache bypass
Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup instructions.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details. 