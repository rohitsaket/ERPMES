# DiamondFlow Domain Model

## Overview

This document describes the core domain model for DiamondFlow, organized by business workflow. The domain layer is implemented in `packages/domain` as pure TypeScript with no infrastructure dependencies.

## Domain Organization by Workflow

### Workflow 1: Master Business Flow (Sales → Production → Delivery)

#### Sales Domain

**Aggregates:**
- `Quotation` - Customer-facing price quote with versioning and approval
- `SalesOrder` - Confirmed customer order with credit validation

**Entities:**
- `QuotationLine` - Product, quantity, price, discount per line
- `SalesOrderLine` - Links to production order, allocation status

**Value Objects:**
- `QuotationId`, `SalesOrderId`, `CustomerId`
- `Money` (currency, amount), `Quantity` (value, UoM)
- `CreditCheckResult` (approved, limit, riskScore)

**Domain Events:**
- `QuotationCreated`, `QuotationApproved`, `QuotationRejected`
- `SalesOrderCreated`, `SalesOrderValidated`, `SalesOrderReleased`

#### Planning Domain

**Aggregates:**
- `ProductionOrder` - Manufacturing work order with routing
- `JobCard` - Shop floor execution document per operation

**Entities:**
- `ProductionOrderOperation` - Step in routing with work center, timing
- `MrpPlannedOrder` - MRP-generated supply suggestion
- `CapacityRequirement` - Load on work center per time bucket

**Value Objects:**
- `ProductionOrderId`, `JobCardId`, `RoutingId`
- `Schedule` (startDate, endDate, status)
- `CapacityLoad` (workCenterId, period, requiredHours, availableHours)

**Domain Services:**
- `MrpCalculationService` - Net requirements, planned orders, pegging
- `FiniteSchedulingService` - CP-SAT optimization with constraints
- `CapacityLevelingService` - Load balancing, overtime, subcontracting

**Domain Events:**
- `MrpRunCompleted`, `PlannedOrderCreated`
- `ProductionOrderCreated`, `ProductionOrderReleased`
- `JobCardGenerated`, `JobCardAssigned`

#### Procurement Domain

**Aggregates:**
- `PurchaseRequisition` - Internal request for materials
- `PurchaseOrder` - Legal commitment to vendor
- `GoodsReceipt` - Physical receipt with inspection

**Entities:**
- `PurchaseRequisitionLine`, `PurchaseOrderLine`, `GoodsReceiptLine`
- `Vendor` - Supplier master data with performance metrics
- `Rfq` - Request for quotation with vendor responses

**Value Objects:**
- `PurchaseOrderId`, `GoodsReceiptId`, `VendorId`
- `LeadTime` (days, variance), `Price` (Money, validity)
- `InspectionResult` (accepted, rejected, conditional)

**Domain Events:**
- `PurchaseRequisitionCreated`, `RfqIssued`, `PurchaseOrderCreated`
- `GoodsReceived`, `GoodsInspected`, `InvoiceMatched`

#### Inventory Domain

**Aggregates:**
- `InventoryLot` - Traceable stock lot with quantity, status, location
- `Reservation` - Allocation of inventory to sales/production order

**Entities:**
- `InventoryTransaction` - Immutable movement record
- `InventorySnapshot` - Point-in-time balance for ERP reconciliation

**Value Objects:**
- `LotId`, `ItemId`, `WarehouseId`, `LocationId`
- `Quantity` (value, UoM, precision), `Weight` (carat, gram)
- `InventoryStatus` (available, reserved, quarantined, blocked)

**Domain Services:**
- `ReservationService` - FIFO/FEFO/allocation strategies
- `InventoryValuationService` - FIFO, weighted average, standard cost

**Domain Events:**
- `InventoryReceived`, `InventoryIssued`, `InventoryTransferred`
- `InventoryAdjusted`, `InventorySnapshotCreated`

#### Manufacturing Domain

**Aggregates:**
- `Operation` - Active work on work center with real-time state

**Entities:**
- `WorkCenterQueue` - Ordered operations awaiting processing
- `DepartmentTransfer` - Inter-department movement with genealogy
- `PacketIssue` - Diamond packet issued to operation

