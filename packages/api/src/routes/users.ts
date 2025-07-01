import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { CreateUserSchema, UpdateUserSchema, PaginationSchema, UserFiltersSchema } from '@yachtcash/shared';
import { config } from '../config';

const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get all users with pagination and filters
  fastify.get('/', {
    onRequest: [fastify.authorize(['users.view'])],
    schema: {
      tags: ['Users'],
      summary: 'List users with pagination',
      querystring: PaginationSchema.merge(UserFiltersSchema),
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { page, limit, sortBy, sortOrder, status, roleId, yachtId } = PaginationSchema.merge(UserFiltersSchema).parse(request.query);

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (roleId) where.assignedRoles = { has: roleId };
    if (yachtId) {
      where.yachtAssignments = {
        some: { yachtId, isActive: true }
      };
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [users, total] = await Promise.all([
      fastify.prisma.user.findMany({
        where,
        include: {
          profile: true,
          yachtAssignments: {
            include: { yacht: true, role: true },
            where: { isActive: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      fastify.prisma.user.count({ where })
    ]);

    return reply.paginated(users, { page, limit, total });
  });

  // Get user by ID
  fastify.get('/:id', {
    onRequest: [fastify.authorize(['users.view'])],
    schema: {
      tags: ['Users'],
      summary: 'Get user by ID',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const user = await fastify.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        yachtAssignments: {
          include: { yacht: true, role: true }
        },
        createdTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      throw fastify.httpErrors.notFound('User not found');
    }

    return reply.success(user);
  });

  // Create new user
  fastify.post('/', {
    onRequest: [fastify.authorize(['users.create'])],
    schema: {
      tags: ['Users'],
      summary: 'Create new user',
      body: CreateUserSchema.extend({
        password: { type: 'string', minLength: 6 }
      }),
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const userData = CreateUserSchema.extend({
      password: { type: 'string', minLength: 6 }
    }).parse(request.body);

    // Check if user already exists
    const existingUser = await fastify.prisma.user.findUnique({
      where: { email: userData.email.toLowerCase() }
    });

    if (existingUser) {
      throw fastify.httpErrors.conflict('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, config.BCRYPT_ROUNDS);

    // Create user and profile in transaction
    const result = await fastify.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: userData.email.toLowerCase(),
          passwordHash,
          assignedRoles: userData.assignedRoles,
          createdByUserId: request.user.userId
        }
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          preferences: userData.preferences
        }
      });

      return { ...user, profile };
    });

    return reply.status(201).success(result, 'User created successfully');
  });

  // Update user
  fastify.patch('/:id', {
    onRequest: [fastify.authorize(['users.edit'])],
    schema: {
      tags: ['Users'],
      summary: 'Update user',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      body: UpdateUserSchema,
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const updateData = UpdateUserSchema.parse(request.body);

    // Check if user exists
    const existingUser = await fastify.prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!existingUser) {
      throw fastify.httpErrors.notFound('User not found');
    }

    // Update user and profile in transaction
    const result = await fastify.prisma.$transaction(async (tx) => {
      // Update user data
      const userUpdateData: any = {};
      if (updateData.assignedRoles) userUpdateData.assignedRoles = updateData.assignedRoles;

      let user = existingUser;
      if (Object.keys(userUpdateData).length > 0) {
        user = await tx.user.update({
          where: { id },
          data: userUpdateData,
          include: { profile: true }
        });
      }

      // Update profile data
      const profileUpdateData: any = {};
      if (updateData.firstName) profileUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) profileUpdateData.lastName = updateData.lastName;
      if (updateData.phone !== undefined) profileUpdateData.phone = updateData.phone;
      if (updateData.preferences) profileUpdateData.preferences = updateData.preferences;

      let profile = user.profile;
      if (Object.keys(profileUpdateData).length > 0) {
        profile = await tx.profile.update({
          where: { userId: id },
          data: profileUpdateData
        });
      }

      return { ...user, profile };
    });

    return reply.success(result, 'User updated successfully');
  });

  // Delete user (soft delete by deactivating)
  fastify.delete('/:id', {
    onRequest: [fastify.authorize(['users.delete'])],
    schema: {
      tags: ['Users'],
      summary: 'Deactivate user',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Prevent self-deletion
    if (id === request.user.userId) {
      throw fastify.httpErrors.badRequest('Cannot delete your own account');
    }

    const user = await fastify.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });

    return reply.success(user, 'User deactivated successfully');
  });

  // Reset user password
  fastify.post('/:id/reset-password', {
    onRequest: [fastify.authorize(['users.edit'])],
    schema: {
      tags: ['Users'],
      summary: 'Reset user password',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      body: {
        type: 'object',
        properties: {
          newPassword: { type: 'string', minLength: 6 }
        },
        required: ['newPassword']
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { newPassword } = request.body as { newPassword: string };

    const passwordHash = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);

    await fastify.prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    return reply.success(null, 'Password reset successfully');
  });
};

export { userRoutes }; 