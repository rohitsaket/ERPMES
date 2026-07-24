# DiamondFlow — Complete Updated Component Architecture (Workflow-Aligned)

## Overview

This document describes the complete component architecture for DiamondFlow, aligned with the 10 business workflows defined in the specification.

## Monorepo Structure

```
diamondflow/
├── apps/
│   ├── api/                      # NestJS REST + WebSocket API
│   ├── web/                      # Next.js 14 Main Application (PWA)
│   ├── portal-customer/          # Customer Portal (Next.js)
│   ├── portal-supplier/          # Supplier Portal (Next.js)
│   └── worker/                   # BullMQ Background Workers
├── packages/
│   ├── contracts/                # Shared Zod Schemas, API Types, Event Contracts
│   ├── domain/                   # Pure Domain Logic (DDD Aggregates, Entities, VOs)
│   ├── database/                 # Prisma Schema, Repositories, Migrations
│   ├── auth/                     # Authentication Integration (Clerk + Custom RBAC)
│   ├── authorization/            # CASL Policies, Org-Scoped Queries
│   ├── events/                   # Event Bus, Outbox, Inbox, Publishers, Consumers
│   ├── queue/                    # BullMQ Job Definitions, Processors, Schedulers
│   ├── realtime/                 # Socket.IO Gateway, Rooms, Presence
│   ├── ui/                       # Design System (shadcn/ui + Domain Components)
│   ├── config/                   # Env Validation, Feature Flags
│   ├── observability/            # Logging, Metrics, Tracing, Health, Alerts
│   └── testing/                  # Factories, Fixtures, Mocks, MSW Handlers
├── infrastructure/
│   ├── docker/                   # Dockerfiles, Compose Files
│   ├── deployment/               # K8s/Helm, Terraform, Scripts
│   └── monitoring/               # Grafana, Prometheus, Loki Configs
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── docs/
    ├── architecture/
    ├── domain/
    ├── api/
    └── operations/
```

## Workflow-to-Package Mapping

| Workflow | Primary Packages | Secondary Packages |
|----------|------------------|-------------------|
| **1. Master Business Flow** | `sales`, `planning`, `procurement`, `inventory`, `manufacturing`, `quality`, `dispatch`, `finance`, `returns` | `contracts`, `domain`, `events`, `database`, `authorization` |
| **2. Legacy ERP Sync** | `integration` (module), `queue`, `events` | `database`, `contracts`, `observability` |
| **3. Planning Workflow** | `planning`, `manufacturing` | `domain` (MRP, Scheduling), `queue` (MRP jobs), `events` |
| **4. Manufacturing Workflow** | `manufacturing`, `diamonds` | `realtime`, `events`, `authorization` |
| **5. Configurable Route** | `manufacturing`, `master-data` | `domain` (Routing Engine), `contracts` |
| **6. Quality & Rework** | `quality`, `manufacturing` | `events`, `queue` (rework jobs) |
| **7. Certification** | `quality`, `diamonds` | `integration` (lab APIs), `queue` (polling), `documents` |
| **8. Return & Repair** | `returns`, `manufacturing`, `quality` | `events`, `dispatch` |
| **9. Event Flow** | `events`, `realtime` | `queue`, `observability`, `ai` |
| **10. AI Workflow** | `ai`, `authorization` | `contracts` (tool schemas), `events` (audit), `domain` |

## Backend Modules (apps/api/src/modules/)

### Core Business Modules (16)

