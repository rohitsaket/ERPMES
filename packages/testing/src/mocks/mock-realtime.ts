import { Server, Socket } from 'socket.io';

export const mockRealtime = {
  server: {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
    in: vi.fn().mockReturnThis(),
    sockets: {
      adapter: {
        rooms: new Map(),
      },
    },
  },
  join: vi.fn(),
  leave: vi.fn(),
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  broadcast: {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  },
} as any;

export const createMockSocket = (overrides: Partial<any> = {}) => ({
  id: 'socket_' + Math.random().toString(36).substr(2, 9),
  userId: 'user_1',
  companyId: 'company_1',
  factoryId: 'factory_1',
  departmentId: 'dept_1',
  roles: ['FACTORY_MANAGER'],
  permissions: ['read:production-order', 'write:operation'],
  rooms: new Set(),
  join: vi.fn(),
  leave: vi.fn(),
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  handshake: {
    auth: { token: 'mock_token' },
    headers: {},
    query: {},
  },
  ...overrides,
} as any);

export const createMockServer = () => {
  const mockSocket1 = createMockSocket();
  const mockSocket2 = createMockSocket({ userId: 'user_2' });
  
  return {
    to: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    emit: vi.fn(),
    sockets: {
      adapter: {
        rooms: new Map([
          ['company:company_1', new Set(['socket_1', 'socket_2'])],
          ['factory:factory_1', new Set(['socket_1'])],
        ]),
      },
      sockets: new Map([
        ['socket_1', mockSocket1],
        ['socket_2', mockSocket2],
      ]),
    },
    engine: {
      clientsCount: 2,
    },
  };
};