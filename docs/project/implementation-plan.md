# DiamondFlow Implementation Plan — Workflow-to-Component Mapping

## Overview

This document maps each of the 10 business workflows to technical components, sprints, and deliverables for a 6-month implementation.

## Workflow → Module Mapping

| # | Workflow | Primary Module | Key Components | Events Produced |
|---|----------|----------------|----------------|-----------------|
| 1 | **Master Business Flow** | Sales → Planning → Procurement → Inventory → Manufacturing → Quality → Dispatch → Finance → Returns | `SalesModule`, `PlanningModule`, `ProcurementModule`, `InventoryModule`, `ManufacturingModule`, `QualityModule`, `DispatchModule`, `FinanceModule`, `ReturnsModule` | `SalesOrderCreated`, `ProductionOrderReleased`, `PurchaseOrderCreated`, `GoodsReceived`, `InventoryAdjusted`, `OperationCompleted`, `InspectionCompleted`, `ShipmentCreated`, `InvoiceGenerated`, `ReturnAuthorized` |
| 2 | **Legacy ERP Sync** | Integration | `ErpSyncService`, `ErpConnector`, `MappingEngine`, `ReconciliationService`, `SyncScheduler` | `ErpSyncStarted`, `ErpSyncCompleted`, `ErpSyncFailed`, `InventorySnapshotCreated` |
| 3 | **Planning Workflow** | Planning | `MrpEngine`, `CapacityPlanner`, `FiniteScheduler`, `ProductionOrderService`, `JobCardService` | `MrpRunCompleted`, `PlannedOrderCreated`, `ProductionOrderCreated`, `JobCardGenerated` |
| 4 | **Manufacturing Workflow** | Manufacturing | `OperationService`, `WorkCenterService`, `PacketIssueService`, `DepartmentQueueService`, `WipTrackingService` | `OperationStarted`, `OperationPaused`, `OperationResumed`, `OperationTransferred`, `OperationCompleted`, `WeightYieldRecorded` |
| 5 | **Configurable Route** | Manufacturing + Master Data | `RoutingService`, `RoutingSelectionEngine`, `RouteConfigurationService`, `DepartmentSequenceResolver` | `RoutingSelected`, `RouteChanged`, `DepartmentSequenceResolved` |
| 6 | **Quality & Rework** | Quality | `InspectionPlanService`, `InspectionService`, `NcrService`, `DispositionService`, `ReworkService`, `CapeService` | `InspectionCompleted`, `NonconformanceCreated`, `DispositionDecided`, `ReworkOrderCreated`, `ReinspectionCompleted` |
| 7 | **Certification** | Quality + Diamonds | `CertificationRequestService`, `LabIntegrationService`, `CertificateValidationService`, `DiamondCertificateService` | `CertificationRequested`, `CertificateReceived`, `CertificateValidated`, `DiamondCertified` |
| 8 | **Return & Repair** | Returns + Manufacturing | `ReturnAuthorizationService`, `RepairOrderService`, `RedispatchService` | `ReturnAuthorized`, `ReturnReceived`, `RepairOrderCreated`, `RepairCompleted`, `Redispatched` |
| 9 | **Event Flow** | Cross-cutting (Infrastructure) | `EventBus`, `OutboxPublisher`, `InboxProcessor`, `EventHandlers[]`, `RealtimeGateway` | All domain events |
| 10 | **AI Workflow** | AI | `CopilotService`, `IntentRouter`, `ToolRegistry`, `PermissionGuard`, `AuditLogger` | `AiRequestReceived`, `AiToolExecuted`, `AiResponseGenerated` |

## Phase Breakdown (6 Months / 26 Weeks)

### Phase 0: Foundation (Weeks 1-3)
| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| 0.1 | Monorepo, CI/CD, Infra | Nx workspace, GitHub Actions, Docker Compose, PostgreSQL, Redis, Prisma setup, Clerk auth, OpenTelemetry |
| 0.2 | Org Hierarchy, AuthZ, Events | Company/Branch/Factory/Dept CRUD, CASL policies, org-scoped queries, outbox/inbox, event bus, audit log |
| 0.3 | Design System, App Shell | shadcn/ui + custom components, sidebar/nav/breadcrumbs, permission-aware routing, TanStack Query, Socket.IO client |

**Exit Criteria:** Auth + org switching + audit + realtime events working end-to-end.

---

### Phase 1: Master Data & Sales (Weeks 4-7)
| Sprint | Workflow Coverage | Deliverables |
|--------|-------------------|--------------|
| 1.1 | Master Business Flow (Customer → Quotation) | Product, BOM (multi-level), Routing (configurable), WorkCenter CRUD; Customer, Quotation (versioning, approval workflow) |
| 1.2 | Master Business Flow (Quotation → Sales Order) | Sales Order, Credit Check hook, Order Validation, **Quotation → SO conversion** |
| 1.3 | Master Business Flow (SO → Planning trigger) | **SO → Production Order linkage** (BOM explosion, routing copy), MRP stub (net requirements) |

