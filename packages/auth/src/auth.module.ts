import { Module, Global } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard, ApiKeyGuard, DeviceTrustGuard } from './guards/auth.guards';

@Global()
@Module({
  providers: [
    Reflector,
    JwtAuthGuard,
    ApiKeyGuard,
    DeviceTrustGuard,
  ],
  exports: [
    JwtAuthGuard,
    ApiKeyGuard,
    DeviceTrustGuard,
  ],
})
export class AuthModule {}
