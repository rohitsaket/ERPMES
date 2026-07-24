import { Test, TestingModule } from '@nestjs/testing';

export async function createTestingModule(imports: any[] = [], providers: any[] = []): Promise<TestingModule> {
  return Test.createTestingModule({ imports, providers }).compile();
}
