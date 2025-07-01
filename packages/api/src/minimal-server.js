const fastify = require('fastify')({ logger: true });

// Load environment variables
require('dotenv').config();

// Add CORS
fastify.register(require('@fastify/cors'), {
  origin: true
});

// Health check endpoint with environment info
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    message: 'YachtCash API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured'
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
      auth: '/api/auth (coming soon)',
      users: '/api/users (coming soon)',
      yachts: '/api/yachts (coming soon)',
      transactions: '/api/transactions (coming soon)'
    }
  };
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
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
};

start(); 