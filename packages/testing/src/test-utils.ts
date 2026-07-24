import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockPrisma } from './mocks/mock-prisma';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      { provide: 'PrismaService', useValue: mockPrisma },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

export async function createIntegrationTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

export function createMockRequest(user?: Record<string, any>): any {
  return {
    user: user || { userId: 'test-user', companyId: 'test-company', roles: ['operator'] },
    headers: {},
    ip: '127.0.0.1',
  };
}

export function createMockResponse(): any {
  const res: any = {};
  res.status = () => res;
  res.json = () => res;
  res.send = () => res;
  return res;
}

export function createMockNext(): any {
  return () => undefined;
}

export async function cleanupDatabase(prisma: any): Promise<void> {
  const models = [
    'payment', 'invoice', 'shipment', 'certificate', 'nonconformance',
    'qualityInspection', 'diamondPacket', 'diamond', 'inventoryLot',
    'purchaseOrder', 'productionOrder', 'salesOrder', 'user',
    'vendor', 'customer', 'product', 'workCenter', 'department',
    'warehouse', 'factory', 'branch', 'company',
  ];

  for (const model of models) {
    try {
      await prisma[model].deleteMany({});
    } catch (e) {
      // Ignore errors for models that don't exist
    }
  }
}
