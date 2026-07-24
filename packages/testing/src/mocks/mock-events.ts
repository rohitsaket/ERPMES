import { EventBus, DomainEvent, EventHandler } from '@diamondflow/events';

export const mockEventBus = {
  publish: vi.fn(),
  publishAll: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  getSubscribers: vi.fn().mockReturnValue([]),
} as unknown as EventBus;

export const mockEventHandler = {
  handle: vi.fn().mockResolvedValue(undefined),
} as EventHandler;

export const createMockDomainEvent = <T = any>(overrides: Partial<DomainEvent<T>> = {}): DomainEvent<T> => ({
  eventId: 'evt_' + Math.random().toString(36).substr(2, 9),
  eventType: 'TestEvent',
  version: 1,
  aggregateId: 'agg_' + Math.random().toString(36).substr(2, 9),
  aggregateType: 'TestAggregate',
  timestamp: new Date(),
  correlationId: 'corr_' + Math.random().toString(36).substr(2, 9),
  causationId: undefined,
  userId: 'user_1',
  organizationScope: { companyId: 'company_1' },
  payload: {},
  ...overrides,
} as DomainEvent<T>);