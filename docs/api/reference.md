# API Reference

## Overview

All APIs are versioned under `/api/v1` and follow REST conventions with JSON request/response bodies.

## Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api/v1` |
| Staging | `https://api-staging.diamondflow.com/api/v1` |
| Production | `https://api.diamondflow.com/api/v1` |

## Authentication

All endpoints require authentication via Bearer token (Clerk JWT):

```
Authorization: Bearer <clerk_jwt_token>
```

## Organization Context

All requests automatically scoped to user's organization via JWT claims:
- `x-company-id`: Current company
- `x-branch-id`: Current branch (optional)
- `x-factory-id`: Current factory (optional)
- `x-department-id`: Current department (optional)

## Standard Response Envelope

```json
{
  "data": T,
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123",
    "version": "1.0"
  }
}
```

## Standard Error Object

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ],
    "requestId": "req_abc123"
  }
}
```

## Pagination

Query parameters:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `sort` (field:direction, e.g., `createdAt:desc`)
- `filter` (JSON encoded filters)

Response includes:
```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

## Idempotency

For mutating endpoints, include `Idempotency-Key` header:
```
Idempotency-Key: unique-key-per-operation
```

## Rate Limiting

- 1000 requests/minute per user
- 10000 requests/minute per company
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## API Endpoints by Module

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Initiate Clerk login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/mfa` | Verify MFA challenge |
| GET | `/auth/me` | Current user profile |
| POST | `/auth/logout` | Invalidate session |

### Companies & Organization

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/companies` | List companies (super admin) |
| POST | `/companies` | Create company |
| GET | `/companies/:id` | Get company details |
| PATCH | `/companies/:id` | Update company |
| GET | `/companies/:id/branches` | List branches |
| POST | `/companies/:id/branches` | Create branch |
| GET | `/branches/:id/factories` | List factories |
| POST | `/branches/:id/factories` | Create factory |
| GET | `/factories/:id/warehouses` | List warehouses |
| POST | `/factories/:id/warehouses` | Create warehouse |
| GET | `/factories/:id/departments` | List departments |
| POST | `/factories/:id/departments` | Create department |
| GET | `/departments/:id/work-centers` | List work centers |
| POST | `/departments/:id/work-centers` | Create work center |

### Master Data

#### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products |
| POST | `/products` | Create product |
| GET | `/products/:id` | Get product |
| PATCH | `/products/:id` | Update product |
| GET | `/products/:id/bom` | Get BOM |
| POST | `/products/:id/bom` | Create BOM version |
| GET | `/products/:id/routing` | Get routing |
| POST | `/products/:id/routing` | Create routing version |
| GET | `/products/:id/routing/config` | Get routing configurations |
| POST | `/products/:id/routing/config` | Create routing config |

#### Customers & Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer |
| PATCH | `/customers/:id` | Update customer |
| GET | `/vendors` | List vendors |
| POST | `/vendors` | Create vendor |
| GET | `/vendors/:id` | Get vendor |
| PATCH | `/vendors/:id` | Update vendor |
| GET | `/vendors/:id/rfqs` | Vendor RFQs |
| GET | `/vendors/:id/pos` | Vendor POs |

#### Work Centers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/work-centers` | List work centers |
| POST | `/work-centers` | Create work center |
| GET | `/work-centers/:id` | Get work center |
| PATCH | `/work-centers/:id` | Update work center |
| GET | `/work-centers/:id/queue` | Get real-time queue |
| GET | `/work-centers/:id/oee` | Get OEE metrics |

### Sales

#### Quotations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quotations` | List quotations |
| POST | `/quotations` | Create quotation |
| GET | `/quotations/:id` | Get quotation |
| PATCH | `/quotations/:id` | Update quotation |
| POST | `/quotations/:id/approve` | Approve quotation |
| POST | `/quotations/:id/reject` | Reject quotation |
| POST | `/quotations/:id/revise` | Create revision |
| POST | `/quotations/:id/convert-to-order` | Convert to sales order |

