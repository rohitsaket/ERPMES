export const testConfig = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/diamondflow_test',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'test_key',
    secretKey: process.env.CLERK_SECRET_KEY || 'test_secret',
  },
};

export function getTestConfig() {
  return testConfig;
}
