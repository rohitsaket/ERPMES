import pino, { Logger, LoggerOptions } from 'pino';
import { Injectable, Logger as NestLogger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLogger {
  private logger: Logger;
  private context?: string;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: [
          '*.password',
          '*.secret',
          '*.token',
          '*.authorization',
          '*.apiKey',
          '*.creditCard',
          '*.ssn',
        ],
        censor: '[REDACTED]',
      },
    });
  }

  setContext(context: string): this {
    this.context = context;
    return this;
  }

  private getLogger() {
    if (this.context) {
      return this.logger.child({ context: this.context });
    }
    return this.logger;
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.getLogger().debug(meta, message);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.getLogger().info(meta, message);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.getLogger().warn(meta, message);
  }

  error(message: string, meta?: Record<string, any>): void {
    this.getLogger().error(meta, message);
  }

  fatal(message: string, meta?: Record<string, any>): void {
    this.getLogger().fatal(meta, message);
  }

  child(bindings: Record<string, any>): StructuredLogger {
    const child = new StructuredLogger();
    child.logger = this.getLogger().child(bindings);
    return child;
  }
}

export const logger = new StructuredLogger();