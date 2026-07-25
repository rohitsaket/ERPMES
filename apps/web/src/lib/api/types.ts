export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  creditLimit: number;
  paymentTerms: string | null;
  companyId: string;
  status?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string | null;
  status?: string;
  companyId: string;
  createdAt: string;
}

export interface QuotationLine {
  id: string;
  quotationId: string;
  productId: string;
  product?: Product;
  qty: number;
  uom: string;
  unitPrice: number;
  discountPct: number;
}

export interface Quotation {
  id: string;
  companyId: string;
  customerId: string;
  customer?: Customer;
  version: number;
  status: string;
  validUntil: string | null;
  lines: QuotationLine[];
  createdAt: string;
}

export interface ProductionOrderOperation {
  id: string;
  orderId: string;
  seq: number;
  departmentId: string;
  department?: { id: string; name: string };
  workCenterId: string | null;
  workCenter?: { id: string; name: string };
  status: string;
  setupMin: number;
  runMin: number;
  qtyComplete: number;
  qtyScrap: number;
  weightIn: number | null;
  weightOut: number | null;
  yieldPct: number | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface JobCard {
  id: string;
  productionOrderId: string;
  opSeq: number;
  status: string;
  assignedTo: string | null;
  issuedAt: string | null;
}

export interface PrLine {
  id: string;
  requisitionId: string;
  itemId: string;
  itemName: string;
  qty: number;
  uom: string;
  neededBy: string;
}

export interface PurchaseRequisition {
  id: string;
  companyId: string;
  status: string;
  lines: PrLine[];
  createdAt: string;
}

export interface RfqLine {
  id: string;
  rfqId: string;
  itemId: string;
  itemName: string;
  qty: number;
  uom: string;
}

export interface RequestForQuotation {
  id: string;
  companyId: string;
  vendorId: string;
  vendor?: Vendor;
  status: string;
  dueDate: string;
  lines: RfqLine[];
  createdAt: string;
}

export interface PoLine {
  id: string;
  poId: string;
  itemId: string;
  itemName: string;
  qty: number;
  uom: string;
  unitPrice: number;
  dueDate: string;
  receivedQty: number;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  companyId: string;
  companyName?: string;
  vendorType?: string;
  category?: string;
  vendorGroup?: string;
  contactPerson?: string;
  designation?: string;
  email?: string;
  mobile?: string;
  alternateMobile?: string;
  telephone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  gstNumber?: string;
  panNumber?: string;
  taxId?: string;
  msmeNumber?: string;
  importExportCode?: string;
  bankName?: string;
  branch?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  swift?: string;
  iban?: string;
  currency?: string;
  creditLimit?: number;
  paymentTerms?: string;
  openingBalance?: number;
  outstandingBalance?: number;
  preferredPaymentMethod?: string;
  leadTime?: number;
  deliveryMode?: string;
  preferredSupplier?: boolean;
  qualityRating?: number;
  performanceScore?: number;
  vendorSince?: string;
  status?: string;
  rating?: number;
  notes?: string;
  internalNotes?: string;
  remarks?: string;
  tags?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  lastPurchaseDate?: string;
  totalPurchaseAmount?: number;
  lastLogin?: string;
}

export interface VendorQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendorType?: string;
  category?: string;
  country?: string;
  state?: string;
  city?: string;
  paymentTerms?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface VendorFormData {
  code: string;
  name: string;
  companyName?: string;
  vendorType?: string;
  category?: string;
  vendorGroup?: string;
  status?: string;
  contactPerson?: string;
  designation?: string;
  email?: string;
  mobile?: string;
  alternateMobile?: string;
  telephone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  gstNumber?: string;
  panNumber?: string;
  taxId?: string;
  msmeNumber?: string;
  importExportCode?: string;
  bankName?: string;
  branch?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  swift?: string;
  iban?: string;
  currency?: string;
  creditLimit?: number;
  paymentTerms?: string;
  openingBalance?: number;
  preferredPaymentMethod?: string;
  leadTime?: number;
  deliveryMode?: string;
  preferredSupplier?: boolean;
  qualityRating?: number;
  notes?: string;
  internalNotes?: string;
  remarks?: string;
  tags?: string;
  companyId: string;
}

export interface WorkCenter {
  id: string;
  name: string;
  type: string;
  capacity: number;
  oeeTarget: number | null;
  companyId: string;
  departmentId: string;
  department?: { id: string; name: string };
  status?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  vendorId: string;
  vendor?: Vendor;
  status: string;
  orderDate: string;
  lines: PoLine[];
  goodsReceipts?: any[];
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  type: string;
  companyId: string;
}

export interface InventoryLot {
  id: string;
  companyId: string;
  itemId: string;
  itemName: string;
  warehouseId: string;
  warehouse?: Warehouse;
  qty: number;
  uom: string;
  status: string;
  lotNumber: string;
  expiryDate: string | null;
  certificateId: string | null;
  transactions?: InventoryTransaction[];
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  lotId: string;
  lot?: InventoryLot;
  type: string;
  qty: number;
  uom: string;
  refType: string | null;
  refId: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  employeeId: string | null;
  weightBefore: number | null;
  weightAfter: number | null;
  timestamp: string;
}

export interface ManufacturingOperation {
  id: string;
  productionOrderId: string;
  productionOrder?: ProductionOrder;
  seq: number;
  departmentId: string;
  department?: { id: string; name: string };
  workCenterId: string | null;
  workCenter?: { id: string; name: string };
  employeeId: string | null;
  status: string;
  startedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  weightIn: number | null;
  weightOut: number | null;
  yieldPct: number | null;
  qtyGood: number;
  qtyScrap: number;
  notes: string | null;
  createdAt: string;
}

export interface DiamondEvent {
  id: string;
  diamondId: string;
  eventType: string;
  fromDeptId: string | null;
  toDeptId: string | null;
  packetId: string | null;
  employeeId: string | null;
  weightBefore: number;
  weightAfter: number;
  lossPct: number;
  operation: string | null;
  timestamp: string;
}

export interface Diamond {
  id: string;
  companyId: string;
  certificateNo: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  shape: string;
  origin: string | null;
  status: string;
  currentOwnerId: string | null;
  currentPacketId: string | null;
  currentDeptId: string | null;
  currentEmployeeId: string | null;
  certificate?: DiamondCertificate | null;
  events?: DiamondEvent[];
  createdAt: string;
}

export interface DiamondCertificate {
  id: string;
  diamondId: string;
  labId: string;
  certificateNo: string;
  issueDate: string;
  pdfUrl: string | null;
}

export interface DiamondPacket {
  id: string;
  factoryId: string;
  status: string;
  location: string | null;
  diamonds?: Diamond[];
  _count?: { diamonds: number };
  createdAt: string;
}

export interface ProductionOrder {
  id: string;
  companyId: string;
  salesOrderLineId: string | null;
  productId: string;
  product?: Product;
  qty: number;
  status: string;
  priority: number;
  startDate: string | null;
  dueDate: string | null;
  routingId: string | null;
  operations: ProductionOrderOperation[];
  jobCards: JobCard[];
  createdAt: string;
}

export interface SalesOrderLine {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  qty: number;
  uom: string;
  unitPrice: number;
  dueDate: string | null;
  allocatedQty: number;
  productionOrderId: string | null;
}

export interface SalesOrder {
  id: string;
  companyId: string;
  customerId: string;
  customer?: Customer;
  quotationId: string | null;
  quotation?: Quotation;
  status: string;
  orderDate: string;
  requiredDate: string | null;
  lines: SalesOrderLine[];
  invoices?: unknown[];
  productionOrders?: unknown[];
  createdAt: string;
}

export interface InspectionStep {
  id: string;
  planId: string;
  seq: number;
  name: string;
  type: string;
  specMin: number | null;
  specMax: number | null;
  uom: string | null;
  method: string | null;
  samplingPlan: unknown | null;
  createdAt: string;
}

export interface InspectionPlan {
  id: string;
  companyId: string;
  productId: string;
  product?: Product;
  version: number;
  status: string;
  steps: InspectionStep[];
  createdAt: string;
}

export interface QualityInspection {
  id: string;
  productionOrderId: string;
  productionOrder?: { id: string; orderNo: string };
  stepId: string;
  step?: InspectionStep;
  operationId: string | null;
  status: string;
  value: number | null;
  result: string | null;
  inspectorId: string;
  timestamp: string;
  ncrId: string | null;
  ncr?: Nonconformance | null;
  images: unknown | null;
  createdAt: string;
}

export interface Nonconformance {
  id: string;
  inspectionId: string;
  inspection?: QualityInspection;
  type: string;
  severity: string;
  disposition: string | null;
  rootCause: string | null;
  correctiveAction: string | null;
  status: string;
  dispositionedAt: string | null;
  dispositionedBy: string | null;
  capa?: CorrectiveAction | null;
  reinspections?: Reinspection[];
  createdAt: string;
}

export interface CorrectiveAction {
  id: string;
  ncrId: string;
  ncr?: Nonconformance;
  description: string;
  ownerId: string;
  dueDate: string;
  completedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  effectiveness: string | null;
  createdAt: string;
}

export interface Reinspection {
  id: string;
  ncrId: string;
  inspectionId: string;
  result: string;
  inspectedAt: string;
  inspectedBy: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  diamondId: string;
  diamond?: Diamond;
  labId: string;
  certificateNo: string;
  issueDate: string;
  pdfUrl: string | null;
  validatedAt: string | null;
  validatedBy: string | null;
  createdAt: string;
}

export interface Asset {
  id: string;
  factoryId: string;
  factory?: { id: string; name: string };
  name: string;
  type: string;
  criticality: string;
  pmScheduleId: string | null;
  pmSchedule?: PreventiveMaintenanceSchedule | null;
  workOrders?: WorkOrder[];
  _count?: { workOrders: number };
  createdAt: string;
}

export interface WoTask {
  id: string;
  workOrderId: string;
  seq: number;
  description: string;
  estimatedHours: number;
  actualHours: number | null;
  completedAt: string | null;
  completedBy: string | null;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  assetId: string;
  asset?: { id: string; name: string };
  type: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  dueDate: string | null;
  completedAt: string | null;
  tasks?: WoTask[];
  _count?: { tasks: number };
  createdAt: string;
}

export interface PreventiveMaintenanceSchedule {
  id: string;
  assetId: string;
  asset?: { id: string; name: string; type: string; criticality: string };
  frequency: string;
  lastRun: string | null;
  nextRun: string;
  tasks: unknown | null;
  createdAt: string;
}

export interface Bag {
  id: string;
  shipmentId: string | null;
  shipment?: { id: string; trackingNo: string | null; status: string };
  weight: number;
  sealNo: string;
  status: string;
  diamonds?: Diamond[];
  _count?: { diamonds: number };
  createdAt: string;
}

export interface ShipmentTracking {
  id: string;
  shipmentId: string;
  status: string;
  location: string | null;
  timestamp: string;
  rawData: unknown | null;
}

export interface Shipment {
  id: string;
  companyId: string;
  customerId: string;
  customer?: { id: string; name: string };
  carrierId: string | null;
  carrier?: { id: string; name: string };
  trackingNo: string | null;
  status: string;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  bags?: Bag[];
  tracking?: ShipmentTracking[];
  _count?: { bags: number };
  createdAt: string;
}

export interface Carrier {
  id: string;
  name: string;
  code: string;
  apiEndpoint: string | null;
  accountNumber: string | null;
  serviceLevels: unknown | null;
  shipments?: Shipment[];
  createdAt: string;
}

export interface ChartOfAccount {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: string;
  parentId: string | null;
  parent?: { id: string; code: string; name: string } | null;
  children?: ChartOfAccount[];
  createdAt: string;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  description: string;
  qty: number;
  unitPrice: number;
  accountId: string;
  account?: { id: string; code: string; name: string };
  createdAt: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  customerId: string;
  customer?: { id: string; name: string };
  shipmentId: string | null;
  status: string;
  amount: number;
  currency: string;
  dueDate: string;
  invoiceDate: string;
  lines?: InvoiceLine[];
  payments?: Payment[];
  _count?: { lines: number; payments: number };
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: { id: string; status: string; amount: number };
  amount: number;
  currency: string;
  method: string;
  reference: string | null;
  receivedAt: string;
  createdAt: string;
}

export interface JournalLine {
  id: string;
  entryId: string;
  accountId: string;
  account?: { id: string; code: string; name: string };
  debit: number;
  credit: number;
  description: string | null;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  date: string;
  memo: string;
  lines?: JournalLine[];
  _count?: { lines: number };
  createdAt: string;
}

export interface RaLine {
  id: string;
  raId: string;
  diamondId: string | null;
  diamond?: { id: string; certificateNo: string; carat: number };
  qty: number;
  reason: string;
  createdAt: string;
}

export interface ReturnAuthorization {
  id: string;
  companyId: string;
  customerId: string;
  customer?: { id: string; name: string };
  invoiceId: string | null;
  status: string;
  disposition: string | null;
  lines?: RaLine[];
  repairOrder?: RepairOrder | null;
  _count?: { lines: number };
  createdAt: string;
}

export interface RepairOrder {
  id: string;
  returnAuthId: string;
  returnAuth?: { id: string; customer?: { id: string; name: string } } | null;
  productionOrderId: string | null;
  status: string;
  completedAt: string | null;
  redispatch?: Redispatch | null;
  createdAt: string;
}

export interface Redispatch {
  id: string;
  repairOrderId: string;
  shipmentId: string;
  shipment?: { id: string; trackingNo: string | null; status: string };
  status: string;
  createdAt: string;
}

export interface OEEData {
  overallOEE: number;
  availability: number;
  performance: number;
  quality: number;
  byDepartment?: { department: string; oee: number; availability: number; performance: number; quality: number; operations: number; status?: string }[];
  operationsAnalyzed: number;
}

export interface YieldData {
  overallYield: number;
  byDepartment: { department: string; yieldPct: number; operations: number; status?: string }[];
  operationsAnalyzed: number;
}

export interface OTDData {
  onTimeDeliveryPct: number;
  totalShipments: number;
  onTimeShipments: number;
  shipments?: {
    id: string;
    trackingNo: string | null;
    customer: string;
    status: string;
    dispatchedAt: string | null;
    deliveredAt: string | null;
    promisedDate: string;
    onTime: boolean;
    carrier: string | null;
  }[];
}

export interface WipAgingData {
  aging: { operationId: string; productionOrderId: string; seq: number; department: string | null; workCenter: string | null; status: string; ageDays: number; ageHours: number }[];
  buckets: { '0-24h': number; '24-48h': number; '48-72h': number; '72h+': number };
  totalWip: number;
}

export interface CapacityData {
  overallUtilization: number;
  byWorkCenter: { workCenter: string; utilization: number; plannedMinutes: number; actualMinutes: number; operations: number }[];
  totalOperations: number;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string | null;
  queryConfig: Record<string, unknown>;
  createdAt: string;
}
