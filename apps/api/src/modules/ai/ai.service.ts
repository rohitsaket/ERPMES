import { Injectable, Logger } from '@nestjs/common';
import { ToolRegistry } from './tool-registry';
import { PermissionGuard } from './permission-guard';
import { AuditLogger } from './audit-logger';
import { PrismaService } from '@diamondflow/database';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private toolRegistry: ToolRegistry,
    private permissionGuard: PermissionGuard,
    private auditLogger: AuditLogger,
    private prisma: PrismaService,
  ) {}

  async processMessage(userId: string, companyId: string, message: string, context?: Record<string, any>): Promise<any> {
    const startTime = Date.now();
    const correlationId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      // Classify intent
      const intent = await this.classifyIntent(message);

      // Select appropriate tool
      const tool = await this.toolRegistry.selectTool(intent, message);

      if (!tool) {
        return this.generateResponse(message, context);
      }

      // Check permissions
      const hasPermission = await this.permissionGuard.check(
        userId,
        companyId,
        tool.requiredPermissions || [],
      );

      if (!hasPermission) {
        await this.auditLogger.logError({
          userId,
          companyId,
          prompt: message,
          error: `Permission denied for tool: ${tool.name}`,
          correlationId,
        });

        return {
          response: `I don't have permission to perform this action. Required permissions: ${tool.requiredPermissions?.join(', ')}`,
          toolExecuted: false,
        };
      }

      // Extract parameters from message
      const params = await this.extractParameters(message, tool.schema);

      // Execute tool
      const toolResult = await this.executeToolFunction(tool, params);

      const durationMs = Date.now() - startTime;

      // Log successful interaction
      await this.auditLogger.log({
        userId,
        companyId,
        intent,
        prompt: message,
        toolName: tool.name,
        toolParams: params,
        toolResult,
        response: toolResult.message || 'Tool executed successfully',
        status: 'completed',
        durationMs,
        correlationId,
      });

      return {
        response: toolResult.message || 'Tool executed successfully',
        data: toolResult.data,
        toolExecuted: true,
        toolName: tool.name,
        correlationId,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const durationMs = Date.now() - startTime;
      await this.auditLogger.logError({
        userId,
        companyId,
        prompt: message,
        error: errorMessage,
        correlationId,
      });

      this.logger.error('AI processing failed', error);

      return {
        response: 'I encountered an error processing your request. Please try again.',
        toolExecuted: false,
        error: errorMessage,
      };
    }
  }

  async executeTool(userId: string, companyId: string, toolName: string, params: Record<string, any>): Promise<any> {
    const tool = this.toolRegistry.getTool(toolName);

    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    // Check permissions
    const hasPermission = await this.permissionGuard.check(
      userId,
      companyId,
      tool.requiredPermissions || [],
    );

    if (!hasPermission) {
      throw new Error(`Permission denied for tool: ${toolName}`);
    }

    return this.executeToolFunction(tool, params);
  }

  getAvailableTools(userId: string, companyId: string): any[] {
    const tools = this.toolRegistry.getAllTools();
    // Filter by user permissions
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      module: tool.module,
      requiredPermissions: tool.requiredPermissions,
    }));
  }

  async getInteractionHistory(companyId: string, limit = 50, offset = 0): Promise<any[]> {
    return this.prisma.aiInteraction.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  private async classifyIntent(message: string): Promise<string> {
    // Simple intent classification based on keywords
    const intents: Record<string, string[]> = {
      production_status: ['production', 'order', 'status', 'progress', 'wip', 'operation'],
      inventory_check: ['inventory', 'stock', 'available', 'quantity', 'lot', 'diamond'],
      quality_report: ['quality', 'inspection', 'ncr', 'nonconformance', 'certification', 'certificate'],
      shipment_tracking: ['shipment', 'ship', 'track', 'tracking', 'delivery', 'dispatch'],
      diamond_traceability: ['genealogy', 'trace', 'history', 'diamond', 'packet', 'bag'],
      capacity_planning: ['capacity', 'schedule', 'plan', 'workcenter', 'load'],
      mrp_run: ['mrp', 'material requirement', 'planning', 'requirement'],
      inventory_alert: ['low stock', 'stockout', 'shortage', 'reorder'],
      maintenance_due: ['maintenance', 'pm', 'preventive', 'work order', 'asset'],
    };

    const lowerMessage = message.toLowerCase();
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        return intent;
      }
    }

    return 'general_query';
  }

  private async extractParameters(message: string, schema: any): Promise<Record<string, any>> {
    // Simple parameter extraction - in production use LLM function calling
    const params: Record<string, any> = {};

    if (schema?.properties) {
      for (const [key, value] of Object.entries(schema.properties as Record<string, unknown>)) {
        const prop = value as { type?: string };
        // Simple regex extraction for common patterns
        if (prop.type === 'string') {
          // Look for patterns like "order PO-123" or "diamond ABC123"
          const regex = new RegExp(`${key}\\s*[=:]\s*(\\S+)`, 'i');
          const match = message.match(regex);
          if (match) params[key] = match[1];
        } else if (prop.type === 'number') {
          const regex = new RegExp(`${key}\\s*[=:]\s*(\\d+)`, 'i');
          const match = message.match(regex);
          if (match?.[1]) params[key] = parseInt(match[1], 10);
        } else if (prop.type === 'boolean') {
          params[key] = /(true|yes|enable|on)/i.test(message);
        }
      }
    }

    return params;
  }

  private async executeToolFunction(tool: any, params: Record<string, any>): Promise<any> {
    // Mock tool execution - in production, call actual API endpoints or services
    const mockResults: Record<string, any> = {
      get_production_order: { message: 'Production order details retrieved', data: { id: 'PO-123', status: 'in_progress', progress: 65 } },
      get_operation_status: { message: 'Operation status retrieved', data: { operationId: 'OP-456', status: 'running', yield: 98.5 } },
      check_inventory: { message: 'Inventory checked', data: { available: 150, reserved: 20, onHand: 170 } },
      check_diamond_availability: { message: 'Diamond availability checked', data: { available: true, count: 5, carats: 3.2 } },
      get_inspection_results: { message: 'Inspection results retrieved', data: { passed: 12, failed: 1, pending: 3 } },
      get_ncr_list: { message: 'NCR list retrieved', data: { open: 5, inProgress: 2, closed: 15 } },
      track_shipment: { message: 'Shipment tracked', data: { trackingNo: '1Z999AA10123456784', status: 'in_transit', eta: '2024-01-20' } },
      get_diamond_genealogy: { message: 'Diamond genealogy retrieved', data: { diamondId: 'DIA-123', events: [] } },
      get_capacity_load: { message: 'Capacity load retrieved', data: { workCenters: [] } },
      run_mrp: { message: 'MRP run completed', data: { plannedOrders: 25, exceptions: 3 } },
      get_invoice_status: { message: 'Invoice status retrieved', data: { invoiceId: 'INV-123', status: 'paid' } },
      get_payment_status: { message: 'Payment status retrieved', data: { customerId: 'CUST-123', paid: 50000, pending: 10000 } },
      get_oee_metrics: { message: 'OEE metrics retrieved', data: { overall: 0.82, availability: 0.9, performance: 0.95, quality: 0.96 } },
      get_yield_report: { message: 'Yield report retrieved', data: { overallYield: 0.94, byOperation: [] } },
      get_wip_aging: { message: 'WIP aging retrieved', data: { agingBuckets: [] } },
    };

    return mockResults[tool.name] || { message: `${tool.name} executed`, data: params };
  }

  private async generateResponse(message: string, context?: Record<string, any>): Promise<any> {
    // Simple response generation - in production use LLM
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return { response: 'Hello! How can I help you with DiamondFlow today?' };
    }

    if (lowerMessage.includes('help')) {
      return {
        response: `I can help you with:
• Production order status and progress
• Inventory levels and diamond availability
• Quality inspections and NCRs
• Shipment tracking
• Diamond genealogy and traceability
• Capacity planning and MRP
• Financial information (invoices, payments)
• Analytics (OEE, yield, WIP aging)

Just ask me naturally, like "What's the status of production order PO-123?" or "Show me available diamonds for customer XYZ."`,
      };
    }

    return {
      response: 'I understand you\'re asking about something, but I need more specific information to help you. Could you please clarify what you\'d like to know? For example, are you looking for production status, inventory levels, quality reports, or something else?',
    };
  }
}
