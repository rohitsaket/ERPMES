import { Company } from '../aggregates/company';
import { Branch } from '../aggregates/branch';
import { Factory } from '../aggregates/factory';
import { Warehouse } from '../aggregates/warehouse';
import { Department } from '../aggregates/department';
import { WorkCenter } from '../aggregates/work-center';
import { Product } from '../aggregates/product';
import { BillOfMaterials } from '../aggregates/bill-of-materials';
import { Routing } from '../aggregates/routing';
import { SalesOrder } from '../aggregates/sales-order';
import { ProductionOrder } from '../aggregates/production-order';
import { ProductionOrderOperation } from '../aggregates/production-order-operation';
import { Diamond } from '../aggregates/diamond';
import { DiamondPacket } from '../aggregates/diamond-packet';
import { Certificate } from '../aggregates/certificate';
import { InventoryLot } from '../aggregates/inventory-lot';
import { InventoryTransaction } from '../aggregates/inventory-transaction';
import { InspectionPlan } from '../aggregates/inspection-plan';
import { QualityInspection } from '../aggregates/quality-inspection';
import { Nonconformance } from '../aggregates/nonconformance';

export interface CompanyRepository {
  findById(id: string): Promise<Company | null>;
  findByCode(code: string): Promise<Company | null>;
  save(company: Company): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface BranchRepository {
  findById(id: string): Promise<Branch | null>;
  findByCompanyIdAndCode(companyId: string, code: string): Promise<Branch | null>;
  findByCompanyId(companyId: string): Promise<Branch[]>;
  save(branch: Branch): Promise<void>;
}

export interface FactoryRepository {
  findById(id: string): Promise<Factory | null>;
  findByBranchIdAndCode(branchId: string, code: string): Promise<Factory | null>;
  findByBranchId(branchId: string): Promise<Factory[]>;
  save(factory: Factory): Promise<void>;
}

export interface WarehouseRepository {
  findById(id: string): Promise<Warehouse | null>;
  findByFactoryIdAndName(factoryId: string, name: string): Promise<Warehouse | null>;
  findByFactoryId(factoryId: string): Promise<Warehouse[]>;
  save(warehouse: Warehouse): Promise<void>;
}

export interface DepartmentRepository {
  findById(id: string): Promise<Department | null>;
  findByFactoryIdAndName(factoryId: string, name: string): Promise<Department | null>;
  findByFactoryId(factoryId: string): Promise<Department[]>;
  save(department: Department): Promise<void>;
}

export interface WorkCenterRepository {
  findById(id: string): Promise<WorkCenter | null>;
  findByDepartmentIdAndName(departmentId: string, name: string): Promise<WorkCenter | null>;
  findByDepartmentId(departmentId: string): Promise<WorkCenter[]>;
  save(workCenter: WorkCenter): Promise<void>;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByCompanyIdAndSku(companyId: string, sku: string): Promise<Product | null>;
  findByCompanyId(companyId: string): Promise<Product[]>;
  save(product: Product): Promise<void>;
}

export interface BomRepository {
  findById(id: string): Promise<any | null>;
  findByProductId(productId: string): Promise<any | null>;
  save(bom: any): Promise<void>;
}

export interface RoutingRepository {
  findById(id: string): Promise<any | null>;
  findByProductId(productId: string): Promise<any | null>;
  save(routing: any): Promise<void>;
}

export interface CustomerRepository {
  findById(id: string): Promise<any | null>;
  findByCompanyIdAndCode(companyId: string, code: string): Promise<any | null>;
  findByCompanyId(companyId: string): Promise<any[]>;
  save(customer: any): Promise<void>;
}

export interface VendorRepository {
  findById(id: string): Promise<any | null>;
  findByCompanyIdAndCode(companyId: string, code: string): Promise<any | null>;
  findByCompanyId(companyId: string): Promise<any[]>;
  save(vendor: any): Promise<void>;
}

export interface SalesOrderRepository {
  findById(id: string): Promise<SalesOrder | null>;
  findByCompanyId(companyId: string): Promise<SalesOrder[]>;
  findByCustomerId(customerId: string): Promise<SalesOrder[]>;
  findByStatus(status: string): Promise<SalesOrder[]>;
  save(salesOrder: SalesOrder): Promise<void>;
}

export interface QuotationRepository {
  findById(id: string): Promise<any | null>;
  findByCompanyId(companyId: string): Promise<any[]>;
  findByCustomerId(customerId: string): Promise<any[]>;
  findByStatus(status: string): Promise<any[]>;
  save(quotation: any): Promise<void>;
}

export interface ProductionOrderRepository {
  findById(id: string): Promise<ProductionOrder | null>;
  findByCompanyId(companyId: string): Promise<ProductionOrder[]>;
  findBySalesOrderLineId(salesOrderLineId: string): Promise<ProductionOrder | null>;
  findByStatus(status: string): Promise<ProductionOrder[]>;
  save(productionOrder: ProductionOrder): Promise<void>;
}

export interface ProductionOrderOperationRepository {
  findById(id: string): Promise<ProductionOrderOperation | null>;
  findByOrderId(orderId: string): Promise<any[]>;
  findByWorkCenterId(workCenterId: string): Promise<any[]>;
  findByStatus(status: string): Promise<any[]>;
  save(operation: ProductionOrderOperation): Promise<void>;
}

export interface DiamondRepository {
  findById(id: string): Promise<Diamond | null>;
  findByCompanyId(companyId: string): Promise<Diamond[]>;
  findByPacketId(packetId: string): Promise<Diamond[]>;
  findByStatus(status: string): Promise<Diamond[]>;
  save(diamond: Diamond): Promise<void>;
}

export interface DiamondPacketRepository {
  findById(id: string): Promise<DiamondPacket | null>;
  findByFactoryId(factoryId: string): Promise<DiamondPacket[]>;
  findByStatus(status: string): Promise<DiamondPacket[]>;
  save(packet: DiamondPacket): Promise<void>;
}

export interface CertificateRepository {
  findById(id: string): Promise<Certificate | null>;
  findByDiamondId(diamondId: string): Promise<Certificate | null>;
  findByLabId(labId: string): Promise<Certificate[]>;
  findByCertificateNo(certificateNo: string): Promise<Certificate | null>;
  save(certificate: Certificate): Promise<void>;
}

export interface InventoryLotRepository {
  findById(id: string): Promise<any | null>;
  findByCompanyIdAndLotNumber(companyId: string, lotNumber: string): Promise<any | null>;
  findByCompanyId(companyId: string): Promise<any[]>;
  findByWarehouseId(warehouseId: string): Promise<any[]>;
  findByItemId(itemId: string): Promise<any[]>;
  findByStatus(status: string): Promise<any[]>;
  save(lot: any): Promise<void>;
}

export interface InventoryTransactionRepository {
  findById(id: string): Promise<any | null>;
  findByLotId(lotId: string): Promise<any[]>;
  findByRefTypeAndRefId(refType: string, refId: string): Promise<any[]>;
  save(transaction: any): Promise<void>;
}

export interface InspectionPlanRepository {
  findById(id: string): Promise<any | null>;
  findByProductIdAndVersion(productId: string, version: number): Promise<any | null>;
  findByCompanyId(companyId: string): Promise<any[]>;
  findByProductId(productId: string): Promise<any[]>;
  save(plan: any): Promise<void>;
}

export interface QualityInspectionRepository {
  findById(id: string): Promise<any | null>;
  findByProductionOrderId(productionOrderId: string): Promise<any[]>;
  findByStepId(stepId: string): Promise<any[]>;
  findByStatus(status: string): Promise<any[]>;
  findByInspectorId(inspectorId: string): Promise<any[]>;
  save(inspection: any): Promise<void>;
}

export interface NonconformanceRepository {
  findById(id: string): Promise<any | null>;
  findByInspectionId(inspectionId: string): Promise<any | null>;
  findByStatus(status: string): Promise<any[]>;
  findByDisposition(disposition: string): Promise<any[]>;
  save(ncr: any): Promise<void>;
}

export interface ApprovalFlowRepository {
  findById(id: string): Promise<any | null>;
  findByCompanyIdAndEntityType(companyId: string, entityType: string): Promise<any | null>;
  findByEntityType(entityType: string): Promise<any[]>;
  save(flow: any): Promise<void>;
}

export interface ApprovalInstanceRepository {
  findById(id: string): Promise<any | null>;
  findByFlowIdAndEntity(flowId: string, entityId: string, entityType: string): Promise<any | null>;
  findByEntity(entityId: string, entityType: string): Promise<any | null>;
  findByStatus(status: string): Promise<any[]>;
  save(instance: any): Promise<void>;
}

export interface AuditLogRepository {
  findById(id: string): Promise<any | null>;
  findByCompanyId(companyId: string): Promise<any[]>;
  findByEntityTypeAndId(entityType: string, entityId: string): Promise<any[]>;
  findByUserId(userId: string): Promise<any[]>;
  findByCorrelationId(correlationId: string): Promise<any[]>;
  save(log: any): Promise<void>;
}

export interface OutboxEventRepository {
  save(event: any): Promise<void>;
  getUnpublished(limit: number): Promise<any[]>;
  markPublished(id: string): Promise<void>;
}

export interface InboxEventRepository {
  save(event: any): Promise<void>;
  findByEventIdAndConsumer(eventId: string, consumer: string): Promise<any | null>;
  update(event: any): Promise<void>;
  getPending(limit: number): Promise<any[]>;
  getDeadLetter(limit: number): Promise<any[]>;
}