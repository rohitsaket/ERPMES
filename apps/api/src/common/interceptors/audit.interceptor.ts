import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { StructuredLogger } from '@diamondflow/observability';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private logger: StructuredLogger, private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.correlationId;
    const user = request.user;

    const auditData = {
      correlationId,
      userId: user?.userId,
      companyId: user?.companyId,
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString(),
    };

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logger.info('API request completed', {
            ...auditData,
            statusCode: context.switchToHttp().getResponse().statusCode,
            responseSize: JSON.stringify(data).length,
          });
        },
        error: (error) => {
          this.logger.error('API request failed', {
            ...auditData,
            error: error.message,
            stack: error.stack,
          });
        },
      }),
    );
  }
}