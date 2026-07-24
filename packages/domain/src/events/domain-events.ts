import type { DomainEvent } from '../aggregate-root.js';

// ============================================
// Sales Domain Events (Workflow 1)
// ============================================

export type QuotationCreatedPayload = {
  quotationId: string;
  customerId: string;
  number: string;
  version: number;
  lines: Array<{ productId: string; qty: number; unitPrice: number; uom: string }>;
  validUntil?: Date;
  currency: string;
};

export type QuotationApprovedPayload = {
  quotationId: string;
  version: number;
  approvedBy: string;
};

export type QuotationRejectedPayload = {
  quotationId: string;
  version: number;
  reason: string;
};

export type SalesOrderCreatedPayload = {
  salesOrderId: string;
  customerId: string;
  quotationId?: string;
  number: string;
  lines: Array<{ productId: string; qty: number; unitPrice: number; uom: string; dueDate?: Date }>;
  currency: string;
  requestedDate: Date;
};

export type SalesOrderValidatedPayload = {
  salesOrderId: string;
  creditCheckResult: { approved: boolean; score?: number; limit?: number; balance?: number };
};

export type SalesOrderReleasedPayload = {
  salesOrderId: string;
  releasedBy: string;
};

export type QuotationCreatedEvent = DomainEvent<QuotationCreatedPayload>;
export type QuotationApprovedEvent = DomainEvent<QuotationApprovedPayload>;
export type QuotationRejectedEvent = DomainEvent<QuotationRejectedPayload>;
export type SalesOrderCreatedEvent = DomainEvent<SalesOrderCreatedPayload>;
export type SalesOrderValidatedEvent = DomainEvent<SalesOrderValidatedPayload>;
export type SalesOrderReleasedEvent = DomainEvent<SalesOrderReleasedPayload>;

// ============================================
// Planning Domain Events (Workflow 3)
// ============================================

export type MrpRunCompletedPayload = {
  mrpRunId: string;
  recordsProcessed: number;
  plannedOrdersCount: number;
  exceptions: Array<{ itemId: string; type: string; message: string }>;
  durationMs: number;
};

export type PlannedOrderCreatedPayload = {
  plannedOrderId: string;
  mrpRunId: string;
  itemId: string;
  qty: number;
  uom: string;
  dueDate: Date;
  supplyType: string;
};

export type ProductionOrderCreatedPayload = {
  productionOrderId: string;
  salesOrderLineId?: string;
  productId: string;
  routingId: string;
  number: string;
  qty: number;
  priority: string;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
};

export type ProductionOrderReleasedPayload = {
  productionOrderId: string;
  releasedBy: string;
  jobCardsCount: number;
};

export type JobCardGeneratedPayload = {
  jobCardId: string;
  productionOrderId: string;
  operationSeq: number;
  departmentId: string;
};

export type JobCardAssignedPayload = {
  jobCardId: string;
  assignedTo: string;
};

export type MrpRunCompletedEvent = DomainEvent<MrpRunCompletedPayload>;
export type PlannedOrderCreatedEvent = DomainEvent<PlannedOrderCreatedPayload>;
export type ProductionOrderCreatedEvent = DomainEvent<ProductionOrderCreatedPayload>;
export type ProductionOrderReleasedEvent = DomainEvent<ProductionOrderReleasedPayload>;
export type JobCardGeneratedEvent = DomainEvent<JobCardGeneratedPayload>;
export type JobCardAssignedEvent = DomainEvent<JobCardAssignedPayload>;

// ============================================
// Procurement Domain Events (Workflow 1)
// ============================================

export type PurchaseRequisitionCreatedPayload = {
  requisitionId: string;
  number: string;
  lines: Array<{ itemId: string; qty: number; uom: string; neededBy: Date }>;
};

export type RfqIssuedPayload = {
  rfqId: string;
  vendorId: string;
  number: string;
  dueDate: Date;
  lines: Array<{ itemId: string; qty: number; uom: string }>;
};

export type PurchaseOrderCreatedPayload = {
  purchaseOrderId: string;
  vendorId: string;
  requisitionId?: string;
  number: string;
  lines: Array<{ itemId: string; qty: number; unitPrice: number; uom: string; dueDate?: Date }>;
  currency: string;
};

