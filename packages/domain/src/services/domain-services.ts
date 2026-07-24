import { ProductId } from '../value-objects/ids';

export class MrpCalculationService {
  async calculateNetRequirements(
    prisma: any,
    companyId: string,
    productId: ProductId | string
  ): Promise<{ demand: number; supply: number; net: number }> {
    const productKey = typeof productId === 'string' ? productId : productId.value;

    // Calculate gross requirements from sales orders
    const salesOrderLines = await prisma.salesOrderLine.findMany({
      where: {
        productId: productKey,
        productionOrderId: null,
      },
    });
    const demand = salesOrderLines.reduce((sum: number, line: any) => sum + line.qty, 0);

    // Calculate available supply
    const inventoryLots = await prisma.inventoryLot.findMany({
      where: {
        itemId: productKey,
        status: 'AVAILABLE',
      },
    });
    const availableSupply = inventoryLots.reduce((sum: number, lot: any) => sum + lot.qty, 0);

    // Calculate planned supply from purchase orders
    const poLines = await prisma.poLine.findMany({
      where: {
        itemId: productKey,
        receivedQty: { lt: prisma.prismaClient.raw('qty') },
      },
    });
    const onOrder = poLines.reduce((sum: number, line: any) => sum + (line.qty - line.receivedQty), 0);

    // Calculate planned supply from production orders
    const poOperations = await prisma.productionOrderOperation.findMany({
      where: {
        order: {
          productId: productKey,
          status: { in: ['PLANNED', 'RELEASED', 'IN_PROGRESS'] },
        },
      },
    });
    const inProduction = poOperations.reduce((sum: number, op: any) => sum + (op.qty - op.qtyComplete), 0);

    const supply = availableSupply + onOrder + inProduction;
    const net = demand - supply;

    return { demand, supply, net };
  }

  async generatePlannedOrders(
    prisma: any,
    companyId: string,
    products: any[]
  ): Promise<any[]> {
    const plannedOrders = [];

    for (const product of products) {
      const { demand, supply, net } = await this.calculateNetRequirements(
        prisma,
        product.companyId,
        product.id
      );

      if (net > 0) {
        plannedOrders.push({
          productId: product.id,
          qty: net,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          supplyType: 'MANUFACTURE',
          pegging: { demand, supply, net },
        });
      }
    }

    return plannedOrders;
  }
}

export class FiniteSchedulingService {
  async scheduleOperations(
    operations: any[],
    workCenters: any[],
    startDate: Date
  ): Promise<any[]> {
    // Group operations by work center
    const operationsByWc = new Map<string, any[]>();
    for (const op of operations) {
      if (!op.workCenterId) continue;
      const workCenterOperations = operationsByWc.get(op.workCenterId) ?? [];
      workCenterOperations.push(op);
      operationsByWc.set(op.workCenterId, workCenterOperations);
    }

    const scheduled: any[] = [];

    for (const [wcId, ops] of operationsByWc) {
      // Sort by priority and due date
      ops.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      let currentTime = new Date(startDate);

      for (const op of ops) {
        const setup = op.setupMin || 0;
        const run = op.runMin || 0;
        const queue = op.queueMin || 0;
        const move = op.moveMin || 0;
        const totalMin = setup + run + queue + move;

        const start = new Date(Math.max(currentTime.getTime(), new Date(op.dueDate).getTime() - totalMin * 60 * 1000));
        const end = new Date(start.getTime() + totalMin * 60 * 1000);

        scheduled.push({
          operationId: op.id,
          workCenterId: op.workCenterId,
          startTime: start,
          endTime: end,
          setupMin: op.setupMin,
          runMin: op.runMin,
          queueMin: op.queueMin,
          moveMin: op.moveMin,
        });

        currentTime = end;
      }
    }

    return scheduled;
  }

