import { User, Organization } from '@clerk/clerk-sdk-node';

export const mockClerk = {
  users: {
    getUser: vi.fn().mockResolvedValue({
      id: 'user_1',
      emailAddresses: [{ emailAddress: 'test@example.com', verification: { status: 'verified' } }],
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/avatar.png',
      publicMetadata: { roles: ['FACTORY_MANAGER'], factories: ['factory_1'], departments: ['dept_1'] },
      privateMetadata: {},
      unsafeMetadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastSignInAt: Date.now(),
      twoFactorEnabled: false,
    }),
    getUserList: vi.fn().mockResolvedValue([]),
    createUser: vi.fn().mockResolvedValue({}),
    updateUser: vi.fn().mockResolvedValue({}),
    deleteUser: vi.fn().mockResolvedValue({}),
    getOrganizationMembershipList: vi.fn().mockResolvedValue([]),
  },
  organizations: {
    getOrganization: vi.fn().mockResolvedValue({
      id: 'org_1',
      name: 'Test Company',
      slug: 'test-company',
      imageUrl: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      publicMetadata: {},
      privateMetadata: {},
    }),
    getOrganizationMembershipList: vi.fn().mockResolvedValue([]),
    createOrganization: vi.fn().mockResolvedValue({}),
    updateOrganization: vi.fn().mockResolvedValue({}),
    deleteOrganization: vi.fn().mockResolvedValue({}),
  },
  webhooks: {
    verifySignature: vi.fn().mockReturnValue(true),
  },
} as any;

export const createMockClerkUser = (overrides: Partial<any> = {}) => ({
  id: 'user_' + Math.random().toString(36).substr(2, 9),
  emailAddresses: [{ emailAddress: 'test@example.com', verification: { status: 'verified' } }],
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.png',
  publicMetadata: { roles: ['FACTORY_MANAGER'], factories: ['factory_1'], departments: ['dept_1'] },
  privateMetadata: {},
  unsafeMetadata: {},
  createdAt: Date.now(),
  updatedAt: Date.now(),
  lastSignInAt: Date.now(),
  twoFactorEnabled: false,
  ...overrides,
});

export const createMockClerkOrganization = (overrides: Partial<any> = {}) => ({
  id: 'org_' + Math.random().toString(36).substr(2, 9),
  name: 'Test Company',
  slug: 'test-company',
  imageUrl: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  publicMetadata: {},
  privateMetadata: {},
  ...overrides,
});

export const createMockClerkMembership = (overrides: Partial<any> = {}) => ({
  id: 'mem_' + Math.random().toString(36).substr(2, 9),
  organizationId: 'org_1',
  userId: 'user_1',
  role: 'org:member',
  publicMetadata: {},
  privateMetadata: {},
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});