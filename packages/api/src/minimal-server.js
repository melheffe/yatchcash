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
      'admin-stats': '/api/admin/stats',
      'admin-yachts': '/api/admin/yachts',
      'admin-users': '/api/admin/users',
      'admin-transactions': '/api/admin/transactions/recent',
      auth: '/api/auth (coming soon)'
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

    // Create sample yacht (check if it exists first)
    let yacht = await prisma.yacht.findFirst({
      where: { name: 'Serenity' }
    });

    if (!yacht) {
      yacht = await prisma.yacht.create({
        data: {
          name: 'Serenity',
          imoNumber: 'IMO-DEMO-001',
          ownerUserId: owner.id,
          primaryCaptainUserId: captain.id
        }
      });

      // Create cash balances separately
      await prisma.cashBalance.createMany({
        data: [
          {
            yachtId: yacht.id,
            currencyCodeId: currencies[0].id, // USD
            amount: 25000.00,
            thresholdAlert: 5000.00,
            lastUpdated: new Date(),
            updatedByUserId: captain.id
          },
          {
            yachtId: yacht.id,
            currencyCodeId: currencies[1].id, // EUR
            amount: 18000.00,
            thresholdAlert: 3000.00,
            lastUpdated: new Date(),
            updatedByUserId: captain.id
          }
        ]
      });
    }

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

// Admin dashboard statistics endpoint
fastify.get('/api/admin/stats', async (request, reply) => {
  try {
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { status: 'ACTIVE' }
    });

    // Get yacht statistics
    const totalYachts = await prisma.yacht.count();
    const activeYachts = await prisma.yacht.count({
      where: { isActive: true }
    });

    // Get transaction statistics
    const totalTransactions = await prisma.transaction.count();
    const pendingTransactions = await prisma.transaction.count({
      where: { status: 'PENDING' }
    });
    const flaggedTransactions = await prisma.transactionFlag.count({
      where: { status: 'OPEN' }
    });

    // Get cash balance overview
    const cashBalances = await prisma.cashBalance.findMany({
      include: {
        currencyCode: true,
        yacht: true
      }
    });

    const totalBalancesByCurrency = cashBalances.reduce((acc, balance) => {
      const currency = balance.currencyCode.code;
      acc[currency] = (acc[currency] || 0) + Number(balance.amount);
      return acc;
    }, {});

    return {
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        yachts: {
          total: totalYachts,
          active: activeYachts
        },
        transactions: {
          total: totalTransactions,
          pending: pendingTransactions,
          flagged: flaggedTransactions
        },
        cashBalances: totalBalancesByCurrency
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Admin yachts overview endpoint
fastify.get('/api/admin/yachts', async (request, reply) => {
  try {
    const yachts = await prisma.yacht.findMany({
      include: {
        owner: {
          include: {
            profile: true
          }
        },
        primaryCaptain: {
          include: {
            profile: true
          }
        },
        cashBalances: {
          include: {
            currencyCode: true
          }
        },
        _count: {
          select: {
            transactions: true,
            yachtUsers: true
          }
        }
      }
    });

    const yachtsWithDetails = yachts.map(yacht => ({
      id: yacht.id,
      name: yacht.name,
      imoNumber: yacht.imoNumber,
      owner: yacht.owner.profile ? 
        `${yacht.owner.profile.firstName} ${yacht.owner.profile.lastName}` : 
        yacht.owner.email,
      captain: yacht.primaryCaptain?.profile ? 
        `${yacht.primaryCaptain.profile.firstName} ${yacht.primaryCaptain.profile.lastName}` : 
        yacht.primaryCaptain?.email || 'Not assigned',
      cashBalances: yacht.cashBalances.map(balance => ({
        amount: Number(balance.amount),
        currency: balance.currencyCode.code,
        symbol: balance.currencyCode.symbol,
        threshold: Number(balance.thresholdAlert),
        isLowBalance: Number(balance.amount) <= Number(balance.thresholdAlert)
      })),
      totalTransactions: yacht._count.transactions,
      crewMembers: yacht._count.yachtUsers,
      isActive: yacht.isActive,
      createdAt: yacht.createdAt
    }));

    return {
      success: true,
      data: yachtsWithDetails
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Admin users management endpoint
fastify.get('/api/admin/users', async (request, reply) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        ownedYachts: {
          select: {
            name: true
          }
        },
        managedYachts: {
          select: {
            name: true
          }
        },
        captainYachts: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            createdTransactions: true
          }
        }
      }
    });

    const usersWithDetails = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.profile ? 
        `${user.profile.firstName} ${user.profile.lastName}` : 
        'No profile',
      roles: user.assignedRoles,
      status: user.status,
      country: user.profile?.country || 'Not specified',
      phone: user.profile?.phone || 'Not provided',
      lastLogin: user.lastLogin,
      yachts: {
        owned: user.ownedYachts.map(y => y.name),
        managed: user.managedYachts.map(y => y.name),
        captain: user.captainYachts.map(y => y.name)
      },
      transactionCount: user._count.createdTransactions,
      createdAt: user.createdAt
    }));

    return {
      success: true,
      data: usersWithDetails
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Recent transactions for admin dashboard
fastify.get('/api/admin/transactions/recent', async (request, reply) => {
  try {
    const limit = parseInt(request.query.limit) || 10;
    
    const transactions = await prisma.transaction.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        yacht: true,
        createdBy: {
          include: {
            profile: true
          }
        },
        currencyCode: true,
        expenseCategory: true,
        recipient: true
      }
    });

    const formattedTransactions = transactions.map(txn => ({
      id: txn.id,
      amount: Number(txn.amount),
      currency: txn.currencyCode.code,
      symbol: txn.currencyCode.symbol,
      description: txn.description,
      category: txn.expenseCategory.name,
      yacht: txn.yacht.name,
      createdBy: txn.createdBy.profile ? 
        `${txn.createdBy.profile.firstName} ${txn.createdBy.profile.lastName}` : 
        txn.createdBy.email,
      recipient: txn.recipient?.name || 'N/A',
      status: txn.status,
      location: txn.location,
      transactionDate: txn.transactionDate,
      createdAt: txn.createdAt
    }));

    return {
      success: true,
      data: formattedTransactions
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