**Value Objects:**
- `OperationId`, `WorkCenterId`, `DepartmentId`
- `OperationState` (queued, running, paused, transferred, held, completed)
- `WeightYield` (inputWeight, outputWeight, yieldPct, lossPct)
- `TimeRecord` (setupMin, runMin, waitMin, moveMin)

**Domain Services:**
- `WorkCenterQueueService` - Priority sequencing, SPT/EDD/CR rules
- `YieldCalculationService` - Diamond weight tracking, loss accounting
- `TransferService` - Department handoff with genealogy

**Domain Events:**
- `OperationStarted`, `OperationPaused`, `OperationResumed`
- `OperationTransferred`, `OperationCompleted`, `WeightYieldRecorded`

#### Diamonds Domain

**Aggregates:**
- `Diamond` - Master stone with complete digital genealogy
- `DiamondPacket` - Physical container for stones in process

**Entities:**
- `StoneGenealogy` - Immutable event log of stone lifecycle
- `Allocation` - Stone assigned to sales order/production order

**Value Objects:**
- `DiamondId`, `CertificateNumber`, `PacketId`, `BagId`
- `DiamondSpec` (carat, color, clarity, cut, shape, origin)
- `GenealogyEvent` (type, fromDept, toDept, weightBefore, weightAfter, lossPct, timestamp, operatorId, machineId)

**Domain Services:**
- `DiamondGenealogyService` - Complete traceability queries
- `AllocationOptimizationService` - Best-fit stone to order
- `SplitMergeService` - Stone division/recombination with genealogy

**Domain Events:**
- `DiamondAllocated`, `DiamondTransferred`, `DiamondSplit`, `DiamondMerged`
- `DiamondCertified`, `DiamondBagged`, `DiamondDispatched`

#### Dispatch Domain

**Aggregates:**
- `Shipment` - Customer delivery with tracking
- `Bag` - Sealed container with diamonds/jewelry

**Entities:**
- `ShipmentTracking` - Carrier status updates
- `DispatchPlan` - Consolidation logic for shipments

**Value Objects:**
- `ShipmentId`, `BagId`, `TrackingNumber`
- `CarrierInfo` (name, serviceLevel, accountNumber)
- `DeliveryProof` (signature, timestamp, gps, photo)

**Domain Events:**
- `BagCreated`, `ShipmentCreated`, `ShipmentDispatched`
- `ShipmentDelivered`, `DeliveryConfirmed`

#### Finance Domain

**Aggregates:**
- `Invoice` - Customer billing document
- `Payment` - Receipt against invoice
- `JournalEntry` - GL posting with double-entry

**Entities:**
- `InvoiceLine`, `PaymentAllocation`
- `ChartOfAccount` - Account structure per company

**Value Objects:**
- `InvoiceId`, `PaymentId`, `JournalEntryId`, `AccountCode`
- `TaxCalculation` (taxCode, rate, amount, jurisdiction)
- `ExchangeRate` (fromCurrency, toCurrency, rate, date)

**Domain Events:**
- `InvoiceGenerated`, `PaymentReceived`, `JournalEntryPosted`
- `AccountingPeriodClosed`

#### Returns Domain

**Aggregates:**
- `ReturnAuthorization` - Approved customer return
- `RepairOrder` - Manufacturing rework for returned goods

**Entities:**
- `ReturnReceipt` - Physical receipt with inspection
- `Redispatch` - Re-shipment after repair

**Value Objects:**
- `ReturnId`, `RepairOrderId`, `Disposition` (credit, replace, repair, reject)

**Domain Events:**
- `ReturnAuthorized`, `ReturnReceived`, `RepairOrderCreated`
- `RepairCompleted`, `Redispatched`

---

### Workflow 2: Legacy ERP Synchronization

**Aggregates:**
- `ErpSyncRecord` - Complete audit trail of each sync operation

**Entities:**
- `ErpConnector` - Configuration for each external system
- `MappingVersion` - Schema transformation rules

**Value Objects:**
- `SyncId`, `ConnectorId`, `ExternalIdentifier`
- `SyncResult` (received, accepted, rejected, conflicts, retries)
- `ReconciliationResult` (matched, unmatched, discrepancies)

**Domain Services:**
- `SchemaValidationService` - XSD/JSON schema validation
- `DataTransformationService` - External → internal mapping
- `ConflictDetectionService` - Duplicate, version, referential conflicts
- `ReconciliationService` - Inventory snapshot comparison

