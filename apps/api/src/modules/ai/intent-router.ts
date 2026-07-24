import { Injectable } from '@nestjs/common';

@Injectable()
export class IntentRouter {
  private intentPatterns: Map<string, RegExp[]> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    this.intentPatterns.set('production_status', [
      /production\s*order/i,
      /po\s*status/i,
      /work\s*order/i,
      /manufacturing\s*status/i,
      /wip\s*status/i,
      /operation\s*status/i,
      /progress.*production/i,
    ]);

    this.intentPatterns.set('inventory_check', [
      /inventory/i,
      /stock\s*level/i,
      /available\s*quantity/i,
      /on\s*hand/i,
      /stock\s*check/i,
      /how\s*many.*diamond/i,
      /diamond.*available/i,
    ]);

    this.intentPatterns.set('quality_report', [
      /quality/i,
      /inspection/i,
      /ncr/i,
      /non.?conformance/i,
      /certification/i,
      /certificate/i,
      /pass.*fail/i,
      /rework/i,
      /defect/i,
    ]);

    this.intentPatterns.set('shipment_tracking', [
      /shipment/i,
      /ship/i,
      /track/i,
      /tracking/i,
      /delivery/i,
      /dispatch/i,
      /courier/i,
      /fedex|ups|dhl/i,
    ]);

    this.intentPatterns.set('diamond_traceability', [
      /genealogy/i,
      /trace/i,
      /history.*diamond/i,
      /diamond.*history/i,
      /where.*diamond/i,
      /diamond.*from/i,
      /diamond.*to/i,
      /packet.*diamond/i,
      /bag.*diamond/i,
    ]);

    this.intentPatterns.set('capacity_planning', [
      /capacity/i,
      /schedule/i,
      /plan/i,
      /work.?center/i,
      /machine.*load/i,
      /capacity.*load/i,
      /finite.*schedul/i,
    ]);

    this.intentPatterns.set('mrp_run', [
      /mrp/i,
      /material.*require/i,
      /planning.*run/i,
      /reorder/i,
      /planned\s*order/i,
    ]);

    this.intentPatterns.set('diamond_allocation', [
      /allocat/i,
      /reserv/i,
      /assign.*diamond/i,
      /diamond.*order/i,
      /stone.*order/i,
    ]);

    this.intentPatterns.set('financial_query', [
      /invoice/i,
      /payment/i,
      /receiv/i,
      /payable/i,
      /financial/i,
      /accounting/i,
      /gl/i,
      /journal/i,
    ]);

    this.intentPatterns.set('analytics_query', [
      /oee/i,
      /yield/i,
      /wip.*aging/i,
      /analytic/i,
      /report/i,
      /dashboard/i,
      /metric/i,
      /kpi/i,
      /performance/i,
      /efficiency/i,
    ]);

    this.intentPatterns.set('maintenance_due', [
      /maintenance/i,
      /preventive/i,
      /pm\s*schedule/i,
      /work\s*order/i,
      /asset/i,
      /equipment/i,
      /breakdown/i,
    ]);

    this.intentPatterns.set('return_repair', [
      /return/i,
      /repair/i,
      /warranty/i,
      /exchange/i,
      /credit\s*memo/i,
      /rma/i,
    ]);
  }

  classify(message: string): string {
    const lowerMessage = message.toLowerCase();
    let bestMatch = 'general_query';
    let maxMatches = 0;

    for (const [intent, patterns] of this.intentPatterns.entries()) {
      const matches = patterns.filter((pattern) => pattern.test(lowerMessage)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = intent;
      }
    }

    return bestMatch;
  }

  getAvailableIntents(): string[] {
    return Array.from(this.intentPatterns.keys());
  }
}