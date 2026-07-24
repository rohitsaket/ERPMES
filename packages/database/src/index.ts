export { prisma, setOrgScope, clearOrgScope } from './prisma-client.js';
export { PrismaService } from './prisma/prisma.service.js';
export { DatabaseModule } from './prisma/prisma-module.js';

import { prisma } from './prisma-client.js';
export function getPrismaClient() {
  return prisma;
}
