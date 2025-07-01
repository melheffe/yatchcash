import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { LoginSchema, CreateUserSchema } from '@yachtcash/shared';
import { config } from '../config';

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Login
  fastify.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'User login',
        body: LoginSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      profile: { type: 'object' },
                      roles: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = LoginSchema.parse(request.body);

      // Find user
      const user = await fastify.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { profile: true },
      });

      if (!user) {
        throw fastify.httpErrors.unauthorized('Invalid email or password');
      }

      if (user.status !== 'ACTIVE') {
        throw fastify.httpErrors.forbidden('Account is not active');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw fastify.httpErrors.unauthorized('Invalid email or password');
      }

      // Update last login
      await fastify.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate JWT token
      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
        roles: user.assignedRoles,
      });

      return reply.success(
        {
          token,
          user: {
            id: user.id,
            email: user.email,
            profile: user.profile,
            roles: user.assignedRoles,
            status: user.status,
          },
        },
        'Login successful'
      );
    }
  );

  // Register (for development/setup)
  fastify.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'User registration',
        body: CreateUserSchema.extend({
          password: LoginSchema.shape.password,
        }),
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userData = CreateUserSchema.extend({
        password: LoginSchema.shape.password,
      }).parse(request.body);

      // Check if user already exists
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email: userData.email.toLowerCase() },
      });

      if (existingUser) {
        throw fastify.httpErrors.conflict('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, config.BCRYPT_ROUNDS);

      // Create user and profile in transaction
      const result = await fastify.prisma.$transaction(async tx => {
        const user = await tx.user.create({
          data: {
            email: userData.email.toLowerCase(),
            passwordHash,
            assignedRoles: userData.assignedRoles.length > 0 ? userData.assignedRoles : ['captain'],
          },
        });

        const profile = await tx.profile.create({
          data: {
            userId: user.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            preferences: userData.preferences,
          },
        });

        return { user, profile };
      });

      return reply.status(201).success(
        {
          id: result.user.id,
          email: result.user.email,
        },
        'User registered successfully'
      );
    }
  );

  // Get current user
  fastify.get(
    '/me',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Get current user information',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.userId },
        include: {
          profile: true,
          yachtAssignments: {
            include: { yacht: true, role: true },
          },
        },
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      return reply.success({
        id: user.id,
        email: user.email,
        status: user.status,
        roles: user.assignedRoles,
        profile: user.profile,
        yachtAssignments: user.yachtAssignments,
        lastLogin: user.lastLogin,
      });
    }
  );

  // Logout (for session management)
  fastify.post(
    '/logout',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Logout current user',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      // In a full implementation, you'd invalidate the JWT token
      // For now, we'll just return success
      return reply.success(null, 'Logged out successfully');
    }
  );
};

export { authRoutes };
