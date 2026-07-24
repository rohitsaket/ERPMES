import { Module } from '@nestjs/common';
import { RealtimeGateway } from './gateway/socket.gateway';
import { ConnectionHandler } from './gateway/connection-handler';
import { RoomManager, PresenceTracker } from './gateway/room-manager';

@Module({
  providers: [
    RealtimeGateway,
    ConnectionHandler,
    RoomManager,
    PresenceTracker,
  ],
  exports: [
    RealtimeGateway,
    ConnectionHandler,
    RoomManager,
    PresenceTracker,
  ],
})
export class RealtimeModule {}
