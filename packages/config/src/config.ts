import { z } from 'zod';

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('api/v1'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(20),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_SESSION_TTL: z.coerce.number().default(86400),

  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string(),
  CLERK_API_URL: z.string().url().default('https://api.clerk.com'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // S3/MinIO
  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_REGION: z.string().default('us-east-1'),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(false),

  // Socket.IO
  SOCKET_IO_PORT: z.coerce.number().default(3001),
  SOCKET_IO_CORS_ORIGIN: z.string().url().default('http://localhost:3001'),

  // Feature Flags
  FF_MRP_ENABLED: z.coerce.boolean().default(true),
  FF_FINITE_SCHEDULING_ENABLED: z.coerce.boolean().default(false),
  FF_AI_COPILOT_ENABLED: z.coerce.boolean().default(true),
  FF_ADVANCED_SCHEDULING: z.coerce.boolean().default(false),
  FF_MULTI_CURRENCY: z.coerce.boolean().default(false),

  // Email (Mailhog for dev)
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@diamondflow.dev'),

  // Observability
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().default('http://localhost:4318'),
  OTEL_SERVICE_NAME: z.string().default('diamondflow-api'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // External Integrations
  GIA_API_KEY: z.string().optional(),
  IGI_API_KEY: z.string().optional(),
  UPS_API_KEY: z.string().optional(),
  FEDEX_API_KEY: z.string().optional(),
  DHL_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!cachedConfig) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('Invalid environment configuration:', result.error.flatten().fieldErrors);
      throw new Error('Invalid environment configuration');
    }
    cachedConfig = result.data;
  }
  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = null;
}