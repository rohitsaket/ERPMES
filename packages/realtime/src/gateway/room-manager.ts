export class RoomManager {
  private rooms: Map<string, Set<string>> = new Map();

  join(socketId: string, room: string): void {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(socketId);
  }

  leave(socketId: string, room: string): void {
    const roomSockets = this.rooms.get(room);
    if (roomSockets) {
      roomSockets.delete(socketId);
      if (roomSockets.size === 0) {
        this.rooms.delete(room);
      }
    }
  }

  leaveAll(socketId: string): void {
    for (const [room, sockets] of this.rooms.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.rooms.delete(room);
        }
      }
    }
  }

  getRoomSockets(room: string): string[] {
    return Array.from(this.rooms.get(room) || []);
  }

  getSocketRooms(socketId: string): string[] {
    const rooms: string[] = [];
    for (const [room, sockets] of this.rooms.entries()) {
      if (sockets.has(socketId)) {
        rooms.push(room);
      }
    }
    return rooms;
  }

  getRoomCount(room: string): number {
    return this.rooms.get(room)?.size || 0;
  }

  getAllRooms(): string[] {
    return Array.from(this.rooms.keys());
  }

  broadcast(room: string, event: string, data: any): void {
    // This would be called by the gateway to emit to room
  }
}

export class PresenceTracker {
  private userPresence: Map<string, Map<string, Date>> = new Map();
  private socketUserMap: Map<string, string> = new Map();

  setUserOnline(userId: string, socketId: string): void {
    if (!this.userPresence.has(userId)) {
      this.userPresence.set(userId, new Map());
    }
    this.userPresence.get(userId)!.set(socketId, new Date());
    this.socketUserMap.set(socketId, userId);
  }

  setUserOffline(socketId: string): void {
    const userId = this.socketUserMap.get(socketId);
    if (userId) {
      const userSockets = this.userPresence.get(userId);
      if (userSockets) {
        userSockets.delete(socketId);
        if (userSockets.size === 0) {
          this.userPresence.delete(userId);
        }
      }
      this.socketUserMap.delete(socketId);
    }
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.userPresence.get(userId);
    return sockets !== undefined && sockets.size > 0;
  }

  getUserSockets(userId: string): string[] {
    const sockets = this.userPresence.get(userId);
    return sockets ? Array.from(sockets.keys()) : [];
  }

  getOnlineUsers(): string[] {
    const online: string[] = [];
    for (const [userId, sockets] of this.userPresence.entries()) {
      if (sockets.size > 0) {
        online.push(userId);
      }
    }
    return online;
  }

  getUserLastSeen(userId: string): Date | null {
    const sockets = this.userPresence.get(userId);
    if (!sockets || sockets.size === 0) return null;
    
    let latest = new Date(0);
    for (const [, timestamp] of sockets.entries()) {
      if (timestamp > latest) latest = timestamp;
    }
    return latest;
  }
}