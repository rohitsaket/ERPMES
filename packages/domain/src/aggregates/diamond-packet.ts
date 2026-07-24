import { AggregateRoot } from '../aggregate-root';
import { DomainEvent } from '../aggregate-root';
import { DiamondPacketId, BagId } from '../value-objects';
import { Diamond } from './diamond';

export class DiamondPacket extends AggregateRoot {
  private _id: DiamondPacketId;
  private _factoryId: string;
  private _diamonds: Map<string, Diamond> = new Map();
  private _status: PacketStatus;
  private _location: string | null;
  private _bagId: string | null = null;
  private _deletedAt: Date | null = null;

  private constructor(
    id: DiamondPacketId,
    factoryId: string,
    status: PacketStatus,
    location: string | null
  ) {
    super();
    this._id = id;
    this._factoryId = factoryId;
    this._status = status;
    this._location = location;
  }

  static create(factoryId: string, location: string | null = null): DiamondPacket {
    const id = DiamondPacketId.generate();
    const packet = new DiamondPacket(id, factoryId, 'OPEN', location);
    packet.addEvent({
      eventId: crypto.randomUUID(),
      eventType: 'DiamondPacketCreated',
      version: 1,
      aggregateId: id.value,
      aggregateType: 'DiamondPacket',
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
      causationId: undefined,
      userId: '',
      organizationScope: { factoryId, packetId: id.value },
      payload: { factoryId, location },
    });
    return packet;
  }

  static reconstruct(
    id: DiamondPacketId,
    factoryId: string,
    status: PacketStatus,
    location: string | null,
    bagId: string | null,
    diamonds: Map<string, Diamond>,
    deletedAt: Date | null
  ): DiamondPacket {
    const packet = new DiamondPacket(id, factoryId, status, location);
    packet._bagId = bagId;
    packet._diamonds = diamonds;
    packet._deletedAt = deletedAt;
    return packet;
  }

  get id(): DiamondPacketId { return this._id; }
  get factoryId(): string { return this._factoryId; }
  get status(): PacketStatus { return this._status; }
  get location(): string | null { return this._location; }
  get bagId(): string | null { return this._bagId; }
  get diamonds(): Diamond[] { return Array.from(this._diamonds.values()); }
  get deletedAt(): Date | null { return this._deletedAt; }

  addDiamond(diamond: Diamond): void {
    if (this._diamonds.has(diamond.id.value)) {
      throw new Error(`Diamond ${diamond.id.value} already in packet`);
    }
    this._diamonds.set(diamond.id.value, diamond);
    this.incrementVersion();
  }

  removeDiamond(diamondId: string): Diamond | null {
    const diamond = this._diamonds.get(diamondId);
    if (diamond) {
      this._diamonds.delete(diamondId);
      this.incrementVersion();
    }
    return diamond || null;
  }

  getDiamond(diamondId: string): Diamond | null {
    return this._diamonds.get(diamondId) || null;
  }

  issue(employeeId: string): void {
    this._status = 'ISSUED';
    this.incrementVersion();
  }

  receive(employeeId: string): void {
    this._status = 'IN_PROCESS';
    this.incrementVersion();
  }

  complete(): void {
    this._status = 'COMPLETED';
    this.incrementVersion();
  }

  assignToBag(bagId: string): void {
    this._bagId = bagId;
    this._status = 'BAGGED';
    this.incrementVersion();
  }

  updateLocation(location: string): void {
    this._location = location;
    this.incrementVersion();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.incrementVersion();
  }
}

export type PacketStatus = 'OPEN' | 'ISSUED' | 'IN_PROCESS' | 'COMPLETED' | 'BAGGED' | 'CLOSED';