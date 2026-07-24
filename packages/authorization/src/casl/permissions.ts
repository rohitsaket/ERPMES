// DiamondFlow Permission Definitions
// Format: action:resource:scope

export const PERMISSIONS = {
  // Company & Organization
  'manage:company:global': { description: 'Manage all companies (super admin)' },
  'manage:company:company': { description: 'Manage company settings', scope: 'company' },
  'read:company:global': { description: 'Read all companies' },
  'read:company:company': { description: 'Read own company', scope: 'company' },
  
  'manage:branch:company': { description: 'Manage branches', scope: 'company' },
  'read:branch:company': { description: 'Read branches', scope: 'company' },
  
  'manage:factory:branch': { description: 'Manage factories', scope: 'branch' },
  'manage:factory:company': { description: 'Manage factories', scope: 'company' },
  'read:factory:factory': { description: 'Read factory', scope: 'factory' },
  'read:factory:company': { description: 'Read factories', scope: 'company' },
  
  'manage:warehouse:factory': { description: 'Manage warehouses', scope: 'factory' },
  'read:warehouse:factory': { description: 'Read warehouses', scope: 'factory' },
  
  'manage:department:factory': { description: 'Manage departments', scope: 'factory' },
  'read:department:factory': { description: 'Read departments', scope: 'factory' },
  
  'manage:workcenter:department': { description: 'Manage work centers', scope: 'department' },
  'read:workcenter:department': { description: 'Read work centers', scope: 'department' },

  // Master Data
  'manage:product:company': { description: 'Manage products', scope: 'company' },
  'read:product:company': { description: 'Read products', scope: 'company' },
  
  'manage:bom:company': { description: 'Manage BOMs', scope: 'company' },
  'read:bom:company': { description: 'Read BOMs', scope: 'company' },
  
  'manage:routing:company': { description: 'Manage routings', scope: 'company' },
  'read:routing:company': { description: 'Read routings', scope: 'company' },

  // Sales
  'manage:customer:company': { description: 'Manage customers', scope: 'company' },
  'read:customer:company': { description: 'Read customers', scope: 'company' },
  
  'create:quotation:company': { description: 'Create quotations', scope: 'company' },
  'read:quotation:company': { description: 'Read quotations', scope: 'company' },
  'update:quotation:department': { description: 'Update quotations', scope: 'department' },
  'approve:quotation:company': { description: 'Approve quotations', scope: 'company' },
  'revise:quotation:company': { description: 'Revise quotations', scope: 'company' },
  'convert:quotation:company': { description: 'Convert to sales order', scope: 'company' },
  
  'create:salesorder:company': { description: 'Create sales orders', scope: 'company' },
  'read:salesorder:company': { description: 'Read sales orders', scope: 'company' },
  'update:salesorder:department': { description: 'Update sales orders', scope: 'department' },
  'validate:salesorder:company': { description: 'Validate sales orders', scope: 'company' },
  'release:salesorder:company': { description: 'Release to planning', scope: 'company' },

  // Planning
  'run:mrp:company': { description: 'Run MRP', scope: 'company' },
  'read:mrp:company': { description: 'Read MRP results', scope: 'company' },
  
  'create:productionorder:factory': { description: 'Create production orders', scope: 'factory' },
  'read:productionorder:factory': { description: 'Read production orders', scope: 'factory' },
  'update:productionorder:factory': { description: 'Update production orders', scope: 'factory' },
  'release:productionorder:factory': { description: 'Release production orders', scope: 'factory' },
  'close:productionorder:factory': { description: 'Close production orders', scope: 'factory' },
  
  'read:jobcard:factory': { description: 'Read job cards', scope: 'factory' },
  'assign:jobcard:workcenter': { description: 'Assign job cards', scope: 'workcenter' },
  
  'manage:capacity:factory': { description: 'Manage capacity', scope: 'factory' },
  'read:capacity:factory': { description: 'Read capacity', scope: 'factory' },

  // Procurement
  'create:requisition:company': { description: 'Create purchase requisitions', scope: 'company' },
  'read:requisition:company': { description: 'Read requisitions', scope: 'company' },
  'approve:requisition:company': { description: 'Approve requisitions', scope: 'company' },
  
  'create:rfq:company': { description: 'Create RFQs', scope: 'company' },
  'read:rfq:company': { description: 'Read RFQs', scope: 'company' },
  'issue:rfq:company': { description: 'Issue RFQs to vendors', scope: 'company' },
  
  'create:purchaseorder:company': { description: 'Create purchase orders', scope: 'company' },
  'read:purchaseorder:company': { description: 'Read purchase orders', scope: 'company' },
  'update:purchaseorder:company': { description: 'Update purchase orders', scope: 'company' },
  'approve:purchaseorder:company': { description: 'Approve purchase orders', scope: 'company' },
  'send:purchaseorder:company': { description: 'Send PO to vendor', scope: 'company' },
  
  'create:goodsreceipt:company': { description: 'Create goods receipts', scope: 'company' },
  'read:goodsreceipt:company': { description: 'Read goods receipts', scope: 'company' },
  'inspect:goodsreceipt:factory': { description: 'Inspect goods receipts', scope: 'factory' },
  'post:goodsreceipt:company': { description: 'Post goods receipts to inventory', scope: 'company' },
  
  'manage:vendor:company': { description: 'Manage vendors', scope: 'company' },
  'read:vendor:company': { description: 'Read vendors', scope: 'company' },

  // Inventory
  'read:inventorylot:warehouse': { description: 'Read inventory lots', scope: 'warehouse' },
  'read:inventorylot:company': { description: 'Read inventory lots', scope: 'company' },
  
  'issue:inventory:warehouse': { description: 'Issue inventory', scope: 'warehouse' },
  'receive:inventory:warehouse': { description: 'Receive inventory', scope: 'warehouse' },
  'transfer:inventory:company': { description: 'Transfer inventory', scope: 'company' },
  'adjust:inventory:factory': { description: 'Adjust inventory', scope: 'factory' },
  'reserve:inventory:warehouse': { description: 'Reserve inventory', scope: 'warehouse' },
  'release:reservation:warehouse': { description: 'Release reservation', scope: 'warehouse' },
  
  'manage:physicalcount:factory': { description: 'Manage physical counts', scope: 'factory' },
  'enter:physicalcount:factory': { description: 'Enter physical counts', scope: 'factory' },
  'approve:physicalcount:factory': { description: 'Approve physical counts', scope: 'factory' },
  
  'manage:erpsync:company': { description: 'Manage ERP sync', scope: 'company' },
  'trigger:erpsync:company': { description: 'Trigger ERP sync', scope: 'company' },
  'resolve:erpsync:company': { description: 'Resolve sync conflicts', scope: 'company' },

  // Diamonds
  'read:diamond:factory': { description: 'Read diamonds', scope: 'factory' },
  'read:diamond:company': { description: 'Read diamonds', scope: 'company' },
  'allocate:diamond:factory': { description: 'Allocate diamonds', scope: 'factory' },
  'transfer:diamond:department': { description: 'Transfer diamonds', scope: 'department' },
  'split:diamond:factory': { description: 'Split diamonds', scope: 'factory' },
  'merge:diamond:factory': { description: 'Merge diamonds', scope: 'factory' },
  'view:genealogy:company': { description: 'View diamond genealogy', scope: 'company' },
  
  'read:diamondpacket:factory': { description: 'Read diamond packets', scope: 'factory' },
  'create:diamondpacket:factory': { description: 'Create diamond packets', scope: 'factory' },
  'issue:diamondpacket:factory': { description: 'Issue diamond packets', scope: 'factory' },
  'return:diamondpacket:factory': { description: 'Return diamond packets', scope: 'factory' },
  'bag:diamondpacket:factory': { description: 'Move to bag', scope: 'factory' },

  // Manufacturing
  'read:operation:workcenter': { description: 'Read operations', scope: 'workcenter' },
  'start:operation:workcenter': { description: 'Start operation', scope: 'workcenter' },
  'complete:operation:workcenter': { description: 'Complete operation', scope: 'workcenter' },
  'pause:operation:workcenter': { description: 'Pause operation', scope: 'workcenter' },
  'transfer:operation:department': { description: 'Transfer operation', scope: 'department' },
  'hold:operation:workcenter': { description: 'Hold operation', scope: 'workcenter' },
  'record:yield:workcenter': { description: 'Record weight/yield', scope: 'workcenter' },
  
  'read:workcenterqueue:workcenter': { description: 'Read work center queue', scope: 'workcenter' },
  'manage:workcenterqueue:workcenter': { description: 'Manage work center queue', scope: 'workcenter' },
  
  'read:wip:factory': { description: 'Read WIP', scope: 'factory' },
  'read:wip:company': { description: 'Read WIP', scope: 'company' },

  // Quality
  'manage:inspectionplan:company': { description: 'Manage inspection plans', scope: 'company' },
  'read:inspectionplan:company': { description: 'Read inspection plans', scope: 'company' },
  
  'create:inspection:department': { description: 'Create inspections', scope: 'department' },
  'read:inspection:department': { description: 'Read inspections', scope: 'department' },
  'complete:inspection:department': { description: 'Complete inspections', scope: 'department' },
  'create:ncr:department': { description: 'Create NCRs', scope: 'department' },
  
  'read:ncr:factory': { description: 'Read NCRs', scope: 'factory' },
  'disposition:ncr:factory': { description: 'Disposition NCRs', scope: 'factory' },
  'create:capa:factory': { description: 'Create CAPAs', scope: 'factory' },
  'verify:capa:factory': { description: 'Verify CAPAs', scope: 'factory' },
  'reinspect:ncr:department': { description: 'Reinspect NCRs', scope: 'department' },
  
  'request:certification:factory': { description: 'Request certification', scope: 'factory' },
  'read:certification:factory': { description: 'Read certifications', scope: 'factory' },
  'validate:certificate:factory': { description: 'Validate certificates', scope: 'factory' },

  // Maintenance
  'manage:asset:factory': { description: 'Manage assets', scope: 'factory' },
  'read:asset:factory': { description: 'Read assets', scope: 'factory' },
  
  'create:workorder:factory': { description: 'Create work orders', scope: 'factory' },
  'read:workorder:factory': { description: 'Read work orders', scope: 'factory' },
  'update:workorder:factory': { description: 'Update work orders', scope: 'factory' },
  'complete:workorder:factory': { description: 'Complete work orders', scope: 'factory' },
  'manage:pmschedule:factory': { description: 'Manage PM schedules', scope: 'factory' },

  // Dispatch
  'create:bag:factory': { description: 'Create bags', scope: 'factory' },
  'read:bag:factory': { description: 'Read bags', scope: 'factory' },
  'seal:bag:factory': { description: 'Seal bags', scope: 'factory' },
  'assign:shipment:factory': { description: 'Assign to shipment', scope: 'factory' },
  
  'create:shipment:company': { description: 'Create shipments', scope: 'company' },
  'read:shipment:company': { description: 'Read shipments', scope: 'company' },
  'dispatch:shipment:company': { description: 'Dispatch shipments', scope: 'company' },
  'track:shipment:company': { description: 'Track shipments', scope: 'company' },
  'deliver:shipment:company': { description: 'Mark delivered', scope: 'company' },
  
  'manage:carrier:company': { description: 'Manage carriers', scope: 'company' },
  'read:carrier:company': { description: 'Read carriers', scope: 'company' },

  // Finance
  'create:invoice:company': { description: 'Create invoices', scope: 'company' },
  'read:invoice:company': { description: 'Read invoices', scope: 'company' },
  'send:invoice:company': { description: 'Send invoices', scope: 'company' },
  'void:invoice:company': { description: 'Void invoices', scope: 'company' },
  
  'create:payment:company': { description: 'Record payments', scope: 'company' },
  'read:payment:company': { description: 'Read payments', scope: 'company' },
  'allocate:payment:company': { description: 'Allocate payments', scope: 'company' },
  
  'create:journalentry:company': { description: 'Create journal entries', scope: 'company' },
  'read:journalentry:company': { description: 'Read journal entries', scope: 'company' },
  'post:journalentry:company': { description: 'Post journal entries', scope: 'company' },
  'close:period:company': { description: 'Close accounting period', scope: 'company' },
  
  'manage:chartofaccount:company': { description: 'Manage chart of accounts', scope: 'company' },
  'read:chartofaccount:company': { description: 'Read chart of accounts', scope: 'company' },

  // Returns
  'create:returnauth:company': { description: 'Create return authorizations', scope: 'company' },
  'read:returnauth:company': { description: 'Read return authorizations', scope: 'company' },
  'approve:returnauth:company': { description: 'Approve return authorizations', scope: 'company' },
  
  'create:returnreceipt:company': { description: 'Create return receipts', scope: 'company' },
  'create:repairorder:company': { description: 'Create repair orders', scope: 'company' },
  'read:repairorder:company': { description: 'Read repair orders', scope: 'company' },
  'complete:repairorder:company': { description: 'Complete repair orders', scope: 'company' },
  'redispatch:repairorder:company': { description: 'Redispatch repaired items', scope: 'company' },

  // Admin
  'manage:user:company': { description: 'Manage users', scope: 'company' },
  'read:user:company': { description: 'Read users', scope: 'company' },
  'manage:role:company': { description: 'Manage roles', scope: 'company' },
  'read:role:company': { description: 'Read roles', scope: 'company' },
  'manage:permission:company': { description: 'Manage permissions', scope: 'company' },
  
  'read:auditlog:company': { description: 'Read audit logs', scope: 'company' },
  'read:auditlog:global': { description: 'Read all audit logs', scope: 'global' },

  // Analytics
  'read:analytics:company': { description: 'Read analytics', scope: 'company' },
  'read:analytics:factory': { description: 'Read factory analytics', scope: 'factory' },
  'manage:report:company': { description: 'Manage custom reports', scope: 'company' },

  // AI
  'use:ai:company': { description: 'Use AI copilot', scope: 'company' },
  'manage:ai:global': { description: 'Manage AI system', scope: 'global' },
} as const;

export type Permission = keyof typeof PERMISSIONS;
export const PERMISSION_LIST = Object.keys(PERMISSIONS) as Permission[];