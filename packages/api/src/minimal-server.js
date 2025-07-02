const fastify = require('fastify')({ logger: true });
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Debug: Log the static file paths
console.log('🔍 Static file paths:');
console.log('Admin panel:', path.join(__dirname, '../../../packages/admin-panel/dist'));
console.log('Tenant dashboard:', path.join(__dirname, '../../../packages/tenant-dashboard/dist'));
console.log('Captain PWA:', path.join(__dirname, '../../../packages/captain-pwa/dist'));
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Add CORS
fastify.register(require('@fastify/cors'), {
  origin: true,
});

// Tenant-aware middleware
fastify.addHook('preHandler', async (request, _reply) => {
  // Skip tenant resolution for super admin routes and static files
  if (
    request.url.startsWith('/admin/') ||
    request.url.startsWith('/tenant/') ||
    request.url.startsWith('/captain/') ||
    request.url.startsWith('/api/super-admin/') ||
    request.url.startsWith('/api/admin/') ||
    request.url.startsWith('/api/status') ||
    request.url.startsWith('/health') ||
    request.url === '/'
  ) {
    return;
  }

  // Extract tenant from subdomain or header
  let tenantId = null;

  // Check for tenant in headers (for API access)
  if (request.headers['x-tenant-id']) {
    tenantId = request.headers['x-tenant-id'];
  }

  // Check for tenant from subdomain
  if (!tenantId && request.headers.host) {
    const subdomain = request.headers.host.split('.')[0];
    if (subdomain && subdomain !== 'yatchcash' && subdomain !== 'www') {
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain },
      });
      if (tenant) {
        tenantId = tenant.id;
      }
    }
  }

  // Attach tenant context to request
  request.tenantId = tenantId;
  request.prisma = prisma; // Make prisma available to routes
});

// Register @fastify/static to enable reply.sendFile method
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '../../../'),
  serve: false, // Don't auto-serve, we'll handle routing manually
});

// Serve static files without automatic routing
const fs = require('fs');

// Custom route handler for serving static files and SPA fallback
const serveApp = (appPath, appPrefix) => {
  return async (request, reply) => {
    const filePath = request.url;
    // Remove the app prefix (e.g., '/admin/', '/tenant/', '/captain/') from the URL
    const relativePath = filePath.replace(new RegExp(`^${appPrefix}`), '');
    const fullPath = path.join(appPath, relativePath);

    // Check if it's a file with extension (static asset)
    if (path.extname(relativePath) && fs.existsSync(fullPath)) {
      return reply.sendFile(relativePath, appPath);
    }

    // SPA fallback - serve index.html for routes without extensions
    return reply.sendFile('index.html', appPath);
  };
};

// Admin panel routes
const adminPath = path.join(__dirname, '../../../packages/admin-panel/dist');
fastify.get('/admin/*', serveApp(adminPath, '/admin/'));

// Tenant dashboard routes
const tenantPath = path.join(__dirname, '../../../packages/tenant-dashboard/dist');
fastify.get('/tenant/*', serveApp(tenantPath, '/tenant/'));

// Captain PWA routes
const captainPath = path.join(__dirname, '../../../packages/captain-pwa/dist');
fastify.get('/captain/*', serveApp(captainPath, '/captain/'));

// Redirect /admin to /admin/ for better UX
fastify.get('/admin', async (request, reply) => {
  return reply.redirect(301, '/admin/');
});

// Redirect /tenant to /tenant/ for better UX
fastify.get('/tenant', async (request, reply) => {
  return reply.redirect(301, '/tenant/');
});

// Redirect /captain to /captain/ for better UX
fastify.get('/captain', async (request, reply) => {
  return reply.redirect(301, '/captain/');
});

// Note: SPA fallback is handled by @fastify/static plugin automatically

// Health check endpoint with environment info
fastify.get('/health', async (_request, _reply) => {
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
    database: dbStatus,
  };
});

