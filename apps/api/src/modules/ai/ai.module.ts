import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { IntentRouter } from './intent-router';
import { ToolRegistry } from './tool-registry';
import { PermissionGuard } from './permission-guard';
import { AuditLogger } from './audit-logger';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, IntentRouter, ToolRegistry, PermissionGuard, AuditLogger],
  exports: [AiService, ToolRegistry],
})
export class AiModule {}