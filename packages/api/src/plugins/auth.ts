import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { config } from '../config';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: string;
      email: string;
      roles: string[];
    };
    user: {
      userId: string;
      email: string;
      roles: string[];
    };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register JWT plugin
  await fastify.register(import('@fastify/jwt'), {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_EXPIRES_IN
    }
  });

  // Authentication decorator
  fastify.decorate('authenticate', async function(request: FastifyRequest) {
    try {
      await request.jwtVerify();
    } catch (err) {
      throw fastify.httpErrors.unauthorized('Invalid or missing token');
    }
  });

  // Authorization helper
  fastify.decorate('authorize', (requiredPermissions: string[]) => {
    return async (request: FastifyRequest) => {
      await fastify.authenticate(request);
      
      const user = request.user;
      
      // Get user's permissions from database
      const userWithProfile = await fastify.prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          profile: true
        }
      });

      if (!userWithProfile) {
        throw fastify.httpErrors.unauthorized('User not found');
      }

      if (userWithProfile.status !== 'ACTIVE') {
        throw fastify.httpErrors.forbidden('User account is not active');
      }

      // Check if user has required permissions
      const userPermissions = userWithProfile.permissions || [];
      const userRoles = userWithProfile.assignedRoles || [];

      // System admin has all permissions
      if (userRoles.includes('system_admin')) {
        return;
      }

      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        throw fastify.httpErrors.forbidden('Insufficient permissions');
      }
    };
  });
};

export default fp(authPlugin); 