import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { extractTokenFromHeader, verifyAccessToken, buildAuthContext } from '../session/session-manager';
import { AuthContext } from '../types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const payload = await verifyAccessToken(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
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

    // Validate API key against database
    // const isValid = await this.apiKeyService.validate(apiKey);
    // if (!isValid) throw new UnauthorizedException('Invalid API key');

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

    // Check if device is trusted for this user
    // const isTrusted = await this.deviceTrustService.isTrusted(request.auth.userId, deviceFingerprint);
    // if (!isTrusted) throw new UnauthorizedException('Untrusted device');

    return true;
  }
}