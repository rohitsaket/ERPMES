export class CompanyFactory {
  static create(overrides: Partial<{
    name: string;
    code: string;
    settings: Record<string, any>;
  }> = {}) {
    return {
      name: overrides.name || `Company ${Math.random().toString(36).substr(2, 8)}`,
      code: overrides.code || `COMP${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      settings: overrides.settings || { currency: 'USD', timezone: 'UTC' },
    };
  }
}

export class BranchFactory {
  static create(companyId: string, overrides: Partial<{
    name: string;
    code: string;
    address: any;
    timezone: string;
  }> = {}) {
    return {
      companyId,
      name: overrides.name || `Branch ${Math.random().toString(36).substr(2, 8)}`,
      code: overrides.code || `BR${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      address: overrides.address || { city: 'Test City', country: 'Test Country' },
      timezone: overrides.timezone || 'UTC',
    };
  }
}

export class FactoryFactory {
  static create(branchId: string, overrides: Partial<{
    name: string;
    code: string;
    capacity: number;
    shifts: any;
  }> = {}) {
    return {
      branchId,
      name: overrides.name || `Factory ${Math.random().toString(36).substr(2, 8)}`,
      code: overrides.code || `FAC${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      capacity: overrides.capacity || 1000,
      shifts: overrides.shifts || ['DAY', 'NIGHT'],
    };
  }
}

export class ProductFactory {
  static create(companyId: string, overrides: Partial<{
    sku: string;
    name: string;
    category: string;
    description: string;
  }> = {}) {
    return {
      companyId,
      sku: overrides.sku || `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      name: overrides.name || `Product ${Math.random().toString(36).substr(2, 8)}`,
      category: overrides.category || 'DIAMOND',
      description: overrides.description || 'Test product',
    };
  }
}

export class CustomerFactory {
  static create(companyId: string, overrides: Partial<{
    name: string;
    code: string;
    creditLimit: number;
    paymentTerms: string;
  }> = {}) {
    return {
      companyId,
      name: overrides.name || `Customer ${Math.random().toString(36).substr(2, 8)}`,
      code: overrides.code || `CUST${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      creditLimit: overrides.creditLimit || 1000000,
      paymentTerms: overrides.paymentTerms || 'NET30',
    };
  }
}

export class VendorFactory {
  static create(companyId: string, overrides: Partial<{
    name: string;
    code: string;
    rating: number;
  }> = {}) {
    return {
      companyId,
      name: overrides.name || `Vendor ${Math.random().toString(36).substr(2, 8)}`,
      code: overrides.code || `VEND${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      rating: overrides.rating || 4.5,
    };
  }
}

export class ProductionOrderFactory {
  static create(companyId: string, overrides: Partial<{
    productId: string;
    qty: number;
    priority: number;
    startDate: Date;
    dueDate: Date;
    routingId: string;
  }> = {}) {
    return {
      companyId,
      productId: overrides.productId || 'test-product',
      qty: overrides.qty || 100,
      priority: overrides.priority || 0,
      startDate: overrides.startDate || new Date(),
      dueDate: overrides.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      routingId: overrides.routingId,
    };
  }
}

export class DiamondFactory {
  static create(companyId: string, overrides: Partial<{
    certificateNo: string;
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    shape: string;
    origin: string;
    status: string;
  }> = {}) {
    return {
      companyId,
      certificateNo: overrides.certificateNo || `CERT${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      carat: overrides.carat || 1.0,
      color: overrides.color || 'D',
      clarity: overrides.clarity || 'IF',
      cut: overrides.cut || 'EXCELLENT',
      shape: overrides.shape || 'ROUND',
      origin: overrides.origin || 'NATURAL',
      status: overrides.status || 'ROUGH',
    };
  }
}

export class QuotationFactory {
  static create(companyId: string, customerId: string, overrides: Partial<{
    version: number;
    status: string;
    validUntil: Date;
  }> = {}) {
    return {
      companyId,
      customerId,
      version: overrides.version || 1,
      status: overrides.status || 'DRAFT',
      validUntil: overrides.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }
}

export class SalesOrderFactory {
  static create(companyId: string, customerId: string, overrides: Partial<{
    quotationId: string;
    status: string;
    orderDate: Date;
    requiredDate: Date;
  }> = {}) {
    return {
      companyId,
      customerId,
      quotationId: null,
      status: overrides.status || 'DRAFT',
      orderDate: overrides.orderDate || new Date(),
      requiredDate: overrides.requiredDate,
    };
  }
}

export class InspectionPlanFactory {
  static create(companyId: string, productId: string, overrides: Partial<{
    version: number;
    status: string;
  }> = {}) {
    return {
      companyId,
      productId,
      version: 1,
      status: 'ACTIVE',
    };
  }
}

export class InspectionFactory {
  static create(productionOrderId: string, stepId: string, inspectorId: string, overrides: Partial<{
    status: string;
    value: number;
    result: string;
  }> = {}) {
    return {
      productionOrderId,
      stepId,
      status: 'PENDING',
      inspectorId,
      timestamp: new Date(),
    };
  }
}

export class NcrFactory {
  static create(inspectionId: string, overrides: Partial<{
    type: string;
    severity: string;
    disposition: string;
  }> = {}) {
    return {
      inspectionId,
      type: 'DIMENSIONAL',
      severity: 'MAJOR',
      disposition: 'REWORK',
    };
  }
}