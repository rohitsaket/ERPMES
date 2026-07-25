import { Injectable } from '@nestjs/common';
import { SessionManager } from './session-manager';

@Injectable()
export class TokenRefreshService {
  constructor(private sessionManager: SessionManager) {}

  async refreshTokens(refreshToken: string) {
    return this.sessionManager.refreshSession(refreshToken);
  }

  async revokeRefreshToken(userId: string, refreshToken: string) {
    await this.sessionManager.revokeSession(userId);
  }
}