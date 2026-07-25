import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return null;
  const [type, token] = parts;
  return type === 'Bearer' && token ? token : null;
}

export function verifyAccessToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function buildAuthContext(payload: any) {
  return {
    userId: payload.sub || payload.id,
    email: payload.email,
    organizationId: payload.companyId || payload.orgId,
    organizationRole: payload.role,
    permissions: payload.permissions || [],
    factories: payload.factories || [],
    branches: payload.branches || [],
    departments: payload.departments || [],
  };
}

@Injectable()
export class SessionManager {
  private sessions = new Map<string, { userId: string; expiresAt: Date }>();

  createSession(userId: string, expiresIn: number = 7 * 24 * 60 * 60 * 1000): string {
    const sessionId = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    this.sessions.set(sessionId, {
      userId,
      expiresAt: new Date(Date.now() + expiresIn),
    });
    return sessionId;
  }

  validateSession(sessionId: string): { userId: string } | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }
    return { userId: session.userId };
  }

  refreshSession(refreshToken: string): { sessionId: string } | null {
    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
      const newSessionId = this.createSession(payload.userId);
      return { sessionId: newSessionId };
    } catch {
      return null;
    }
  }

  revokeSession(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
  }
}