**Domain Events:**
- `ErpSyncStarted`, `ErpSyncCompleted`, `ErpSyncFailed`
- `InventorySnapshotCreated`, `ReconciliationCompleted`

---

### Workflow 3: Planning Workflow

Covered in Planning Domain above (MRP, Capacity, Finite Scheduling)

---

### Workflow 4: Manufacturing Workflow

Covered in Manufacturing Domain above (Operations, Queues, Transfers, Yield)

---

### Workflow 5: Configurable Department Route

**Aggregates:**
- `Routing` - Versioned sequence of operations
- `RoutingConfiguration` - Rules for route selection

**Entities:**
- `RoutingOperation` - Step with department, work center type, timing
- `RoutingRule` - Condition (product, diamond type, shape, customer, priority) → department sequence

**Value Objects:**
- `RoutingId`, `RoutingVersion`
- `RoutingKey` (companyId, factoryId, productId, diamondType, shape, customerId, orderType, method, priority, qualityReq)
- `DepartmentSequence` (ordered list of department IDs)

**Domain Services:**
- `RoutingSelectionEngine` - Evaluates rules, returns applicable routing
- `RoutingVersioningService` - Immutable versions, effective dates

**Domain Events:**
- `RoutingSelected`, `RoutingChanged`, `RoutingVersionCreated`

---

### Workflow 6: Quality & Rework Workflow

**Aggregates:**
- `QualityInspection` - Inspection execution against plan
- `Nonconformance` - Deviation with disposition workflow

**Entities:**
- `InspectionPlan` - Linked to routing operation
- `InspectionStep` - Variable/attribute, spec limits, sampling
- `CorrectiveAction` - Root cause, action, verification

**Value Objects:**
- `InspectionPlanId`, `InspectionId`, `NcrId`
- `InspectionResult` (value, pass/fail, measurement, images)
- `Disposition` (rework, repair, regrade, acceptDeviation, returnToSupplier, reject)
- `SamplingPlan` (AQL, sampleSize, acceptRejectNumbers)

**Domain Services:**
- `InspectionSamplingService` - ANSI/ISO sampling plans
- `DispositionDecisionService` - Business rules for disposition options
- `CapeService` - Corrective/preventive action tracking

**Domain Events:**
- `InspectionCompleted`, `NonconformanceCreated`
- `DispositionDecided`, `CorrectiveActionCreated`
- `ReinspectionCompleted`

---

### Workflow 7: Certification Workflow

**Aggregates:**
- `CertificationRequest` - Submission to external lab
- `Certificate` - Validated lab certificate

**Entities:**
- `LabSubmission` - Package sent to lab with tracking
- `LabIntegration` - API configuration per lab (GIA, IGI, HRD, etc.)

**Value Objects:**
- `CertificationRequestId`, `CertificateId`, `LabId`
- `CertificateData` (reportNumber, measurements, grades, images)
- `ValidationResult` (valid, discrepancies, verifiedBy, verifiedAt)

**Domain Services:**
- `LabIntegrationService` - Submit, poll, receive via API/EDI
- `CertificateValidationService` - Cross-check with stone specs

**Domain Events:**
- `CertificationRequested`, `CertificateReceived`
- `CertificateValidated`, `DiamondCertified`

---

### Workflow 8: Return & Repair Workflow

Covered in Returns Domain above

---

### Workflow 9: Event Flow

**Core Infrastructure (Cross-cutting):**

**Entities:**
- `OutboxEvent` - Pending domain event for publishing
- `InboxEvent` - Received event for idempotent processing

**Value Objects:**
- `EventId`, `CorrelationId`, `CausationId`
- `EventMetadata` (version, timestamp, userId, orgScope)
- `IdempotencyKey` (consumer + eventId)

**Domain Services:**
- `EventPublisher` - Transactional outbox → message broker
- `EventProcessor` - Inbox → handler with retry/DLQ
- `EventReplayer` - Replay from checkpoint with filters

**Domain Events:**
- All domain events flow through this infrastructure

---

### Workflow 10: AI Workflow

**Aggregates:**
- `AiInteraction` - Complete audit trail of AI request/response

**Entities:**
- `AiTool` - Registered function with schema, permissions
- `AiIntent` - Classified user intent with confidence

