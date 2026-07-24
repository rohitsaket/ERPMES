import { Injectable } from '@nestjs/common';
import { AbilityFactory, AppAbility } from '@diamondflow/authorization';

@Injectable()
export class PermissionGuard {
  constructor(private abilityFactory: AbilityFactory) {}

  async check(userId: string, companyId: string, requiredPermissions: string[]): Promise<boolean> {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // In production, fetch user from database with roles/permissions
    // For now, return true for development
    const user = {
      userId,
      companyId,
      role: 'operator',
      permissions: requiredPermissions, // Simulated - in production fetch from DB
    };

    const ability = this.abilityFactory.defineAbility(user);

    return requiredPermissions.every((permission) => {
      const [action, subject] = permission.split(':');
      return Boolean(action && subject && ability.can(action, subject));
    });
  }
}
