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
      'seed-demo': 'POST /api/seed-demo',
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

// Seed demo data endpoint
fastify.post('/api/seed-demo', async (request, reply) => {
  try {
    // Create currencies
    const currencies = await Promise.all([
      prisma.currencyCode.upsert({
        where: { code: 'USD' },
        update: {},
        create: {
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          decimalPlaces: 2,
          isDefault: true,
          createdByUserId: 'system'
        }
      }),
      prisma.currencyCode.upsert({
        where: { code: 'EUR' },
        update: {},
        create: {
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          decimalPlaces: 2,
          createdByUserId: 'system'
        }
      }),
      prisma.currencyCode.upsert({
        where: { code: 'GBP' },
        update: {},
        create: {
          code: 'GBP',
          name: 'British Pound',
          symbol: '£',
          decimalPlaces: 2,
          createdByUserId: 'system'
        }
      })
    ]);

    // Create sample owner
    const owner = await prisma.user.upsert({
      where: { email: 'owner@yachtcash.com' },
      update: {},
      create: {
        email: 'owner@yachtcash.com',
        passwordHash: '$2a$10$demo.hash.for.testing',
        assignedRoles: ['YACHT_OWNER'],
        createdByUserId: 'system',
        profile: {
          create: {
            firstName: 'Alexander',
            lastName: 'Maritime',
            phone: '+1-555-YACHT-1',
            country: 'Monaco',
            preferences: {
              currency: 'EUR',
              notifications: true
            }
          }
        }
      }
    });

    // Create sample captain
    const captain = await prisma.user.upsert({
      where: { email: 'captain@yachtcash.com' },
      update: {},
      create: {
        email: 'captain@yachtcash.com',
        passwordHash: '$2a$10$demo.hash.for.testing',
        assignedRoles: ['CAPTAIN'],
        createdByUserId: 'system',
        profile: {
          create: {
            firstName: 'Maria',
            lastName: 'Rodriguez',
            phone: '+1-555-CAPT-1',
            country: 'Spain',
            preferences: {
              currency: 'EUR',
              language: 'en'
            }
          }
        }
      }
    });

    // Create sample yacht
    const yacht = await prisma.yacht.upsert({
      where: { name: 'Serenity' },
      update: {},
      create: {
        name: 'Serenity',
        imoNumber: 'IMO-DEMO-001',
        ownerUserId: owner.id,
        primaryCaptainUserId: captain.id,
        cashBalances: {
          create: [
            {
              currencyCodeId: currencies[0].id, // USD
              amount: 25000.00,
              thresholdAlert: 5000.00,
              lastUpdated: new Date(),
              updatedByUserId: captain.id
            },
            {
              currencyCodeId: currencies[1].id, // EUR
              amount: 18000.00,
              thresholdAlert: 3000.00,
              lastUpdated: new Date(),
              updatedByUserId: captain.id
            }
          ]
        }
      }
    });

    // Get final counts
    const finalCounts = {
      users: await prisma.user.count(),
      yachts: await prisma.yacht.count(),
      currencies: await prisma.currencyCode.count(),
      cashBalances: await prisma.cashBalance.count()
    };

    return {
      success: true,
      message: 'Demo data seeded successfully! 🛥️',
      data: finalCounts,
      seeded: {
        currencies: currencies.map(c => `${c.code} (${c.symbol})`),
        users: ['Alexander Maritime (Owner)', 'Maria Rodriguez (Captain)'],
        yachts: ['Serenity - IMO-DEMO-001'],
        cashBalances: ['$25,000 USD', '€18,000 EUR']
      }
    };
  } catch (error) {
    return {
      success: false,
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