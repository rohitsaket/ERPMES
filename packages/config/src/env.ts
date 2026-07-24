import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('api/v1'),
  
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  
  REDIS_URL: z.string().url(),
  REDIS_SESSION_TTL: z.coerce.number().default(86400),
  
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string(),
  CLERK_API_URL: z.string().url().default('https://api.clerk.com'),
  
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_REGION: z.string().default('us-east-1'),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(false),
  
  SOCKET_IO_PORT: z.coerce.number().default(3001),
  SOCKET_IO_CORS_ORIGIN: z.string().default('http://localhost:3001'),
  
  // Feature Flags
  FF_MRP_ENABLED: z.coerce.boolean().default(true),
  FF_FINITE_SCHEDULING_ENABLED: z.coerce.boolean().default(false),
  FF_AI_COPILOT_ENABLED: z.coerce.boolean().default(true),
  FF_ADVANCED_ANALYTICS: z.coerce.boolean().default(false),
  FF_MULTI_CURRENCY: z.coerce.boolean().default(false),
  
  // Observability
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().default('http://localhost:4318'),
  OTEL_SERVICE_NAME: z.string().default('diamondflow-api'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Email
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@diamondflow.dev'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}