  async levelCapacity(
    operations: any[],
    workCenters: any[],
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    // Calculate capacity per time bucket (day)
    const capacityMap = new Map();
    
    for (const wc of workCenters) {
      const dailyCapacity = wc.capacity * 480; // 8 hours in minutes
      const days = Math.ceil((new Date(wc.endDate).getTime() - new Date(wc.startDate).getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < days; i++) {
        const date = new Date(wc.startDate);
        date.setDate(date.getDate() + i);
        const key = `${wc.id}-${date.toISOString().split('T')[0]}`;
        
        if (!capacityMap.has(key)) {
          capacityMap.set(key, { workCenterId: wc.id, date: date, capacity: dailyCapacity, load: 0 });
        }
        capacityMap.get(key).load += dailyCapacity * 0.85; // Assume 85% utilization target
      }
    }

    return Array.from(capacityMap.values());
  }
}

export class CapacityPlanningService {
  async calculateCapacityRequirements(
    prisma: any,
    productionOrders: any[],
    workCenters: any[]
  ): Promise<any[]> {
    const requirements = [];

    for (const order of productionOrders) {
      for (const op of order.operations) {
        if (!op.workCenterId) continue;

        const wc = workCenters.find(wc => wc.id === op.workCenterId);
        if (!wc) continue;

        const setupHours = (op.setupMin || 0) / 60;
        const runHours = (op.runMin || 0) * order.qty / 60;
        const queueHours = (op.queueMin || 0) / 60;
        const moveHours = (op.moveMin || 0) / 60;

        requirements.push({
          workCenterId: op.workCenterId,
          workCenterName: workCenters.find(wc => wc.id === op.workCenterId)?.name,
          orderId: order.id,
          operationSeq: op.seq,
          setupHours,
          runHours,
          queueHours,
          moveHours,
          totalHours: setupHours + runHours + queueHours + moveHours,
          startDate: order.startDate,
          dueDate: order.dueDate,
        });
      }
    }

    return requirements;
  }

  async checkCapacityAvailability(
    prisma: any,
    workCenterId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ available: boolean; utilization: number }> {
    const wc = await prisma.workCenter.findUnique({ where: { id: workCenterId } });
    if (!wc) return { available: false, utilization: 0 };

    const scheduledOps = await prisma.productionOrderOperation.findMany({
      where: {
        workCenterId,
        status: { in: ['QUEUED', 'RUNNING', 'PAUSED'] },
        startedAt: { lte: new Date() },
      },
    });

    const totalMinutes = scheduledOps.reduce(
      (sum: number, op: { runMin?: number | null }) => sum + (op.runMin ?? 0),
      0,
    );
    const availableMinutes = (wc.capacity * 480) * 0.85; // 85% target utilization

    return {
      available: totalMinutes < availableMinutes,
      utilization: totalMinutes / availableMinutes,
    };
  }
}

export class YieldCalculationService {
  calculateYield(weightIn: number, weightOut: number): number {
    if (weightIn <= 0) return 0;
    return Math.round((weightOut / weightIn) * 10000) / 100; // 2 decimal places
  }

  calculateLoss(weightIn: number, weightOut: number): number {
    return weightIn - weightOut;
  }

  calculateLossPercentage(weightIn: number, weightOut: number): number {
    if (weightIn <= 0) return 0;
    return Math.round(((weightIn - weightOut) / weightIn) * 10000) / 100;
  }

  calculateTheoreticalYield(operations: any[]): number {
    let totalIn = 0;
    let totalOut = 0;

    for (const op of operations) {
      if (op.weightIn && op.weightOut) {
        totalIn += op.weightIn;
        totalOut += op.weightOut;
      }
    }

    return totalIn > 0 ? this.calculateYield(totalIn, totalOut) : 0;
  }

  calculateCumulativeYield(operations: any[]): number {
    let cumulativeYield = 100;

    for (const op of operations) {
      if (op.yieldPct !== null && op.yieldPct !== undefined) {
        cumulativeYield = (cumulativeYield * op.yieldPct) / 100;
      }
    }

    return Math.round(cumulativeYield * 100) / 100;
  }
}

export class OeeCalculationService {
  calculateAvailability(operatingTime: number, plannedProductionTime: number): number {
    if (plannedProductionTime <= 0) return 0;
    return Math.min(100, Math.round((operatingTime / plannedProductionTime) * 10000) / 100);
  }