| Module | Workflow Coverage | Key Services | Key Events |
|--------|-------------------|--------------|------------|
| **auth** | All | `ClerkWebhookService`, `SessionService`, `MfaService` | `UserSynced`, `SessionCreated` |
| **companies** | 1, 2, 9 | `CompanyService`, `BranchService`, `FactoryService`, `WarehouseService`, `DepartmentService` | `CompanyCreated`, `FactoryCreated` |
| **master-data** | 1, 3, 4, 5 | `ProductService`, `BomService`, `RoutingService`, `WorkCenterService`, `RoutingSelectionEngine` | `ProductCreated`, `BomVersioned`, `RoutingVersioned`, `WorkCenterCreated` |
| **sales** | 1 | `QuotationService`, `SalesOrderService`, `CustomerService`, `PricingService`, `CreditCheckService` | `QuotationCreated`, `QuotationApproved`, `SalesOrderCreated`, `SalesOrderValidated` |
| **planning** | 1, 3 | `MrpEngineService`, `CapacityPlanningService`, `FiniteSchedulerService`, `ProductionOrderService`, `JobCardService` | `MrpRunCompleted`, `PlannedOrderCreated`, `ProductionOrderCreated`, `JobCardGenerated` |
| **procurement** | 1 | `RequisitionService`, `RfqService`, `VendorService`, `PurchaseOrderService`, `GoodsReceiptService` | `PurchaseRequisitionCreated`, `RfqIssued`, `PurchaseOrderCreated`, `GoodsReceived` |
| **inventory** | 1, 2 | `InventoryLotService`, `InventoryTransactionService`, `ReservationService`, `TransferService`, `AdjustmentService`, `ErpSyncService` | `InventoryReceived`, `InventoryIssued`, `InventoryTransferred`, `InventoryAdjusted`, `InventorySnapshotCreated`, `ErpSyncCompleted` |
| **manufacturing** | 1, 3, 4, 5, 6, 8 | `ProductionOrderExecutionService`, `OperationService`, `WorkCenterQueueService`, `PacketIssueService`, `DepartmentTransferService`, `WipTrackingService`, `ReworkService` | `ProductionOrderReleased`, `OperationStarted`, `OperationPaused`, `OperationResumed`, `OperationTransferred`, `OperationCompleted`, `WeightYieldRecorded`, `ReworkOrderCreated` |
| **diamonds** | 1, 4, 7 | `DiamondService`, `DiamondPacketService`, `GenealogyService`, `AllocationService`, `CertificateService` | `DiamondAllocated`, `DiamondTransferred`, `DiamondSplit`, `DiamondMerged`, `DiamondCertified` |
| **quality** | 1, 6, 7 | `InspectionPlanService`, `InspectionService`, `NcrService`, `DispositionService`, `CapeService`, `CertificationRequestService`, `LabIntegrationService`, `CertificateValidationService` | `InspectionPlanCreated`, `InspectionCompleted`, `NonconformanceCreated`, `DispositionDecided`, `ReinspectionCompleted`, `CertificationRequested`, `CertificateReceived`, `CertificateValidated` |
| **maintenance** | 1 | `AssetService`, `WorkOrderService`, `PreventiveMaintenanceService`, `SparePartsService` | `WorkOrderCreated`, `WorkOrderCompleted`, `PmDue` |
| **dispatch** | 1, 8 | `BaggingService`, `ShipmentService`, `CarrierIntegrationService`, `TrackingService` | `BagCreated`, `ShipmentCreated`, `ShipmentDispatched`, `ShipmentDelivered` |
| **finance** | 1 | `InvoiceService`, `PaymentService`, `JournalEntryService`, `ChartOfAccountService`, `AccountingPeriodService` | `InvoiceGenerated`, `PaymentReceived`, `JournalEntryPosted` |
| **returns** | 1, 8 | `ReturnAuthorizationService`, `ReturnReceiptService`, `RepairOrderService`, `RedispatchService` | `ReturnAuthorized`, `ReturnReceived`, `RepairOrderCreated`, `RepairCompleted`, `Redispatched` |
| **analytics** | 1, 9 | `OeeMetricsService`, `YieldAnalyticsService`, `WipAgingService`, `CapacityUtilizationService`, `OnTimeDeliveryService`, `ReportBuilderService` | — (read-only) |
| **ai** | 10 | `CopilotService`, `IntentRouter`, `ToolRegistry`, `PermissionGuard`, `AuditLogger` | `AiRequestReceived`, `AiToolExecuted`, `AiResponseGenerated` |

### Cross-Cutting Modules (6)

| Module | Purpose | Key Components |
|--------|---------|----------------|
| **workflow** | Approval flows, state machines | `ApprovalFlowEngine`, `StateMachine`, `WorkflowInstanceService` |
| **notifications** | Email, SMS, Push, In-app | `NotificationService`, `EmailProvider`, `SmsProvider`, `PushProvider`, `DigestService` |
| **documents** | File upload, S3, PDF generation | `StorageService`, `PdfGenerator`, `DocumentService`, `CadViewerService` |
| **integration** | Legacy ERP, EDI, CAD, Lab, Courier | `ErpConnector[]`, `EdiParser`, `CadIntegrationService`, `LabApiClient`, `CourierApiClient` |
| **realtime** | Socket.IO gateway | `SocketGateway`, `RoomManager`, `PresenceTracker`, `EventBroadcaster` |
| **health** | Health checks, readiness | `HealthController`, `ReadinessProbe`, `LivenessProbe` |

## Domain Layer (packages/domain/src/)

### Aggregates by Workflow