#### Sales Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales-orders` | List sales orders |
| POST | `/sales-orders` | Create sales order |
| GET | `/sales-orders/:id` | Get sales order |
| PATCH | `/sales-orders/:id` | Update sales order |
| POST | `/sales-orders/:id/validate` | Validate & credit check |
| POST | `/sales-orders/:id/release` | Release to planning |
| GET | `/sales-orders/:id/lines` | Get order lines |
| GET | `/sales-orders/:id/allocations` | Get stone allocations |

### Planning

#### MRP

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mrp/runs` | Trigger MRP run |
| GET | `/mrp/runs` | List MRP runs |
| GET | `/mrp/runs/:id` | Get MRP run details |
| GET | `/mrp/runs/:id/exceptions` | Get exceptions |
| GET | `/mrp/runs/:id/pegging/:itemId` | Get pegging for item |

#### Production Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/production-orders` | List production orders |
| POST | `/production-orders` | Create production order |
| GET | `/production-orders/:id` | Get production order |
| PATCH | `/production-orders/:id` | Update production order |
| POST | `/production-orders/:id/release` | Release to shop floor |
| POST | `/production-orders/:id/close` | Close production order |
| GET | `/production-orders/:id/operations` | Get operations |
| GET | `/production-orders/:id/schedule` | Get finite schedule |
| GET | `/production-orders/:id/job-cards` | Get job cards |

#### Capacity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/capacity/load` | Get capacity load |
| GET | `/capacity/load/:workCenterId` | Work center load |
| POST | `/capacity/level` | Run capacity leveling |

### Procurement

#### Purchase Requisitions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requisitions` | List requisitions |
| POST | `/requisitions` | Create requisition |
| GET | `/requisitions/:id` | Get requisition |
| PATCH | `/requisitions/:id` | Update requisition |
| POST | `/requisitions/:id/approve` | Approve requisition |

#### RFQs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rfqs` | List RFQs |
| POST | `/rfqs` | Create RFQ |
| GET | `/rfqs/:id` | Get RFQ |
| POST | `/rfqs/:id/issue` | Issue to vendors |
| POST | `/rfqs/:id/respond` | Vendor response |

#### Purchase Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchase-orders` | List POs |
| POST | `/purchase-orders` | Create PO |
| GET | `/purchase-orders/:id` | Get PO |
| PATCH | `/purchase-orders/:id` | Update PO |
| POST | `/purchase-orders/:id/approve` | Approve PO |
| POST | `/purchase-orders/:id/send` | Send to vendor |

#### Goods Receipts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/goods-receipts` | List GRs |
| POST | `/goods-receipts` | Create GR |
| GET | `/goods-receipts/:id` | Get GR |
| POST | `/goods-receipts/:id/inspect` | Record inspection |
| POST | `/goods-receipts/:id/post` | Post to inventory |

### Inventory

#### Lots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory/lots` | List lots |
| GET | `/inventory/lots/:id` | Get lot details |
| GET | `/inventory/lots/:id/transactions` | Lot transactions |
| GET | `/inventory/lots/available` | Available lots for allocation |

#### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inventory/issue` | Issue inventory |
| POST | `/inventory/receive` | Receive inventory |
| POST | `/inventory/transfer` | Transfer between locations |
| POST | `/inventory/adjust` | Adjust inventory |
| POST | `/inventory/reserve` | Reserve for order |
| POST | `/inventory/release-reservation` | Release reservation |

#### Physical Count

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inventory/counts` | Create count sheet |
| GET | `/inventory/counts/:id` | Get count |
| POST | `/inventory/counts/:id/enter` | Enter counts |
| POST | `/inventory/counts/:id/approve` | Approve & post variance |

#### ERP Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inventory/erp-sync` | Trigger sync |
| GET | `/inventory/erp-sync/history` | Sync history |
| GET | `/inventory/erp-sync/:id` | Sync details |
| GET | `/inventory/erp-sync/:id/conflicts` | Conflicts |
| POST | `/inventory/erp-sync/:id/resolve` | Resolve conflict |

### Manufacturing

