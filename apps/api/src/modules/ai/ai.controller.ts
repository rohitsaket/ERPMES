import { Controller, Post, Body, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermission } from '@diamondflow/authorization';
import { AiService } from './ai.service';
import { CurrentUser, JwtAuthGuard } from '@diamondflow/auth';

@ApiTags('AI Copilot')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @RequirePermission('use:ai:company')
  @ApiOperation({ summary: 'Chat with AI Copilot' })
  async chat(
    @Body() body: { message: string; context?: Record<string, any> },
    @Request() req: any,
  ) {
    return this.aiService.processMessage(req.user.userId, req.user.companyId, body.message, body.context);
  }

  @Post('tools/execute')
  @RequirePermission('use:ai:company')
  @ApiOperation({ summary: 'Execute AI tool' })
  async executeTool(
    @Body() body: { toolName: string; params: Record<string, any> },
    @Request() req: any,
  ) {
    return this.aiService.executeTool(req.user.userId, req.user.companyId, body.toolName, body.params);
  }

  @Get('tools')
  @RequirePermission('use:ai:company')
  @ApiOperation({ summary: 'List available AI tools' })
  async getTools(@Request() req: any) {
    return this.aiService.getAvailableTools(req.user.userId, req.user.companyId);
  }

  @Get('interactions')
  @RequirePermission('view:analytics:company')
  @ApiOperation({ summary: 'Get AI interaction history' })
  async getInteractions(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.aiService.getInteractionHistory(req.user.companyId, limit, offset);
  }
}