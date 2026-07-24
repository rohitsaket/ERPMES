import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthContext } from '../types';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.auth as AuthContext;
    
    if (!user) {
      return null;
    }
    
    return data ? user[data] : user;
  },
);

export const CurrentOrg = createParamDecorator(
  (data: keyof AuthContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.auth as AuthContext;
    
    if (!user) {
      return null;
    }
    
    return data ? user[data] : {
      organizationId: user.organizationId,
      organizationRole: user.organizationRole,
      factories: user.factories,
      branches: user.branches,
      departments: user.departments,
    };
  },
);

export const Permissions = createParamDecorator(
  (data: string | string[] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.auth as AuthContext;
    
    if (!user) {
      return [];
    }
    
    return data ? (Array.isArray(data) ? data : [data]) : user.permissions;
  },
);