**Exit Criteria:** Create product with 5-level BOM + 15-step routing → Quotation → SO → Auto-generate PO.

---

### Phase 2: Planning & Procurement (Weeks 8-11)
| Sprint | Workflow Coverage | Deliverables |
|--------|-------------------|--------------|
| 2.1 | Planning Workflow (Requirement Analysis → Production Plan) | **MRP Engine**: Net requirements, planned orders, PO suggestions, pegging, exception messages, capacity-aware |
| 2.2 | Master Business Flow (Stock unavailable → PO) | Purchase Requisition, RFQ, Vendor Catalog, Purchase Order, Approval Workflow |
| 2.3 | Master Business Flow (PO → Goods Receipt → Inventory) | Goods Receipt, Inspection (basic), Inventory Lots, Put-away, Inventory Transactions, **Reservation engine** |

**Exit Criteria:** MRP runs nightly → generates POs → GR posts inventory → available for allocation.

---

### Phase 3: Manufacturing Execution (MES Core) (Weeks 12-17)
| Sprint | Workflow Coverage | Deliverables |
|--------|-------------------|--------------|
| 3.1 | Manufacturing Workflow (PO → Job Card → Dept Queue) | Production Order release, Job Cards, **Department Queues** (priority/FIFO/custom), Work Center Dashboard |
| 3.2 | Manufacturing Workflow (Execution + Live WIP) | **Shop Floor Terminal**: Start/Pause/Resume/Transfer/Complete, Real-time WIP board, Andon alerts |
| 3.3 | Master Business Flow (Stone Allocation → Packet Prep) | Diamond/Packet allocation, Issue, **Department Transfer**, Genealogy events, Weight/Yield capture |
| 3.4 | Configurable Route | **Routing Engine**: Route by product/customer/shape/priority, Dynamic re-route, Skip/Repeat ops, Versioning |

**Exit Criteria:** Operator starts op on tablet → real-time dashboard updates → diamond genealogy recorded → auto-queues next dept.

---

### Phase 4: Quality & Certification (Weeks 18-21)
| Sprint | Workflow Coverage | Deliverables |
|--------|-------------------|--------------|
| 4.1 | Quality Workflow (Inspection Plan → Inspection) | Inspection Plans (linked to routing ops), Quality Inspections (variable/attribute), FAI support |
| 4.2 | Quality Workflow (Failed → NCR → Disposition → Rework) | NCR/Disposition (Rework/Repair/Regrade/Accept/Reject), CAPA linkage, Re-inspection workflow |
| 4.3 | Certification Workflow | Certification Request → Lab Selection → Submission → External Tracking → Certificate Receipt → Validation |
| 4.4 | Quality Analytics | SPC Charts (Xbar-R, Individuals), Gage R&R, Quality Dashboards (FTY, DPU, PPM) |

**Exit Criteria:** Failed inspection → NCR → Rework order → Re-inspect → Pass → Cert request → Cert received → Ready for bagging.

---

### Phase 5: Dispatch, Finance, Returns (Weeks 22-25)
| Sprint | Workflow Coverage | Deliverables |
|--------|-------------------|--------------|
| 5.1 | Master Business Flow (Bagging → Shipment) | Bagging (diamond→bag→box), Dispatch Planning, Shipment Creation, **Carrier API Integration**, Tracking |
| 5.2 | Master Business Flow (Invoice → Payment) | Invoice Generation (from dispatch), Payment Tracking, AR Aging, Basic GL (COA, Journal Entries) |
| 5.3 | Return/Repair Workflow | Return Authorization, Receipt Inspection, Disposition (Credit/Replace/Repair), **Repair Job Card → Re-certify → Redispatch** |

**Exit Criteria:** Complete order-to-cash + return-to-redispatch cycle working.

---

### Phase 6: Analytics, AI, Hardening (Weeks 26-28)
| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| 6.1 | Enterprise Analytics | Operational Dashboards: WIP Aging, OEE, Yield, OTD, Queue Health, Capacity Utilization, Custom Report Builder |
| 6.2 | AI Copilot | Intent → Tool Selection → API Call → Validation → Audited Response (permission-scoped, org-isolated) |
| 6.3 | Production Hardening | Load Testing (10k concurrent), Pen Test, Chaos Engineering, Runbooks, DR Drill, Documentation |
| 6.4 | Pilot Go-Live | Training Materials, Pilot Support, Feedback Loop, Performance Tuning |

---

## Critical Path Dependencies

