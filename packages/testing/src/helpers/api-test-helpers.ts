import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockPrisma } from '../mocks/mock-prisma';
import { mockEventBus } from '../mocks/mock-events';
import { mockQueue } from '../mocks/mock-queue';
import { mockRealtime } from '../mocks/mock-realtime';
import { mockClerk } from '../mocks/mock-clerk';

export async function createTestModule(overrides: any = {}): Promise<TestingModule> {
  const moduleBuilder = Test.createTestingModule({
    imports: [],
    providers: [],
  });

  if (overrides.providers) {
    for (const [token, value] of Object.entries(overrides.providers)) {
      moduleBuilder.overrideProvider(token).useValue(value);
    }
  }

  moduleBuilder
    .overrideProvider('PrismaClient')
    .useValue(mockPrisma)
    .overrideProvider('EventBus')
    .useValue(mockEventBus)
    .overrideProvider('Queue')
    .useValue(mockQueue)
    .overrideProvider('RealtimeGateway')
    .useValue(mockRealtime)
    .overrideProvider('ClerkClient')
    .useValue(mockClerk);

  return moduleBuilder.compile();
}

export async function createTestApp(module: TestingModule): Promise<INestApplication> {
  const app = module.createNestApplication();
  await app.init();
  return app;
}

export function createMockRequest(overrides: any = {}) {
  return {
    method: 'GET',
    url: '/api/v1/test',
    headers: {
      authorization: 'Bearer mock_token',
      'x-correlation-id': 'test_correlation_id',
    },
    body: {},
    query: {},
    params: {},
    user: {
      userId: 'user_1',
      email: 'test@example.com',
      organizationId: 'company_1',
      roles: ['FACTORY_MANAGER'],
      permissions: ['read:production-order', 'write:operation'],
    },
    ...overrides,
  };
}

export function createMockResponse() {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
  };
  return res;
}

export function createMockNext() {
  return vi.fn();
}

export async function cleanupTestApp(app: INestApplication): Promise<void> {
  await app.close();
}