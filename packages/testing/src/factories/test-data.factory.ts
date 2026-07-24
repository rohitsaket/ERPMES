import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export class TestDataFactory {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createCompany(overrides: Record<string, any> = {}) {
    return this.prisma.company.create({
      data: {
        name: faker.company.name(),
        code: faker.string.alphanumeric(4).toUpperCase(),
        settings: {},
        ...overrides,
      },
    });
  }

  async createBranch(companyId: string, overrides: Record<string, any> = {}) {
    return this.prisma.branch.create({
      data: {
        companyId,
        name: faker.company.name(),
        code: faker.string.alphanumeric(3).toUpperCase(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        timezone: 'UTC',
        ...overrides,
      },
    });
  }

  async createFactory(companyId: string, branchId?: string, overrides: Record<string, any> = {}) {
    return this.prisma.factory.create({
      data: {
        companyId,
        branchId: branchId || null,
        name: faker.company.name() + ' Factory',
        code: faker.string.alphanumeric(3).toUpperCase(),
        capacity: { totalHours: 160, shifts: 1 },
        shifts: [{ name: 'Day', start: '08:00', end: '17:00' }],
        ...overrides,
      },
    });
  }

  async createWarehouse(companyId: string, factoryId: string, overrides: Record<string, any> = {}) {
    return this.prisma.warehouse.create({
      data: {
        companyId,
        factoryId,
        name: faker.location.street() + ' Warehouse',
        code: faker.string.alphanumeric(4).toUpperCase(),
        type: 'standard',
        location: { zone: 'A', rack: '1' },
        ...overrides,
      },
    });
  }

  async createDepartment(companyId: string, factoryId: string, overrides: Record<string, any> = {}) {
    const types = ['planning', 'rough', 'sawing', 'laser', 'blocking', 'bruting', 'polishing', 'fancy', 'repair', 'final_polishing', 'quality_control', 'certification', 'bagging', 'dispatch'];
    return this.prisma.department.create({
      data: {
        companyId,
        factoryId,
        name: faker.helpers.arrayElement(types),
        code: faker.string.alphanumeric(4).toUpperCase(),
        type: faker.helpers.arrayElement(types),
        sequence: faker.number.int({ min: 1, max: 20 }),
        capacity: faker.number.int({ min: 5, max: 20 }),
        ...overrides,
      },
    });
  }

  async createWorkCenter(companyId: string, departmentId: string, overrides: Record<string, any> = {}) {
    const types = ['machine', 'manual', 'inspection', 'laser', 'saw', 'polishing_wheel', 'bruting_machine'];
    return this.prisma.workCenter.create({
      data: {
        companyId,
        departmentId,
        name: faker.company.buzzPhrase(),
        code: faker.string.alphanumeric(4).toUpperCase(),
        type: faker.helpers.arrayElement(types),
        capacity: faker.number.int({ min: 1, max: 5 }),
        oeeTarget: 0.85,
        ...overrides,
      },
    });
  }

  async createProduct(companyId: string, overrides: Record<string, any> = {}) {
    return this.prisma.product.create({
      data: {
        companyId,
        sku: faker.string.alphanumeric(10).toUpperCase(),
        name: faker.commerce.productName(),
        category: faker.helpers.arrayElement(['diamond', 'jewelry', 'raw_material', 'service']),
        uom: 'PCS',
        weight: faker.number.float({ min: 0.1, max: 5, fractionDigits: 4 }),
        ...overrides,
      },
    });
  }

  async createCustomer(companyId: string, overrides: Record<string, any> = {}) {
    return this.prisma.customer.create({
      data: {
        companyId,
        code: faker.string.alphanumeric(6).toUpperCase(),
        name: faker.company.name(),
        type: faker.helpers.arrayElement(['individual', 'business']),
        contactInfo: {
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        creditLimit: faker.number.float({ min: 10000, max: 1000000, fractionDigits: 2 }),
        paymentTerms: 'NET30',
        ...overrides,
      },
    });
  }

  async createVendor(companyId: string, overrides: Record<string, any> = {}) {
    return this.prisma.vendor.create({
      data: {
        companyId,
        code: faker.string.alphanumeric(6).toUpperCase(),
        name: faker.company.name(),
        type: 'supplier',
        contactInfo: {
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        paymentTerms: 'NET30',
        leadTimeDays: faker.number.int({ min: 1, max: 30 }),
        rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        ...overrides,
      },
    });
  }

  async createUser(companyId: string, overrides: Record<string, any> = {}) {
    return this.prisma.user.create({
      data: {
        companyId,
        clerkId: faker.string.uuid(),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: faker.helpers.arrayElement(['operator', 'supervisor', 'manager', 'admin']),
        permissions: [],
        settings: {},
        ...overrides,
      },
    });
  }

  async createSalesOrder(companyId: string, customerId: string, overrides: Record<string, any> = {}) {
    return this.prisma.salesOrder.create({
      data: {
        companyId,
        customerId,
        number: `SO-${faker.string.alphanumeric(8).toUpperCase()}`,
        status: 'validated',
        currency: 'USD',
        totalAmount: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
        requestedDate: faker.date.future(),
        promisedDate: faker.date.future(),
        createdBy: 'test-user',
        ...overrides,
      },
    });
  }

  async createProductionOrder(companyId: string, productId: string, overrides: Record<string, any> = {}) {
    return this.prisma.productionOrder.create({
      data: {
        companyId,
        productId,
        number: `PO-${faker.string.alphanumeric(8).toUpperCase()}`,
        qty: faker.number.int({ min: 1, max: 100 }),
        uom: 'PCS',
        status: 'planned',
        priority: 'normal',
        plannedStartDate: faker.date.future(),
        plannedEndDate: faker.date.future(),
        routingId: 'default-routing',
        createdBy: 'test-user',
        ...overrides,
      },
    });
  }

  async createPurchaseOrder(companyId: string, vendorId: string, overrides: Record<string, any> = {}) {
    return this.prisma.purchaseOrder.create({
      data: {
        companyId,
        vendorId,
        number: `PO-${faker.string.alphanumeric(8).toUpperCase()}`,
        status: 'draft',
        currency: 'USD',
        totalAmount: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
        createdBy: 'test-user',
        ...overrides,
      },
    });
  }

  async createInventoryLot(companyId: string, warehouseId: string, itemId: string, overrides: Record<string, any> = {}) {
    return this.prisma.inventoryLot.create({
      data: {
        companyId,
        warehouseId,
        itemId,
        lotNumber: `LOT-${faker.string.alphanumeric(8).toUpperCase()}`,
        qty: faker.number.float({ min: 1, max: 1000, fractionDigits: 4 }),
        uom: 'PCS',
        status: 'available',
        ...overrides,
      },
    });
  }

  async createDiamond(companyId: string, overrides: Record<string, any> = {}) {
    return this.prisma.diamond.create({
      data: {
        companyId,
        certificateNo: faker.string.alphanumeric(10).toUpperCase(),
        carat: faker.number.float({ min: 0.1, max: 5, fractionDigits: 4 }),
        color: faker.helpers.arrayElement(['D', 'E', 'F', 'G', 'H', 'I', 'J']),
        clarity: faker.helpers.arrayElement(['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2']),
        cut: faker.helpers.arrayElement(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']),
        shape: faker.helpers.arrayElement(['round', 'princess', 'emerald', 'oval', 'marquise', 'pear', 'heart', 'cushion', 'radiant', 'asscher']),
        origin: faker.location.country(),
        status: 'unallocated',
        ...overrides,
      },
    });
  }

  async createDiamondPacket(companyId: string, factoryId: string, overrides: Record<string, any> = {}) {
    return this.prisma.diamondPacket.create({
      data: {
        companyId,
        factoryId,
        name: `PKT-${faker.string.alphanumeric(6).toUpperCase()}`,
        barcode: faker.string.alphanumeric(12).toUpperCase(),
        status: 'open',
        ...overrides,
      },
    });
  }

  async createQualityInspection(companyId: string, productionOrderId: string, operationId: string, overrides: Record<string, any> = {}) {
    return this.prisma.qualityInspection.create({
      data: {
        companyId,
        productionOrderId,
        operationId,
        planId: 'plan-1',
        stepId: 'step-1',
        status: 'pending',
        inspectorId: 'test-inspector',
        ...overrides,
      },
    });
  }

  async createNonconformance(companyId: string, inspectionId: string, overrides: Record<string, any> = {}) {
    return this.prisma.nonconformance.create({
      data: {
        companyId,
        inspectionId,
        type: 'defect',
        severity: 'major',
        disposition: 'rework',
        status: 'open',
        ...overrides,
      },
    });
  }

  async createCertificate(companyId: string, diamondId: string, overrides: Record<string, any> = {}) {
    return this.prisma.certificate.create({
      data: {
        companyId,
        diamondId,
        labId: 'GIA',
        certificateNo: `GIA-${faker.string.alphanumeric(8).toUpperCase()}`,
        reportDate: faker.date.recent(),
        issueDate: faker.date.recent(),
        validatedAt: new Date(),
        validatedBy: 'test-validator',
        status: 'validated',
        ...overrides,
      },
    });
  }

  async createShipment(companyId: string, customerId: string, overrides: Record<string, any> = {}) {
    return this.prisma.shipment.create({
      data: {
        companyId,
        customerId,
        number: `SHIP-${faker.string.alphanumeric(8).toUpperCase()}`,
        status: 'planned',
        weight: faker.number.float({ min: 0.1, max: 10, fractionDigits: 4 }),
        value: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
        createdAt: new Date(),
        ...overrides,
      },
    });
  }

  async createInvoice(companyId: string, customerId: string, shipmentId?: string, overrides: Record<string, any> = {}) {
    return this.prisma.invoice.create({
      data: {
        companyId,
        customerId,
        shipmentId,
        number: `INV-${faker.string.alphanumeric(8).toUpperCase()}`,
        status: 'draft',
        amount: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
        currency: 'USD',
        dueDate: faker.date.future(),
        ...overrides,
      },
    });
  }

  async createPayment(companyId: string, invoiceId: string, overrides: Record<string, any> = {}) {
    return this.prisma.payment.create({
      data: {
        companyId,
        invoiceId,
        amount: faker.number.float({ min: 100, max: 50000, fractionDigits: 2 }),
        currency: 'USD',
        method: 'bank_transfer',
        reference: faker.string.alphanumeric(12),
        receivedAt: new Date(),
        ...overrides,
      },
    });
  }

  async cleanup(): Promise<void> {
    const models = [
      'payment', 'invoice', 'shipment', 'certificate', 'nonconformance',
      'qualityInspection', 'diamondPacket', 'diamond', 'inventoryLot',
      'purchaseOrder', 'productionOrder', 'salesOrder', 'user',
      'vendor', 'customer', 'product', 'workCenter', 'department',
      'warehouse', 'factory', 'branch', 'company',
    ];

    for (const model of models) {
      try {
        await (this.prisma as any)[model].deleteMany({});
      } catch (e) {
        // Model might not exist
      }
    }
  }
}

export function createTestFactory(prisma: PrismaClient): TestDataFactory {
  return new TestDataFactory(prisma);
}