// Root endpoint
fastify.get('/', async (_request, _reply) => {
  return {
    message: '🛥️ Welcome to YachtCash API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Maritime petty cash management',
      'Multi-currency support',
      'Offline-first PWA',
      'Receipt management',
      'Role-based access control',
      'Multitenant SaaS architecture',
    ],
    applications: {
      'Super Admin Panel': '/admin/',
      'Tenant Dashboard': '/tenant/',
      'Captain Mobile PWA': '/captain/',
    },
    api: {
      status: '/api/status',
      health: '/health',
    },
    note: 'Visit the applications above to access the YachtCash interfaces',
  };
});

// API Status endpoint
fastify.get('/api/status', async (request, reply) => {
  try {
    const tenantCount = await prisma.tenant.count();
    const userCount = await prisma.user.count();
    const yachtCount = await prisma.yacht.count();

    return {
      success: true,
      data: {
        status: 'operational',
        database: 'connected',
        tenants: tenantCount,
        users: userCount,
        yachts: yachtCount,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: 'Database connection failed',
    });
  }
});

// ================================
// SUPER ADMIN ENDPOINTS
// ================================

// Super Admin Dashboard Stats
fastify.get('/api/super-admin/stats', async (request, reply) => {
  try {
    const [tenants, totalUsers, totalYachts, totalTransactions] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.yacht.count(),
      prisma.transaction.count(),
    ]);

    const recentTenants = await prisma.tenant.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        subdomain: true,
        status: true,
        subscriptionPlan: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            yachts: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        tenants: {
          total: tenants,
          recent: recentTenants,
        },
        users: { total: totalUsers },
        yachts: { total: totalYachts },
        transactions: { total: totalTransactions },
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// List All Tenants
fastify.get('/api/super-admin/tenants', async (request, reply) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            yachts: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: tenants,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// Create New Tenant
fastify.post('/api/super-admin/tenants', async (request, reply) => {
  try {
    const { name, subdomain, email, phone, address, country, subscriptionPlan } = request.body;

    const tenant = await prisma.tenant.create({
      data: {
        name,
        subdomain: subdomain.toLowerCase(),
        email,
        phone,
        address,
        country,
        subscriptionPlan: subscriptionPlan || 'basic',
        isOnTrial: true,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      },
    });

    return {
      success: true,
      data: tenant,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// Get Tenant Details
fastify.get('/api/super-admin/tenants/:tenantId', async (request, reply) => {
  try {
    const { tenantId } = request.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          include: {
            profile: true,
          },
        },
        yachts: {
          include: {
            owner: {
              include: { profile: true },
            },
            primaryCaptain: {
              include: { profile: true },
            },
          },
        },
        _count: {
          select: {
            users: true,
            yachts: true,
            reports: true,
            alerts: true,
          },
        },
      },
    });

    if (!tenant) {
      return reply.status(404).send({
        success: false,
        error: 'Tenant not found',
      });
    }

    return {
      success: true,
      data: tenant,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// ================================
// TENANT AUTHENTICATION ENDPOINTS
// ================================

// Tenant Login
fastify.post('/api/tenant/auth/login', async (request, reply) => {
  try {
    const { email, password, subdomain } = request.body;

    if (!email || !password) {
      return reply.status(400).send({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find tenant by subdomain if provided
    let tenant = null;
    if (subdomain) {
      tenant = await prisma.tenant.findUnique({
        where: { subdomain: subdomain.toLowerCase() },
      });

      if (!tenant) {
        return reply.status(404).send({
          success: false,
          error: 'Tenant not found',
        });
      }
    }

    // Find user by email and tenant
    let user = await prisma.user.findFirst({
      where: {
        email,
        tenantId: tenant?.id || null,
        status: 'ACTIVE',
      },
      include: {
        profile: true,
        tenant: true,
      },
    });

    // If no user found with tenant context, try finding by email only (for demo users)
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          email,
          status: 'ACTIVE',
        },
        include: {
          profile: true,
          tenant: true,
        },
      });
    }

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // In a real implementation, you would verify the password hash here
    // For demo purposes, we'll accept any password for existing users

    // Generate a simple token (in production, use JWT with proper signing)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    // For demo users without tenant, create a default tenant response
    let tenantResponse = user.tenant;
    if (!tenantResponse && !user.tenantId) {
      tenantResponse = {
        id: 'demo',
        name: 'Demo Account',
        subdomain: 'demo',
        status: 'ACTIVE',
        subscriptionPlan: 'demo',
      };
    }

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId || 'demo',
        assignedRoles: user.assignedRoles,
        profile: user.profile,
      },
      tenant: tenantResponse,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// Tenant Token Verification
fastify.post('/api/tenant/auth/verify', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'No valid token provided',
      });
    }

    const token = authHeader.slice(7);

    // Decode the simple token (in production, verify JWT signature)
    let decodedToken;
    try {
      decodedToken = Buffer.from(token, 'base64').toString();
    } catch (err) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid token format',
      });
    }

    const [userId, timestamp] = decodedToken.split(':');

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return reply.status(401).send({
        success: false,
        error: 'Token expired',
      });
    }

    // Find user and verify they're still active
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        status: 'ACTIVE',
      },
      include: {
        profile: true,
        tenant: true,
      },
    });

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: 'User not found or inactive',
      });
    }

    // For demo users without tenant, create a default tenant response
    let tenantResponse = user.tenant;
    if (!tenantResponse && !user.tenantId) {
      tenantResponse = {
        id: 'demo',
        name: 'Demo Account',
        subdomain: 'demo',
        status: 'ACTIVE',
        subscriptionPlan: 'demo',
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId || 'demo',
        assignedRoles: user.assignedRoles,
        profile: user.profile,
      },
      tenant: tenantResponse,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// ================================
// TENANT-SPECIFIC ENDPOINTS
// ================================

// Tenant Dashboard Stats (tenant-scoped version of the original admin stats)
fastify.get('/api/tenant/stats', async (request, reply) => {
  try {
    const { tenantId } = request;

    if (!tenantId) {
      return reply.status(400).send({
        success: false,
        error: 'Tenant context required',
      });
    }

    const [users, yachts, transactions, cashBalances] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.yacht.count({ where: { tenantId } }),
      prisma.transaction.count({
        where: { yacht: { tenantId } },
      }),
      prisma.cashBalance.findMany({
        where: { yacht: { tenantId } },
        include: { currencyCode: true },
      }),
    ]);

    // Aggregate cash balances by currency
    const balancesByCurrency = cashBalances.reduce((acc, balance) => {
      const code = balance.currencyCode.code;
      acc[code] = (acc[code] || 0) + parseFloat(balance.amount);
      return acc;
    }, {});

    return {
      success: true,
      data: {
        users: { total: users, active: users },
        yachts: { total: yachts, active: yachts },
        transactions: {
          total: transactions,
          pending: 0,
          flagged: 0,
        },
        cashBalances: balancesByCurrency,
      },
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// Tenant Yachts
fastify.get('/api/tenant/yachts', async (request, reply) => {
  try {
    const { tenantId } = request;

    if (!tenantId) {
      return reply.status(400).send({
        success: false,
        error: 'Tenant context required',
      });
    }

    const yachts = await prisma.yacht.findMany({
      where: { tenantId },
      include: {
        owner: { include: { profile: true } },
        primaryCaptain: { include: { profile: true } },
        manager: { include: { profile: true } },
        cashBalances: { include: { currencyCode: true } },
        _count: {
          select: {
            transactions: true,
            yachtUsers: true,
          },
        },
      },
    });

    return {
      success: true,
      data: yachts,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// Tenant Users
fastify.get('/api/tenant/users', async (request, reply) => {
  try {
    const { tenantId } = request;

    if (!tenantId) {
      return reply.status(400).send({
        success: false,
        error: 'Tenant context required',
      });
    }

    const users = await prisma.user.findMany({
      where: { tenantId },
      include: {
        profile: true,
        yachtAssignments: {
          include: {
            yacht: true,
            role: true,
          },
        },
      },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// ================================
// LEGACY ADMIN ENDPOINTS (for current admin panel)
// ================================

// Legacy Admin Stats (using legacy tenant data)
fastify.get('/api/admin/stats', async (request, reply) => {
  try {
    const legacyTenantId = 'tenant_legacy';

    const [users, yachts, transactions, cashBalances] = await Promise.all([
      prisma.user.count({ where: { tenantId: legacyTenantId } }),
      prisma.yacht.count({ where: { tenantId: legacyTenantId } }),
      prisma.transaction.count({
        where: { yacht: { tenantId: legacyTenantId } },
      }),
      prisma.cashBalance.findMany({
        where: { yacht: { tenantId: legacyTenantId } },
        include: { currencyCode: true },
      }),
    ]);

    const balancesByCurrency = cashBalances.reduce((acc, balance) => {
      const code = balance.currencyCode.code;
      acc[code] = (acc[code] || 0) + parseFloat(balance.amount);
      return acc;
    }, {});

    return {
      success: true,
      data: {
        users: { total: users, active: users },
        yachts: { total: yachts, active: yachts },
        transactions: {
          total: transactions,
          pending: 0,
          flagged: 0,
        },
        cashBalances: balancesByCurrency,
      },
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// Legacy Admin Yachts
fastify.get('/api/admin/yachts', async (request, reply) => {
  try {
    const legacyTenantId = 'tenant_legacy';

    const yachts = await prisma.yacht.findMany({
      where: { tenantId: legacyTenantId },
      include: {
        owner: { include: { profile: true } },
        primaryCaptain: { include: { profile: true } },
        manager: { include: { profile: true } },
        cashBalances: { include: { currencyCode: true } },
        _count: {
          select: {
            transactions: true,
            yachtUsers: true,
          },
        },
      },
    });

    const formattedYachts = yachts.map(yacht => ({
      id: yacht.id,
      name: yacht.name,
      imoNumber: yacht.imoNumber,
      owner: yacht.owner.profile
        ? `${yacht.owner.profile.firstName} ${yacht.owner.profile.lastName}`
        : yacht.owner.email,
      captain: yacht.primaryCaptain?.profile
        ? `${yacht.primaryCaptain.profile.firstName} ${yacht.primaryCaptain.profile.lastName}`
        : yacht.primaryCaptain?.email || 'Not assigned',
      cashBalances: yacht.cashBalances.map(balance => ({
        amount: Number(balance.amount),
        currency: balance.currencyCode.code,
        symbol: balance.currencyCode.symbol,
        formatted: `${balance.currencyCode.symbol}${Number(balance.amount).toLocaleString()}`,
      })),
      totalTransactions: yacht._count.transactions,
      crewMembers: yacht._count.yachtUsers,
      isActive: yacht.isActive,
      createdAt: yacht.createdAt,
    }));

    return {
      success: true,
      data: formattedYachts,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// Legacy Admin Users
fastify.get('/api/admin/users', async (request, reply) => {
  try {
    const legacyTenantId = 'tenant_legacy';

    const users = await prisma.user.findMany({
      where: { tenantId: legacyTenantId },
      include: {
        profile: true,
        ownedYachts: { select: { name: true } },
        managedYachts: { select: { name: true } },
        captainYachts: { select: { name: true } },
        _count: {
          select: {
            createdTransactions: true,
          },
        },
      },
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'No profile',
      roles: user.assignedRoles,
      status: user.status,
      country: user.profile?.country || 'Not specified',
      phone: user.profile?.phone || 'Not provided',
      lastLogin: user.lastLogin,
      yachts: {
        owned: user.ownedYachts.map(y => y.name),
        managed: user.managedYachts.map(y => y.name),
        captain: user.captainYachts.map(y => y.name),
      },
      transactionCount: user._count.createdTransactions,
      createdAt: user.createdAt,
    }));

    return {
      success: true,
      data: formattedUsers,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// Legacy Admin Recent Transactions
fastify.get('/api/admin/transactions/recent', async (request, reply) => {
  try {
    const legacyTenantId = 'tenant_legacy';

    const transactions = await prisma.transaction.findMany({
      where: { yacht: { tenantId: legacyTenantId } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        yacht: true,
        createdBy: { include: { profile: true } },
        currencyCode: true,
        expenseCategory: true,
        recipient: true,
      },
    });

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

// Database test endpoint
fastify.get('/api/database-test', async (_request, _reply) => {
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
        currencies: currencyCount,
      },
      models: [
        'User',
        'Profile',
        'Role',
        'Permission',
        'Session',
        'Yacht',
        'YachtUser',
        'CashBalance',
        'Transaction',
        'Receipt',
        'CurrencyCode',
        'CashRecipient',
        'ExpenseCategory',
        'TransactionFlag',
        'Alert',
        'Report',
        'AuditLog',
        'SystemConfiguration',
      ],
    };
  } catch (error) {
    return {
      database: 'error',
      error: error.message,
    };
  }
});

// Seed demo data endpoint
fastify.post('/api/seed-demo', async (_request, _reply) => {
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
          createdByUserId: 'system',
        },
      }),
      prisma.currencyCode.upsert({
        where: { code: 'EUR' },
        update: {},
        create: {
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          decimalPlaces: 2,
          createdByUserId: 'system',
        },
      }),
      prisma.currencyCode.upsert({
        where: { code: 'GBP' },
        update: {},
        create: {
          code: 'GBP',
          name: 'British Pound',
          symbol: '£',
          decimalPlaces: 2,
          createdByUserId: 'system',
        },
      }),
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
              notifications: true,
            },
          },
        },
      },
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
              language: 'en',
            },
          },
        },
      },
    });

    // Create sample yacht (check if it exists first)
    let yacht = await prisma.yacht.findFirst({
      where: { name: 'Serenity' },
    });

    if (!yacht) {
      yacht = await prisma.yacht.create({
        data: {
          name: 'Serenity',
          imoNumber: 'IMO-DEMO-001',
          ownerUserId: owner.id,
          primaryCaptainUserId: captain.id,
        },
      });

      // Create cash balances separately
      await prisma.cashBalance.createMany({
        data: [
          {
            yachtId: yacht.id,
            currencyCodeId: currencies[0].id, // USD
            amount: 25000.0,
            thresholdAlert: 5000.0,
            lastUpdated: new Date(),
            updatedByUserId: captain.id,
          },
          {
            yachtId: yacht.id,
            currencyCodeId: currencies[1].id, // EUR
            amount: 18000.0,
            thresholdAlert: 3000.0,
            lastUpdated: new Date(),
            updatedByUserId: captain.id,
          },
        ],
      });
    }

    // Get final counts
    const finalCounts = {
      users: await prisma.user.count(),
      yachts: await prisma.yacht.count(),
      currencies: await prisma.currencyCode.count(),
      cashBalances: await prisma.cashBalance.count(),
    };

    return {
      success: true,
      message: 'Demo data seeded successfully! 🛥️',
      data: finalCounts,
      seeded: {
        currencies: currencies.map(c => `${c.code} (${c.symbol})`),
        users: ['Alexander Maritime (Owner)', 'Maria Rodriguez (Captain)'],
        yachts: ['Serenity - IMO-DEMO-001'],
        cashBalances: ['$25,000 USD', '€18,000 EUR'],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
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
