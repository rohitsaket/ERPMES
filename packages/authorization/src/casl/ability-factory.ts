import { Injectable } from '@nestjs/common';
import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';

export type AppAbility = MongoAbility<[string, string]>;

export interface AuthorizationUser {
  role?: string;
  permissions?: unknown;
}

const ROLE_PERMISSIONS: Record<string, ReadonlyArray<[string, string]>> = {
  super_admin: [['manage', 'all']],
  company_admin: [['manage', 'all']],
  operator: [['read', 'all']],
};

function parsePermission(value: string): [string, string] | null {
  const [action, subject] = value.split(':');
  return action && subject ? [action, subject] : null;
}

@Injectable()
export class AbilityFactory {
  defineAbility(user: AuthorizationUser): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
    const role = user.role?.toLowerCase() ?? 'operator';

    for (const [action, subject] of ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.operator!) {
      can(action, subject);
    }

    if (Array.isArray(user.permissions)) {
      for (const permission of user.permissions) {
        if (typeof permission !== 'string') continue;
        const parsed = parsePermission(permission);
        if (parsed) can(parsed[0], parsed[1]);
      }
    }

    return build();
  }

  createForUser(user: AuthorizationUser): AppAbility {
    return this.defineAbility(user);
  }
}
