import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '../casl/ability-factory';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private abilityFactory: AbilityFactory,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const ability = this.abilityFactory.defineAbility(user);

    for (const permission of requiredPermissions) {
      const [action, subject] = permission.split(':');
      if (!action || !subject || !ability.can(action, subject)) {
        throw new ForbiddenException(`Missing permission: ${permission}`);
      }
    }

    return true;
  }
}

@Injectable()
export class OrgScopeGuard implements CanActivate {
  constructor(private abilityFactory: AbilityFactory) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Add org scope to request for use in services
    request.orgScope = {
      companyId: user.companyId,
      branchId: user.branchId,
      factoryId: user.factoryId,
      departmentId: user.departmentId,
    };

    return true;
  }
}
