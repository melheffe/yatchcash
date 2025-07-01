# YachtCash - Maritime Petty Cash Management System

A comprehensive solution for managing petty cash transactions across international waters with multiple currencies, receipt capture, and role-based access control.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm 9+

### Development Setup

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd yachtcash
npm install
```

2. **Database Setup**
```bash
# Create PostgreSQL database
createdb yachtcash_dev

# Set up environment
cp packages/api/.env.example packages/api/.env
# Edit packages/api/.env with your database URL

# Generate Prisma client and run migrations
cd packages/api
npx prisma generate
npx prisma migrate dev
```

3. **Start Development Servers**
```bash
# From project root
npm run dev

# Or individually:
npm run dev:api      # API server on :3001
npm run dev:admin    # Admin panel on :5173
npm run dev:captain  # Captain PWA on :5174
```

## 🏗️ Architecture

### Packages
- **`@yachtcash/shared`** - TypeScript types, validation schemas, utilities
- **`@yachtcash/api`** - Fastify REST API with Prisma ORM
- **`@yachtcash/admin-panel`** - React admin interface with Mantine UI
- **`@yachtcash/captain-pwa`** - Mobile-first PWA for captains

### Technology Stack
- **Backend**: Fastify, Prisma, PostgreSQL, JWT authentication
- **Frontend**: React, TypeScript, Mantine UI
- **Database**: PostgreSQL with comprehensive schema
- **Validation**: Zod schemas for type-safe API contracts

## 🔐 Authentication & Authorization

### Default Roles
- **Super Admin**: Full system access
- **Admin**: Administrative access to most functions
- **Manager**: Yacht management and oversight
- **Captain**: Operational transaction management
- **Crew**: Limited transaction creation

### API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Current user info
- `GET /api/users` - User management (admin)
- `GET /api/yachts` - Yacht management
- `GET /api/transactions` - Transaction history
- `GET /api/admin/stats` - System statistics

## 📱 Features Implemented

### ✅ Current Features
- [x] JWT-based authentication system
- [x] Role-based access control
- [x] User management interface
- [x] Dashboard with system statistics
- [x] Navigation with permission-based menus
- [x] Complete database schema
- [x] API routes for all major entities
- [x] TypeScript type safety throughout
- [x] Development environment setup

### 🔄 In Development
- [ ] Transaction creation and management UI
- [ ] Yacht management interface
- [ ] Cash balance tracking
- [ ] Receipt upload and management
- [ ] Reporting and analytics
- [ ] Mobile captain PWA
- [ ] SMS confirmation system
- [ ] Multi-currency exchange rates

### 📋 Planned Features
- [ ] Offline functionality for poor connectivity
- [ ] Geolocation tracking
- [ ] Fraud detection algorithms
- [ ] Advanced reporting and exports
- [ ] Family office integration
- [ ] Audit logging and compliance
- [ ] Real-time notifications

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start all development servers
npm run dev

# Build all packages
npm run build

# Run type checking
npm run type-check

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio

# Linting
npm run lint
```

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with:
- User authentication and profiles
- Role-based permissions system
- Yacht and crew management
- Multi-currency transaction tracking
- Receipt and confirmation workflows
- Audit logging and system configuration

See `packages/api/prisma/schema.prisma` for complete schema definition.

## 🌐 API Documentation

When running in development mode, API documentation is available at:
- Swagger UI: `http://localhost:3001/docs`
- Health Check: `http://localhost:3001/health`

## 💼 User Stories Addressed

This system addresses complex maritime cash management needs:

1. **Captain Operations**: Quick transaction entry, receipt capture, offline functionality
2. **Yacht Manager**: Remote oversight, fraud detection, multi-yacht monitoring
3. **Cash Recipients**: Easy confirmation via SMS/links
4. **Family Office**: Financial transparency, reporting, accounting integration

## 📝 Next Development Phase

Ready to continue with:
1. **Transaction Management UI** - Create, edit, and approve transactions
2. **Cash Balance Interface** - Real-time balance tracking and alerts
3. **Receipt Management** - Upload, view, and manage receipt photos
4. **Yacht Administration** - Complete yacht setup and user assignment
5. **Reporting Dashboard** - Analytics and export functionality

The foundation is solid and ready for rapid feature development! 