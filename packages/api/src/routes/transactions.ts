import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { CreateTransactionSchema, UpdateTransactionSchema, PaginationSchema, TransactionFiltersSchema } from '@yachtcash/shared';

const transactionRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get all transactions with pagination and filters
  fastify.get('/', {
    onRequest: [fastify.authorize(['transactions.view'])],
    schema: {
      tags: ['Transactions'],
      summary: 'List transactions with pagination',
      querystring: PaginationSchema.merge(TransactionFiltersSchema),
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const filters = PaginationSchema.merge(TransactionFiltersSchema).parse(request.query);
    const { page, limit, sortBy, sortOrder, yachtId, currencyCodeId, expenseCategoryId, status, startDate, endDate, minAmount, maxAmount } = filters;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    if (yachtId) where.yachtId = yachtId;
    if (currencyCodeId) where.currencyCodeId = currencyCodeId;
    if (expenseCategoryId) where.expenseCategoryId = expenseCategoryId;
    if (status) where.status = status.toUpperCase();
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.transactionDate = 'desc';
    }

    const [transactions, total] = await Promise.all([
      fastify.prisma.transaction.findMany({
        where,
        include: {
          yacht: true,
          createdBy: { include: { profile: true } },
          recipient: true,
          expenseCategory: true,
          currencyCode: true,
          receipt: true,
          confirmation: true,
          flags: {
            include: { flagType: true, flaggedBy: { include: { profile: true } } }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      fastify.prisma.transaction.count({ where })
    ]);

    return reply.paginated(transactions, { page, limit, total });
  });

  // Get transaction by ID
  fastify.get('/:id', {
    onRequest: [fastify.authorize(['transactions.view'])],
    schema: {
      tags: ['Transactions'],
      summary: 'Get transaction by ID',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const transaction = await fastify.prisma.transaction.findUnique({
      where: { id },
      include: {
        yacht: true,
        createdBy: { include: { profile: true } },
        recipient: true,
        expenseCategory: true,
        currencyCode: true,
        receipt: true,
        confirmation: true,
        flags: {
          include: { 
            flagType: true, 
            flaggedBy: { include: { profile: true } },
            resolvedBy: { include: { profile: true } }
          }
        }
      }
    });

    if (!transaction) {
      throw fastify.httpErrors.notFound('Transaction not found');
    }

    return reply.success(transaction);
  });

  // Create new transaction
  fastify.post('/', {
    onRequest: [fastify.authorize(['transactions.create'])],
    schema: {
      tags: ['Transactions'],
      summary: 'Create new transaction',
      body: CreateTransactionSchema,
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const transactionData = CreateTransactionSchema.parse(request.body);

    const transaction = await fastify.prisma.transaction.create({
      data: {
        ...transactionData,
        transactionDate: new Date(transactionData.transactionDate),
        createdByUserId: request.user.userId
      },
      include: {
        yacht: true,
        createdBy: { include: { profile: true } },
        recipient: true,
        expenseCategory: true,
        currencyCode: true
      }
    });

    return reply.status(201).success(transaction, 'Transaction created successfully');
  });

  // Update transaction
  fastify.patch('/:id', {
    onRequest: [fastify.authorize(['transactions.edit'])],
    schema: {
      tags: ['Transactions'],
      summary: 'Update transaction',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      body: UpdateTransactionSchema,
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const updateData = UpdateTransactionSchema.parse(request.body);

    // Convert date if provided
    const data: any = { ...updateData };
    if (data.transactionDate) {
      data.transactionDate = new Date(data.transactionDate);
    }

    const transaction = await fastify.prisma.transaction.update({
      where: { id },
      data,
      include: {
        yacht: true,
        createdBy: { include: { profile: true } },
        recipient: true,
        expenseCategory: true,
        currencyCode: true,
        receipt: true
      }
    });

    return reply.success(transaction, 'Transaction updated successfully');
  });

  // Upload receipt for transaction
  fastify.post('/:id/receipt', {
    onRequest: [fastify.authorize(['transactions.edit'])],
    schema: {
      tags: ['Transactions'],
      summary: 'Upload receipt for transaction',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      consumes: ['multipart/form-data'],
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Get uploaded file
    const data = await request.file();
    if (!data) {
      throw fastify.httpErrors.badRequest('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      throw fastify.httpErrors.badRequest('Invalid file type. Only images and PDFs are allowed.');
    }

    // Save file (simplified - in production you'd use cloud storage)
    const filename = `receipt-${id}-${Date.now()}.${data.mimetype.split('/')[1]}`;
    const filePath = `/uploads/receipts/${filename}`;

    // Create receipt record
    const receipt = await fastify.prisma.receipt.upsert({
      where: { transactionId: id },
      update: {
        filePath,
        fileName: data.filename || filename,
        mimeType: data.mimetype,
        fileSize: data.file.bytesRead || 0,
        uploadedAt: new Date(),
        uploadedByUserId: request.user.userId
      },
      create: {
        transactionId: id,
        filePath,
        fileName: data.filename || filename,
        mimeType: data.mimetype,
        fileSize: data.file.bytesRead || 0,
        uploadedByUserId: request.user.userId
      }
    });

    return reply.success(receipt, 'Receipt uploaded successfully');
  });

  // Flag transaction
  fastify.post('/:id/flag', {
    onRequest: [fastify.authorize(['transactions.flag'])],
    schema: {
      tags: ['Transactions'],
      summary: 'Flag transaction for review',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } }
      },
      body: {
        type: 'object',
        properties: {
          flagTypeId: { type: 'string' },
          reason: { type: 'string' }
        },
        required: ['flagTypeId', 'reason']
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { flagTypeId, reason } = request.body as { flagTypeId: string; reason: string };

    const flag = await fastify.prisma.transactionFlag.create({
      data: {
        transactionId: id,
        flagTypeId,
        reason,
        flaggedByUserId: request.user.userId
      },
      include: {
        flagType: true,
        flaggedBy: { include: { profile: true } }
      }
    });

    // Update transaction status to flagged
    await fastify.prisma.transaction.update({
      where: { id },
      data: { status: 'FLAGGED' }
    });

    return reply.status(201).success(flag, 'Transaction flagged successfully');
  });
};

export { transactionRoutes }; 