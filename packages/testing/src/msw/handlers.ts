import { http, HttpResponse } from 'msw';
import { createMockDomainEvent } from '../mocks/mock-events';

export const handlers = [
  // Auth
  http.post('/api/v1/auth/login', () => {
    return HttpResponse.json({
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      user: {
        id: 'user_1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roles: ['FACTORY_MANAGER'],
      },
    });
  }),

  http.post('/api/v1/auth/refresh', () => {
    return HttpResponse.json({
      accessToken: 'new_mock_access_token',
    });
  }),

  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: 'user_1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['FACTORY_MANAGER'],
      organizationId: 'org_1',
    });
  }),

  // Companies
  http.get('/api/v1/companies', () => {
    return HttpResponse.json({
      data: [
        { id: 'comp_1', name: 'Test Company', code: 'TEST', settings: {} },
      ],
    });
  }),

  http.post('/api/v1/companies', () => {
    return HttpResponse.json({
      id: 'comp_new',
      name: 'New Company',
      code: 'NEW',
      settings: {},
    }, { status: 201 });
  }),

  // Sales Orders
  http.get('/api/v1/sales-orders', () => {
    return HttpResponse.json({
      data: [
        { id: 'so_1', companyId: 'comp_1', customerId: 'cust_1', status: 'RELEASED', orderDate: new Date().toISOString() },
      ],
      meta: { pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } },
    });
  }),

  http.post('/api/v1/sales-orders', () => {
    return HttpResponse.json({
      id: 'so_new',
      companyId: 'comp_1',
      customerId: 'cust_1',
      status: 'DRAFT',
      orderDate: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.get('/api/v1/sales-orders/:id', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      companyId: 'comp_1',
      customerId: 'cust_1',
      status: 'RELEASED',
      orderDate: new Date().toISOString(),
      lines: [
        { id: 'sol_1', productId: 'prod_1', qty: 10, uom: 'PCS', unitPrice: 1000 },
      ],
    });
  }),

  http.post('/api/v1/sales-orders/:id/validate', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'VALIDATED',
    });
  }),

  http.post('/api/v1/sales-orders/:id/release', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'RELEASED',
    });
  }),

  // Production Orders
  http.get('/api/v1/production-orders', () => {
    return HttpResponse.json({
      data: [
        { id: 'po_1', companyId: 'comp_1', productId: 'prod_1', qty: 100, status: 'RELEASED', priority: 0 },
      ],
    });
  }),

  http.post('/api/v1/production-orders', () => {
    return HttpResponse.json({
      id: 'po_new',
      companyId: 'comp_1',
      productId: 'prod_1',
      qty: 100,
      status: 'PLANNED',
      priority: 0,
    }, { status: 201 });
  }),

  http.get('/api/v1/production-orders/:id', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      companyId: 'comp_1',
      productId: 'prod_1',
      qty: 100,
      status: 'RELEASED',
      operations: [
        { id: 'op_1', seq: 1, departmentId: 'dept_1', workCenterId: 'wc_1', status: 'COMPLETED', qtyComplete: 100 },
        { id: 'op_2', seq: 2, departmentId: 'dept_2', workCenterId: 'wc_2', status: 'RUNNING', qtyComplete: 50 },
      ],
    });
  }),

  http.post('/api/v1/production-orders/:id/release', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'RELEASED',
    });
  }),

  // Operations
  http.post('/api/v1/operations/:id/start', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
    });
  }),

  http.post('/api/v1/operations/:id/complete', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    });
  }),

  http.post('/api/v1/operations/:id/pause', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'PAUSED',
      pausedAt: new Date().toISOString(),
    });
  }),

  http.post('/api/v1/operations/:id/resume', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'RUNNING',
      resumedAt: new Date().toISOString(),
    });
  }),

  http.post('/api/v1/operations/:id/transfer', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'TRANSFERRED',
      transferredAt: new Date().toISOString(),
    });
  }),

  http.post('/api/v1/operations/:id/complete', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    });
  }),

  // Diamonds
  http.get('/api/v1/diamonds', () => {
    return HttpResponse.json({
      data: [
        { id: 'diamond_1', companyId: 'comp_1', certificateNo: 'CERT_001', carat: 1.0, color: 'D', clarity: 'IF', cut: 'EXCELLENT', shape: 'ROUND', status: 'CERTIFIED' },
      ],
    });
  }),

  http.post('/api/v1/diamonds', () => {
    return HttpResponse.json({
      id: 'diamond_new',
      companyId: 'comp_1',
      certificateNo: 'CERT_NEW',
      carat: 1.0,
      color: 'D',
      clarity: 'IF',
      cut: 'EXCELLENT',
      shape: 'ROUND',
      status: 'ROUGH',
    }, { status: 201 });
  }),

  http.get('/api/v1/diamonds/:id/genealogy', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      diamondId: params.id,
      events: [
        { eventType: 'CREATED', timestamp: new Date().toISOString(), metadata: { carat: 1.0 } },
        { eventType: 'ALLOCATED', timestamp: new Date().toISOString(), metadata: { ownerId: 'emp1', packetId: 'pkt1' } },
        { eventType: 'TRANSFERRED', timestamp: new Date().toISOString(), metadata: { fromDept: 'SAWING', toDept: 'POLISHING' } },
      ],
    });
  }),

  // Inventory
  http.get('/api/v1/inventory/lots', () => {
    return HttpResponse.json({
      data: [
        { id: 'lot_1', companyId: 'comp_1', itemId: 'prod_1', warehouseId: 'wh_1', qty: 100, uom: 'PCS', status: 'AVAILABLE', lotNumber: 'LOT_001' },
      ],
    });
  }),

  http.post('/api/v1/inventory/issue', () => {
    return HttpResponse.json({
      id: 'txn_new',
      lotId: 'lot_1',
      type: 'ISSUE',
      qty: 10,
      uom: 'PCS',
      refType: 'PRODUCTION_ORDER',
      refId: 'po_1',
      fromLocation: 'wh_1',
      toLocation: 'dept_1',
      employeeId: 'emp_1',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.post('/api/v1/inventory/receive', () => {
    return HttpResponse.json({
      id: 'txn_new',
      lotId: 'lot_1',
      type: 'RECEIPT',
      qty: 50,
      uom: 'PCS',
      refType: 'PURCHASE_ORDER',
      refId: 'po_1',
      fromLocation: 'vendor_1',
      toLocation: 'wh_1',
      employeeId: 'emp_1',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Quality
  http.get('/api/v1/inspections', () => {
    return HttpResponse.json({
      data: [
        { id: 'insp_1', productionOrderId: 'po_1', stepId: 'step_1', status: 'PASSED', value: 0.95, result: 'PASS', inspectorId: 'emp_1' },
      ],
    });
  }),

  http.post('/api/v1/inspections', () => {
    return HttpResponse.json({
      id: 'insp_new',
      productionOrderId: 'po_1',
      stepId: 'step_1',
      status: 'PENDING',
      inspectorId: 'emp_1',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.post('/api/v1/inspections/:id/complete', ({ params }: { params: Record<string, string> }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'PASSED',
      value: 0.95,
      result: 'PASS',
      completedAt: new Date().toISOString(),
    });
  }),

  // Certificates
  http.get('/api/v1/certificates', () => {
    return HttpResponse.json({
      data: [
        { id: 'cert_1', diamondId: 'diamond_1', labId: 'GIA', certificateNo: 'GIA123456', issueDate: new Date().toISOString(), status: 'VALIDATED' },
      ],
    });
  }),

  http.post('/api/v1/certificates/request', () => {
    return HttpResponse.json({
      id: 'cert_req_new',
      diamondId: 'diamond_1',
      labId: 'GIA',
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Shipments
  http.get('/api/v1/shipments', () => {
    return HttpResponse.json({
      data: [
        { id: 'ship_1', companyId: 'comp_1', customerId: 'cust_1', carrierId: 'carrier_1', trackingNo: 'TRK123', status: 'DISPATCHED' },
      ],
    });
  }),

  http.post('/api/v1/shipments', () => {
    return HttpResponse.json({
      id: 'ship_new',
      companyId: 'comp_1',
      customerId: 'cust_1',
      carrierId: 'carrier_1',
      trackingNo: 'TRK_NEW',
      status: 'PLANNED',
    }, { status: 201 });
  }),

  // Analytics
  http.get('/api/v1/analytics/oee', () => {
    return HttpResponse.json({
      data: [
        { workCenterId: 'wc_1', workCenterName: 'Laser Saw 1', oee: 0.85, availability: 0.9, performance: 0.95, quality: 0.99 },
      ],
    });
  }),

  http.get('/api/v1/analytics/yield', () => {
    return HttpResponse.json({
      data: [
        { operationId: 'op_1', yieldPct: 98.5, weightIn: 100, weightOut: 98.5 },
      ],
    });
  }),

  http.get('/api/v1/analytics/wip-aging', () => {
    return HttpResponse.json({
      data: [
        { departmentId: 'dept_1', departmentName: 'Sawing', aging: { '0-24h': 5, '24-48h': 3, '48-72h': 1, '72h+': 0 } },
      ],
    });
  }),

  // AI Copilot
  http.post('/api/v1/ai/chat', () => {
    return HttpResponse.json({
      response: 'I can help you with that. Based on your query, here is the information you requested.',
      toolsUsed: ['getProductionOrder', 'getInventoryLot'],
      toolResults: [
        { tool: 'getProductionOrder', result: { id: 'po_1', status: 'RELEASED' } },
        { tool: 'getInventoryLot', result: { id: 'lot_1', qty: 100, status: 'AVAILABLE' } },
      ],
    });
  }),

  http.get('/api/v1/ai/tools', () => {
    return HttpResponse.json({
      tools: [
        { name: 'getProductionOrder', description: 'Get production order details', parameters: { orderId: { type: 'string' } } },
        { name: 'getInventoryLot', description: 'Get inventory lot details', parameters: { lotId: { type: 'string' } } },
        { name: 'getDiamondGenealogy', description: 'Get diamond genealogy', parameters: { diamondId: { type: 'string' } } },
        { name: 'getWorkCenterQueue', description: 'Get work center queue', parameters: { workCenterId: { type: 'string' } } },
        { name: 'runMrp', description: 'Run MRP for company', parameters: { companyId: { type: 'string' } } },
      ],
    });
  }),

  // Health
  http.get('/health/live', () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  http.get('/health/ready', () => {
    return HttpResponse.json({ status: 'ready' });
  }),

  http.get('/metrics', () => {
    return new HttpResponse(
      `# HELP diamondflow_http_requests_total Total HTTP requests
# TYPE diamondflow_http_requests_total counter
diamondflow_http_requests_total{method="GET",path="/api/v1/health/live",status="200"} 1
diamondflow_http_requests_total{method="POST",path="/api/v1/auth/login",status="200"} 1
# HELP diamondflow_http_request_duration_seconds HTTP request duration
# TYPE diamondflow_http_request_duration_seconds histogram
diamondflow_http_request_duration_seconds_bucket{method="GET",path="/api/v1/health/live",le="0.1"} 1
diamondflow_http_request_duration_seconds_bucket{method="GET",path="/api/v1/health/live",le="0.5"} 1
diamondflow_http_request_duration_seconds_bucket{method="GET",path="/api/v1/health/live",le="1"} 1
diamondflow_http_request_duration_seconds_bucket{method="GET",path="/api/v1/health/live",le="+Inf"} 1`,
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }),

  // Error fallback
  http.all('*', () => {
    return new HttpResponse(null, { status: 404 });
  }),
];