export type GoodsReceivedPayload = {
  goodsReceiptId: string;
  purchaseOrderId: string;
  warehouseId: string;
  number: string;
  lines: Array<{ itemId: string; qty: number; uom: string; lotId?: string }>;
};

export type GoodsInspectedPayload = {
  goodsReceiptId: string;
  inspectionStatus: string;
  lines: Array<{ itemId: string; qty: number; status: string }>;
};

export type PurchaseRequisitionCreatedEvent = DomainEvent<PurchaseRequisitionCreatedPayload>;
export type RfqIssuedEvent = DomainEvent<RfqIssuedPayload>;
export type PurchaseOrderCreatedEvent = DomainEvent<PurchaseOrderCreatedPayload>;
export type GoodsReceivedEvent = DomainEvent<GoodsReceivedPayload>;
export type GoodsInspectedEvent = DomainEvent<GoodsInspectedPayload>;

// ============================================
// Inventory Domain Events (Workflow 1, 2)
// ============================================

export type InventoryReceivedPayload = {
  lotId: string;
  itemId: string;
  warehouseId: string;
  qty: number;
  uom: string;
  refType: string;
  refId: string;
};

export type InventoryIssuedPayload = {
  lotId: string;
  itemId: string;
  qty: number;
  uom: string;
  refType: string;
  refId: string;
};

export type InventoryTransferredPayload = {
  lotId: string;
  itemId: string;
  qty: number;
  uom: string;
  fromWarehouseId: string;
  toWarehouseId: string;
};

export type InventoryAdjustedPayload = {
  lotId: string;
  itemId: string;
  qty: number;
  reason: string;
};

export type InventorySnapshotCreatedPayload = {
  snapshotId: string;
  warehouseId: string;
  itemId: string;
  qty: number;
  uom: string;
  source: string;
};

export type ErpSyncCompletedPayload = {
  syncRecordId: string;
  connector: string;
  recordsReceived: number;
  recordsAccepted: number;
  recordsRejected: number;
  status: string;
};

export type InventoryReceivedEvent = DomainEvent<InventoryReceivedPayload>;
export type InventoryIssuedEvent = DomainEvent<InventoryIssuedPayload>;
export type InventoryTransferredEvent = DomainEvent<InventoryTransferredPayload>;
export type InventoryAdjustedEvent = DomainEvent<InventoryAdjustedPayload>;
export type InventorySnapshotCreatedEvent = DomainEvent<InventorySnapshotCreatedPayload>;
export type ErpSyncCompletedEvent = DomainEvent<ErpSyncCompletedPayload>;

// ============================================
// Manufacturing Domain Events (Workflow 4)
// ============================================

export type OperationStartedPayload = {
  operationId: string;
  productionOrderId: string;
  workCenterId: string;
  departmentId: string;
  operatorId: string;
};

export type OperationPausedPayload = {
  operationId: string;
  reason?: string;
};

export type OperationResumedPayload = {
  operationId: string;
};

export type OperationTransferredPayload = {
  operationId: string;
  fromDeptId: string;
  toDeptId: string;
  productionOrderId: string;
};

export type OperationCompletedPayload = {
  operationId: string;
  productionOrderId: string;
  workCenterId: string;
  qtyGood: number;
  qtyScrap: number;
  weightIn?: number;
  weightOut?: number;
  yieldPct?: number;
};

export type WeightYieldRecordedPayload = {
  operationId: string;
  weightIn: number;
  weightOut: number;
  yieldPct: number;
  lossPct: number;
};

export type ReworkOrderCreatedPayload = {
  reworkOrderId: string;
  ncrId: string;
  productionOrderId: string;
  operationId: string;
  departmentId: string;
};

export type OperationStartedEvent = DomainEvent<OperationStartedPayload>;
export type OperationPausedEvent = DomainEvent<OperationPausedPayload>;
export type OperationResumedEvent = DomainEvent<OperationResumedPayload>;
export type OperationTransferredEvent = DomainEvent<OperationTransferredPayload>;
export type OperationCompletedEvent = DomainEvent<OperationCompletedPayload>;
export type WeightYieldRecordedEvent = DomainEvent<WeightYieldRecordedPayload>;
export type ReworkOrderCreatedEvent = DomainEvent<ReworkOrderCreatedPayload>;

