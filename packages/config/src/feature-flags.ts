import { Injectable } from '@nestjs/common';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number;
  targetRoles?: string[];
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  mrpEnabled: {
    key: 'mrpEnabled',
    enabled: true,
    description: 'Enable MRP engine',
    targetRoles: ['PRODUCTION_PLANNER', 'FACTORY_MANAGER'],
  },
  finiteSchedulingEnabled: {
    key: 'finiteSchedulingEnabled',
    enabled: false,
    description: 'Enable finite capacity scheduling (CP-SAT)',
    targetRoles: ['PRODUCTION_PLANNER'],
  },
  aiCopilotEnabled: {
    key: 'aiCopilotEnabled',
    enabled: true,
    description: 'Enable AI Copilot',
    rolloutPercentage: 50,
    targetRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'FACTORY_MANAGER'],
  },
  advancedAnalytics: {
    key: 'advancedAnalytics',
    enabled: false,
    description: 'Enable advanced analytics dashboards',
    targetRoles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
  },
  multiCurrency: {
    key: 'multiCurrency',
    enabled: false,
    description: 'Enable multi-currency support',
    targetRoles: ['FINANCE_CONTROLLER'],
  },
  offlineShopFloor: {
    key: 'offlineShopFloor',
    enabled: false,
    description: 'Enable offline-first shop floor mode',
    targetRoles: ['SHOP_FLOOR_OPERATOR'],
  },
  advancedQuality: {
    key: 'advancedQuality',
    enabled: false,
    description: 'Enable SPC, Gage R&R, FAI',
    targetRoles: ['QUALITY_INSPECTOR', 'QUALITY_MANAGER'],
  },
  predictiveMaintenance: {
    key: 'predictiveMaintenance',
    enabled: false,
    description: 'Enable predictive maintenance ML',
    targetRoles: ['MAINTENANCE_TECHNICIAN'],
  },
  edimIntegration: {
    key: 'edimIntegration',
    enabled: false,
    description: 'Enable EDI integration',
    targetRoles: ['PROCUREMENT_OFFICER'],
  },
};

@Injectable()
export class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();

  constructor() {
    Object.values(FEATURE_FLAGS).forEach(flag => {
      this.flags.set(flag.key, flag);
    });
  }

  isEnabled(key: string, userContext?: { roleIds?: string[] }): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;
    if (!flag.enabled) return false;
    
    if (flag.targetRoles && userContext?.roleIds) {
      const hasRole = userContext.roleIds.some(role => flag.targetRoles!.includes(role));
      if (!hasRole) return false;
    }
    
    if (flag.rolloutPercentage && flag.rolloutPercentage < 100) {
      // Consistent hash based on user ID
      const hash = this.hashString(userContext?.roleIds?.join(',') || 'anonymous');
      return (hash % 100) < flag.rolloutPercentage;
    }
    
    return true;
  }

  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  setFlag(key: string, enabled: boolean): void {
    const flag = this.flags.get(key);
    if (flag) {
      flag.enabled = enabled;
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}