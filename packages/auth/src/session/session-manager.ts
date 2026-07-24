import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@clerk/clerk-sdk-node';
import type { AuthContext, JWTPayload } from '../types';

const prisma = new PrismaClient();

export function extractTokenFromHeader(header?: string): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function buildAuthContext(payload: JWTPayload): AuthContext {
  return {
    userId: payload.sub,
    email: payload.email,
    organizationId: payload.orgId,
    organizationRole: payload.orgRole,
    permissions: payload.permissions ?? [],
    factories: payload.factories ?? [],
    branches: payload.branches ?? [],
    departments: payload.departments ?? [],
  };
}

@Injectable()
export class SessionManager {
  async createSession(userId: string, deviceFingerprint: string, ipAddress: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    // In production, use JWT with proper signing
    const accessToken = this.generateToken(userId, 'access');
    const refreshToken = this.generateToken(userId, 'refresh');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const refreshTokenHash = await this.hashToken(refreshToken);
    await prisma.session.create({
      data: {
        userId,
        token: refreshTokenHash,
        device: { fingerprint: deviceFingerprint, trusted: false },
        ip: ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken, expiresAt };
  }

  async refreshSession(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const tokenHash = await this.hashToken(refreshToken);
    
    const session = await prisma.session.findUnique({
      where: { token: tokenHash },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Rotate refresh token
    await prisma.session.delete({ where: { id: session.id } });

    const device = session.device as { fingerprint?: string } | null;
    return this.createSession(session.userId, device?.fingerprint ?? 'unknown', session.ip ?? '');
  }

  async revokeSession(userId: string, deviceFingerprint?: string): Promise<void> {
    if (!deviceFingerprint) {
      await prisma.session.deleteMany({ where: { userId } });
      return;
    }
    const sessions = await prisma.session.findMany({ where: { userId }, select: { id: true, device: true } });
    const ids = sessions
      .filter((session) => (session.device as { fingerprint?: string } | null)?.fingerprint === deviceFingerprint)
      .map((session) => session.id);
    if (ids.length > 0) await prisma.session.deleteMany({ where: { id: { in: ids } } });
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
  }

  async validateDeviceTrust(userId: string, deviceFingerprint: string): Promise<boolean> {
    const sessions = await prisma.session.findMany({ where: { userId }, select: { device: true } });
    return sessions.some((session) => {
      const device = session.device as { fingerprint?: string; trusted?: boolean } | null;
      return device?.fingerprint === deviceFingerprint && device.trusted === true;
    });
  }

  async trustDevice(userId: string, deviceFingerprint: string): Promise<void> {
    const sessions = await prisma.session.findMany({ where: { userId }, select: { id: true, device: true } });
    const matching = sessions.filter(
      (session) => (session.device as { fingerprint?: string } | null)?.fingerprint === deviceFingerprint,
    );
    await Promise.all(matching.map((session) =>
      prisma.session.update({
        where: { id: session.id },
        data: { device: { fingerprint: deviceFingerprint, trusted: true } },
      }),
    ));
  }

  private generateToken(userId: string, type: 'access' | 'refresh'): string {
    // In production, use proper JWT signing
    return `${type}_${userId}_${Date.now()}_${Math.random().toString(36).substr(2)}`;
  }

  private async hashToken(token: string): Promise<string> {
    // In production, use bcrypt or argon2
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