// ============================================
// Diamonds Domain Events (Workflow 1, 4, 7)
// ============================================

export type DiamondAllocatedPayload = {
  diamondId: string;
  salesOrderId: string;
  salesOrderLineId?: string;
  packetId?: string;
};

export type DiamondTransferredPayload = {
  diamondId: string;
  fromDeptId: string;
  toDeptId: string;
  weightBefore?: number;
  weightAfter?: number;
  employeeId?: string;
};

export type DiamondSplitPayload = {
  parentDiamondId: string;
  childDiamondIds: string[];
  parentWeightBefore: number;
  childWeights: number[];
};

export type DiamondMergedPayload = {
  sourceDiamondIds: string[];
  targetDiamondId: string;
  sourceWeights: number[];
  targetWeight: number;
};

export type DiamondCertifiedPayload = {
  diamondId: string;
  certificateId: string;
  certificateNo: string;
  labId: string;
};

export type DiamondBaggedPayload = {
  diamondId: string;
  bagId: string;
  packetId?: string;
};

export type DiamondDispatchedPayload = {
  diamondId: string;
  shipmentId: string;
};

export type DiamondAllocatedEvent = DomainEvent<DiamondAllocatedPayload>;
export type DiamondTransferredEvent = DomainEvent<DiamondTransferredPayload>;
export type DiamondSplitEvent = DomainEvent<DiamondSplitPayload>;
export type DiamondMergedEvent = DomainEvent<DiamondMergedPayload>;
export type DiamondCertifiedEvent = DomainEvent<DiamondCertifiedPayload>;
export type DiamondBaggedEvent = DomainEvent<DiamondBaggedPayload>;
export type DiamondDispatchedEvent = DomainEvent<DiamondDispatchedPayload>;

// ============================================
// Quality Domain Events (Workflow 6, 7)
// ============================================

export type InspectionCompletedPayload = {
  inspectionId: string;
  operationId: string;
  productionOrderId: string;
  result: string;
  measurementValue?: number;
  inspectorId: string;
};

export type NonconformanceCreatedPayload = {
  ncrId: string;
  inspectionId: string;
  type: string;
  severity: string;
  operationId: string;
  productionOrderId: string;
};

export type DispositionDecidedPayload = {
  ncrId: string;
  disposition: string;
  dispositionedBy: string;
  targetOperationId?: string;
};

export type CorrectiveActionCreatedPayload = {
  capaId: string;
  ncrId: string;
  type: string;
  description: string;
  ownerId: string;
  dueDate?: Date;
};

export type ReinspectionCompletedPayload = {
  inspectionId: string;
  ncrId: string;
  result: string;
  passedReinspection: boolean;
};

export type InspectionCompletedEvent = DomainEvent<InspectionCompletedPayload>;
export type NonconformanceCreatedEvent = DomainEvent<NonconformanceCreatedPayload>;
export type DispositionDecidedEvent = DomainEvent<DispositionDecidedPayload>;
export type CorrectiveActionCreatedEvent = DomainEvent<CorrectiveActionCreatedPayload>;
export type ReinspectionCompletedEvent = DomainEvent<ReinspectionCompletedPayload>;

// ============================================
// Certification Domain Events (Workflow 7)
// ============================================

export type CertificationRequestedPayload = {
  requestId: string;
  diamondId: string;
  labId: string;
};

export type CertificateReceivedPayload = {
  certificateId: string;
  diamondId: string;
  certificateNo: string;
  labId: string;
};

export type CertificateValidatedPayload = {
  certificateId: string;
  diamondId: string;
  validatedBy: string;
};

export type CertificationRequestedEvent = DomainEvent<CertificationRequestedPayload>;
export type CertificateReceivedEvent = DomainEvent<CertificateReceivedPayload>;
export type CertificateValidatedEvent = DomainEvent<CertificateValidatedPayload>;

// ============================================
// Dispatch Domain Events (Workflow 1)
// ============================================

export type BagCreatedPayload = {
  bagId: string;
  diamondIds: string[];
  weight?: number;
};

