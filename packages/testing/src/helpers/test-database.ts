import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

export async function createTestModule(imports: any[] = [], providers: any[] = []): Promise<TestingModule> {
  return Test.createTestingModule({
    imports,
    providers: [
      ...providers,
    ],
  }).compile();
}

export async function createTestApp(module: TestingModule): Promise<INestApplication> {
  const app = module.createNestApplication();
  await app.init();
  return app;
}

export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
}

export function createTestDatabase() {
  return require('@diamondflow/testing').mockPrisma;
}

export function cleanupTestDatabase(): void {
}

export function seedTestData(): Promise<void> {
  return Promise.resolve();
}