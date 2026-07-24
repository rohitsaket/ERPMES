import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClerkWebhookHandler } from './clerk/clerk-webhook-handler';
import { SessionManager } from './session/session-manager';
import { TokenRefreshService } from './session/token-refresh';
import { MfaHandler } from './session/mfa-handler';
import { JwtAuthGuard, ApiKeyGuard, DeviceTrustGuard } from './guards/auth.guards';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    }),
  ],
  providers: [
    ClerkWebhookHandler,
    SessionManager,
    TokenRefreshService,
    MfaHandler,
    JwtAuthGuard,
    ApiKeyGuard,
    DeviceTrustGuard,
  ],
  exports: [
    ClerkWebhookHandler,
    SessionManager,
    TokenRefreshService,
    MfaHandler,
    JwtAuthGuard,
    ApiKeyGuard,
    DeviceTrustGuard,
    JwtModule,
  ],
})
export class AuthModule {}