```
domain/
├── company/                    # Workflow 1, 2, 9
│   ├── Company.ts
│   ├── Branch.ts
│   ├── Factory.ts
│   ├── Warehouse.ts
│   └── Department.ts
├── product/                    # Workflow 1, 3, 5
│   ├── Product.ts
│   ├── BillOfMaterials.ts
│   ├── BomLine.ts
│   ├── Routing.ts
│   ├── RoutingOperation.ts
│   └── RoutingConfiguration.ts     # Configurable by: company, factory, product, diamondType, shape, customer, orderType, method, priority, quality
├── sales/                      # Workflow 1
│   ├── Quotation.ts
│   ├── QuotationLine.ts
│   ├── QuotationVersion.ts
│   ├── SalesOrder.ts
│   ├── SalesOrderLine.ts
│   └── CreditCheck.ts
├── planning/                   # Workflow 3
│   ├── ProductionOrder.ts
│   ├── ProductionOrderOperation.ts
│   ├── MrpPlannedOrder.ts
│   ├── CapacityRequirement.ts
│   ├── FiniteSchedule.ts
│   └── JobCard.ts
├── procurement/                # Workflow 1
│   ├── PurchaseRequisition.ts
│   ├── RequestForQuotation.ts
│   ├── PurchaseOrder.ts
│   ├── PurchaseOrderLine.ts
│   ├── GoodsReceipt.ts
│   └── Vendor.ts
├── inventory/                  # Workflow 1, 2
│   ├── InventoryLot.ts
│   ├── InventoryTransaction.ts
│   ├── Reservation.ts
│   ├── InventorySnapshot.ts      # For ERP sync reconciliation
│   └── ErpSyncRecord.ts          # Connector, externalId, mappingVersion, conflicts, reconciliationResult
├── manufacturing/              # Workflow 4, 5
│   ├── Operation.ts
│   ├── WorkCenter.ts
│   ├── WorkCenterQueue.ts
│   ├── DepartmentQueue.ts
│   ├── PacketIssue.ts
│   ├── DepartmentTransfer.ts
│   └── OperationResult.ts        # weightIn, weightOut, yield, loss, qtyGood, qtyScrap
├── diamonds/                   # Workflow 1, 4, 7
│   ├── Diamond.ts
│   ├── DiamondPacket.ts
│   ├── StoneGenealogy.ts         # Complete digital genealogy
│   ├── Allocation.ts
│   └── DiamondCertificate.ts
├── quality/                    # Workflow 6, 7
│   ├── InspectionPlan.ts
│   ├── InspectionStep.ts
│   ├── QualityInspection.ts
│   ├── Nonconformance.ts
│   ├── Disposition.ts            # Rework, Repair, Regrade, AcceptWithDeviation, ReturnToSupplier, Reject
│   ├── CorrectiveAction.ts
│   ├── CertificationRequest.ts
│   ├── LabSubmission.ts
│   └── Certificate.ts
├── maintenance/                # Workflow 1
│   ├── Asset.ts
│   ├── WorkOrder.ts
│   ├── WorkOrderTask.ts
│   └── PreventiveMaintenanceSchedule.ts
├── dispatch/                   # Workflow 1
│   ├── Bag.ts
│   ├── Shipment.ts
│   ├── ShipmentTracking.ts
│   └── CarrierIntegration.ts
├── finance/                    # Workflow 1
│   ├── Invoice.ts
│   ├── Payment.ts
│   ├── JournalEntry.ts
│   ├── JournalLine.ts
│   └── ChartOfAccount.ts
├── returns/                    # Workflow 8
│   ├── ReturnAuthorization.ts
│   ├── ReturnReceipt.ts
│   ├── RepairOrder.ts
│   └── Redispatch.ts
└── workflow/                   # Cross-cutting
    ├── ApprovalFlow.ts
    ├── ApprovalStep.ts
    └── StateMachine.ts
```

### Value Objects (Workflow-Aware)

```
value-objects/
├── Money.ts
├── Quantity.ts
├── Weight.ts                   # Carat, gram, precision handling
├── DiamondSpec.ts              # Color, Clarity, Cut, Shape, Carat
├── Dimensions.ts
├── DateRange.ts
├── Address.ts
├── CertificateNumber.ts
├── LotNumber.ts
├── SerialNumber.ts
├── Sku.ts
├── Priority.ts
├── Percentage.ts
├── Duration.ts
├── YieldRate.ts                # Workflow 4: weightOut/weightIn
├── OeeMetrics.ts               # Workflow 4: availability, performance, quality
├── Capacity.ts                 # Workflow 3: machine, labor, hours
└── RoutingKey.ts               # Workflow 5: composite key for route selection
```

### Domain Events (Versioned, per Workflow 9)

```
events/
├── v1/
│   ├── sales/
│   │   ├── QuotationCreated.ts
│   │   ├── QuotationApproved.ts
│   │   ├── SalesOrderCreated.ts
│   │   └── SalesOrderValidated.ts
│   ├── planning/
│   │   ├── MrpRunCompleted.ts
│   │   ├── PlannedOrderCreated.ts
│   │   ├── ProductionOrderCreated.ts
│   │   └── JobCardGenerated.ts
│   ├── procurement/
│   │   ├── PurchaseRequisitionCreated.ts
│   │   ├── RfqIssued.ts
│   │   ├── PurchaseOrderCreated.ts
│   │   └── GoodsReceived.ts
│   ├── inventory/
│   │   ├── InventoryReceived.ts
│   │   ├── InventoryIssued.ts
│   │   ├── InventoryTransferred.ts
│   │   ├── InventoryAdjusted.ts
│   │   ├── InventorySnapshotCreated.ts
│   │   └── ErpSyncCompleted.ts
│   ├── manufacturing/
│   │   ├── ProductionOrderReleased.ts
│   │   ├── OperationStarted.ts
│   │   ├── OperationPaused.ts
│   │   ├── OperationResumed.ts
│   │   ├── OperationTransferred.ts
│   │   ├── OperationCompleted.ts
│   │   ├── WeightYieldRecorded.ts
│   │   └── ReworkOrderCreated.ts
│   ├── diamonds/
│   │   ├── DiamondAllocated.ts
│   │   ├── DiamondTransferred.ts
│   │   ├── DiamondSplit.ts
│   │   └── DiamondMerged.ts
│   ├── quality/
│   │   ├── InspectionCompleted.ts
│   │   ├── NonconformanceCreated.ts
│   │   ├── DispositionDecided.ts
│   │   ├── ReinspectionCompleted.ts
│   │   ├── CertificationRequested.ts
│   │   ├── CertificateReceived.ts
│   │   └── CertificateValidated.ts
│   ├── dispatch/
│   │   ├── BagCreated.ts
│   │   ├── ShipmentCreated.ts
│   │   ├── ShipmentDispatched.ts
│   │   └── ShipmentDelivered.ts
│   ├── finance/
│   │   ├── InvoiceGenerated.ts
│   │   ├── PaymentReceived.ts
│   │   └── JournalEntryPosted.ts
│   ├── returns/
│   │   ├── ReturnAuthorized.ts
│   │   ├── ReturnReceived.ts
│   │   ├── RepairOrderCreated.ts
│   │   ├── RepairCompleted.ts
│   │   └── Redispatched.ts
│   └── ai/
│       ├── AiRequestReceived.ts
│       ├── AiToolExecuted.ts
│       └── AiResponseGenerated.ts
```

