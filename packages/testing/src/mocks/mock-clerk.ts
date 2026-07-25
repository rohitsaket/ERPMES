import { vi } from 'vitest';

export const mockClerk = {
  users: {
    getUser: vi.fn().mockResolvedValue({
      id: 'user_1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/avatar.png',
      roles: ['FACTORY_MANAGER'],
      factories: ['factory_1'],
      departments: ['dept_1'],
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignInAt: new Date(),
    }),
    getUserList: vi.fn().mockResolvedValue([]),
    createUser: vi.fn().mockResolvedValue({}),
    updateUser: vi.fn().mockResolvedValue({}),
    deleteUser: vi.fn().mockResolvedValue({}),
  },
  organizations: {
    getOrganization: vi.fn().mockResolvedValue({
      id: 'org_1',
      name: 'Test Company',
      slug: 'test-company',
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    getOrganizationMembershipList: vi.fn().mockResolvedValue([]),
    createOrganization: vi.fn().mockResolvedValue({}),
    updateOrganization: vi.fn().mockResolvedValue({}),
    deleteOrganization: vi.fn().mockResolvedValue({}),
  },
  tokens: {
    verifyAccessToken: vi.fn().mockReturnValue({
      sub: 'user_1',
      email: 'test@example.com',
      companyId: 'org_1',
      role: 'FACTORY_MANAGER',
      permissions: ['read', 'write'],
      factories: ['factory_1'],
      branches: [],
      departments: ['dept_1'],
    }),
  },
} as const;

export const createMockUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user_' + Math.random().toString(36).substr(2, 9),
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.png',
  roles: ['FACTORY_MANAGER'],
  factories: ['factory_1'],
  departments: ['dept_1'],
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignInAt: new Date(),
  ...overrides,
});

export const createMockOrganization = (overrides: Record<string, unknown> = {}) => ({
  id: 'org_' + Math.random().toString(36).substr(2, 9),
  name: 'Test Company',
  slug: 'test-company',
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockMembership = (overrides: Record<string, unknown> = {}) => ({
  id: 'mem_' + Math.random().toString(36).substr(2, 9),
  organizationId: 'org_1',
  userId: 'user_1',
  role: 'MEMBER',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockAuthContext = (overrides: Record<string, unknown> = {}) => ({
  userId: 'user_1',
  email: 'test@example.com',
  organizationId: 'org_1',
  organizationRole: 'FACTORY_MANAGER',
  permissions: ['read', 'write'],
  factories: ['factory_1'],
  branches: [],
  departments: ['dept_1'],
  ...overrides,
});