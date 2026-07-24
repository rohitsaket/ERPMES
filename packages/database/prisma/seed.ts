import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const company = await prisma.company.upsert({
    where: { code: 'DEMO' },
    update: {
      name: 'DiamondFlow Demo',
    },
    create: {
      name: 'DiamondFlow Demo',
      code: 'DEMO',
      settings: {
        currency: 'USD',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        weightUnit: 'carat',
        enableMRP: true,
        enableFiniteScheduling: false,
        enableAICopilot: true,
      },
    },
  });

  console.log('✅ Company created:', company.code);

  const hqBranch = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'HQ' } },
    update: {
      name: 'Headquarters',
      address: { city: 'New York', country: 'USA' },
      timezone: 'America/New_York',
    },
    create: {
      companyId: company.id,
      name: 'Headquarters',
      code: 'HQ',
      address: { city: 'New York', country: 'USA' },
      timezone: 'America/New_York',
    },
  });

  const mumbaiBranch = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'MUM' } },
    update: {
      name: 'Mumbai Office',
      address: { city: 'Mumbai', country: 'India' },
      timezone: 'Asia/Kolkata',
    },
    create: {
      companyId: company.id,
      name: 'Mumbai Office',
      code: 'MUM',
      address: { city: 'Mumbai', country: 'India' },
      timezone: 'Asia/Kolkata',
    },
  });

  console.log('✅ Branches created');

  const nyFactory = await prisma.factory.upsert({
    where: { companyId_code: { companyId: company.id, code: 'NYC-01' } },
    update: {
      branchId: hqBranch.id,
      name: 'NYC Manufacturing',
      capacity: 1000,
      shifts: ['DAY', 'NIGHT'],
    },
    create: {
      companyId: company.id,
      branchId: hqBranch.id,
      name: 'NYC Manufacturing',
      code: 'NYC-01',
      capacity: 1000,
      shifts: ['DAY', 'NIGHT'],
    },
  });

  const mumbaiFactory = await prisma.factory.upsert({
    where: { companyId_code: { companyId: company.id, code: 'MUM-01' } },
    update: {
      branchId: mumbaiBranch.id,
      name: 'Mumbai Manufacturing',
      capacity: 2000,
      shifts: ['DAY', 'SWING', 'NIGHT'],
    },
    create: {
      companyId: company.id,
      branchId: mumbaiBranch.id,
      name: 'Mumbai Manufacturing',
      code: 'MUM-01',
      capacity: 2000,
      shifts: ['DAY', 'SWING', 'NIGHT'],
    },
  });

  console.log('✅ Factories created');

  const warehouses = [
    { factoryId: nyFactory.id, code: 'NYC-RAW', name: 'Raw Materials', type: 'RAW', location: { zone: 'A' } },
    { factoryId: nyFactory.id, code: 'NYC-WIP', name: 'Work in Progress', type: 'WIP', location: { zone: 'B' } },
    { factoryId: nyFactory.id, code: 'NYC-FG', name: 'Finished Goods', type: 'FINISHED', location: { zone: 'C' } },
    { factoryId: nyFactory.id, code: 'NYC-QA', name: 'Quarantine', type: 'QUARANTINE', location: { zone: 'Q' } },
    { factoryId: mumbaiFactory.id, code: 'MUM-RAW', name: 'Raw Materials', type: 'RAW', location: { zone: 'A' } },
    { factoryId: mumbaiFactory.id, code: 'MUM-WIP', name: 'Work in Progress', type: 'WIP', location: { zone: 'B' } },
    { factoryId: mumbaiFactory.id, code: 'MUM-FG', name: 'Finished Goods', type: 'FINISHED', location: { zone: 'C' } },
    { factoryId: mumbaiFactory.id, code: 'MUM-QA', name: 'Quarantine', type: 'QUARANTINE', location: { zone: 'Q' } },
  ];

  for (const warehouse of warehouses) {
    await prisma.warehouse.upsert({
      where: { companyId_code: { companyId: company.id, code: warehouse.code } },
      update: warehouse,
      create: { companyId: company.id, ...warehouse },
    });
  }

  console.log('✅ Warehouses created');

  const departments = [
    { code: 'PLANNING', name: 'Planning', type: 'PLANNING', sequence: 1 },
    { code: 'ROUGH', name: 'Rough', type: 'ROUGH', sequence: 2 },
    { code: 'SAWING', name: 'Sawing', type: 'SAWING', sequence: 3 },
    { code: 'LASER', name: 'Laser', type: 'LASER', sequence: 4 },
    { code: 'BLOCKING', name: 'Blocking', type: 'BLOCKING', sequence: 5 },
    { code: 'BRUTING', name: 'Bruting', type: 'BRUTING', sequence: 6 },
    { code: 'POLISHING', name: 'Polishing', type: 'POLISHING', sequence: 7 },
    { code: 'FANCY', name: 'Fancy', type: 'FANCY', sequence: 8 },
    { code: 'REPAIR', name: 'Repair', type: 'REPAIR', sequence: 9 },
    { code: 'FINAL-POLISH', name: 'Final Polishing', type: 'POLISHING', sequence: 10 },
    { code: 'QC', name: 'Quality Control', type: 'QC', sequence: 11 },
    { code: 'CERTIFICATION', name: 'Certification', type: 'CERTIFICATION', sequence: 12 },
    { code: 'BAGGING', name: 'Bagging', type: 'BAGGING', sequence: 13 },
    { code: 'DISPATCH', name: 'Dispatch', type: 'DISPATCH', sequence: 14 },
  ];

  for (const factory of [nyFactory, mumbaiFactory]) {
    for (const department of departments) {
      await prisma.department.upsert({
        where: {
          companyId_factoryId_code: {
            companyId: company.id,
            factoryId: factory.id,
            code: department.code,
          },
        },
        update: department,
        create: {
          companyId: company.id,
          factoryId: factory.id,
          ...department,
        },
      });
    }
  }

  console.log('✅ Departments created');

  const workCenters = [
    { departmentCode: 'SAWING', code: 'LASER-SAW-1', name: 'Laser Saw 1', type: 'MACHINE', capacity: 50, oeeTarget: 0.85 },
    { departmentCode: 'SAWING', code: 'LASER-SAW-2', name: 'Laser Saw 2', type: 'MACHINE', capacity: 50, oeeTarget: 0.85 },
    { departmentCode: 'BRUTING', code: 'BRUTING-1', name: 'Bruting Machine 1', type: 'MACHINE', capacity: 30, oeeTarget: 0.80 },
    { departmentCode: 'BRUTING', code: 'BRUTING-2', name: 'Bruting Machine 2', type: 'MACHINE', capacity: 30, oeeTarget: 0.80 },
    { departmentCode: 'POLISHING', code: 'POLISH-1', name: 'Polishing Wheel 1', type: 'MACHINE', capacity: 40, oeeTarget: 0.90 },
    { departmentCode: 'POLISHING', code: 'POLISH-2', name: 'Polishing Wheel 2', type: 'MACHINE', capacity: 40, oeeTarget: 0.90 },
    { departmentCode: 'POLISHING', code: 'POLISH-3', name: 'Polishing Wheel 3', type: 'MACHINE', capacity: 40, oeeTarget: 0.90 },
    { departmentCode: 'QC', code: 'QC-1', name: 'QC Station 1', type: 'LABOR', capacity: 20, oeeTarget: 0.95 },
    { departmentCode: 'QC', code: 'QC-2', name: 'QC Station 2', type: 'LABOR', capacity: 20, oeeTarget: 0.95 },
  ];

  for (const factory of [nyFactory, mumbaiFactory]) {
    for (const workCenter of workCenters) {
      const { departmentCode, ...workCenterData } = workCenter;
      const department = await prisma.department.findFirstOrThrow({
        where: {
          companyId: company.id,
          factoryId: factory.id,
          code: departmentCode,
        },
      });

      await prisma.workCenter.upsert({
        where: {
          companyId_departmentId_code: {
            companyId: company.id,
            departmentId: department.id,
            code: workCenter.code,
          },
        },
        update: {
          factoryId: factory.id,
          ...workCenterData,
        },
        create: {
          companyId: company.id,
          factoryId: factory.id,
          departmentId: department.id,
          ...workCenterData,
        },
      });
    }
  }

  console.log('✅ Work Centers created');

  const products = [
    { sku: 'RD-1.00-E-VVS1-EX', name: 'Round Diamond 1.00ct E/VVS1/EX', category: 'POLISHED_DIAMOND' },
    { sku: 'RD-0.50-F-VS1-VG', name: 'Round Diamond 0.50ct F/VS1/VG', category: 'POLISHED_DIAMOND' },
    { sku: 'RD-2.00-D-IF-EX', name: 'Round Diamond 2.00ct D/IF/EX', category: 'POLISHED_DIAMOND' },
    { sku: 'PR-1.00-G-SI1-GD', name: 'Princess Diamond 1.00ct G/SI1/GD', category: 'POLISHED_DIAMOND' },
    { sku: 'EM-1.50-H-VS2-GD', name: 'Emerald Diamond 1.50ct H/VS2/GD', category: 'POLISHED_DIAMOND' },
    { sku: 'OV-0.75-I-VS1-VG', name: 'Oval Diamond 0.75ct I/VS1/VG', category: 'POLISHED_DIAMOND' },
    { sku: 'ROUGH-5.00', name: 'Rough Diamond 5.00ct', category: 'ROUGH_DIAMOND' },
    { sku: 'ROUGH-10.00', name: 'Rough Diamond 10.00ct', category: 'ROUGH_DIAMOND' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: product.sku } },
      update: product,
      create: { companyId: company.id, ...product },
    });
  }

  console.log('✅ Products created');

  const customers = [
    { code: 'CUST-001', name: 'Tiffany & Co.', creditLimit: 5000000, paymentTerms: 'NET30' },
    { code: 'CUST-002', name: 'Cartier', creditLimit: 3000000, paymentTerms: 'NET30' },
    { code: 'CUST-003', name: 'Harry Winston', creditLimit: 2000000, paymentTerms: 'NET45' },
    { code: 'CUST-004', name: 'Graff Diamonds', creditLimit: 1500000, paymentTerms: 'NET60' },
    { code: 'CUST-005', name: 'Blue Nile', creditLimit: 1000000, paymentTerms: 'NET30' },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { companyId_code: { companyId: company.id, code: customer.code } },
      update: customer,
      create: { companyId: company.id, ...customer },
    });
  }

  console.log('✅ Customers created');

  const vendors = [
    { code: 'VEND-001', name: 'De Beers', rating: 4.9 },
    { code: 'VEND-002', name: 'Alrosa', rating: 4.7 },
    { code: 'VEND-003', name: 'Rio Tinto', rating: 4.8 },
    { code: 'VEND-004', name: 'Petra Diamonds', rating: 4.5 },
    { code: 'VEND-005', name: 'Gem Diamonds', rating: 4.6 },
  ];

  for (const vendor of vendors) {
    await prisma.vendor.upsert({
      where: { companyId_code: { companyId: company.id, code: vendor.code } },
      update: vendor,
      create: { companyId: company.id, ...vendor },
    });
  }

  console.log('✅ Vendors created');

  const accounts = [
    { code: '1000', name: 'Cash', type: 'ASSET' },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET' },
    { code: '1200', name: 'Inventory - Raw Materials', type: 'ASSET' },
    { code: '1210', name: 'Inventory - WIP', type: 'ASSET' },
    { code: '1220', name: 'Inventory - Finished Goods', type: 'ASSET' },
    { code: '1500', name: 'Property & Equipment', type: 'ASSET' },
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
    { code: '3000', name: 'Equity', type: 'EQUITY' },
    { code: '4000', name: 'Sales Revenue', type: 'REVENUE' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE' },
    { code: '6000', name: 'Operating Expenses', type: 'EXPENSE' },
  ];

  for (const account of accounts) {
    await prisma.chartOfAccount.upsert({
      where: { companyId_code: { companyId: company.id, code: account.code } },
      update: account,
      create: { companyId: company.id, ...account },
    });
  }

  console.log('✅ Chart of Accounts created');

  const carriers = [
    { name: 'Brinks', code: 'BRINKS', apiConfig: { endpoint: 'https://api.brinks.com' }, serviceLevels: ['NEXT_DAY', '2_DAY', 'GROUND'] },
    { name: 'Malca-Amit', code: 'MALCA_AMIT', apiConfig: { endpoint: 'https://api.malca-amit.com' }, serviceLevels: ['NEXT_DAY', '2_DAY', 'ECONOMY'] },
    { name: 'Ferrari Logistics', code: 'FERRARI', apiConfig: { endpoint: 'https://api.ferrari-logistics.com' }, serviceLevels: ['EXPRESS', 'STANDARD'] },
    { name: 'ViaMat', code: 'VIAMAT', apiConfig: { endpoint: 'https://api.viamat.com' }, serviceLevels: ['NEXT_DAY', '2_DAY', 'ECONOMY'] },
  ];

  for (const carrier of carriers) {
    await prisma.carrier.upsert({
      where: { companyId_code: { companyId: company.id, code: carrier.code } },
      update: carrier,
      create: { companyId: company.id, ...carrier },
    });
  }

  console.log('✅ Carriers created');

  const approvalFlows = [
    {
      name: 'Quotation Approval',
      entityType: 'QUOTATION',
      steps: [
        { seq: 1, roleId: 'SALES_MANAGER', action: 'APPROVE', condition: { amount: { gt: 50000 } } },
        { seq: 2, roleId: 'FINANCE_DIRECTOR', action: 'APPROVE', condition: { amount: { gt: 100000 } } },
      ],
    },
    {
      name: 'Purchase Order Approval',
      entityType: 'PURCHASE_ORDER',
      steps: [
        { seq: 1, roleId: 'PROCUREMENT_MANAGER', action: 'APPROVE', condition: { amount: { gt: 25000 } } },
        { seq: 2, roleId: 'FINANCE_DIRECTOR', action: 'APPROVE', condition: { amount: { gt: 100000 } } },
      ],
    },
  ];

  for (const approvalFlow of approvalFlows) {
    await prisma.approvalFlow.upsert({
      where: {
        companyId_entityType: {
          companyId: company.id,
          entityType: approvalFlow.entityType,
        },
      },
      update: { ...approvalFlow, status: 'active' },
      create: { companyId: company.id, ...approvalFlow, status: 'active' },
    });
  }

  console.log('✅ Approval Flows created');

  const inspectionSteps = [
    { seq: 1, name: 'Carat Weight Check', type: 'DIMENSIONAL', specMin: 0.99, specMax: 1.01, uom: 'carat', method: 'Digital Scale' },
    { seq: 2, name: 'Color Grade Verification', type: 'VISUAL', method: 'Master Stone Comparison' },
    { seq: 3, name: 'Clarity Inspection', type: 'VISUAL', method: '10x Loupe Examination' },
    { seq: 4, name: 'Cut Grade Assessment', type: 'DIMENSIONAL', method: 'Sarin/Ogi Measurement' },
    { seq: 5, name: 'Fluorescence Check', type: 'VISUAL', method: 'UV Light Examination' },
  ];

  const productRecords = await prisma.product.findMany({
    where: { companyId: company.id },
  });

  for (const product of productRecords) {
    const plan = await prisma.inspectionPlan.upsert({
      where: {
        companyId_productId_version: {
          companyId: company.id,
          productId: product.id,
          version: 1,
        },
      },
      update: {
        name: `${product.name} Inspection`,
        status: 'active',
      },
      create: {
        companyId: company.id,
        productId: product.id,
        version: 1,
        name: `${product.name} Inspection`,
        status: 'active',
      },
    });

    for (const step of inspectionSteps) {
      await prisma.inspectionStep.upsert({
        where: { planId_seq: { planId: plan.id, seq: step.seq } },
        update: step,
        create: { planId: plan.id, ...step },
      });
    }
  }

  console.log('✅ Inspection Plans created');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