### Domain Services (Pure Logic)

```
services/
├── pricing/
│   └── PricingDomainService.ts
├── planning/
│   ├── MrpCalculationService.ts
│   ├── FiniteSchedulingService.ts
│   └── CapacityLevelingService.ts
├── routing/
│   ├── RoutingSelectionService.ts
│   └── RoutingConfigurationService.ts
├── diamonds/
│   ├── DiamondGenealogyService.ts
│   ├── AllocationOptimizationService.ts
│   └── YieldCalculationService.ts
├── manufacturing/
│   ├── OeeCalculationService.ts
│   └── WorkCenterOptimizationService.ts
├── quality/
│   ├── InspectionSamplingService.ts
│   ├── DispositionDecisionService.ts
│   └── CertificationValidationService.ts
└── ai/
    └── IntentClassificationService.ts
```

### Repository Interfaces (Contracts)

```
repositories/
├── CompanyRepository.ts
├── ProductRepository.ts
├── BomRepository.ts
├── RoutingRepository.ts
├── QuotationRepository.ts
├── SalesOrderRepository.ts
├── ProductionOrderRepository.ts
├── PurchaseOrderRepository.ts
├── InventoryLotRepository.ts
├── DiamondRepository.ts
├── DiamondPacketRepository.ts
├── QualityInspectionRepository.ts
├── NonconformanceRepository.ts
├── CertificateRepository.ts
├── WorkOrderRepository.ts
├── ShipmentRepository.ts
├── InvoiceRepository.ts
├── ReturnAuthorizationRepository.ts
└── AuditLogRepository.ts
```

## Database Layer (packages/database/)

### Prisma Schema — Key Models (Workflow-Aligned)

