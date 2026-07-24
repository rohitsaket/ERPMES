import { createParamDecorator, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';

export const RequirePermission = (...permissions: string[]) => SetMetadata('permissions', permissions);

export const RequireScope = (scope: 'global' | 'company' | 'branch' | 'factory' | 'department' | 'record' | 'field') => {
  return createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }

      // Add scope info to request
      request.orgScope = {
        companyId: user.companyId,
        branchId: user.branchId,
        factoryId: user.factoryId,
        departmentId: user.departmentId,
        scope,
      };

      return request.orgScope;
    },
  )();
};

export const CheckFieldAccess = (field: string, subject: string) => {
  return createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }

      const permissions = Array.isArray(user.permissions) ? user.permissions : [];
      if (!permissions.includes(`read:${subject}:${field}`) && user.role !== 'super_admin') {
        throw new ForbiddenException(`Access denied to field: ${field}`);
      }

      return true;
    },
  )();
};
