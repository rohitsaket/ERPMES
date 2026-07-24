export function createMockAuthUser(overrides: Record<string, any> = {}) {
  return {
    userId: 'user_1',
    email: 'test@example.com',
    organizationId: 'company_1',
    roles: ['FACTORY_MANAGER'],
    permissions: ['read:production-order', 'write:operation'],
    ...overrides,
  };
}

export function createMockAuthToken(payload: Record<string, any> = {}): string {
  return `mock-jwt-${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}