```prisma
// Core Org Hierarchy (Workflow 1, 9)
model Company { id, name, code, settings, createdAt }
model Branch { id, companyId, name, code, address, timezone }
model Factory { id, branchId, name, code, capacity, shifts }
model Warehouse { id, factoryId, name, type, location }
model Department { id, factoryId, name, type, sequence, capacity }
model WorkCenter { id, departmentId, name, type, capacity, oeeTarget }

// Master Data (Workflow 1, 3, 5)
model Product { id, companyId, sku, name, category, bomId, routingId }
model Bom { id, productId, version, lines: BomLine[] }
model BomLine { id, bomId, itemId, qty, uom, operationSeq, scrapPct }
model Routing { id, productId, version, operations: RoutingOp[], config: RoutingConfig[] }
model RoutingOp { id, routingId, seq, departmentId, workCenterType, setupMin, runMinPerUnit, queueMin, moveMin }
model RoutingConfig { id, routingId, companyId?, factoryId?, productId?, diamondType?, shape?, customerId?, orderType?, method?, priority?, qualityReq?, departmentSequence: Json } // Workflow 5: configurable route

// Sales (Workflow 1)
model Customer { id, companyId, name, code, creditLimit, paymentTerms }
model Quotation { id, companyId, customerId, version, status, lines: QuotationLine[], approvalFlowId }
model QuotationLine { id, quotationId, productId, qty, uom, unitPrice, discountPct }
model SalesOrder { id, companyId, customerId, quotationId, status, lines: SalesOrderLine[] }
model SalesOrderLine { id, orderId, productId, qty, uom, dueDate, allocatedQty, productionOrderId }

// Planning (Workflow 3)
model MrpRun { id, companyId, status, recordsProcessed, exceptions: Json, startedAt, completedAt }
model PlannedOrder { id, mrpRunId, itemId, qty, dueDate, supplyType, pegging: Json }
model ProductionOrder { id, companyId, salesOrderLineId, productId, qty, status, priority, startDate, dueDate, routingId, operations: ProdOrderOp[] }
model ProdOrderOp { id, orderId, seq, departmentId, workCenterId, status, setupMin, runMin, qtyComplete, qtyScrap, startedAt, completedAt, weightIn, weightOut, yieldPct }
model JobCard { id, productionOrderId, opSeq, status, assignedTo, issuedAt }

// Procurement (Workflow 1)
model PurchaseRequisition { id, companyId, status, lines: PrLine[] }
model PrLine { id, reqId, itemId, qty, uom, neededBy }
model RequestForQuotation { id, companyId, vendorId, status, lines: RfqLine[], dueDate }
model PurchaseOrder { id, companyId, vendorId, status, lines: PoLine[] }
model PoLine { id, poId, itemId, qty, uom, unitPrice, dueDate, receivedQty }
model GoodsReceipt { id, poId, warehouseId, lines: GrLine[], inspectedAt }
model GrLine { id, receiptId, poLineId, qty, uom, lotId, inspectionStatus }

// Inventory (Workflow 1, 2)
model InventoryLot { id, companyId, itemId, warehouseId, qty, uom, status, lotNumber, expiryDate, certificateId }
model InventoryTransaction { id, lotId, type, qty, uom, refType, refId, fromLocation, toLocation, employeeId, timestamp, weightBefore, weightAfter }
model Reservation { id, lotId, salesOrderLineId, qty, uom, status, expiresAt }
model InventorySnapshot { id, companyId, factoryId, warehouseId, itemId, qty, uom, snapshotDate, source } // Workflow 2
model ErpSyncRecord { id, connector, externalRequestId, mappingVersion, importMode, recordsReceived, recordsAccepted, recordsRejected, conflicts: Json, retries, status, correlationId, startedAt, completedAt, errorDetails, reconciliationResult } // Workflow 2

// Diamonds (Workflow 1, 4, 7)
model Diamond { id, companyId, certificateNo, carat, color, clarity, cut, shape, origin, status, currentOwnerId, currentPacketId, currentDeptId, currentEmployeeId, genealogy: DiamondEvent[] }
model DiamondPacket { id, factoryId, diamonds: Diamond[], status, location, bagId }
model DiamondEvent { id, diamondId, eventType, fromDeptId, toDeptId, packetId, employeeId, weightBefore, weightAfter, lossPct, operation, timestamp, metadata: Json } // Complete genealogy
model DiamondCertificate { id, diamondId, labId, certificateNo, issueDate, expiryDate, pdfUrl, validatedAt }

// Manufacturing (Workflow 4)
model Operation { id, productionOrderId, seq, departmentId, workCenterId, employeeId, status, startedAt, pausedAt, resumedAt, completedAt, weightIn, weightOut, yieldPct, qtyGood, qtyScrap, notes }
model WorkCenterQueue { id, workCenterId, operations: Json, updatedAt } // Real-time queue state

// Quality (Workflow 6, 7)
model InspectionPlan { id, companyId, productId, version, steps: InspectionStep[] }
model InspectionStep { id, planId, seq, name, type, specMin, specMax, uom, method, samplingPlan: Json }
model QualityInspection { id, productionOrderId, stepId, operationId, status, value, result, inspectorId, timestamp, ncrId }
model Nonconformance { id, inspectionId, type, disposition, rootCause, correctiveAction, status, dispositionedAt, dispositionedBy }
model CorrectiveAction { id, ncrId, description, ownerId, dueDate, completedAt, verifiedAt }
model CertificationRequest { id, diamondId, labId, status, submittedAt, trackingNo, certificateId }
model Certificate { id, diamondId, labId, certificateNo, issueDate, pdfUrl, validatedAt, validatedBy }

// Maintenance (Workflow 1)
model Asset { id, factoryId, name, type, criticality, pmScheduleId }
model WorkOrder { id, assetId, type, priority, status, assignedTo, dueDate, tasks: WoTask[] }
model WoTask { id, woId, seq, description, estimatedHours, actualHours, completedAt }

// Dispatch (Workflow 1)
model Bag { id, shipmentId, diamonds: Diamond[], weight, sealNo, status }
model Shipment { id, companyId, customerId, carrierId, trackingNo, status, dispatchedAt, deliveredAt, bags: Bag[] }
model ShipmentTracking { id, shipmentId, status, location, timestamp, rawData: Json }

// Finance (Workflow 1)
model ChartOfAccount { id, companyId, code, name, type }
model Invoice { id, companyId, customerId, shipmentId, status, amount, currency, dueDate, lines: InvoiceLine[] }
model InvoiceLine { id, invoiceId, description, qty, unitPrice, accountId }
model Payment { id, invoiceId, amount, currency, method, reference, receivedAt }
model JournalEntry { id, companyId, date, memo, lines: JournalLine[] }
model JournalLine { id, entryId, accountId, debit, credit, description }

// Returns (Workflow 8)
model ReturnAuthorization { id, companyId, customerId, invoiceId, status, disposition, lines: RaLine[] }
model RaLine { id, raId, diamondId, qty, reason }
model RepairOrder { id, returnAuthId, productionOrderId, status, completedAt }
model Redispatch { id, repairOrderId, shipmentId, status }

// Workflow (Cross-cutting)
model ApprovalFlow { id, companyId, name, entityType, steps: ApprovalStep[] }
model ApprovalStep { id, flowId, seq, roleId, action, condition: Json }
model ApprovalInstance { id, flowId, entityId, entityType, currentStep, status, history: Json }

// Audit & Events (Workflow 9)
model AuditLog { id, companyId, entityType, entityId, action, oldValue: Json, newValue: Json, userId, timestamp, correlationId }
model OutboxEvent { id, aggregateType, aggregateId, eventType, version, payload: Json, createdAt, publishedAt }
model InboxEvent { id, eventId, consumer, status, processedAt, retries, error: Json }
```