  calculatePerformance(idealCycleTime: number, actualOutput: number, operatingTime: number): number {
    if (operatingTime <= 0 || idealCycleTime <= 0) return 0;
    const idealOutput = (operatingTime * 60) / idealCycleTime;
    if (idealOutput <= 0) return 0;
    return Math.min(100, Math.round((actualOutput / idealOutput) * 10000) / 100);
  }

  calculateQuality(goodUnits: number, totalUnits: number): number {
    if (totalUnits <= 0) return 0;
    return Math.round((goodUnits / totalUnits) * 10000) / 100;
  }

  calculateOee(availability: number, performance: number, quality: number): number {
    return Math.round((availability * performance * quality) / 10000) / 100;
  }

  calculateOeeFromData(
    operatingTime: number,
    plannedProductionTime: number,
    idealCycleTime: number,
    actualOutput: number,
    goodUnits: number,
    totalUnits: number
  ): { availability: number; performance: number; quality: number; oee: number } {
    const availability = this.calculateAvailability(operatingTime, plannedProductionTime);
    const performance = this.calculatePerformance(idealCycleTime, actualOutput, operatingTime);
    const quality = this.calculateQuality(goodUnits, totalUnits);
    const oee = this.calculateOee(availability, performance, quality);

    return { availability, performance, quality, oee };
  }
}

export class DiamondGenealogyService {
  async getFullGenealogy(diamond: any): Promise<any[]> {
    // Return complete genealogy chain
    return diamond.genealogy || [];
  }

  async getParentDiamond(diamond: any): Promise<any | null> {
    // Find parent diamond if this was split from another
    const parentEvent = diamond.genealogy?.find((e: any) => 
      e.eventType === 'SPLIT' && e.metadata?.parentId === diamond.id
    );
    return parentEvent ? { id: parentEvent.metadata.parentId } : null;
  }

  async getChildDiamonds(diamond: any): Promise<any[]> {
    const splitEvents = diamond.genealogy?.filter((e: any) => e.eventType === 'SPLIT');
    if (!splitEvents || splitEvents.length === 0) return [];

    const childIds = splitEvents.map((e: any) => e.metadata?.newDiamondId).filter(Boolean);
    // In real implementation, would fetch from database
    return childIds.map((id: string) => ({ id }));
  }

  async getAllDescendants(diamond: any): Promise<any[]> {
    // Recursively get all descendants from splits
    const descendants: any[] = [];
    const children = await this.getChildDiamonds(diamond);
    
    for (const child of children) {
      descendants.push(child);
      descendants.push(...await this.getAllDescendants(child));
    }
    
    return descendants;
  }

  async calculateTotalLoss(diamond: any): Promise<number> {
    let totalLoss = 0;
    
    for (const event of diamond.genealogy || []) {
      if (event.metadata?.lossPct) {
        totalLoss += event.metadata.lossPct;
      }
    }
    
    return Math.round(totalLoss * 100) / 100;
  }

  async getCurrentLocation(diamond: any): Promise<{ factoryId?: string; departmentId?: string; packetId?: string; bagId?: string }> {
    return {
      factoryId: diamond.currentDeptId,
      departmentId: diamond.currentDeptId,
      packetId: diamond.currentPacketId,
      bagId: diamond.currentBagId,
    };
  }

