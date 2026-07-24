import { Injectable, Logger } from '@nestjs/common';

interface AiInteraction {
  id?: string;
  userId: string;
  companyId: string;
  intent?: string;
  prompt: string;
  toolName?: string;
  toolParams?: unknown;
  toolResult?: unknown;
  response?: string;
  status?: string;
  tokensUsed?: number;
  durationMs?: number;
  createdAt?: Date;
  error?: string;
  correlationId?: string;
}

@Injectable()
export class AuditLogger {
  private readonly logger = new Logger(AuditLogger.name);

  async log(interaction: AiInteraction): Promise<void> {
    this.logger.log({
      event: 'ai_interaction',
      interactionId: interaction.id,
      userId: interaction.userId,
      companyId: interaction.companyId,
      intent: interaction.intent,
      prompt: interaction.prompt,
      toolName: interaction.toolName,
      toolParams: interaction.toolParams,
      toolResult: interaction.toolResult ? 'present' : 'none',
      responseLength: interaction.response?.length ?? 0,
      status: interaction.status,
      tokensUsed: interaction.tokensUsed,
      durationMs: interaction.durationMs,
      timestamp: (interaction.createdAt ?? new Date()).toISOString(),
    });

    // In production, write to audit log table or external system
    // await this.prisma.aiInteractionLog.create({ data: interaction });
  }

  async logError(interaction: AiInteraction): Promise<void> {
    this.logger.error({
      event: 'ai_interaction_error',
      ...interaction,
      timestamp: new Date().toISOString(),
    });
  }

  async logToolExecution(
    userId: string,
    companyId: string,
    toolName: string,
    params: Record<string, any>,
    result: Record<string, any>,
    durationMs: number,
  ): Promise<void> {
    this.logger.log({
      event: 'ai_tool_execution',
      userId,
      companyId,
      toolName,
      params,
      result: result ? 'success' : 'failed',
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }

  async logPermissionDenied(
    userId: string,
    companyId: string,
    toolName: string,
    requiredPermissions: string[],
  ): Promise<void> {
    this.logger.warn({
      event: 'ai_permission_denied',
      userId,
      companyId,
      toolName,
      requiredPermissions,
      timestamp: new Date().toISOString(),
    });
  }
}