## Frontend Components (packages/ui + apps/web)

### Design System Primitives (`packages/ui/src/components/ui/`)

| Component | Workflow Usage |
|-----------|----------------|
| `Button`, `Input`, `Select`, `DatePicker` | All forms |
| `DataTable` (TanStack Table v8) | All lists: orders, operations, inspections, diamonds |
| `Form` (RHF + Zod) | All create/edit modals |
| `Dialog`, `Drawer`, `Tabs`, `Command` | Navigation, detail views |
| `Badge`, `Avatar`, `Tooltip`, `Toast` | Status indicators, notifications |
| `Skeleton`, `Progress` | Loading states |
| `Chart` (Recharts) | Analytics dashboards |

### Domain Components (`packages/ui/src/components/domain/`)

| Component | Workflow | Props |
|-----------|----------|-------|
| `DiamondGenealogyTree` | 1, 4, 7 | `diamondId`, `depth?`, `onNodeClick` |
| `ProductionOrderCard` | 1, 3, 4 | `order`, `permissions`, `onAction` |
| `WorkCenterQueue` | 4 | `workCenterId`, `filters`, `onOperationClick` |
| `RoutingVisualizer` | 5 | `routingId`, `highlightStep?`, `editable?` |
| `BomExplorer` | 1, 3 | `productId`, `expandLevel?`, `onLineClick` |
| `InventoryLotPicker` | 1, 2 | `itemId`, `warehouseId`, `requiredQty`, `onSelect` |
| `InspectionForm` | 6 | `planId`, `orderId`, `onComplete` |
| `NcrDispositionForm` | 6 | `ncrId`, `onDisposition` |
| `CertificateViewer` | 7 | `certificateId`, `downloadable` |
| `OeeGauge` | 4 | `value`, `target`, `trend` |
| `WipAgingChart` | 1, 4 | `departmentId`, `dateRange` |
| `YieldTrendChart` | 4 | `operationId`, `dateRange`, `groupBy` |
| `CapacityHeatmap` | 3 | `factoryId`, `dateRange` |
| `PacketTracker` | 1, 4 | `packetId`, `showHistory` |
| `ShipmentTrackingMap` | 1 | `shipmentId`, `realTime` |
| `RepairOrderTimeline` | 8 | `repairOrderId` |

### Pages (apps/web/src/app/ — Next.js App Router)

```
(app)/
├── (auth)/login|mfa|password-reset/
├── (app)/
│   ├── dashboard/                          # Role-based: planner, operator, manager, exec
│   ├── master-data/
│   │   ├── products/[id]/bom|routing/     # Workflow 1, 5
│   │   ├── customers/
│   │   ├── vendors/
│   │   └── work-centers/
│   ├── sales/
│   │   ├── quotations/[id]/               # Versioning, approval (Workflow 1)
│   │   └── orders/[id]/                   # Lines, validation, release (Workflow 1)
│   ├── planning/
│   │   ├── mrp/                           # Run, exceptions, pegging (Workflow 3)
│   │   ├── production-orders/[id]/        # Operations, schedule, docs (Workflow 3)
│   │   └── capacity/                      # Heatmap, finite schedule (Workflow 3)
│   ├── procurement/
│   │   ├── requisitions/
│   │   ├── rfqs/
│   │   ├── purchase-orders/[id]/          # Lines, receipts, invoices (Workflow 1)
│   │   └── vendors/
│   ├── inventory/
│   │   ├── lots/
│   │   ├── transactions/
│   │   ├── adjustments/
│   │   ├── transfers/
│   │   ├── physical-count/
│   │   └── erp-sync/                      # Sync history, conflicts (Workflow 2)
│   ├── manufacturing/
│   │   ├── shop-floor/[workCenterId]/     # Operator terminal (Workflow 4)
│   │   ├── operations/[id]/               # Start/pause/transfer/complete (Workflow 4)
│   │   ├── job-cards/
│   │   ├── wip/                           # Board, aging, genealogy (Workflow 1, 4)
│   │   └── diamonds/
│   │       ├── [id]/                      # Genealogy, location, history (Workflow 1, 4, 7)
│   │       └── packets/
│   ├── quality/
│   │   ├── inspection-plans/
│   │   ├── inspections/[id]/              # Steps, results, photos (Workflow 6)
│   │   ├── ncr/[id]/                      # Disposition, CAPA (Workflow 6)
│   │   └── certificates/[id]/             # View, validate (Workflow 7)
│   ├── maintenance/
│   │   ├── assets/
│   │   ├── work-orders/[id]/              # Tasks, labor, parts
│   │   └── schedules/
│   ├── dispatch/
│   │   ├── bagging/
│   │   ├── shipments/[id]/                # Tracking, documents (Workflow 1)
│   │   └── carriers/
│   ├── finance/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── journal-entries/
│   │   └── chart-of-accounts/
│   ├── returns/
│   │   ├── authorizations/
│   │   ├── receipts/
│   │   └── repair-orders/                 # Repair → Re-certify → Redispatch (Workflow 8)
│   ├── analytics/
│   │   ├── oee|yield|otd|wip-aging|capacity|custom/
│   └── admin/
│       ├── users|roles|permissions/
│       ├── audit-log/
│       └── feature-flags/
```

