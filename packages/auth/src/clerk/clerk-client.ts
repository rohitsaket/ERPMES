import { createClerkClient } from '@clerk/clerk-sdk-node';
import { config } from '@diamondflow/config';

let clerkClient: ReturnType<typeof createClerkClient> | null = null;

export function getClerkClient() {
  if (!clerkClient) {
    clerkClient = createClerkClient({
      secretKey: config.clerk.secretKey,
      publishableKey: config.clerk.publishableKey,
      apiUrl: config.clerk.apiUrl,
    });
  }
  return clerkClient;
}

export async function syncUserFromClerk(clerkUser: any) {
  const db = await import('@diamondflow/database').then(m => m.getPrismaClient());
  
  const primaryEmail = clerkUser.emailAddresses?.find((e: any) => e.verification?.status === 'verified')?.emailAddress 
    || clerkUser.emailAddresses?.[0]?.emailAddress;
  
  if (!primaryEmail) {
    throw new Error('User has no verified email address');
  }

  const user = await db.user.upsert({
    where: { clerkId: clerkUser.id },
    create: {
      clerkId: clerkUser.id,
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      isActive: true,
      roleIds: ['employee'],
    },
    update: {
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      isActive: !clerkUser.banned,
    },
  });

  return user;
}

export async function syncOrganizationFromClerk(clerkOrg: any) {
  const db = await import('@diamondflow/database').then(m => m.getPrismaClient());
  
  const company = await db.company.upsert({
    where: { code: clerkOrg.slug.toUpperCase() },
    create: {
      name: clerkOrg.name,
      code: clerkOrg.slug.toUpperCase(),
      settings: clerkOrg.publicMetadata || {},
    },
    update: {
      name: clerkOrg.name,
      settings: clerkOrg.publicMetadata || {},
    },
  });

  return company;
}

export async function syncMembershipFromClerk(clerkMembership: any) {
  const db = await import('@diamondflow/database').then(m => m.getPrismaClient());
  
  const user = await db.user.findUnique({ where: { clerkId: clerkMembership.userId } });
  const company = await db.company.findUnique({ where: { code: clerkMembership.organizationId } });
  
  if (!user || !company) {
    return null;
  }

  const roleMapping: Record<string, string[]> = {
    'org:admin': ['company_admin'],
    'org:manager': ['factory_manager'],
    'org:member': ['employee'],
    'org:viewer': ['auditor'],
  };

  const roleIds = roleMapping[clerkMembership.role] || ['employee'];

  await db.user.update({
    where: { id: user.id },
    data: { roleIds },
  });

  return { userId: user.id, companyId: company.id, roleIds };
}

export async function deleteUserFromClerk(clerkId: string) {
  const db = await import('@diamondflow/database').then(m => m.getPrismaClient());
  
  await db.user.update({
    where: { clerkId },
    data: { isActive: false, deletedAt: new Date() },
  });
}

export async function deleteOrganizationFromClerk(clerkOrgId: string) {
  const db = await import('@diamondflow/database').then(m => m.getPrismaClient());
  
  await db.company.update({
    where: { code: clerkOrgId },
    data: { deletedAt: new Date() },
  });
}