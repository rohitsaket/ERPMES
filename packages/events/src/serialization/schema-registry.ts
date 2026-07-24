// Event Schema Registry - Centralized schema management

export const eventSchemas = {
  // Company Events
  CompanyCreated: {
    type: 'object',
    required: ['companyId', 'name', 'code'],
    properties: {
      companyId: { type: 'string', format: 'uuid' },
      name: { type: 'string', minLength: 1 },
      code: { type: 'string', minLength: 1, maxLength: 10 },
      settings: { type: 'object' },
    },
  },

  // Factory Events
  FactoryCreated: {
    type: 'object',
    required: ['branchId', 'name', 'code', 'capacity', 'shifts'],
    properties: {
      branchId: { type: 'string', format: 'uuid' },
      name: { type: 'string', minLength: 1 },
      code: { type: 'string', minLength: 1, maxLength: 10 },
      capacity: { type: 'integer', minimum: 1 },
      shifts: { type: 'array', items: { type: 'object' } },
    },
  },

  // Product Events
  ProductCreated: {
    type: 'object',
    required: ['companyId', 'sku', 'name', 'category'],
    properties: {
      companyId: { type: 'string', format: 'uuid' },
      sku: { type: 'string', minLength: 1 },
      name: { type: 'string', minLength: 1 },
      category: { type: 'string', minLength: 1 },
      description: { type: 'string' },
    },
  },

  // Sales Events
  SalesOrderCreated: {
    type: 'object',
    required: ['orderId', 'companyId', 'customerId', 'orderDate', 'requiredDate', 'lines'],
    properties: {
      orderId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
      customerId: { type: 'string', format: 'uuid' },
      orderDate: { type: 'string', format: 'date-time' },
      requiredDate: { type: 'string', format: 'date-time' },
      lines: {
        type: 'array',
        items: {
          type: 'object',
          required: ['productId', 'qty', 'uom', 'unitPrice'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
            qty: { type: 'number', minimum: 0 },
            uom: { type: 'string' },
            unitPrice: { type: 'number', minimum: 0 },
          },
        },
      },
    },
  },

  SalesOrderValidated: {
    type: 'object',
    required: ['orderId', 'companyId'],
    properties: {
      orderId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
    },
  },

  // Production Events
  ProductionOrderCreated: {
    type: 'object',
    required: ['orderId', 'companyId', 'productId', 'qty', 'status', 'priority', 'startDate', 'dueDate'],
    properties: {
      orderId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
      productId: { type: 'string', format: 'uuid' },
      qty: { type: 'number', minimum: 0 },
      status: { type: 'string', enum: ['PLANNED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED'] },
      priority: { type: 'integer', minimum: 0 },
      startDate: { type: 'string', format: 'date-time' },
      dueDate: { type: 'string', format: 'date-time' },
      routingId: { type: 'string', format: 'uuid' },
    },
  },

  ProductionOrderReleased: {
    type: 'object',
    required: ['orderId', 'companyId'],
    properties: {
      orderId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
    },
  },

  OperationStarted: {
    type: 'object',
    required: ['operationId', 'orderId', 'workCenterId', 'employeeId'],
    properties: {
      operationId: { type: 'string', format: 'uuid' },
      orderId: { type: 'string', format: 'uuid' },
      workCenterId: { type: 'string', format: 'uuid' },
      employeeId: { type: 'string', format: 'uuid' },
      startedAt: { type: 'string', format: 'date-time' },
    },
  },

  OperationCompleted: {
    type: 'object',
    required: ['operationId', 'orderId', 'qtyGood', 'qtyScrap', 'weightIn', 'weightOut', 'yieldPct'],
    properties: {
      operationId: { type: 'string', format: 'uuid' },
      orderId: { type: 'string', format: 'uuid' },
      qtyGood: { type: 'number', minimum: 0 },
      qtyScrap: { type: 'number', minimum: 0 },
      weightIn: { type: 'number', minimum: 0 },
      weightOut: { type: 'number', minimum: 0 },
      yieldPct: { type: 'number', minimum: 0, maximum: 100 },
    },
  },

  // Diamond Events
  DiamondCreated: {
    type: 'object',
    required: ['diamondId', 'companyId', 'certificateNo', 'carat', 'color', 'clarity', 'cut', 'shape', 'origin'],
    properties: {
      diamondId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
      certificateNo: { type: 'string' },
      carat: { type: 'number', minimum: 0 },
      color: { type: 'string' },
      clarity: { type: 'string' },
      cut: { type: 'string' },
      shape: { type: 'string' },
      origin: { type: 'string' },
    },
  },

  DiamondTransferred: {
    type: 'object',
    required: ['diamondId', 'fromDeptId', 'toDeptId', 'packetId', 'employeeId', 'weightBefore', 'weightAfter', 'lossPct', 'operation'],
    properties: {
      diamondId: { type: 'string', format: 'uuid' },
      fromDeptId: { type: 'string', format: 'uuid' },
      toDeptId: { type: 'string', format: 'uuid' },
      packetId: { type: 'string', format: 'uuid' },
      employeeId: { type: 'string', format: 'uuid' },
      weightBefore: { type: 'number', minimum: 0 },
      weightAfter: { type: 'number', minimum: 0 },
      lossPct: { type: 'number', minimum: 0, maximum: 100 },
      operation: { type: 'string' },
    },
  },

  DiamondSplit: {
    type: 'object',
    required: ['diamondId', 'parentDiamondId', 'newDiamondId', 'newCarat', 'employeeId'],
    properties: {
      diamondId: { type: 'string', format: 'uuid' },
      parentDiamondId: { type: 'string', format: 'uuid' },
      newDiamondId: { type: 'string', format: 'uuid' },
      newCarat: { type: 'number', minimum: 0 },
      employeeId: { type: 'string', format: 'uuid' },
    },
  },

  DiamondMerged: {
    type: 'object',
    required: ['diamondId', 'mergedDiamondId', 'resultingCarat', 'employeeId'],
    properties: {
      diamondId: { type: 'string', format: 'uuid' },
      mergedDiamondId: { type: 'string', format: 'uuid' },
      resultingCarat: { type: 'number', minimum: 0 },
      employeeId: { type: 'string', format: 'uuid' },
    },
  },

  // Inventory Events
  InventoryReceived: {
    type: 'object',
    required: ['lotId', 'companyId', 'warehouseId', 'itemId', 'qty', 'uom'],
    properties: {
      lotId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
      warehouseId: { type: 'string', format: 'uuid' },
      itemId: { type: 'string', format: 'uuid' },
      qty: { type: 'number', minimum: 0 },
      uom: { type: 'string' },
      refType: { type: 'string' },
      refId: { type: 'string', format: 'uuid' },
    },
  },

  InventoryAdjusted: {
    type: 'object',
    required: ['lotId', 'deltaQty', 'reason', 'employeeId'],
    properties: {
      lotId: { type: 'string', format: 'uuid' },
      deltaQty: { type: 'number' },
      reason: { type: 'string' },
      employeeId: { type: 'string', format: 'uuid' },
    },
  },

  // Quality Events
  InspectionCompleted: {
    type: 'object',
    required: ['inspectionId', 'productionOrderId', 'stepId', 'value', 'result', 'inspectorId'],
    properties: {
      inspectionId: { type: 'string', format: 'uuid' },
      productionOrderId: { type: 'string', format: 'uuid' },
      stepId: { type: 'string', format: 'uuid' },
      value: { type: 'number' },
      result: { type: 'string', enum: ['PASS', 'FAIL'] },
      inspectorId: { type: 'string', format: 'uuid' },
    },
  },

  NonconformanceCreated: {
    type: 'object',
    required: ['ncrId', 'inspectionId', 'type', 'severity'],
    properties: {
      ncrId: { type: 'string', format: 'uuid' },
      inspectionId: { type: 'string', format: 'uuid' },
      type: { type: 'string', enum: ['DIMENSIONAL', 'VISUAL', 'WEIGHT', 'CERTIFICATE', 'PROCESS'] },
      severity: { type: 'string', enum: ['MINOR', 'MAJOR', 'CRITICAL'] },
    },
  },

  NonconformanceDispositioned: {
    type: 'object',
    required: ['ncrId', 'disposition', 'rootCause', 'correctiveAction', 'dispositionedBy'],
    properties: {
      ncrId: { type: 'string', format: 'uuid' },
      disposition: { type: 'string', enum: ['REWORK', 'REPAIR', 'REGRADE', 'ACCEPT_DEVIATION', 'RETURN_TO_SUPPLIER', 'REJECT'] },
      rootCause: { type: 'string' },
      correctiveAction: { type: 'string' },
      dispositionedBy: { type: 'string', format: 'uuid' },
    },
  },

  // Certification Events
  CertificationRequested: {
    type: 'object',
    required: ['certificationId', 'diamondId', 'labId'],
    properties: {
      certificationId: { type: 'string', format: 'uuid' },
      diamondId: { type: 'string', format: 'uuid' },
      labId: { type: 'string', format: 'uuid' },
    },
  },

  CertificateReceived: {
    type: 'object',
    required: ['certificateId', 'diamondId', 'labId', 'certificateNo', 'issueDate'],
    properties: {
      certificateId: { type: 'string', format: 'uuid' },
      diamondId: { type: 'string', format: 'uuid' },
      labId: { type: 'string', format: 'uuid' },
      certificateNo: { type: 'string' },
      issueDate: { type: 'string', format: 'date-time' },
    },
  },

  // Dispatch Events
  ShipmentCreated: {
    type: 'object',
    required: ['shipmentId', 'companyId', 'customerId', 'carrierId'],
    properties: {
      shipmentId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
      customerId: { type: 'string', format: 'uuid' },
      carrierId: { type: 'string', format: 'uuid' },
    },
  },

  ShipmentDispatched: {
    type: 'object',
    required: ['shipmentId', 'trackingNo'],
    properties: {
      shipmentId: { type: 'string', format: 'uuid' },
      trackingNo: { type: 'string' },
    },
  },

  // Finance Events
  InvoiceGenerated: {
    type: 'object',
    required: ['invoiceId', 'companyId', 'customerId', 'amount', 'currency', 'dueDate'],
    properties: {
      invoiceId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
      customerId: { type: 'string', format: 'uuid' },
      amount: { type: 'number', minimum: 0 },
      currency: { type: 'string', minLength: 3, maxLength: 3 },
      dueDate: { type: 'string', format: 'date-time' },
    },
  },

  PaymentReceived: {
    type: 'object',
    required: ['paymentId', 'invoiceId', 'amount', 'currency'],
    properties: {
      paymentId: { type: 'string', format: 'uuid' },
      invoiceId: { type: 'string', format: 'uuid' },
      amount: { type: 'number', minimum: 0 },
      currency: { type: 'string', minLength: 3, maxLength: 3 },
      method: { type: 'string', enum: ['BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'CASH'] },
    },
  },

  // Return Events
  ReturnAuthorized: {
    type: 'object',
    required: ['returnId', 'companyId', 'customerId', 'invoiceId', 'disposition'],
    properties: {
      returnId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
      customerId: { type: 'string', format: 'uuid' },
      invoiceId: { type: 'string', format: 'uuid' },
      disposition: { type: 'string', enum: ['CREDIT', 'REPLACEMENT', 'REPAIR', 'REJECT'] },
    },
  },

  RepairOrderCreated: {
    type: 'object',
    required: ['repairOrderId', 'returnAuthId', 'productionOrderId'],
    properties: {
      repairOrderId: { type: 'string', format: 'uuid' },
      returnAuthId: { type: 'string', format: 'uuid' },
      productionOrderId: { type: 'string', format: 'uuid' },
    },
  },

  // AI Events
  AiRequestReceived: {
    type: 'object',
    required: ['interactionId', 'userId', 'companyId', 'intent'],
    properties: {
      interactionId: { type: 'string', format: 'uuid' },
      userId: { type: 'string', format: 'uuid' },
      companyId: { type: 'string', format: 'uuid' },
      intent: { type: 'string' },
      context: { type: 'object' },
    },
  },

  AiToolExecuted: {
    type: 'object',
    required: ['interactionId', 'toolName', 'parameters'],
    properties: {
      interactionId: { type: 'string', format: 'uuid' },
      toolName: { type: 'string' },
      parameters: { type: 'object' },
      result: { type: 'object' },
      success: { type: 'boolean' },
    },
  },

  AiResponseGenerated: {
    type: 'object',
    required: ['interactionId', 'response', 'tokensUsed'],
    properties: {
      interactionId: { type: 'string', format: 'uuid' },
      response: { type: 'string' },
      tokensUsed: { type: 'integer' },
      model: { type: 'string' },
    },
  },
};