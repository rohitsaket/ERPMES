// Clerk Authentication Types
export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string; verification: { status: string } }>;
  phoneNumbers: Array<{ phoneNumber: string; verification: { status: string } }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  publicMetadata: Record<string, unknown>;
  privateMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number | null;
  twoFactorEnabled: boolean;
  externalAccounts: Array<{ provider: string; providerUserId: string }>;
}

export interface ClerkOrganization {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  createdAt: number;
  updatedAt: number;
  publicMetadata: Record<string, unknown>;
  privateMetadata: Record<string, unknown>;
}

export interface ClerkMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  publicMetadata: Record<string, unknown>;
  privateMetadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface ClerkWebhookEvent {
  type: string;
  data: ClerkUser | ClerkOrganization | ClerkMembership;
  object: 'user' | 'organization' | 'organization_membership';
}

export interface JWTPayload {
  sub: string;
  email: string;
  orgId: string;
  orgRole: string;
  orgSlug: string;
  permissions: string[];
  factories: string[];
  branches: string[];
  departments: string[];
  iat: number;
  exp: number;
  jti: string;
}

export interface AuthContext {
  userId: string;
  email: string;
  organizationId: string;
  organizationRole: string;
  permissions: string[];
  factories: string[];
  branches: string[];
  departments: string[];
}

export const CLERK_WEBHOOK_EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  ORG_CREATED: 'organization.created',
  ORG_UPDATED: 'organization.updated',
  ORG_DELETED: 'organization.deleted',
  MEMBERSHIP_CREATED: 'organization_membership.created',
  MEMBERSHIP_UPDATED: 'organization_membership.updated',
  MEMBERSHIP_DELETED: 'organization_membership.deleted',
} as const;

export const DEFAULT_ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  FACTORY_MANAGER: 'factory_manager',
  PRODUCTION_PLANNER: 'production_planner',
  SHOP_FLOOR_OPERATOR: 'shop_floor_operator',
  QUALITY_INSPECTOR: 'quality_inspector',
  WAREHOUSE_OPERATOR: 'warehouse_operator',
  PROCUREMENT_OFFICER: 'procurement_officer',
  SALES_REP: 'sales_rep',
  FINANCE_CONTROLLER: 'finance_controller',
  MAINTENANCE_TECHNICIAN: 'maintenance_technician',
  LOGISTICS_COORDINATOR: 'logistics_coordinator',
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  AUDITOR: 'auditor',
} as const;