## Auth & Authorization (packages/auth/, packages/authorization/)

### Auth Package
```
auth/
├── clerk/                    # Clerk webhook sync, session management
├── session/                  # Token refresh, MFA, device trust
├── guards/                   # JwtAuthGuard, ApiKeyGuard, DeviceTrustGuard
└── decorators/               # @CurrentUser, @CurrentOrg, @Permissions
```

### Authorization Package (CASL + Org Scope)
```
authorization/
├── casl/
│   ├── ability-factory.ts
│   ├── permissions.ts        # 100+ permissions: create:sales-order:company, start:operation:workcenter, etc.
│   ├── rules/
│   │   ├── company.rules.ts
│   │   ├── sales.rules.ts
│   │   ├── manufacturing.rules.ts
│   │   ├── inventory.rules.ts
│   │   ├── quality.rules.ts
│   │   ├── finance.rules.ts
│   │   └── diamonds.rules.ts
│   └── scopes/
│       ├── global.scope.ts
│       ├── company.scope.ts
│       ├── factory.scope.ts
│       ├── department.scope.ts
│       └── record.scope.ts
├── guards/                   # PermissionGuard, OrgScopeGuard
├── decorators/               # @RequirePermission, @RequireScope
└── middleware/               # OrgContextMiddleware
```

## Event & Queue Infrastructure (packages/events/, packages/queue/)

### Events Package (Workflow 9)
```
events/
├── bus/
│   ├── event-bus.ts
│   ├── event-publisher.ts
│   └── event-subscriber.ts
├── outbox/
│   ├── outbox-table.ts
│   ├── outbox-publisher.ts
│   └── outbox-processor.ts
├── inbox/
│   ├── inbox-table.ts
│   ├── inbox-processor.ts
│   └── idempotency-handler.ts
├── serialization/
│   ├── event-serializer.ts
│   └── schema-registry.ts
└── handlers/                 # Authorized Subscribers (Workflow 9)
    ├── audit-handler.ts      # → AuditLog
    ├── workflow-handler.ts   # → Approval flows
    ├── notification-handler.ts # → Email/SMS/Push
    ├── realtime-handler.ts   # → Socket.IO rooms
    ├── search-index-handler.ts # → Elasticsearch/OpenSearch
    ├── analytics-handler.ts  # → Materialized views, ClickHouse
    └── ai-context-handler.ts # → AI context store
```

### Queue Package (BullMQ Jobs)
```
queue/
├── jobs/
│   ├── mrp-run.job.ts                    # Workflow 3: scheduled nightly
│   ├── scheduled-mrp.job.ts
│   ├── erp-sync.job.ts                   # Workflow 2: incremental/delta
│   ├── report-generation.job.ts
│   ├── certificate-polling.job.ts        # Workflow 7: lab tracking
│   ├── shipment-tracking.job.ts          # Workflow 1: carrier updates
│   ├── maintenance-due.job.ts
│   ├── notification-digest.job.ts
│   ├── data-archival.job.ts
│   └── ai-batch-processing.job.ts        # Workflow 10: embeddings, forecasts
├── processors/
│   ├── mrp-processor.ts
│   ├── erp-sync-processor.ts
│   ├── report-processor.ts
│   └── notification-processor.ts
├── queues/
│   ├── queue-tokens.ts
│   └── queue-config.ts
└── scheduling/
    ├── cron-scheduler.ts
    └── dynamic-scheduler.ts
```

## Realtime (packages/realtime/) — Workflow 4, 9

```
realtime/
├── gateway/
│   ├── socket.gateway.ts
│   ├── connection-handler.ts
│   └── room-manager.ts
├── rooms/                    # Hierarchical rooms matching org structure
│   ├── company.room.ts       # company:{companyId}
│   ├── factory.room.ts       # factory:{factoryId}
│   ├── department.room.ts    # department:{deptId}
│   ├── workcenter.room.ts    # workcenter:{wcId}     ← Shop floor terminals
│   ├── production-order.room.ts # production-order:{orderId}
│   ├── diamond.room.ts       # diamond:{diamondId}     ← Genealogy tracking
│   └── user.room.ts          # user:{userId}           ← Notifications
├── events/
│   ├── realtime-event-map.ts # DomainEvent → Room mapping
│   └── presence-tracker.ts
└── guards/
    ├── ws-auth.guard.ts
    └── ws-permission.guard.ts
```

