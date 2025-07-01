import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

const errorHandlerPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.setErrorHandler(async (error, request, reply) => {
    const { log } = fastify;

    // Log error details
    log.error({
      error,
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
        headers: request.headers
      }
    }, 'Request error');

    // Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return reply.status(409).send({
            success: false,
            error: 'Record already exists',
            details: { 
              field: error.meta?.target,
              message: 'A record with this value already exists'
            }
          });
        
        case 'P2025':
          return reply.status(404).send({
            success: false,
            error: 'Record not found',
            details: { message: 'The requested record was not found' }
          });
        
        case 'P2003':
          return reply.status(400).send({
            success: false,
            error: 'Foreign key constraint failed',
            details: { message: 'Referenced record does not exist' }
          });
        
        default:
          log.error({ error }, 'Unhandled Prisma error');
          return reply.status(500).send({
            success: false,
            error: 'Database error',
            details: { message: 'An unexpected database error occurred' }
          });
      }
    }

    // Fastify HTTP errors
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
        details: error.validation ? { validation: error.validation } : undefined
      });
    }

    // File upload errors
    if (error.code === 'FST_FILES_LIMIT' || error.code === 'FST_FILE_TOO_LARGE') {
      return reply.status(413).send({
        success: false,
        error: 'File too large',
        details: { message: `Maximum file size is ${fastify.initialConfig.limits?.fileSize || '10MB'}` }
      });
    }

    // JWT errors
    if (error.message.includes('jwt')) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication failed',
        details: { message: 'Invalid or expired token' }
      });
    }

    // Default internal server error
    log.error({ error }, 'Unhandled error');
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? 
        { message: error.message, stack: error.stack } : 
        { message: 'An unexpected error occurred' }
    });
  });

  // Add success response helper
  fastify.decorateReply('success', function(data: any, message?: string) {
    return this.send({
      success: true,
      data,
      message
    });
  });

  // Add paginated response helper
  fastify.decorateReply('paginated', function(
    data: any[], 
    pagination: { page: number; limit: number; total: number }
  ) {
    return this.send({
      success: true,
      data,
      pagination: {
        ...pagination,
        pages: Math.ceil(pagination.total / pagination.limit)
      }
    });
  });
};

declare module 'fastify' {
  interface FastifyReply {
    success(data: any, message?: string): FastifyReply;
    paginated(
      data: any[], 
      pagination: { page: number; limit: number; total: number }
    ): FastifyReply;
  }
}

export { errorHandlerPlugin };
export default fp(errorHandlerPlugin); 