// Testing Package - Test Utilities, Factories, Mocks, MSW Handlers

// Factories
export { CompanyFactory, BranchFactory, FactoryFactory, ProductFactory, CustomerFactory, VendorFactory, ProductionOrderFactory, DiamondFactory, QuotationFactory, SalesOrderFactory, InspectionPlanFactory, InspectionFactory, NcrFactory } from './factories';
export { TestDataFactory, createTestFactory } from './factories/test-data.factory';

// Fixtures
export { validCompany, validSalesOrder, validProductionOrder } from './fixtures';

// Mocks
export { mockPrisma } from './mocks/mock-prisma';
export { mockEventBus } from './mocks/mock-events';
export { mockQueue } from './mocks/mock-queue';
export { mockRealtime } from './mocks/mock-realtime';
export { mockClerk } from './mocks/mock-clerk';
export { mockLabApi } from './mocks/mock-lab-api';

// Helpers
export { createTestingModule } from './helpers/test-module';
export { createTestModule as createDbTestModule, createTestApp as createDbTestApp, closeTestApp, createTestDatabase, cleanupTestDatabase, seedTestData } from './helpers/test-database';
export { createTestModule, createTestApp, createMockRequest, createMockResponse, createMockNext, cleanupTestApp } from './helpers/api-test-helpers';
export { createMockAuthUser, createMockAuthToken } from './helpers/auth-test-helpers';

// Test Configuration
export { testConfig, getTestConfig } from './config/test-config';
