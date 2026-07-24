export { AggregateRoot } from './aggregate-root';
export type {
  DomainEvent,
  EventHandler,
  EventPublisher,
  EventSubscriber,
  OrganizationScope,
} from './aggregate-root';
export * from './value-objects/ids';
export { LotNumber, type LotNumberProps } from './value-objects/lot-number';
export * from './services/domain-services';
