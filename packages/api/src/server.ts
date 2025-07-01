import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { adminRoutes } from './routes/admin';
import { yachtRoutes } from './routes/yachts';
import { transactionRoutes } from './routes/transactions';
import { authPlugin } from './plugins/auth';
import { errorHandlerPlugin } from './plugins/errorHandler';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authorize: (permissions: string[]) => any;
  }

  interface FastifyRequest {
    user: {
      userId: string;
      email: string;
      permissions: string[];
    };
  }

  interface FastifyReply {
    success: (data?: any, message?: string) => FastifyReply;
    error: (message: string, statusCode?: number) => FastifyReply;
    paginated: (data: any[], pagination: { page: number; limit: number; total: number }) => FastifyReply;
  }
}

const fastify = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    ...(config.NODE_ENV === 'development' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    })
  }
});

// Initialize Prisma
const prisma = new PrismaClient({
  log: config.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

// Decorate fastify instance with prisma
fastify.decorate('prisma', prisma);

// Custom response decorators
fastify.decorateReply('success', function(data?: any, message = 'Success') {
  return this.send({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
});

fastify.decorateReply('error', function(message: string, statusCode = 400) {
  return this.status(statusCode).send({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
});

fastify.decorateReply('paginated', function(data: any[], pagination: { page: number; limit: number; total: number }) {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);
  
  return this.send({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  });
});

// Register plugins
async function registerPlugins() {
  // Register CORS
  await fastify.register(cors, {
    origin: config.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://your-app.herokuapp.com']
      : config.CORS_ORIGINS,
    credentials: true
  });

  // Register JWT
  await fastify.register(jwt, {
    secret: config.JWT_SECRET
  });

  // Register multipart for file uploads
  await fastify.register(multipart, {
    addToBody: true,
    limits: {
      fileSize: config.MAX_FILE_SIZE
    }
  });

  // Register Swagger for API documentation
  if (config.NODE_ENV === 'development') {
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'YachtCash API',
          description: 'Maritime petty cash management system API',
          version: '1.0.0'
        },
        servers: [
          { url: 'http://localhost:3001', description: 'Development server' }
        ]
      }
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false
      }
    });
  }

  // Register custom plugins
  await fastify.register(errorHandlerPlugin);
  await fastify.register(authPlugin);

  // Serve static files for frontend apps (production only)
  if (config.NODE_ENV === 'production') {
    // Serve admin panel
    await fastify.register(staticFiles, {
      root: path.join(__dirname, '../../admin-panel/dist'),
      prefix: '/admin/',
      decorateReply: false
    });

    // Serve captain PWA  
    await fastify.register(staticFiles, {
      root: path.join(__dirname, '../../captain-pwa/dist'),
      prefix: '/captain/',
      decorateReply: false
    });

    // Default route to admin panel
    fastify.get('/', async (request, reply) => {
      return reply.redirect('/admin/');
    });
  }
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    };
  });

  // API routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(adminRoutes, { prefix: '/api/admin' });
  await fastify.register(yachtRoutes, { prefix: '/api/yachts' });
  await fastify.register(transactionRoutes, { prefix: '/api/transactions' });
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    // Connect to database
    await prisma.$connect();
    fastify.log.info('Connected to database');

    // Start server
    const host = config.NODE_ENV === 'production' ? '0.0.0.0' : config.HOST;
    const port = config.PORT;
    
    await fastify.listen({ host, port });
    
    console.log(`🚀 YachtCash API Server running on ${host}:${port}`);
    console.log(`📱 Environment: ${config.NODE_ENV}`);
    
    if (config.NODE_ENV === 'development') {
      console.log(`📖 API Documentation: http://${host}:${port}/docs`);
    }
    
    if (config.NODE_ENV === 'production') {
      console.log(`🎛️  Admin Panel: http://${host}:${port}/admin/`);
      console.log(`⚓ Captain PWA: http://${host}:${port}/captain/`);
    }
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
});

if (require.main === module) {
  start();
}

export default fastify; 