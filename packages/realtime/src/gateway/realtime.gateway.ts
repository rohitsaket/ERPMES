import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@diamondflow/auth';
import { RoomManager, PresenceTracker } from './room-manager';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  companyId?: string;
  factoryId?: string;
  departmentId?: string;
  roles?: string[];
  permissions?: string[];
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private roomManager: RoomManager,
    private presenceTracker: PresenceTracker,
  ) {}

  async handleConnection(client: any): Promise<void> {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
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

      // Join org-scoped rooms
      client.join(`company:${client.companyId}`);
      
      if (payload.factoryId) {
        client.join(`factory:${payload.factoryId}`);
      }
      if (payload.departmentId) {
        client.join(`department:${payload.departmentId}`);
      }
      if (payload.workCenterId) {
        client.join(`workcenter:${payload.workCenterId}`);
      }
      if (payload.productionOrderId) {
        client.join(`production-order:${payload.productionOrderId}`);
      }
      if (payload.diamondId) {
        client.join(`diamond:${payload.diamondId}`);
      }

      this.presenceTracker.setUserOnline(payload.sub, client.id);

      // Track user's rooms
      const userRooms = this.presenceTracker.getUserRooms(payload.sub) || new Set();
      userRooms.add(`company:${client.companyId}`);
      if (payload.factoryId) userRooms.add(`factory:${payload.factoryId}`);
      if (payload.departmentId) userRooms.add(`department:${payload.departmentId}`);
      if (payload.workCenterId) userRooms.add(`workcenter:${payload.workCenterId}`);
      if (payload.productionOrderId) userRooms.add(`production-order:${payload.productionOrderId}`);
      if (payload.diamondId) userRooms.add(`diamond:${payload.diamondId}`);
    } catch (error) {
      console.error('Socket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: any): void {
    this.presenceTracker.setUserOffline(client.id);
    
    if (client.userId) {
      const userRooms = this.presenceTracker.getUserRooms(client.userId);
      if (userRooms) {
        userRooms.delete(`company:${client.companyId}`);
        if (userRooms.size === 0) {
          this.presenceTracker.removeUser(client.userId);
        }
      }
    }
    
    console.log(`Client disconnected: ${client.id} (user: ${client.userId})`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    client: any,
    data: { room: string }
  ): { success: boolean; error?: string } {
    // Validate room access
    if (this.canAccessRoom(client, data.room)) {
      client.join(data.room);
      return { success: true };
    } else {
      return { success: false, error: 'Access denied to room' };
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    client: any,
    data: { room: string }
  ): boolean {
    client.leave(data.room);
    return { success: true };
  }

  @SubscribeMessage('subscribe:operation')
  handleSubscribeOperation(
    client: any,
    data: { orderId: string }
  ): { success: boolean } {
    client.join(`production-order:${data.orderId}`);
    return { success: true };
  }

  @SubscribeMessage('subscribe:diamond')
  handleSubscribeDiamond(
    client: any,
    data: { diamondId: string }
  ): { success: boolean } {
    client.join(`diamond:${data.diamondId}`);
    return { success: true };
  }

  @SubscribeMessage('subscribe:workcenter')
  handleSubscribeWorkcenter(
    client: any,
    data: { workCenterId: string }
  ): { success: boolean } {
    client.join(`workcenter:${data.workCenterId}`);
    return { success: true };
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(): { pong: boolean } {
    return { pong: true };
  }

  @SubscribeMessage('get:presence')
  handleGetPresence(
    data: { userId: string }
  ): { online: boolean; lastSeen?: Date } {
    const online = this.presenceTracker.isUserOnline(data.userId);
    const lastSeen = this.presenceTracker.getUserLastSeen(data.userId);
    return { online, lastSeen };
  }

  private canAccessRoom(client: any, room: string): boolean {
    // Company-scoped rooms
    if (client.companyId && client.companyId === client.companyId) return true;
    
    // Factory-scoped rooms
    if (room.startsWith('factory:')) {
      const factoryId = room.split(':')[1];
      return client.factoryId === room.split(':')[1] || client.roles?.includes('SUPER_ADMIN');
    }
    
    // Department-scoped rooms
    if (room.startsWith('department:')) {
      const deptId = room.split(':')[1];
      return client.departmentId === deptId || client.roles?.includes('FACTORY_MANAGER');
    }
    
    // Production order rooms
    if (room.startsWith('production-order:')) {
      return true;
    }
    
    // Diamond rooms
    if (room.startsWith('diamond:')) {
      return true;
    }
    
    // Work center rooms
    if (room.startsWith('workcenter:')) {
      return true;
    }
    
    // User-specific rooms
    if (room.startsWith('user:')) {
      return room.includes(client.userId || '');
    }
    
    return false;
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

  notifyOperationStarted(orderId: string, operationId: string, workCenterId: string): void {
    this.server.to(`production-order:${orderId}`).emit('operation:started', { operationId, workCenterId });
    this.server.to(`workcenter:${workCenterId}`).emit('operation:started', { operationId, orderId });
  }

  notifyOperationCompleted(orderId: string, operationId: string, yieldRate: number): void {
    this.server.to(`production-order:${orderId}`).emit('operation:completed', { operationId, yieldRate });
  }

  notifyDiamondTransferred(diamondId: string, fromDept: string, toDept: string): void {
    this.server.to(`diamond:${diamondId}`).emit('diamond:transferred', { fromDept, toDept });
  }

  notifyNcrCreated(ncrId: string, orderId: string): void {
    this.server.to(`production-order:${orderId}`).emit('ncr:created', { ncrId });
  }

  notifyShipmentTracking(shipmentId: string, status: string, location: string): void {
    this.server.to(`shipment:${shipmentId}`).emit('shipment:tracking', { status, location });
  }

  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }

  getUserRooms(userId: string): string[] {
    return this.presenceTracker.getUserSockets(userId);
  }
}