**Value Objects:**
- `InteractionId`, `ToolId`, `IntentId`
- `ToolSchema` (name, description, parameters Zod schema, requiredPermissions)
- `AiContext` (userId, orgScope, permissions, relevantEntityIds)
- `ValidationResult` (valid, errors, sanitizedOutput)

**Domain Services:**
- `IntentClassificationService` - NLP → structured intent
- `ToolSelectionService` - Match intent → approved tools
- `PermissionGuard` - Validate tool execution against user permissions
- `ResultValidationService` - Schema validation, hallucination detection

**Domain Events:**
- `AiRequestReceived`, `AiToolExecuted`, `AiResponseGenerated`

---

## Shared Kernel (Cross-Domain)

### Value Objects

```typescript
// packages/domain/src/value-objects/

Money          // currency, amount (decimal.js)
Quantity       // value, unitOfMeasure (UCUM)
Weight         // carat, gram, precision
Percentage     // 0-100 with precision
Duration       // minutes, hours, days
DateRange      // start, end, inclusivity
Priority       // enum: low, normal, high, urgent, critical
Status         // generic state machine base
```

### Domain Events Base

```typescript
// packages/domain/src/events/

interface DomainEvent<T = unknown> {
  eventId: string;           // UUID v7
  eventType: string;         // "SalesOrderCreated"
  version: number;           // 1
  aggregateId: string;       // entity ID
  aggregateType: string;     // "SalesOrder"
  timestamp: Date;           // ISO 8601
  correlationId: string;     // tracks business transaction
  causationId?: string;      // event that caused this
  userId: string;            // actor
  organizationScope: {       // for multi-tenancy
    companyId: string;
    branchId?: string;
    factoryId?: string;
    departmentId?: string;
  };
  payload: T;                // typed payload
}
```

### Repository Interfaces

```typescript
// packages/domain/src/repositories/

interface Repository<T extends AggregateRoot> {
  findById(id: string): Promise<T | null>;
  save(aggregate: T): Promise<void>;
  delete(id: string): Promise<void>;
}

interface SalesOrderRepository extends Repository<SalesOrder> {
  findByCustomer(customerId: string): Promise<SalesOrder[]>;
  findByStatus(status: SalesOrderStatus): Promise<SalesOrder[]>;
  findByDateRange(range: DateRange): Promise<SalesOrder[]>;
}

interface DiamondRepository extends Repository<Diamond> {
  findByPacket(packetId: string): Promise<Diamond[]>;
  findByGenealogy(parentDiamondId: string): Promise<Diamond[]>;
  findByStatus(status: DiamondStatus): Promise<Diamond[]>;
}
```

### Aggregate Root Base

```typescript
// packages/domain/src/aggregate-root.ts

abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];
  protected _version: number = 0;

  get domainEvents(): DomainEvent[] { return [...this._domainEvents]; }
  get version(): number { return this._version; }

  protected addEvent<T>(event: DomainEvent<T>): void {
    this._domainEvents.push(event);
  }

  protected clearEvents(): void {
    this._domainEvents = [];
  }

  protected incrementVersion(): void {
    this._version++;
  }
}
```

---

## Domain Service Registry

| Service | Package | Dependencies |
|---------|---------|--------------|
| `PricingDomainService` | sales | Product, Customer, Currency |
| `MrpCalculationService` | planning | BOM, Inventory, Demand, Capacity |
| `FiniteSchedulingService` | planning | Operations, Resources, Constraints |
| `RoutingSelectionEngine` | manufacturing | Product, Order, Rules |
| `DiamondGenealogyService` | diamonds | Events, Packets, Allocations |
| `YieldCalculationService` | manufacturing | Weight, Operations |
| `InspectionSamplingService` | quality | Plan, Lot Size, AQL |
| `DispositionDecisionService` | quality | NCR Type, Customer, Regulations |
| `CertificationValidationService` | quality | Certificate, Diamond Spec |
| `AllocationOptimizationService` | diamonds | Orders, Stones, Constraints |
| `InventoryValuationService` | inventory | Lots, Transactions, Policy |
| `ReservationService` | inventory | Demand, Supply, Priority |
| `EventPublisher` | events | Outbox, Broker |
| `EventProcessor` | events | Inbox, Handlers |
| `IntentClassificationService` | ai | NLP Model |
| `ToolSelectionService` | ai | Tool Registry, Permissions |