```
Phase 0 (Foundation)
    │
    ├─→ Phase 1 (Master Data + Sales) ──→ Phase 2 (Planning + Procurement)
    │                                         │
    │                                         └─→ Phase 3 (Manufacturing) ──→ Phase 4 (Quality + Cert)
    │                                                                           │
    │                                                                           └─→ Phase 5 (Dispatch + Finance + Returns)
    │
    └─→ Phase 6 (Analytics + AI + Hardening) ←── (parallel after Phase 3 core)
```

**Longest path:** 0 → 1 → 2 → 3 → 4 → 5 = **25 weeks** (Phase 6 overlaps)

---

## Clarifying Questions (Need Your Decisions)

| # | Question | Impact |
|---|----------|--------|
| 1 | **MRP: Infinite vs Finite capacity for MVP?** | Infinite = 2 weeks; Finite = 6 weeks (CP-SAT integration) |
| 2 | **Routing: How many route variations exist?** | <50 = JSONLogic config; >500 = visual route designer needed |
| 3 | **Shop floor: Offline-first required?** | Yes = PWA + IndexedDB + sync engine (adds 3 weeks) |
| 4 | **Legacy ERP: Which system? API or file-based?** | Determines connector complexity (REST vs SFTP/EDI) |
| 5 | **Certification labs: Which labs? API specs available?** | GIA/IGI/HRD have APIs; others need email/portal scraping |
| 6 | **Carriers: Which shipping APIs?** | UPS/FedEx/DHL/regional — each needs separate integration |
| 7 | **Multi-currency / multi-language for MVP?** | Adds finance complexity; defer to Phase 6 if not needed |
| 8 | **Diamond-specific: Rapaport price integration?** | Needed for quotation pricing; API key required |
| 9 | **Team size & composition?** | Affects parallelization (8-10 engineers assumed) |
| 10 | **Target MVP date?** | Drives scope cuts if timeline is fixed |

---

## Sprint 0.1 Task Breakdown (Ready to Execute)

| Task | Hours | Owner | Dependencies |
|------|-------|-------|--------------|
| Nx monorepo init with 16 packages + 5 apps | 4 | Lead | — |
| GitHub Actions CI/CD (lint, typecheck, test, build, docker) | 6 | DevOps | Nx init |
| Docker Compose (PostgreSQL, Redis, MinIO, Mailhog) | 4 | DevOps | — |
| Prisma schema (core org hierarchy + audit + outbox/inbox) | 6 | Backend | Docker |
| Clerk auth + webhook sync + session management | 4 | Backend | Prisma |
| CASL permission framework with org-scoped rules | 6 | Backend | Auth |
| Event bus + outbox/inbox pattern + serialization | 6 | Backend | Prisma |
| OpenTelemetry instrumentation (logs, metrics, traces) | 4 | DevOps | — |
| Design system setup (shadcn/ui + Tailwind config) | 6 | Frontend | Nx init |
| App shell (sidebar, top nav, breadcrumbs, permission-aware routing) | 4 | Frontend | Design system |

**Total: ~46 hours** (6 days, 1 engineer)

---

## Definition of Done (Per Sprint)

1. **Code:** Lint ✓, TypeCheck ✓, Unit ≥80% ✓, Integration ✓
2. **API:** OpenAPI spec updated, Contract tests ✓, Versioned
3. **DB:** Migration reviewed, Rollback tested, Seed data ✓
4. **UI:** Component storybook ✓, A11y (axe) ✓, Responsive ✓, Permission states ✓
5. **Events:** Produced + Consumed ✓, Idempotency ✓, Dead-letter tested
6. **Docs:** ADR for new decisions, API docs, Runbook updates
7. **Deploy:** Staging deployed, Smoke tests pass, Rollback <5 min

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| MRP/APS complexity underestimated | High | High | Build finite scheduler as separate service; use OR-Tools/CP-SAT; start with infinite capacity |
| Diamond genealogy performance | Medium | High | Materialized paths in PostgreSQL; separate read model (CQRS); partition by company+date |
| Shop floor offline/realtime | Medium | High | PWA with IndexedDB + background sync; conflict resolution via event sourcing |
| Legacy ERP sync reliability | High | Medium | Idempotent connectors; reconciliation dashboard; manual override; circuit breaker |
| Multi-org data leakage | Low | Critical | RLS policies in PostgreSQL; automated test suite for cross-org queries; penetration test |
| Configurable routing engine complexity | Medium | High | Rule engine (JSONLogic/Expression) not hardcoded; versioned routes; simulation mode |
| Team ramp-up on DDD/Event-driven | Medium | Medium | Architecture decision records (ADRs); pair programming; domain modeling workshops |

---

## Next Steps (After Your Approval)

1. **Confirm answers** to 10 clarifying questions above
2. **Finalize Sprint 0.1 task assignments** with team
3. **Initialize Nx workspace** and begin implementation
4. **Weekly sync** to track progress against critical path