## AI Package (packages/ai/) — Workflow 10

```
ai/
├── src/
│   ├── copilot/
│   │   ├── copilot.service.ts
│   │   ├── intent-router.ts
│   │   ├── context-builder.ts
│   │   └── response-validator.ts
│   ├── tools/
│   │   ├── tool-registry.ts
│   │   ├── schemas/          # Zod schemas for each tool (permission-scoped)
│   │   │   ├── sales-order.tools.ts
│   │   │   ├── production-order.tools.ts
│   │   │   ├── inventory.tools.ts
│   │   │   ├── diamond.tools.ts
│   │   │   ├── quality.tools.ts
│   │   │   └── analytics.tools.ts
│   │   └── executors/        # Tool → API call → Domain service
│   ├── permissions/
│   │   └── tool-permission-guard.ts  # Validates user can execute tool
│   └── audit/
│       └── ai-audit-logger.ts        # Logs all AI interactions
```

## Observability (packages/observability/)

```
observability/
├── logging/
│   ├── logger.ts
│   └── structured-logger.ts
├── metrics/
│   ├── metrics-collector.ts
│   ├── business-metrics.ts       # Workflow KPIs: order cycle time, yield, OEE, OTD
│   └── prometheus-exporter.ts
├── tracing/
│   ├── tracer.ts
│   └── propagation.ts
├── health/
│   ├── health-indicators.ts
│   └── readiness-probe.ts
└── alerts/
    ├── alert-rules.ts
    └── notification-channels.ts
```

## Testing Utilities (packages/testing/)

```
testing/
├── factories/
│   ├── company.factory.ts
│   ├── product.factory.ts
│   ├── quotation.factory.ts
│   ├── sales-order.factory.ts
│   ├── production-order.factory.ts
│   ├── purchase-order.factory.ts
│   ├── diamond.factory.ts
│   ├── inspection.factory.ts
│   └── ncr.factory.ts
├── fixtures/
│   ├── valid-quotation.json
│   ├── valid-production-order.json
│   ├── sample-diamond-genealogy.json
│   └── erp-sync-sample.json
├── mocks/
│   ├── mock-prisma.ts
│   ├── mock-event-bus.ts
│   ├── mock-queue.ts
│   ├── mock-realtime.ts
│   ├── mock-clerk.ts
│   └── mock-lab-api.ts
├── helpers/
│   ├── test-module.ts
│   ├── test-database.ts
│   ├── auth-test-helpers.ts
│   └── api-test-helpers.ts
└── msw/
    ├── handlers.ts
    └── server.ts
```

## Infrastructure (infrastructure/)

```
infrastructure/
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── Dockerfile.worker
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── docker-compose.test.yml
├── deployment/
│   ├── kubernetes/
│   │   ├── base/
│   │   │   ├── namespace.yaml
│   │   │   ├── configmap.yaml
│   │   │   ├── secrets.yaml
│   │   │   ├── deployment-api.yaml
│   │   │   ├── deployment-web.yaml
│   │   │   ├── deployment-worker.yaml
│   │   │   ├── service.yaml
│   │   │   ├── ingress.yaml
│   │   │   ├── hpa.yaml
│   │   │   └── pdb.yaml
│   │   ├── overlays/{dev,staging,prod}/
│   │   └── helm/diamondflow/
│   ├── terraform/
│   │   ├── modules/{vpc,rds,elasticache,eks,s3,monitoring}/
│   │   └── environments/{dev,staging,prod}/
│   └── scripts/{deploy,rollback,migrate,seed}.sh
└── monitoring/
    ├── grafana/dashboards/{api-performance,business-metrics,manufacturing-oee,inventory-health,system-resources}.json
    ├── prometheus/rules/{api-alerts,business-alerts,infrastructure-alerts}.yaml
    └── loki/loki-config.yaml
```

## Component Summary by Workflow

| Workflow | Domain Aggregates | API Modules | UI Pages | Events | Jobs |
|----------|-------------------|-------------|----------|--------|------|
| **1. Master Business Flow** | 15+ | 9 | 25+ | 20+ | 3 |
| **2. Legacy ERP Sync** | 2 | 1 | 2 | 4 | 1 |
| **3. Planning** | 6 | 2 | 4 | 6 | 2 |
| **4. Manufacturing** | 8 | 2 | 8 | 10 | 0 |
| **5. Configurable Route** | 2 | 1 | 2 | 2 | 0 |
| **6. Quality & Rework** | 7 | 1 | 5 | 8 | 1 |
| **7. Certification** | 3 | 1 | 3 | 4 | 1 |
| **8. Return & Repair** | 4 | 1 | 4 | 6 | 0 |
| **9. Event Flow** | — | 1 (infra) | — | All | — |
| **10. AI Workflow** | — | 1 | 1 | 3 | 1 |