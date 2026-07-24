import { Injectable, NestMiddleware } from '@nestjs/common';
import { setOrgScope, clearOrgScope } from '@diamondflow/database';

@Injectable()
export class OrgContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const user = (req as any).user;

    if (user) {
      setOrgScope({
        companyId: user.companyId,
        branchId: user.branchId,
        factoryId: user.factoryId,
        departmentId: user.departmentId,
      });
    }

    // Clear org scope after response
    res.on('finish', () => {
      clearOrgScope();
    });

    next();
  }
}
