import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { CreateRoleSchema, UpdateRoleSchema, CreateCurrencyCodeSchema, UpdateCurrencyCodeSchema, CreateSystemConfigSchema, UpdateSystemConfigSchema } from '@yachtcash/shared';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES, DEFAULT_CURRENCIES, DEFAULT_EXPENSE_CATEGORIES } from '@yachtcash/shared';

const adminRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Roles Management
  fastify.get('/roles', {
    onRequest: [fastify.authorize(['roles.view'])],
    schema: {
      tags: ['Admin'],
      summary: 'List all roles',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const roles = await fastify.prisma.role.findMany({
      orderBy: [{ isSystemRole: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }]
    });

    return reply.success(roles);
  });

  fastify.post('/roles', {
    onRequest: [fastify.authorize(['roles.create'])],
    schema: {
      tags: ['Admin'],
      summary: 'Create new role',
      body: CreateRoleSchema,
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const roleData = CreateRoleSchema.parse(request.body);

    const role = await fastify.prisma.role.create({
      data: {
        ...roleData,
        createdByUserId: request.user.userId
      }
    });

    return reply.status(201).success(role, 'Role created successfully');
  });

  fastify.patch('/roles/:id', {
    onRequest: [fastify.authorize(['roles.edit'])],
    schema: {
      tags: ['Admin'],
      summary: 'Update role',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      body: UpdateRoleSchema,
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const updateData = UpdateRoleSchema.parse(request.body);

    // Prevent editing system roles
    const existingRole = await fastify.prisma.role.findUnique({ where: { id } });
    if (existingRole?.isSystemRole) {
      throw fastify.httpErrors.forbidden('Cannot edit system roles');
    }

    const role = await fastify.prisma.role.update({
      where: { id },
      data: updateData
    });

    return reply.success(role, 'Role updated successfully');
  });

  // Permissions Management
  fastify.get('/permissions', {
    onRequest: [fastify.authorize(['roles.view'])],
    schema: {
      tags: ['Admin'],
      summary: 'List all available permissions',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const permissions = Object.entries(DEFAULT_PERMISSIONS).map(([name, description]) => ({
      name,
      description
    }));

    return reply.success(permissions);
  });

  // Currency Management
  fastify.get('/currencies', {
    onRequest: [fastify.authorize(['system.configure'])],
    schema: {
      tags: ['Admin'],
      summary: 'List currency codes',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const currencies = await fastify.prisma.currencyCode.findMany({
      orderBy: [{ isDefault: 'desc' }, { code: 'asc' }]
    });

    return reply.success(currencies);
  });

  fastify.post('/currencies', {
    onRequest: [fastify.authorize(['system.configure'])],
    schema: {
      tags: ['Admin'],
      summary: 'Create currency code',
      body: CreateCurrencyCodeSchema,
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const currencyData = CreateCurrencyCodeSchema.parse(request.body);

    const currency = await fastify.prisma.currencyCode.create({
      data: {
        ...currencyData,
        createdByUserId: request.user.userId
      }
    });

    return reply.status(201).success(currency, 'Currency created successfully');
  });

  // Default Expense Categories
  fastify.get('/expense-categories', {
    onRequest: [fastify.authorize(['system.configure'])],
    schema: {
      tags: ['Admin'],
      summary: 'List default expense categories',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const categories = await fastify.prisma.defaultExpenseCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });

    return reply.success(categories);
  });

  // System Configuration
  fastify.get('/config', {
    onRequest: [fastify.authorize(['system.configure'])],
    schema: {
      tags: ['Admin'],
      summary: 'Get system configuration',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const configs = await fastify.prisma.systemConfiguration.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }]
    });

    // Group by category and hide sensitive values
    const grouped = configs.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = {};
      }
      acc[config.category][config.key] = {
        value: config.isSensitive ? '***' : config.value,
        description: config.description,
        dataType: config.dataType,
        isSensitive: config.isSensitive
      };
      return acc;
    }, {} as Record<string, any>);

    return reply.success(grouped);
  });

  // System Statistics
  fastify.get('/stats', {
    onRequest: [fastify.authorize(['system.monitor'])],
    schema: {
      tags: ['Admin'],
      summary: 'Get system statistics',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const [
      totalUsers,
      activeUsers,
      totalYachts,
      totalTransactions,
      pendingTransactions,
      flaggedTransactions
    ] = await Promise.all([
      fastify.prisma.user.count(),
      fastify.prisma.user.count({ where: { status: 'ACTIVE' } }),
      fastify.prisma.yacht.count({ where: { isActive: true } }),
      fastify.prisma.transaction.count(),
      fastify.prisma.transaction.count({ where: { status: 'PENDING' } }),
      fastify.prisma.transaction.count({ where: { status: 'FLAGGED' } })
    ]);

    return reply.success({
      users: { total: totalUsers, active: activeUsers },
      yachts: { total: totalYachts },
      transactions: { 
        total: totalTransactions, 
        pending: pendingTransactions,
        flagged: flaggedTransactions 
      }
    });
  });

  // Initialize System Data
  fastify.post('/initialize', {
    onRequest: [fastify.authorize(['system.configure'])],
    schema: {
      tags: ['Admin'],
      summary: 'Initialize system with default data',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    await fastify.prisma.$transaction(async (tx) => {
      // Create default permissions
      const permissions = Object.entries(DEFAULT_PERMISSIONS).map(([name, description]) => ({
        name,
        displayName: name.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description,
        resource: name.split('.')[0],
        action: name.split('.')[1].toUpperCase() as any,
        isSystemPermission: true,
        createdByUserId: request.user.userId
      }));

      await tx.permission.createMany({
        data: permissions,
        skipDuplicates: true
      });

      // Create default roles
      const roles = Object.values(DEFAULT_ROLES).map(role => ({
        ...role,
        createdByUserId: request.user.userId
      }));

      await tx.role.createMany({
        data: roles,
        skipDuplicates: true
      });

      // Create default currencies
      const currencies = DEFAULT_CURRENCIES.map(currency => ({
        ...currency,
        createdByUserId: request.user.userId
      }));

      await tx.currencyCode.createMany({
        data: currencies,
        skipDuplicates: true
      });

      // Create default expense categories
      const categories = DEFAULT_EXPENSE_CATEGORIES.map((category, index) => ({
        ...category,
        sortOrder: index,
        createdByUserId: request.user.userId
      }));

      await tx.defaultExpenseCategory.createMany({
        data: categories,
        skipDuplicates: true
      });
    });

    return reply.success(null, 'System initialized successfully');
  });
};

export { adminRoutes }; 