import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request as Request & { correlationId?: string }).correlationId || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : (response as any).message || exception.message;
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      details = exception.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      }));
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handlePrismaError(exception);
    } else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error({
      correlationId,
      method: request.method,
      url: request.url,
      status,
      message,
      error: exception instanceof Error ? exception.stack : exception,
    });

    response.status(status).json({
      error: {
        code: this.getErrorCode(status, exception),
        message,
        details,
        correlationId,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return `Unique constraint violation on ${error.meta?.target}`;
      case 'P2003':
        return `Foreign key constraint violation on ${error.meta?.field_name}`;
      case 'P2025':
        return 'Record not found';
      default:
        return 'Database operation failed';
    }
  }

  private getErrorCode(status: number, exception: unknown): string {
    if (exception instanceof ZodError) return 'VALIDATION_ERROR';
    if (exception instanceof PrismaClientKnownRequestError) return 'DATABASE_ERROR';
    if (exception instanceof HttpException) return 'HTTP_ERROR';
    return 'INTERNAL_ERROR';
  }
}
