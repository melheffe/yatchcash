const fastify = require('fastify')({ logger: true });
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Add CORS
fastify.register(require('@fastify/cors'), {
  origin: true
});

// Health check endpoint with environment info
fastify.get('/health', async (request, reply) => {
  let dbStatus = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'error';
  }
  
  return { 
    status: 'ok', 
    message: 'YachtCash API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus
  };
});

// Root endpoint
fastify.get('/', async (request, reply) => {
  return { 
    message: '🛥️ Welcome to YachtCash API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Maritime petty cash management',
      'Multi-currency support',
      'Offline-first PWA',
      'Receipt management',
      'Role-based access control'
    ]
  };
});

// API status endpoint
fastify.get('/api/status', async (request, reply) => {
  return {
    api: 'YachtCash Maritime API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/health',
      'database-test': '/api/database-test',
      auth: '/api/auth (coming soon)',
      users: '/api/users (coming soon)',
      yachts: '/api/yachts (coming soon)',
      transactions: '/api/transactions (coming soon)'
    }
  };
});

// Database test endpoint
fastify.get('/api/database-test', async (request, reply) => {
  try {
    // Test database connection and schema
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const userCount = await prisma.user.count();
    const yachtCount = await prisma.yacht.count();
    const currencyCount = await prisma.currencyCode.count();
    
    return {
      database: 'connected',
      schema: 'deployed',
      tables: Number(tableCount[0].count),
      data: {
        users: userCount,
        yachts: yachtCount,
        currencies: currencyCount
      },
      models: [
        'User', 'Profile', 'Role', 'Permission', 'Session',
        'Yacht', 'YachtUser', 'CashBalance', 'Transaction', 
        'Receipt', 'CurrencyCode', 'CashRecipient', 
        'ExpenseCategory', 'TransactionFlag', 'Alert', 
        'Report', 'AuditLog', 'SystemConfiguration'
      ]
    };
  } catch (error) {
    return {
      database: 'error',
      error: error.message
    };
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    await fastify.listen({ port, host });
    console.log(`🚀 YachtCash API running on ${host}:${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`📋 Prisma Client: Initialized`);
  } catch (err) {
    console.error('❌ Error starting server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start(); 