#### Shop Floor

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shop-floor/queue` | Department queue |
| GET | `/shop-floor/queue/:workCenterId` | Work center queue |
| POST | `/operations/:id/start` | Start operation |
| POST | `/operations/:id/pause` | Pause operation |
| POST | `/operations/:id/resume` | Resume operation |
| POST | `/operations/:id/transfer` | Transfer to next dept |
| POST | `/operations/:id/hold` | Hold operation |
| POST | `/operations/:id/complete` | Complete operation |
| POST | `/operations/:id/yield` | Record weight/yield |

#### Job Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/job-cards` | List job cards |
| GET | `/job-cards/:id` | Get job card |
| POST | `/job-cards/:id/assign` | Assign to operator |
| POST | `/job-cards/:id/print` | Generate PDF |

#### WIP Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wip/board` | WIP board view |
| GET | `/wip/aging` | WIP aging report |
| GET | `/wip/diamonds/:id` | Diamond traceability |
| GET | `/wip/packets/:id` | Packet tracking |

### Diamonds

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/diamonds` | List diamonds |
| POST | `/diamonds` | Create diamond record |
| GET | `/diamonds/:id` | Get diamond |
| GET | `/diamonds/:id/genealogy` | Complete genealogy tree |
| POST | `/diamonds/:id/allocate` | Allocate to order |
| POST | `/diamonds/:id/transfer` | Transfer department |
| POST | `/diamonds/:id/split` | Split diamond |
| POST | `/diamonds/:id/merge` | Merge diamonds |
| GET | `/diamonds/:id/certificate` | Get certificate |

#### Packets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/packets` | List packets |
| POST | `/packets` | Create packet |
| GET | `/packets/:id` | Get packet |
| POST | `/packets/:id/issue` | Issue to operation |
| POST | `/packets/:id/return` | Return from operation |
| POST | `/packets/:id/bag` | Move to bag |

### Quality

#### Inspection Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inspection-plans` | List plans |
| POST | `/inspection-plans` | Create plan |
| GET | `/inspection-plans/:id` | Get plan |
| PATCH | `/inspection-plans/:id` | Update plan |

#### Inspections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inspections` | List inspections |
| POST | `/inspections` | Create inspection |
| GET | `/inspections/:id` | Get inspection |
| PATCH | `/inspections/:id` | Update inspection |
| POST | `/inspections/:id/complete` | Complete with results |
| POST | `/inspections/:id/ncr` | Create NCR |

#### NCRs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ncrs` | List NCRs |
| GET | `/ncrs/:id` | Get NCR |
| POST | `/ncrs/:id/disposition` | Record disposition |
| POST | `/ncrs/:id/capa` | Create corrective action |
| POST | `/ncrs/:id/reinspect` | Schedule reinspection |

#### Certificates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/certificates` | List certificates |
| POST | `/certificates/request` | Request certification |
| GET | `/certificates/:id` | Get certificate |
| POST | `/certificates/:id/validate` | Validate certificate |
| GET | `/certificates/:id/download` | Download PDF |

### Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assets` | List assets |
| POST | `/assets` | Create asset |
| GET | `/work-orders` | List work orders |
| POST | `/work-orders` | Create work order |
| GET | `/work-orders/:id` | Get work order |
| POST | `/work-orders/:id/complete` | Complete work order |
| GET | `/pm-schedules` | List PM schedules |

### Dispatch

#### Bagging

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bags` | List bags |
| POST | `/bags` | Create bag |
| GET | `/bags/:id` | Get bag |
| POST | `/bags/:id/seal` | Seal bag |
| POST | `/bags/:id/assign-shipment` | Assign to shipment |

#### Shipments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shipments` | List shipments |
| POST | `/shipments` | Create shipment |
| GET | `/shipments/:id` | Get shipment |
| POST | `/shipments/:id/dispatch` | Dispatch shipment |
| GET | `/shipments/:id/tracking` | Get tracking |
| POST | `/shipments/:id/deliver` | Mark delivered |

#### Carriers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/carriers` | List carriers |
| POST | `/carriers` | Create carrier |
| GET | `/carriers/:id/rates` | Get rates |
| POST | `/carriers/:id/track` | Track shipment |

### Finance

#### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | List invoices |
| POST | `/invoices` | Create invoice |
| GET | `/invoices/:id` | Get invoice |
| POST | `/invoices/:id/send` | Send to customer |
| POST | `/invoices/:id/void` | Void invoice |

#### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List payments |
| POST | `/payments` | Record payment |
| GET | `/payments/:id` | Get payment |
| POST | `/payments/:id/allocate` | Allocate to invoices |

#### General Ledger

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chart-of-accounts` | List accounts |
| POST | `/chart-of-accounts` | Create account |
| GET | `/journal-entries` | List journal entries |
| POST | `/journal-entries` | Create journal entry |
| POST | `/periods/close` | Close accounting period |

### Returns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/returns/authorizations` | List RAs |
| POST | `/returns/authorizations` | Create RA |
| GET | `/returns/authorizations/:id` | Get RA |
| POST | `/returns/authorizations/:id/approve` | Approve RA |
| POST | `/returns/receipts` | Create return receipt |
| GET | `/returns/repair-orders` | List repair orders |
| POST | `/returns/repair-orders` | Create repair order |
| POST | `/returns/repair-orders/:id/redispatch` | Redispatch after repair |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/oee` | OEE dashboard |
| GET | `/analytics/yield` | Yield trends |
| GET | `/analytics/otd` | On-time delivery |
| GET | `/analytics/wip-aging` | WIP aging |
| GET | `/analytics/capacity` | Capacity utilization |
| GET | `/analytics/custom` | Custom report builder |

### AI Copilot

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Chat with copilot |
| POST | `/ai/tools/execute` | Execute tool |
| GET | `/ai/tools` | List available tools |
| GET | `/ai/interactions` | Interaction history |

---

## Real-time Events (Socket.IO)

### Connection

```javascript
const socket = io('https://api.diamondflow.com', {
  auth: { token: clerkJwt },
  transports: ['websocket', 'polling']
});
```

### Rooms (Auto-joined based on org scope)

- `company:{companyId}` - Company-wide notifications
- `factory:{factoryId}` - Factory dashboards
- `department:{departmentId}` - Department queues
- `workcenter:{workCenterId}` - Machine/operator screens
- `production-order:{orderId}` - Order tracking
- `diamond:{diamondId}` - Stone tracking
- `user:{userId}` - Personal notifications

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `operation:started` | `{ orderId, operationId, workCenterId }` | Operation started |
| `operation:completed` | `{ orderId, operationId, yield }` | Operation completed |
| `diamond:transferred` | `{ diamondId, fromDept, toDept }` | Diamond moved |
| `queue:updated` | `{ workCenterId, queue }` | Queue changed |
| `ncr:created` | `{ ncrId, orderId, operationId }` | NCR created |
| `shipment:tracking` | `{ shipmentId, status, location }` | Tracking update |
| `notification:new` | `{ notification }` | New notification |

---

## Webhooks

### Outgoing Webhooks (Configured per Company)

| Event | Endpoint | Retry Policy |
|-------|----------|--------------|
| `sales_order.created` | `POST /webhooks/sales-order` | 3x exponential backoff |
| `production_order.completed` | `POST /webhooks/production-order` | 3x exponential backoff |
| `shipment.dispatched` | `POST /webhooks/shipment` | 3x exponential backoff |
| `invoice.generated` | `POST /webhooks/invoice` | 3x exponential backoff |
| `payment.received` | `POST /webhooks/payment` | 3x exponential backoff |

### Incoming Webhooks

| Source | Endpoint | Purpose |
|--------|----------|---------|
| Clerk | `POST /webhooks/clerk` | User/org sync |
| Lab (GIA/IGI) | `POST /webhooks/lab/:labId` | Certificate callback |
| Carrier | `POST /webhooks/carrier/:carrierId` | Tracking updates |
| ERP | `POST /webhooks/erp/:connectorId` | Async responses |
| Payment Gateway | `POST /webhooks/payment/:gatewayId` | Payment status |

---

## OpenAPI Specification

Full OpenAPI 3.1 spec available at:
- Development: `http://localhost:3000/api/docs`
- Production: `https://api.diamondflow.com/api/docs`

Download: `GET /api/v1/openapi.json`