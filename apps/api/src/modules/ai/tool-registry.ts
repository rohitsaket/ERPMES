import { Injectable } from '@nestjs/common';

export interface AiTool {
  name: string;
  description: string;
  module: string;
  schema: Record<string, any>;
  requiredPermissions?: string[];
}

@Injectable()
export class ToolRegistry {
  private tools: Map<string, AiTool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools(): void {
    // Production Tools
    this.register({
      name: 'get_production_order',
      description: 'Get production order details by ID',
      module: 'manufacturing',
      schema: { type: 'object', properties: { productionOrderId: { type: 'string' } }, required: ['productionOrderId'] },
      requiredPermissions: ['read:production-order:factory'],
    });

    this.register({
      name: 'list_production_orders',
      description: 'List production orders with filters',
      module: 'manufacturing',
      schema: { type: 'object', properties: { status: { type: 'string' }, factoryId: { type: 'string' }, page: { type: 'number' }, limit: { type: 'number' } } },
      requiredPermissions: ['read:production-order:factory'],
    });

    this.register({
      name: 'get_operation_status',
      description: 'Get current operation status for a production order',
      module: 'manufacturing',
      schema: { type: 'object', properties: { productionOrderId: { type: 'string' } }, required: ['productionOrderId'] },
      requiredPermissions: ['read:operation:factory'],
    });

    this.register({
      name: 'get_work_center_queue',
      description: 'Get work center queue status',
      module: 'manufacturing',
      schema: { type: 'object', properties: { workCenterId: { type: 'string' } }, required: ['workCenterId'] },
      requiredPermissions: ['read:queue:department'],
    });

    // Inventory Tools
    this.register({
      name: 'check_inventory',
      description: 'Check inventory availability for an item',
      module: 'inventory',
      schema: { type: 'object', properties: { itemId: { type: 'string' }, warehouseId: { type: 'string' } }, required: ['itemId'] },
      requiredPermissions: ['read:inventory:company'],
    });

    this.register({
      name: 'check_diamond_availability',
      description: 'Check available diamonds matching criteria',
      module: 'diamonds',
      schema: { type: 'object', properties: { caratMin: { type: 'number' }, caratMax: { type: 'number' }, color: { type: 'string' }, clarity: { type: 'string' }, shape: { type: 'string' }, status: { type: 'string' } } },
      requiredPermissions: ['read:diamond:company'],
    });

    this.register({
      name: 'get_diamond_genealogy',
      description: 'Get complete genealogy tree for a diamond',
      module: 'diamonds',
      schema: { type: 'object', properties: { diamondId: { type: 'string' } }, required: ['diamondId'] },
      requiredPermissions: ['view:genealogy:company'],
    });

    // Quality Tools
    this.register({
      name: 'get_inspection_results',
      description: 'Get inspection results for a production order',
      module: 'quality',
      schema: { type: 'object', properties: { productionOrderId: { type: 'string' } }, required: ['productionOrderId'] },
      requiredPermissions: ['inspect:quality:department'],
    });

    this.register({
      name: 'get_ncr_list',
      description: 'List non-conformance reports with filters',
      module: 'quality',
      schema: { type: 'object', properties: { status: { type: 'string' }, factoryId: { type: 'string' }, dateFrom: { type: 'string' }, dateTo: { type: 'string' } } },
      requiredPermissions: ['inspect:quality:department'],
    });

    // Shipment Tools
    this.register({
      name: 'track_shipment',
      description: 'Track shipment by tracking number or shipment ID',
      module: 'dispatch',
      schema: { type: 'object', properties: { trackingNumber: { type: 'string' }, shipmentId: { type: 'string' } } },
      requiredPermissions: ['track:shipment:company'],
    });

    this.register({
      name: 'create_shipment',
      description: 'Create new shipment for dispatch',
      module: 'dispatch',
      schema: { type: 'object', properties: { salesOrderId: { type: 'string' }, carrierId: { type: 'string' }, items: { type: 'array' } }, required: ['salesOrderId'] },
      requiredPermissions: ['dispatch:shipment:factory'],
    });

    // Planning Tools
    this.register({
      name: 'run_mrp',
      description: 'Trigger MRP run for company',
      module: 'planning',
      schema: { type: 'object', properties: { companyId: { type: 'string' }, fullRun: { type: 'boolean' } } },
      requiredPermissions: ['run:mrp:company'],
    });

    this.register({
      name: 'get_capacity_load',
      description: 'Get capacity load for work centers',
      module: 'planning',
      schema: { type: 'object', properties: { factoryId: { type: 'string' }, periodStart: { type: 'string' }, periodEnd: { type: 'string' } }, required: ['factoryId'] },
      requiredPermissions: ['read:capacity:factory'],
    });

    // Finance Tools
    this.register({
      name: 'get_invoice_status',
      description: 'Get invoice status by ID or number',
      module: 'finance',
      schema: { type: 'object', properties: { invoiceId: { type: 'string' }, invoiceNumber: { type: 'string' } } },
      requiredPermissions: ['read:invoice:company'],
    });

    this.register({
      name: 'get_payment_status',
      description: 'Get payment status for invoices',
      module: 'finance',
      schema: { type: 'object', properties: { invoiceId: { type: 'string' }, customerId: { type: 'string' } } },
      requiredPermissions: ['read:payment:company'],
    });

    // Analytics Tools
    this.register({
      name: 'get_oee_metrics',
      description: 'Get OEE metrics for work centers',
      module: 'analytics',
      schema: { type: 'object', properties: { workCenterId: { type: 'string' }, factoryId: { type: 'string' }, dateFrom: { type: 'string' }, dateTo: { type: 'string' } } },
      requiredPermissions: ['view:analytics:company'],
    });

    this.register({
      name: 'get_yield_report',
      description: 'Get yield report for operations',
      module: 'analytics',
      schema: { type: 'object', properties: { factoryId: { type: 'string' }, operationId: { type: 'string' }, dateFrom: { type: 'string' }, dateTo: { type: 'string' } } },
      requiredPermissions: ['view:analytics:company'],
    });

    this.register({
      name: 'get_wip_aging',
      description: 'Get WIP aging report',
      module: 'analytics',
      schema: { type: 'object', properties: { factoryId: { type: 'string' }, departmentId: { type: 'string' } } },
      requiredPermissions: ['view:analytics:company'],
    });
  }

  register(tool: AiTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): AiTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): AiTool[] {
    return Array.from(this.tools.values());
  }

  selectTool(intent: string, message: string): AiTool | undefined {
    // Simple intent-to-tool mapping
    const intentToolMap: Record<string, string[]> = {
      'production_status': ['get_production_order', 'list_production_orders', 'get_operation_status'],
      'inventory_check': ['check_inventory', 'check_diamond_availability'],
      'quality_report': ['get_inspection_results', 'get_ncr_list'],
      'shipment_tracking': ['track_shipment'],
      'diamond_traceability': ['get_diamond_genealogy'],
      'capacity_planning': ['get_capacity_load'],
      'mrp_run': ['run_mrp'],
      'diamond_allocation': ['check_diamond_availability'],
      'financial_query': ['get_invoice_status', 'get_payment_status'],
      'analytics_query': ['get_oee_metrics', 'get_yield_report', 'get_wip_aging'],
    };

    const toolNames = intentToolMap[intent] || [];
    for (const name of toolNames) {
      const tool = this.tools.get(name);
      if (tool) return tool;
    }

    return undefined;
  }
}