export type ShipmentCreatedPayload = {
  shipmentId: string;
  customerId: string;
  salesOrderId?: string;
  bagIds: string[];
  carrierId?: string;
};

export type ShipmentDispatchedPayload = {
  shipmentId: string;
  trackingNo?: string;
  carrierId?: string;
};

export type ShipmentDeliveredPayload = {
  shipmentId: string;
  signedBy?: string;
};

export type BagCreatedEvent = DomainEvent<BagCreatedPayload>;
export type ShipmentCreatedEvent = DomainEvent<ShipmentCreatedPayload>;
export type ShipmentDispatchedEvent = DomainEvent<ShipmentDispatchedPayload>;
export type ShipmentDeliveredEvent = DomainEvent<ShipmentDeliveredPayload>;

// ============================================
// Finance Domain Events (Workflow 1)
// ============================================

export type InvoiceGeneratedPayload = {
  invoiceId: string;
  salesOrderId?: string;
  shipmentId?: string;
  customerId: string;
  amount: number;
  currency: string;
  dueDate: Date;
};

export type PaymentReceivedPayload = {
  paymentId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
};

export type JournalEntryPostedPayload = {
  journalEntryId: string;
  number: string;
  memo?: string;
};

export type InvoiceGeneratedEvent = DomainEvent<InvoiceGeneratedPayload>;
export type PaymentReceivedEvent = DomainEvent<PaymentReceivedPayload>;
export type JournalEntryPostedEvent = DomainEvent<JournalEntryPostedPayload>;

// ============================================
// Returns Domain Events (Workflow 8)
// ============================================

export type ReturnAuthorizedPayload = {
  returnAuthId: string;
  customerId: string;
  invoiceId?: string;
  type: string;
};

export type ReturnReceivedPayload = {
  returnAuthId: string;
  receiptId: string;
  inspectionStatus: string;
};

export type RepairOrderCreatedPayload = {
  repairOrderId: string;
  returnAuthId: string;
  productionOrderId?: string;
};

export type RepairCompletedPayload = {
  repairOrderId: string;
  productionOrderId: string;
};

export type RedispatchedPayload = {
  redispatchId: string;
  repairOrderId: string;
  shipmentId: string;
};

export type ReturnAuthorizedEvent = DomainEvent<ReturnAuthorizedPayload>;
export type ReturnReceivedEvent = DomainEvent<ReturnReceivedPayload>;
export type RepairOrderCreatedEvent = DomainEvent<RepairOrderCreatedPayload>;
export type RepairCompletedEvent = DomainEvent<RepairCompletedPayload>;
export type RedispatchedEvent = DomainEvent<RedispatchedPayload>;

// ============================================
// AI Domain Events (Workflow 10)
// ============================================

export type AiRequestReceivedPayload = {
  interactionId: string;
  userId: string;
  intent?: string;
  prompt: string;
};

export type AiToolExecutedPayload = {
  interactionId: string;
  toolName: string;
  toolParams: unknown;
  result: unknown;
};

export type AiResponseGeneratedPayload = {
  interactionId: string;
  response: string;
  tokensUsed: number;
  durationMs: number;
};

export type AiRequestReceivedEvent = DomainEvent<AiRequestReceivedPayload>;
export type AiToolExecutedEvent = DomainEvent<AiToolExecutedPayload>;
export type AiResponseGeneratedEvent = DomainEvent<AiResponseGeneratedPayload>;

// ============================================
// Routing Domain Events (Workflow 5)
// ============================================

export type RoutingSelectedPayload = {
  routingId: string;
  routingVersion: number;
  productionOrderId: string;
  productId: string;
  departmentSequence: string[];
};

export type RoutingChangedPayload = {
  productionOrderId: string;
  oldRoutingId: string;
  newRoutingId: string;
  reason: string;
};

export type RoutingVersionCreatedPayload = {
  routingId: string;
  version: number;
  productId: string;
  departmentSequence: string[];
};

export type RoutingSelectedEvent = DomainEvent<RoutingSelectedPayload>;
export type RoutingChangedEvent = DomainEvent<RoutingChangedPayload>;
export type RoutingVersionCreatedEvent = DomainEvent<RoutingVersionCreatedPayload>;