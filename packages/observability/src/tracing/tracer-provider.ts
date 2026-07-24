interface SpanLike {
  setStatus(status: { code: number; message?: string }): void;
  recordException(error: Error): void;
  end(): void;
  spanContext(): { traceId: string; spanId: string };
}

const noopSpan: SpanLike = {
  setStatus: () => undefined,
  recordException: () => undefined,
  end: () => undefined,
  spanContext: () => ({ traceId: '', spanId: '' }),
};

export class TracerProvider {
  constructor(private readonly serviceName = 'diamondflow') {}

  getTracer(name: string) {
    return {
      name: `${this.serviceName}:${name}`,
      startActiveSpan: <T>(
        _spanName: string,
        _options: Record<string, unknown>,
        callback: (span: SpanLike) => T,
      ): T => callback(noopSpan),
    };
  }

  getProvider(): TracerProvider {
    return this;
  }

  async shutdown(): Promise<void> {}
}

export function createSpan(
  tracer: ReturnType<TracerProvider['getTracer']>,
  name: string,
  attributes?: Record<string, unknown>,
): SpanLike {
  return tracer.startActiveSpan(name, { attributes }, (span) => span);
}

export function setSpanError(span: SpanLike, error: Error): void {
  span.setStatus({ code: 2, message: error.message });
  span.recordException(error);
}

export function injectTrace(_context: unknown, _carrier: Record<string, string>): void {}

export function extractTrace(_carrier: Record<string, string>): undefined {
  return undefined;
}

export function getCurrentSpan(): undefined {
  return undefined;
}

export function getTraceId(): string | undefined {
  return undefined;
}

export function getSpanId(): string | undefined {
  return undefined;
}