---

## Invariants & Business Rules

### Sales
- Quotation must be approved before conversion to Sales Order
- Sales Order requires credit check pass
- Sales Order line quantity > 0
- Quotation version immutable after approval

### Planning
- MRP runs only for active items with demand
- Planned orders respect lead times and safety stock
- Finite schedule cannot exceed work center capacity
- Production order operations follow routing sequence

### Procurement
- PO requires approved requisition
- GR quantity ≤ PO line open quantity
- Inspection required for critical items
- Three-way match (PO, GR, Invoice) before payment

### Inventory
- Inventory lot quantity ≥ 0 always
- Reservation quantity ≤ available quantity
- Transfer creates outbound + inbound transactions
- Adjustment requires reason code and approval

### Manufacturing
- Operation can only start if prior operation completed
- Weight out ≤ weight in (conservation of mass)
- Yield % tracked per operation
- Department transfer requires acceptance

### Diamonds
- Every diamond has immutable identity
- Genealogy event for every state change
- Weight loss tracked at each operation
- Split/merge preserves total carat weight

### Quality
- Inspection plan required for critical operations
- NCR required for failed inspection
- Disposition mandatory before next operation
- Rework creates new operation with traceability

### Certification
- Certificate required for diamonds > threshold carat
- Lab submission tracked with SLA
- Certificate validated against stone specs
- Only validated certificates allow bagging

### Returns
- Return authorization required before receipt
- Repair order follows manufacturing workflow
- Re-certification if stone altered
- Credit only after receipt and inspection

---

## Context Maps

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sales     │────►│  Planning   │────►│Procurement  │
│  (Customer  │     │  (MRP,      │     │  (PO, GR,   │
│   Order)    │     │   Schedule) │     │   Vendor)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐     ┌─────────────┐
                    │Inventory    │◄────│Manufacturing│
                    │(Lots, Resv) │     │(Ops, Queue) │
                    └──────┬──────┘     └──────┬──────┘
                           │                   │
                    ┌──────▼──────┐     ┌──────▼──────┐
                    │  Diamonds   │     │  Quality    │
                    │(Genealogy,  │     │(Inspect,    │
                    │ Alloc)      │     │  NCR, Cert) │
                    └──────┬──────┘     └──────┬──────┘
                           │                   │
                    ┌──────▼───────────────────▼──────┐
                    │         Dispatch                │
                    │    (Bag, Ship, Track)           │
                    └──────────────────┬──────────────┘
                                       │
                              ┌────────▼────────┐
                              │      Finance    │
                              │ (Invoice, Pay,  │
                              │  GL, Returns)   │
                              └─────────────────┘
                                       │
                              ┌────────▼────────┐
                              │     Events      │
                              │ (Audit, Notify, │
                              │  Realtime, AI)  │
                              └─────────────────┘
```

---

## Anti-Corruption Layers

| External System | ACL Location | Responsibility |
|-----------------|--------------|----------------|
| Legacy ERP | `packages/database/src/erp-sync/` | Schema mapping, conflict resolution |
| Lab Systems (GIA/IGI) | `apps/api/src/modules/quality/lab-integration/` | Submit, poll, parse certificates |
| Courier APIs | `apps/api/src/modules/dispatch/carrier-integration/` | Rate, track, label |
| CAD/PLM | `apps/api/src/modules/integration/cad/` | BOM push, ECN sync |
| EDI (X12/EDIFACT) | `apps/api/src/modules/integration/edi/` | Parse, validate, transform |
| Banking/Payment | `apps/api/src/modules/finance/payment/` | Tokenize, authorize, reconcile |

---

## Testing Strategy

### Unit Tests (Domain Layer)
- Aggregate behavior (command → events)
- Value object invariants
- Domain service logic
- Specification pattern for complex rules

### Integration Tests (Application Layer)
- Use case execution with repositories
- Event publishing/consumption
- Authorization enforcement
- Saga orchestration

### Contract Tests
- API schema validation (Zod)
- Event schema compatibility
- EDI message compliance

### Property-Based Tests
- Invariant preservation (weight conservation, quantity non-negative)
- State machine transitions
- Idempotency of event handlers