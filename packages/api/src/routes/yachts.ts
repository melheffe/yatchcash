import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { CreateYachtSchema, UpdateYachtSchema, PaginationSchema } from '@yachtcash/shared';

const yachtRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get all yachts with pagination
  fastify.get(
    '/',
    {
      onRequest: [fastify.authorize(['yachts.view'])],
      schema: {
        tags: ['Yachts'],
        summary: 'List yachts with pagination',
        querystring: PaginationSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { page, limit, sortBy, sortOrder } = PaginationSchema.parse(request.query);

      const skip = (page - 1) * limit;

      // Build order by
      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy] = sortOrder;
      } else {
        orderBy.name = 'asc';
      }

      const [yachts, total] = await Promise.all([
        fastify.prisma.yacht.findMany({
          where: { isActive: true },
          include: {
            owner: { include: { profile: true } },
            manager: { include: { profile: true } },
            primaryCaptain: { include: { profile: true } },
            yachtUsers: {
              where: { isActive: true },
              include: { user: { include: { profile: true } }, role: true },
            },
            cashBalances: {
              include: { currencyCode: true },
            },
            _count: {
              select: { transactions: true },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        fastify.prisma.yacht.count({ where: { isActive: true } }),
      ]);

      return reply.paginated(yachts, { page, limit, total });
    }
  );

  // Get yacht by ID
  fastify.get(
    '/:id',
    {
      onRequest: [fastify.authorize(['yachts.view'])],
      schema: {
        tags: ['Yachts'],
        summary: 'Get yacht by ID',
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const yacht = await fastify.prisma.yacht.findUnique({
        where: { id, isActive: true },
        include: {
          owner: { include: { profile: true } },
          manager: { include: { profile: true } },
          primaryCaptain: { include: { profile: true } },
          yachtUsers: {
            where: { isActive: true },
            include: { user: { include: { profile: true } }, role: true },
          },
          cashBalances: {
            include: { currencyCode: true },
          },
          transactions: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
              createdBy: { include: { profile: true } },
              currencyCode: true,
              expenseCategory: true,
            },
          },
        },
      });

      if (!yacht) {
        throw fastify.httpErrors.notFound('Yacht not found');
      }

      return reply.success(yacht);
    }
  );

  // Create new yacht
  fastify.post(
    '/',
    {
      onRequest: [fastify.authorize(['yachts.create'])],
      schema: {
        tags: ['Yachts'],
        summary: 'Create new yacht',
        body: CreateYachtSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const yachtData = CreateYachtSchema.parse(request.body);

      const yacht = await fastify.prisma.yacht.create({
        data: yachtData,
        include: {
          owner: { include: { profile: true } },
          manager: { include: { profile: true } },
          primaryCaptain: { include: { profile: true } },
        },
      });

      return reply.status(201).success(yacht, 'Yacht created successfully');
    }
  );

  // Update yacht
  fastify.patch(
    '/:id',
    {
      onRequest: [fastify.authorize(['yachts.edit'])],
      schema: {
        tags: ['Yachts'],
        summary: 'Update yacht',
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        body: UpdateYachtSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const updateData = UpdateYachtSchema.parse(request.body);

      const yacht = await fastify.prisma.yacht.update({
        where: { id },
        data: updateData,
        include: {
          owner: { include: { profile: true } },
          manager: { include: { profile: true } },
          primaryCaptain: { include: { profile: true } },
        },
      });

      return reply.success(yacht, 'Yacht updated successfully');
    }
  );

  // Get yacht cash balances
  fastify.get(
    '/:id/balances',
    {
      onRequest: [fastify.authorize(['cash.view'])],
      schema: {
        tags: ['Yachts'],
        summary: 'Get yacht cash balances',
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const balances = await fastify.prisma.cashBalance.findMany({
        where: { yachtId: id },
        include: {
          currencyCode: true,
          updatedBy: { include: { profile: true } },
        },
        orderBy: { currencyCode: { isDefault: 'desc' } },
      });

      return reply.success(balances);
    }
  );

  // Update yacht cash balance
  fastify.patch(
    '/:id/balances/:currencyId',
    {
      onRequest: [fastify.authorize(['cash.manage'])],
      schema: {
        tags: ['Yachts'],
        summary: 'Update yacht cash balance',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            currencyId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            thresholdAlert: { type: 'number' },
          },
          required: ['amount'],
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id, currencyId } = request.params as { id: string; currencyId: string };
      const { amount, thresholdAlert } = request.body as {
        amount: number;
        thresholdAlert?: number;
      };

      const balance = await fastify.prisma.cashBalance.upsert({
        where: {
          yachtId_currencyCodeId: {
            yachtId: id,
            currencyCodeId: currencyId,
          },
        },
        update: {
          amount,
          thresholdAlert: thresholdAlert ?? 0,
          lastUpdated: new Date(),
          updatedByUserId: request.user.userId,
        },
        create: {
          yachtId: id,
          currencyCodeId: currencyId,
          amount,
          thresholdAlert: thresholdAlert ?? 0,
          lastUpdated: new Date(),
          updatedByUserId: request.user.userId,
        },
        include: {
          currencyCode: true,
          updatedBy: { include: { profile: true } },
        },
      });

      return reply.success(balance, 'Cash balance updated successfully');
    }
  );

  // Assign user to yacht
  fastify.post(
    '/:id/users',
    {
      onRequest: [fastify.authorize(['yachts.edit'])],
      schema: {
        tags: ['Yachts'],
        summary: 'Assign user to yacht',
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            roleId: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
          required: ['userId', 'roleId'],
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { userId, roleId, expiresAt } = request.body as {
        userId: string;
        roleId: string;
        expiresAt?: string;
      };

      const assignment = await fastify.prisma.yachtUser.create({
        data: {
          yachtId: id,
          userId,
          roleId,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          assignedByUserId: request.user.userId,
        },
        include: {
          user: { include: { profile: true } },
          role: true,
        },
      });

      return reply.status(201).success(assignment, 'User assigned to yacht successfully');
    }
  );
};

export { yachtRoutes };
