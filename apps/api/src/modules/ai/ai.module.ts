import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { IntentRouter } from './intent-router.js';
import { ToolRegistry } from './tool-registry.js';
import { PermissionGuard } from './permission-guard.js';
import { AuditLogger } from './audit-logger.js';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, IntentRouter, ToolRegistry, PermissionGuard, AuditLogger],
  exports: [AiService, ToolRegistry],
})
export class AiModule {}