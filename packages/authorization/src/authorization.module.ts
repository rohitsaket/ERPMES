import { Module, Global } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from './casl/ability-factory';
import { PermissionGuard } from './guards/permission.guard';
import { OrgScopeGuard } from './guards/permission.guard';

@Global()
@Module({
  providers: [
    Reflector,
    AbilityFactory,
    PermissionGuard,
    OrgScopeGuard,
  ],
  exports: [
    AbilityFactory,
    PermissionGuard,
    OrgScopeGuard,
  ],
})
export class AuthorizationModule {}
