import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
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
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Authentication required. No token provided.');
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }

    const authContext = buildAuthContext(payload);
    request.auth = authContext;
    request.user = authContext;

    return true;
  }
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    return true;
  }
}

@Injectable()
export class DeviceTrustGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const deviceFingerprint = request.headers['x-device-fingerprint'];

    if (!deviceFingerprint) {
      throw new UnauthorizedException('Device fingerprint required');
    }

    return true;
  }
}
