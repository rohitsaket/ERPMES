import { Injectable } from '@nestjs/common';
import { AbilityFactory, AppAbility } from '@diamondflow/authorization';
import { PrismaService } from '@diamondflow/database';

@Injectable()
export class PermissionGuard {
  constructor(
    private abilityFactory: AbilityFactory,
    private prisma: PrismaService,
  ) {}

  async check(userId: string, companyId: string, requiredPermissions: string[]): Promise<boolean> {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, permissions: true },
    });

    if (!userRecord) {
      return false;
    }

    const user = {
      userId,
      companyId,
      role: userRecord.role,
      permissions: (userRecord.permissions as string[]) || [],
    };

    const ability = this.abilityFactory.defineAbility(user);

    return requiredPermissions.every((permission) => {
      const [action, subject] = permission.split(':');
      return Boolean(action && subject && ability.can(action, subject));
    });
  }
}