  async getHistory(diamond: any, limit: number = 50): Promise<any[]> {
    return (diamond.genealogy || [])
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export class AllocationOptimizationService {
  async allocateDiamondsToOrders(
    diamonds: any[],
    orders: any[]
  ): Promise<Map<string, string[]>> {
    // Match diamonds to orders based on specifications
    const allocation = new Map<string, string[]>();

    for (const order of orders) {
      const matchingDiamonds = diamonds.filter(d => 
        d.status === 'AVAILABLE' &&
        d.carat >= order.minCarat &&
        d.carat <= order.maxCarat &&
        d.color === order.color &&
        d.clarity === order.clarity &&
        d.cut === order.cut &&
        d.shape === order.shape
      );

      if (matchingDiamonds.length > 0) {
        // Sort by best match (closest carat weight)
        matchingDiamonds.sort((a, b) => 
          Math.abs(a.carat - order.targetCarat) - Math.abs(b.carat - order.targetCarat)
        );

        allocation.set(order.id, matchingDiamonds.slice(0, order.qty).map(d => d.id.value));
      }
    }

    return allocation;
  }

  async optimizeAllocation(
    diamonds: any[],
    orders: any[]
  ): Promise<{ allocation: Map<string, string[]>; unallocated: string[] }> {
    const allocated = new Set<string>();
    const allocation = new Map<string, string[]>();

    // Sort orders by priority
    orders.sort((a, b) => b.priority - a.priority);

    for (const order of orders) {
      const available = diamonds.filter(d => 
        !allocated.has(d.id.value) &&
        d.status === 'AVAILABLE' &&
        d.carat >= order.minCarat &&
        d.carat <= order.maxCarat &&
        d.color === order.color &&
        d.clarity === order.clarity &&
        d.cut === order.cut &&
        d.shape === order.shape
      );

      if (available.length >= order.qty) {
        available.sort((a, b) => 
          Math.abs(a.carat - order.targetCarat) - Math.abs(b.carat - order.targetCarat)
        );

        const allocatedIds = available.slice(0, order.qty).map(d => d.id.value);
        allocation.set(order.id, allocatedIds);
        allocatedIds.forEach(id => allocated.add(id));
      }
    }

    const unallocated = diamonds
      .filter(d => !allocated.has(d.id.value))
      .map(d => d.id.value);

    return { allocation, unallocated };
  }
}

export class DispositionDecisionService {
  decideDisposition(
    ncr: any,
    inspection: any,
    product: any
  ): { disposition: string; rationale: string } {
    // Auto-disposition logic based on NCR type and severity
    switch (ncr.type) {
      case 'DIMENSIONAL':
        if (ncr.severity === 'CRITICAL') {
          return { disposition: 'REJECT', rationale: 'Critical dimensional failure' };
        }
        if (ncr.severity === 'MAJOR') {
          return { disposition: 'REWORK', rationale: 'Major dimensional deviation - rework required' };
        }
        return { disposition: 'ACCEPT_WITH_DEVIATION', rationale: 'Minor dimensional variation within tolerance' };

      case 'VISUAL':
        if (ncr.severity === 'CRITICAL') {
          return { disposition: 'REJECT', rationale: 'Critical visual defect' };
        }
        return { disposition: 'REWORK', rationale: 'Visual defect - cosmetic rework' };

      case 'WEIGHT':
        if (ncr.severity === 'CRITICAL') {
          return { disposition: 'REPAIR', rationale: 'Critical weight loss - repair required' };
        }
        return { disposition: 'REWORK', rationale: 'Weight variation - recut/rework' };

      case 'CERTIFICATE':
        return { disposition: 'RETURN_TO_SUPPLIER', rationale: 'Certificate mismatch' };

      default:
        return { disposition: 'REWORK', rationale: 'Standard rework disposition' };
    }
  }

  validateDisposition(
    disposition: string,
    ncrType: string,
    severity: string
  ): { valid: boolean; errors: string[] } {
    const validDispositions = ['REWORK', 'REPAIR', 'REGRADE', 'ACCEPT_DEVIATION', 'RETURN_TO_SUPPLIER', 'REJECT'];
    const errors: string[] = [];

    if (!validDispositions.includes(disposition)) {
      errors.push(`Invalid disposition: ${disposition}`);
    }

    // Business rules
    if (disposition === 'ACCEPT_DEVIATION' && ncrType === 'CERTIFICATE') {
      errors.push('Cannot accept deviation on certificate NCR');
    }

    if (disposition === 'REJECT' && severity === 'MINOR') {
      errors.push('REJECT disposition not recommended for MINOR severity');
    }

    return { valid: errors.length === 0, errors };
  }
}

export class InspectionSamplingService {
  calculateSampleSize(lotSize: number, aql: number = 1.0, inspectionLevel: string = 'II'): number {
    // ANSI/ASQ Z1.4 sampling plan
    const sampleSizes: Record<string, number[]> = {
      'I': [2, 3, 5, 8, 13, 20, 32, 50, 80, 125, 200, 315, 500, 800, 1250],
      'II': [2, 3, 5, 8, 13, 20, 32, 50, 80, 125, 200, 315, 500, 800, 1250],
      'III': [3, 5, 8, 13, 20, 32, 50, 80, 125, 200, 315, 500, 800, 1250, 2000],
    };

    const sizes = sampleSizes[inspectionLevel] ?? sampleSizes['II'] ?? [];
    const sampleAt = (index: number): number =>
      sizes[index] ?? sizes[sizes.length - 1] ?? lotSize;
    
    if (lotSize <= 2) return lotSize;
    if (lotSize <= 8) return sampleAt(0);
    if (lotSize <= 15) return sampleAt(1);
    if (lotSize <= 25) return sampleAt(1);
    if (lotSize <= 50) return sampleAt(2);
    if (lotSize <= 90) return sampleAt(3);
    if (lotSize <= 150) return sampleAt(4);
    if (lotSize <= 280) return sampleAt(5);
    if (lotSize <= 500) return sampleAt(6);
    if (lotSize <= 1200) return sampleAt(7);
    if (lotSize <= 3200) return sampleAt(8);
    if (lotSize <= 10000) return sampleAt(9);
    if (lotSize <= 35000) return sampleAt(10);
    if (lotSize <= 150000) return sampleAt(11);
    if (lotSize <= 500000) return sampleAt(12);
    if (lotSize <= 1000000) return sampleAt(13);
    return sampleAt(14);
  }

  getAcceptRejectNumbers(sampleSize: number, aql: number): { accept: number; reject: number } {
    // Simplified - in real implementation, would use full Z1.4 tables
    if (aql >= 1.0) {
      return { accept: Math.floor(sampleSize * 0.01), reject: Math.ceil(sampleSize * 0.02) };
    }
    return { accept: 0, reject: 1 };
  }

  calculateAcceptance(sampleSize: number, defectives: number, aql: number): 'ACCEPT' | 'REJECT' {
    const { accept, reject } = this.getAcceptRejectNumbers(sampleSize, aql);
    
    if (defectives <= accept) return 'ACCEPT';
    if (defectives >= reject) return 'REJECT';
    return 'ACCEPT'; // Between accept and reject - depends on specific table
  }
}

export class CertificationValidationService {
  validateCertificate(certificate: any, diamond: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check certificate matches diamond
    if (certificate.diamondId !== diamond.id.value) {
      errors.push('Certificate does not match diamond');
    }

    // Check carat weight within tolerance (±0.01 carat)
    if (Math.abs(certificate.carat - diamond.carat) > 0.01) {
      errors.push(`Carat mismatch: cert=${certificate.carat}, diamond=${diamond.carat}`);
    }

    // Check color match
    if (certificate.color !== diamond.color) {
      errors.push(`Color mismatch: cert=${certificate.color}, diamond=${diamond.color}`);
    }

    // Check clarity match
    if (certificate.clarity !== diamond.clarity) {
      errors.push(`Clarity mismatch: cert=${certificate.clarity}, diamond=${diamond.clarity}`);
    }

    // Check cut match
    if (certificate.cut !== diamond.cut) {
      errors.push(`Cut mismatch: cert=${certificate.cut}, diamond=${diamond.cut}`);
    }

    // Check shape match
    if (certificate.shape !== diamond.shape) {
      errors.push(`Shape mismatch: cert=${certificate.shape}, diamond=${diamond.shape}`);
    }

    // Check certificate not expired
    if (certificate.expiryDate && new Date(certificate.expiryDate) < new Date()) {
      errors.push('Certificate has expired');
    }

    return { valid: errors.length === 0, errors };
  }

  validateLabAccreditation(labId: string, requiredAccreditations: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    // In real implementation, would check lab database for accreditations
    if (!labId) {
      errors.push('Lab ID is required');
    }
    return { valid: errors.length === 0, errors };
  }
}

export class PricingDomainService {
  calculatePrice(
    product: any,
    quantity: number,
    customer: any,
    marketPrice: number
  ): { unitPrice: number; totalPrice: number; discount: number } {
    const basePrice = marketPrice || product.basePrice || 0;
    let discount = 0;

    // Volume discount
    if (quantity >= 1000) discount += 0.15;
    else if (quantity >= 500) discount += 0.10;
    else if (quantity >= 100) discount += 0.05;

    // Customer tier discount
    if (customer.tier === 'PREMIUM') discount += 0.05;
    else if (customer.tier === 'STANDARD') discount += 0.02;

    const unitPrice = basePrice * (1 - discount);
    const totalPrice = unitPrice * quantity;

    return { unitPrice: Math.round(unitPrice * 100) / 100, totalPrice: Math.round(totalPrice * 100) / 100, discount: Math.round(discount * 10000) / 100 };
  }

  calculateDiamondPrice(diamond: any, marketPricePerCarat: number): number {
    const basePrice = diamond.carat * marketPricePerCarat;
    let multiplier = 1.0;

    // Quality multipliers
    const colorMultipliers: Record<string, number> = { 'D': 1.0, 'E': 0.95, 'F': 0.9, 'G': 0.85, 'H': 0.8, 'I': 0.75, 'J': 0.7 };
    const clarityMultipliers: Record<string, number> = { 'IF': 1.0, 'VVS1': 0.95, 'VVS2': 0.9, 'VS1': 0.85, 'VS2': 0.8, 'SI1': 0.75, 'SI2': 0.7, 'I1': 0.6 };
    const cutMultipliers: Record<string, number> = { 'EXCELLENT': 1.0, 'VERY_GOOD': 0.95, 'GOOD': 0.9, 'FAIR': 0.85, 'POOR': 0.8 };

    multiplier *= colorMultipliers[diamond.color] || 1.0;
    multiplier *= clarityMultipliers[diamond.clarity] || 1.0;
    multiplier *= cutMultipliers[diamond.cut] || 1.0;

    return Math.round(basePrice * multiplier * 100) / 100;
  }
}

export class RoutingSelectionService {
  selectRouting(
    routings: any[],
    context: {
      companyId?: string;
      factoryId?: string;
      productId?: string;
      diamondType?: string;
      shape?: string;
      customerId?: string;
      orderType?: string;
      method?: string;
      priority?: string;
      qualityReq?: string;
    }
  ): any | null {
    // Sort by specificity (most specific first)
    const scored = routings
      .filter(r => r.status === 'ACTIVE')
      .map(routing => {
        let score = 0;
        for (const config of routing.configs) {
          let matches = 0;
          let total = 0;
          
          if (config.companyId) { total++; if (config.companyId === context.companyId) matches++; }
          if (config.factoryId) { total++; if (config.factoryId === context.factoryId) matches++; }
          if (config.productId) { total++; if (config.productId === context.productId) matches++; }
          if (config.diamondType) { total++; if (config.diamondType === context.diamondType) matches++; }
          if (config.shape) { total++; if (config.shape === context.shape) matches++; }
          if (config.customerId) { total++; if (config.customerId === context.customerId) matches++; }
          if (config.orderType) { total++; if (config.orderType === context.orderType) matches++; }
          if (config.method) { total++; if (config.method === context.method) matches++; }
          if (config.priority) { total++; if (config.priority === context.priority) matches++; }
          if (config.qualityReq) { total++; if (config.qualityReq === context.qualityReq) matches++; }
          
          score += total > 0 ? matches / total : 0;
        }
        return { routing, score: score / routing.configs.length };
      });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.routing || null;
  }
}

export class RoutingConfigurationService {
  createConfiguration(
    routingId: string,
    departmentSequence: string[],
    filters: {
      companyId?: string;
      factoryId?: string;
      productId?: string;
      diamondType?: string;
      shape?: string;
      customerId?: string;
      orderType?: string;
      method?: string;
      priority?: string;
      qualityReq?: string;
    }
  ): any {
    return {
      id: crypto.randomUUID(),
      routingId,
      ...filters,
      departmentSequence,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  validateConfiguration(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.departmentSequence || config.departmentSequence.length === 0) {
      errors.push('Department sequence is required');
    }

    // Check for duplicate departments in sequence
    const unique = new Set(config.departmentSequence);
    if (unique.size !== config.departmentSequence.length) {
      errors.push('Department sequence contains duplicates');
    }

    return { valid: errors.length === 0, errors };
  }

  getApplicableConfigs(configs: any[], context: any): any[] {
    return configs
      .filter(c => c.matches(context))
      .sort((a, b) => b.specificity - a.specificity);
  }
}
