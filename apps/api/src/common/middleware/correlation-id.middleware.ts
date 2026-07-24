import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
    (req as Request & { correlationId?: string }).correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.log({
        correlationId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });
    });

    next();
  }
}
