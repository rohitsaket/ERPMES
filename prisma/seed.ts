import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default company
  const company = await prisma.company.upsert({
    where: { code: 'DEMO' },
    update: {},
    create: {
      name: 'DiamondFlow Demo Company',
      code: 'DEMO',
      settings: { currency: 'USD', timezone: 'UTC', dateFormat: 'YYYY-MM-DD' },
    },
  });
  console.log('✅ Company created:', company.name);

  // Create branch
  const branch = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'HQ' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Headquarters',
      code: 'HQ',
      address: { street: '123 Diamond St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
      timezone: 'America/New_York',
    },
  });
  console.log('✅ Branch created:', branch.name);

  // Create factory
  const factory = await prisma.factory.upsert({
    where: { companyId_branchId_code: { companyId: company.id, branchId: branch.id, code: 'FAC001' } },
    update: {},
    create: {
      companyId: company.id,
      branchId: branch.id,
      name: 'Main Manufacturing Facility',
      code: 'FAC001',
      capacity: { totalHours: 160, shifts: 1 },
      shifts: [{ name: 'Day Shift', start: '06:00', end: '14:00' }, { name: 'Night Shift', start: '14:00', end: '22:00' }],
    },
  });
  console.log('✅ Factory created:', factory.name);

  // Create warehouses
  const rawWarehouse = await prisma.warehouse.upsert({
    where: { factoryId_code: { factoryId: factory.id, code: 'RAW' } },
    update: {},
    create: { factoryId: factory.id, name: 'Raw Material Warehouse', code: 'RAW', type: 'standard', location: { zone: 'A' } },
  });

  const wipWarehouse = await prisma.warehouse.upsert({
    where: { factoryId_code: { factoryId: factory.id, code: 'WIP' } },
    update: {},
    create: { factoryId: factory.id, name: 'WIP Warehouse', code: 'WIP', type: 'standard', location: { zone: 'B' } },
  });

  const finishedWarehouse = await prisma.warehouse.upsert({
    where: { factoryId_code: { factoryId: factory.id, code: 'FIN' } },
    update: {},
    create: { factoryId: factory.id, name: 'Finished Goods Warehouse', code: 'FIN', type: 'standard', location: { zone: 'C' } },
  });
  console.log('✅ Warehouses created');

  // Create departments
  const departments = [
    { name: 'Planning', code: 'PLN', type: 'planning', sequence: 1, capacity: 20 },
    { name: 'Rough', code: 'RGH', type: 'rough', sequence: 2, capacity: 15 },
    { name: 'Sawing', code: 'SAW', type: 'sawing', sequence: 3, capacity: 10 },
    { name: 'Laser', code: 'LSR', type: 'laser', sequence: 4, capacity: 8 },
    { name: 'Blocking', code: 'BLK', type: 'blocking', sequence: 5, capacity: 12 },
    { name: 'Bruting', code: 'BRU', type: 'bruting', sequence: 6, capacity: 10 },
    { name: 'Polishing', code: 'POL', type: 'polishing', sequence: 7, capacity: 20 },
    { name: 'Fancy', code: 'FNC', type: 'fancy', sequence: 8, capacity: 8 },
    { name: 'Repair', code: 'REP', type: 'repair', sequence: 9, capacity: 5 },
    { name: 'Final Polishing', code: 'FPL', type: 'final_polishing', sequence: 10, capacity: 10 },
    { name: 'Quality Control', code: 'QC', type: 'quality_control', sequence: 11, capacity: 15 },
    { name: 'Certification', code: 'CERT', type: 'certification', sequence: 12, capacity: 5 },
    { name: 'Bagging', code: 'BAG', type: 'bagging', sequence: 13, capacity: 10 },
    { name: 'Dispatch', code: 'DSP', type: 'dispatch', sequence: 14, capacity: 10 },
    { name: 'Maintenance', code: 'MNT', type: 'maintenance', sequence: 15, capacity: 5 },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { companyId_factoryId_code: { companyId: company.id, factoryId: factory.id, code: dept.code } },
      update: {},
      create: { ...dept, companyId: company.id, factoryId: factory.id },
    });
  }
  console.log('✅ Departments created');

  // Create work centers
  const workCenters = [
    { departmentCode: 'PLN', name: 'Planning Station 1', code: 'PLN-001', type: 'manual', capacity: 2 },
    { departmentCode: 'RGH', name: 'Rough Assortment Station', code: 'RGH-001', type: 'manual', capacity: 3 },
    { departmentCode: 'SAW', name: 'Laser Saw 1', code: 'SAW-001', type: 'laser', capacity: 1, oeeTarget: 0.85 },
    { departmentCode: 'SAW', name: 'Laser Saw 2', code: 'SAW-002', type: 'laser', capacity: 1, oeeTarget: 0.85 },
    { departmentCode: 'BLK', name: 'Blocking Station 1', code: 'BLK-001', type: 'manual', capacity: 2 },
    { departmentCode: 'BRU', name: 'Bruting Machine 1', code: 'BRU-001', type: 'bruting_machine', capacity: 1, oeeTarget: 0.88 },
    { departmentCode: 'BRU', name: 'Bruting Machine 2', code: 'BRU-002', type: 'bruting_machine', capacity: 1, oeeTarget: 0.88 },
    { departmentCode: 'POL', name: 'Polishing Wheel 1', code: 'POL-001', type: 'polishing_wheel', capacity: 1, oeeTarget: 0.9 },
    { departmentCode: 'POL', name: 'Polishing Wheel 2', code: 'POL-002', type: 'polishing_wheel', capacity: 1, oeeTarget: 0.9 },
    { departmentCode: 'POL', name: 'Polishing Wheel 3', code: 'POL-003', type: 'polishing_wheel', capacity: 1, oeeTarget: 0.9 },
    { departmentCode: 'POL', name: 'Polishing Wheel 4', code: 'POL-004', type: 'polishing_wheel', capacity: 1, oeeTarget: 0.9 },
    { departmentCode: 'POL', name: 'Polishing Wheel 5', code: 'POL-005', type: 'polishing_wheel', capacity: 1, oeeTarget: 0.9 },
    { departmentCode: 'FNC', name: 'Fancy Cutting Station', code: 'FNC-001', type: 'manual', capacity: 2 },
    { departmentCode: 'REP', name: 'Repair Station', code: 'REP-001', type: 'manual', capacity: 2 },
    { departmentCode: 'FPL', name: 'Final Polishing Wheel', code: 'FPL-001', type: 'polishing_wheel', capacity: 1, oeeTarget: 0.92 },
    { departmentCode: 'QC', name: 'QC Microscope 1', code: 'QC-001', type: 'inspection', capacity: 2 },
    { departmentCode: 'QC', name: 'QC Microscope 2', code: 'QC-002', type: 'inspection', capacity: 2 },
    { departmentCode: 'CERT', name: 'Certification Desk', code: 'CERT-001', type: 'manual', capacity: 1 },
    { departmentCode: 'BAG', name: 'Bagging Station 1', code: 'BAG-001', type: 'manual', capacity: 2 },
    { departmentCode: 'BAG', name: 'Bagging Station 2', code: 'BAG-002', type: 'manual', capacity: 2 },
    { departmentCode: 'DSP', name: 'Dispatch Station', code: 'DSP-001', type: 'manual', capacity: 2 },
    { departmentCode: 'MNT', name: 'Maintenance Workshop', code: 'MNT-001', type: 'manual', capacity: 2 },
  ];

  for (const wc of workCenters) {
    const dept = await prisma.department.findFirst({ where: { factoryId: factory.id, code: wc.departmentCode } });
    if (dept) {
      await prisma.workCenter.upsert({
        where: { companyId_departmentId_code: { companyId: company.id, departmentId: dept.id, code: wc.code } },
        update: {},
        create: { ...wc, companyId: company.id, factoryId: factory.id, departmentId: dept.id },
      });
    }
  }
  console.log('✅ Work centers created');

  // Create products
  const products = [
    { sku: 'RND-1.0', name: 'Round Brilliant 1.00ct', category: 'polished_diamond', type: 'finished', uom: 'PCS', weight: 0.2 },
    { sku: 'RND-1.5', name: 'Round Brilliant 1.50ct', category: 'polished_diamond', type: 'finished', uom: 'PCS', weight: 0.3 },
    { sku: 'RND-2.0', name: 'Round Brilliant 2.00ct', category: 'polished_diamond', type: 'finished', uom: 'PCS', weight: 0.4 },
    { sku: 'PRN-1.0', name: 'Princess Cut 1.00ct', category: 'polished_diamond', type: 'finished', uom: 'PCS', weight: 0.2 },
    { sku: 'EMR-1.0', name: 'Emerald Cut 1.00ct', category: 'polished_diamond', type: 'finished', uom: 'PCS', weight: 0.2 },
    { sku: 'OVAL-1.0', name: 'Oval Cut 1.00ct', category: 'polished_diamond', type: 'finished', uom: 'PCS', weight: 0.2 },
    { sku: 'ROUGH-2.0', name: 'Rough Diamond 2.00ct', category: 'rough_diamond', type: 'raw', uom: 'PCS', weight: 0.4 },
    { sku: 'ROUGH-3.0', name: 'Rough Diamond 3.00ct', category: 'rough_diamond', type: 'raw', uom: 'PCS', weight: 0.6 },
    { sku: 'ROUGH-5.0', name: 'Rough Diamond 5.00ct', category: 'rough_diamond', type: 'raw', uom: 'PCS', weight: 1.0 },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: prod.sku } },
      update: {},
      create: { ...prod, companyId: company.id },
    });
  }
  console.log('✅ Products created');

  // Create customers
  const customers = [
    { code: 'CUST001', name: 'Tiffany & Co.', type: 'business', contactInfo: { email: 'purchasing@tiffany.com', phone: '+1-212-555-0100' }, address: { street: '727 5th Ave', city: 'New York', state: 'NY', postalCode: '10022', country: 'USA' }, taxId: '13-5555555', creditLimit: 5000000, paymentTerms: 'NET30' },
    { code: 'CUST002', name: 'Cartier', type: 'business', contactInfo: { email: 'orders@cartier.com', phone: '+33-1-555-0100' }, address: { street: '13 Rue de la Paix', city: 'Paris', state: '75', postalCode: '75002', country: 'France' }, taxId: 'FR12345678901', creditLimit: 3000000, paymentTerms: 'NET45' },
    { code: 'CUST003', name: 'Harry Winston', type: 'business', contactInfo: { email: 'buying@harrywinston.com', phone: '+1-212-555-0200' }, address: { street: '718 5th Ave', city: 'New York', state: 'NY', postalCode: '10022', country: 'USA' }, taxId: '13-5555556', creditLimit: 4000000, paymentTerms: 'NET30' },
    { code: 'CUST004', name: 'Van Cleef & Arpels', type: 'business', contactInfo: { email: 'procurement@vancleefarpels.com', phone: '+33-1-555-0300' }, address: { street: '22 Place Vendôme', city: 'Paris', state: '75', postalCode: '75001', country: 'France' }, taxId: 'FR12345678902', creditLimit: 3500000, paymentTerms: 'NET45' },
  ];

  for (const cust of customers) {
    await prisma.customer.upsert({
      where: { companyId_code: { companyId: company.id, code: cust.code } },
      update: {},
      create: { ...cust, companyId: company.id },
    });
  }
  console.log('✅ Customers created');

  // Create vendors
  const vendors = [
    { code: 'VEND001', name: 'De Beers Group', type: 'supplier', contactInfo: { email: 'sales@debeers.com', phone: '+27-11-555-0100' }, address: { street: '44 Main St', city: 'Johannesburg', state: 'GP', postalCode: '2001', country: 'South Africa' }, taxId: 'ZA1234567890', paymentTerms: 'NET30', leadTimeDays: 14, rating: 4.8 },
    { code: 'VEND002', name: 'Alrosa', type: 'supplier', contactInfo: { email: 'export@alrosa.ru', phone: '+7-495-555-0100' }, address: { street: 'Ulitsa Malaya Dmitrovka', city: 'Moscow', state: 'MOW', postalCode: '127006', country: 'Russia' }, taxId: 'RU1234567890', paymentTerms: 'NET30', leadTimeDays: 21, rating: 4.7 },
    { code: 'VEND003', name: 'Rio Tinto Diamonds', type: 'supplier', contactInfo: { email: 'diamonds@riotinto.com', phone: '+61-8-555-0100' }, address: { street: '152-158 St Georges Terrace', city: 'Perth', state: 'WA', postalCode: '6000', country: 'Australia' }, taxId: 'AU12345678901', paymentTerms: 'NET45', leadTimeDays: 30, rating: 4.6 },
    { code: 'VEND004', name: 'Dominion Diamond Mines', type: 'supplier', contactInfo: { email: 'sales@dominiondiamond.com', phone: '+1-416-555-0100' }, address: { street: '40 King St W', city: 'Toronto', state: 'ON', postalCode: 'M5H 3Y2', country: 'Canada' }, taxId: 'CA1234567890', paymentTerms: 'NET30', leadTimeDays: 14, rating: 4.5 },
  ];

  for (const vend of vendors) {
    await prisma.vendor.upsert({
      where: { companyId_code: { companyId: company.id, code: vend.code } },
      update: {},
      create: { ...vend, companyId: company.id },
    });
  }
  console.log('✅ Vendors created');

  // Create routing for round brilliant
  const roundProduct = await prisma.product.findFirst({ where: { companyId: company.id, sku: 'RND-1.0' } });
  if (roundProduct) {
    const routing = await prisma.routing.upsert({
      where: { productId_version: { productId: roundProduct.id, version: 1 } },
      update: {},
      create: {
        productId: roundProduct.id,
        version: 1,
        name: 'Standard Round Brilliant Routing',
        status: 'active',
      },
    });

    const routingOps = [
      { seq: 1, departmentCode: 'PLN', workCenterType: 'manual', setupMin: 30, runMinPerUnit: 15, queueMin: 60, moveMin: 10 },
      { seq: 2, departmentCode: 'RGH', workCenterType: 'manual', setupMin: 15, runMinPerUnit: 20, queueMin: 30, moveMin: 10 },
      { seq: 3, departmentCode: 'SAW', workCenterType: 'laser', setupMin: 30, runMinPerUnit: 45, queueMin: 60, moveMin: 15 },
      { seq: 4, departmentCode: 'BLK', workCenterType: 'manual', setupMin: 20, runMinPerUnit: 30, queueMin: 30, moveMin: 10 },
      { seq: 5, departmentCode: 'BRU', workCenterType: 'bruting_machine', setupMin: 30, runMinPerUnit: 60, queueMin: 60, moveMin: 15 },
      { seq: 6, departmentCode: 'POL', workCenterType: 'polishing_wheel', setupMin: 45, runMinPerUnit: 120, queueMin: 120, moveMin: 20 },
      { seq: 7, departmentCode: 'FPL', workCenterType: 'polishing_wheel', setupMin: 30, runMinPerUnit: 45, queueMin: 60, moveMin: 10 },
      { seq: 8, departmentCode: 'QC', workCenterType: 'inspection', setupMin: 15, runMinPerUnit: 30, queueMin: 30, moveMin: 10 },
      { seq: 9, departmentCode: 'CERT', workCenterType: 'manual', setupMin: 10, runMinPerUnit: 20, queueMin: 60, moveMin: 10 },
      { seq: 10, departmentCode: 'BAG', workCenterType: 'manual', setupMin: 10, runMinPerUnit: 10, queueMin: 15, moveMin: 5 },
      { seq: 11, departmentCode: 'DSP', workCenterType: 'manual', setupMin: 15, runMinPerUnit: 15, queueMin: 30, moveMin: 15 },
    };

    for (const op of routingOps) {
      const dept = await prisma.department.findFirst({ where: { factoryId: factory.id, code: op.departmentCode } });
      if (dept) {
        await prisma.routingOp.upsert({
          where: { routingId_seq: { routingId: routing.id, seq: op.seq } },
          update: {},
          create: { ...op, routingId: routing.id, departmentId: dept.id },
        });
      }
    }
    console.log('✅ Routing created for Round Brilliant');
  }

  // Create routing configurations
  await prisma.routingConfig.upsert({
    where: { routingId: routing.id },
    update: {},
    create: {
      routingId: routing.id,
      companyId: company.id,
      factoryId: factory.id,
      productId: roundProduct.id,
      diamondType: 'polished',
      shape: 'round',
      departmentSequence: ['PLN', 'RGH', 'SAW', 'BLK', 'BRU', 'POL', 'FPL', 'QC', 'CERT', 'BAG', 'DSP'],
    },
  });

  // Create inspection plans
  const qcDept = await prisma.department.findFirst({ where: { factoryId: factory.id, code: 'QC' } });
  if (qcDept) {
    const inspectionPlan = await prisma.inspectionPlan.upsert({
      where: { companyId_productId_version: { companyId: company.id, productId: roundProduct.id, version: 1 } },
      update: {},
      create: {
        companyId: company.id,
        productId: roundProduct.id,
        version: 1,
        name: 'Round Brilliant Final Inspection',
        status: 'active',
        steps: {
          create: [
            { seq: 1, name: 'Carat Weight Verification', type: 'variable', specMin: 0.99, specMax: 1.01, uom: 'CT', method: 'Digital Scale', samplingPlan: { type: '100%', sampleSize: 0 }, requiredImage: false },
            { seq: 2, name: 'Color Grade', type: 'attribute', specMin: 'G', specMax: 'H', uom: 'GRADE', method: 'Master Stone Comparison', samplingPlan: { type: '100%', sampleSize: 0 }, requiredImage: true },
            { seq: 3, name: 'Clarity Grade', type: 'attribute', specMin: 'VS1', specMax: 'VS2', uom: 'GRADE', method: '10x Loupe', samplingPlan: { type: '100%', sampleSize: 0 }, requiredImage: true },
            { seq: 4, name: 'Cut Grade', type: 'attribute', specMin: 'Excellent', specMax: 'Very Good', uom: 'GRADE', method: 'Sarin/Ogi', samplingPlan: { type: '100%', sampleSize: 0 }, requiredImage: false },
            { seq: 5, name: 'Symmetry', type: 'attribute', specMin: 'Excellent', specMax: 'Very Good', uom: 'GRADE', method: 'Visual', samplingPlan: { type: '100%', sampleSize: 0 }, requiredImage: false },
            { seq: 6, name: 'Polish', type: 'attribute', specMin: 'Excellent', specMax: 'Very Good', uom: 'GRADE', method: 'Visual', samplingPlan: { type: '100%', sampleSize: 0 }, requiredImage: false },
            { seq: 7, name: 'Fluorescence', type: 'attribute', specMin: 'None', specMax: 'Faint', uom: 'GRADE', method: 'UV Lamp', samplingPlan: { type: '100%', sampleSize: 0 }, requiredImage: false },
            { seq: 8, name: 'Measurements', type: 'variable', specMin: 6.4, specMax: 6.6, uom: 'MM', method: 'Ogi/Sarin', samplingPlan: { type: '100%', sampleSize: 0 }, requiredImage: false },
          ],
      },
    });
    console.log('✅ Inspection plan created');
  }

  // Create default feature flags
  const featureFlags = [
    { name: 'mrp', description: 'MRP Engine', enabled: true, rolloutPct: 100 },
    { name: 'finite-scheduling', description: 'Finite Capacity Scheduling', enabled: false, rolloutPct: 100 },
    { name: 'ai-copilot', description: 'AI Copilot Assistant', enabled: true, rolloutPct: 100 },
    { name: 'advanced-scheduling', description: 'Advanced Scheduling Features', enabled: false, rolloutPct: 100 },
    { name: 'multi-currency', description: 'Multi-Currency Support', enabled: false, rolloutPct: 100 },
    { name: 'erp-sync', description: 'Legacy ERP Synchronization', enabled: true, rolloutPct: 100 },
    { name: 'certification', description: 'Lab Certification Workflow', enabled: true, rolloutPct: 100 },
    { name: 'maintenance', description: 'Maintenance Management', enabled: true, rolloutPct: 100 },
    { name: 'returns', description: 'Returns & Repair Workflow', enabled: true, rolloutPct: 100 },
    { name: 'analytics', description: 'Advanced Analytics & Reports', enabled: true, rolloutPct: 100 },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: {},
      create: flag,
    });
  }
  console.log('✅ Feature flags created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });