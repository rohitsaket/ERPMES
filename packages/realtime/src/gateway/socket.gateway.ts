import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RoomManager, PresenceTracker } from './room-manager';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  companyId?: string;
  factoryId?: string;
  departmentId?: string;
  roles?: string[];
  permissions?: string[];
}

@WebSocketGateway({
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private jwtService: JwtService,
    private roomManager: RoomManager,
    private presenceTracker: PresenceTracker,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      
      client.userId = payload.sub;
      client.companyId = payload.orgId;
      client.factoryId = payload.factories?.[0];
      client.departmentId = payload.departments?.[0];
      client.roles = payload.roles || [];
      client.permissions = payload.permissions || [];

      // Join user-specific room
      client.join(`user:${client.userId}`);

      // Join company room
      client.join(`company:${payload.orgId}`);

      // Join factory room if applicable
      if (payload.factories?.length) {
        for (const factoryId of payload.factories) {
          client.join(`factory:${factoryId}`);
        }
      }

      // Join department room if applicable
      if (payload.departments?.length) {
        for (const deptId of payload.departments) {
          client.join(`department:${deptId}`);
        }
      }

      // Track presence
      this.presenceTracker.setUserOnline(payload.sub, client.id);

      console.log(`Client connected: ${client.userId} (${client.id})`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.presenceTracker.setUserOffline(client.id);
    
    if (client.userId) {
      client.leave(`user:${client.userId}`);
    }
    
    console.log(`Client disconnected: ${client.userId} (${client.id})`);
  }

  @SubscribeMessage('join:room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomType: string; roomId: string }
  ): Promise<{ success: boolean; error?: string }> {
    const { roomType, roomId } = data;

    // Validate permission to join room
    const hasAccess = await this.checkRoomAccess(client, roomType, roomId);
    if (!hasAccess) {
      return { success: false, error: 'Access denied to room' };
    }

    client.join(`${roomType}:${roomId}`);
    return { success: true };
  }

  @SubscribeMessage('leave:room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomType: string; roomId: string }
  ): Promise<{ success: boolean }> {
    client.leave(`${data.roomType}:${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('subscribe:operation')
  async handleSubscribeOperation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { orderId: string }
  ): Promise<{ success: boolean }> {
    // Check access to production order
    // In real implementation, check if user has access to this order
    client.join(`production-order:${data.orderId}`);
    return { success: true };
  }

  @SubscribeMessage('subscribe:diamond')
  async handleSubscribeDiamond(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { diamondId: string }
  ): Promise<{ success: boolean }> {
    client.join(`diamond:${data.diamondId}`);
    return { success: true };
  }

  @SubscribeMessage('subscribe:workcenter')
  async handleSubscribeWorkcenter(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { workCenterId: string }
  ): Promise<{ success: boolean }> {
    client.join(`workcenter:${data.workCenterId}`);
    return { success: true };
  }

  @SubscribeMessage('ping')
  handlePing(): { pong: boolean } {
    return { pong: true };
  }

  @SubscribeMessage('get:presence')
  handleGetPresence(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string }
  ): { online: boolean; lastSeen?: Date } {
    const online = this.presenceTracker.isUserOnline(data.userId);
    const lastSeen = this.presenceTracker.getUserLastSeen(data.userId) ?? undefined;
    return { online, lastSeen };
  }

  private async checkRoomAccess(client: AuthenticatedSocket, roomType: string, roomId: string): Promise<boolean> {
    // In a real implementation, check permissions
    switch (roomType) {
      case 'company':
        return client.companyId === roomId;
      case 'factory':
        return client.factoryId === roomId || (client.roles ?? []).includes('SUPER_ADMIN');
      case 'department':
        return client.departmentId === roomId || (client.roles ?? []).includes('FACTORY_MANAGER');
      case 'production-order':
      case 'diamond':
      case 'workcenter':
        // Check specific permissions
        return true;
      default:
        return false;
    }
  }

  // Broadcast methods for other services to use
  broadcastToCompany(companyId: string, event: string, data: any): void {
    this.server.to(`company:${companyId}`).emit(event, data);
  }

  broadcastToFactory(factoryId: string, event: string, data: any): void {
    this.server.to(`factory:${factoryId}`).emit(event, data);
  }

  broadcastToDepartment(departmentId: string, event: string, data: any): void {
    this.server.to(`department:${departmentId}`).emit(event, data);
  }

  broadcastToUser(userId: string, event: string, data: any): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  broadcastToProductionOrder(orderId: string, event: string, data: any): void {
    this.server.to(`production-order:${orderId}`).emit(event, data);
  }

  broadcastToDiamond(diamondId: string, event: string, data: any): void {
    this.server.to(`diamond:${diamondId}`).emit(event, data);
  }

  broadcastToWorkcenter(workCenterId: string, event: string, data: any): void {
    this.server.to(`workcenter:${workCenterId}`).emit(event, data);
  }
}
