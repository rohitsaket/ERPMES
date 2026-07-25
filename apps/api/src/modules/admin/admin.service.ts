import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UsersQueryDto } from './dto/users-query.dto';
import { PermissionsQueryDto } from './dto/permissions-query.dto';

const prisma = new PrismaClient() as any;

const STATUS_MAP: Record<string, string> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  suspended: 'SUSPENDED',
  pending_verification: 'PENDING_VERIFICATION',
};

const SYSTEM_PERMISSIONS = [
  { action: 'manage', subject: 'users', description: 'Manage user accounts and access', category: 'user' },
  { action: 'view', subject: 'users', description: 'View user accounts', category: 'user' },
  { action: 'create', subject: 'users', description: 'Create user accounts', category: 'user' },
  { action: 'update', subject: 'users', description: 'Update user accounts', category: 'user' },
  { action: 'delete', subject: 'users', description: 'Delete user accounts', category: 'user' },
  { action: 'manage', subject: 'roles', description: 'Manage roles and permissions', category: 'role' },
  { action: 'view', subject: 'roles', description: 'View roles and permissions', category: 'role' },
  { action: 'assign', subject: 'roles', description: 'Assign roles to users', category: 'role' },
  { action: 'create', subject: 'companies', description: 'Create companies', category: 'admin' },
  { action: 'view', subject: 'companies', description: 'View company details', category: 'admin' },
  { action: 'update', subject: 'companies', description: 'Update company information', category: 'admin' },
  { action: 'manage', subject: 'settings', description: 'Manage system settings', category: 'admin' },
  { action: 'view', subject: 'products', description: 'View products', category: 'product' },
  { action: 'create', subject: 'products', description: 'Create products', category: 'product' },
  { action: 'update', subject: 'products', description: 'Update products', category: 'product' },
  { action: 'delete', subject: 'products', description: 'Delete products', category: 'product' },
  { action: 'view', subject: 'inventory', description: 'View inventory', category: 'inventory' },
  { action: 'manage', subject: 'inventory', description: 'Manage inventory', category: 'inventory' },
  { action: 'transfer', subject: 'inventory', description: 'Transfer inventory between locations', category: 'inventory' },
  { action: 'view', subject: 'orders', description: 'View orders', category: 'order' },
  { action: 'create', subject: 'orders', description: 'Create orders', category: 'order' },
  { action: 'update', subject: 'orders', description: 'Update orders', category: 'order' },
  { action: 'cancel', subject: 'orders', description: 'Cancel orders', category: 'order' },
  { action: 'view', subject: 'sales', description: 'View sales data', category: 'order' },
  { action: 'manage', subject: 'sales', description: 'Manage sales', category: 'order' },
  { action: 'view', subject: 'purchases', description: 'View purchase orders', category: 'order' },
  { action: 'manage', subject: 'purchases', description: 'Manage purchase orders', category: 'order' },
  { action: 'view', subject: 'manufacturing', description: 'View manufacturing data', category: 'manufacturing' },
  { action: 'manage', subject: 'manufacturing', description: 'Manage manufacturing', category: 'manufacturing' },
  { action: 'view', subject: 'quality', description: 'View quality control data', category: 'quality' },
  { action: 'manage', subject: 'quality', description: 'Manage quality control', category: 'quality' },
  { action: 'view', subject: 'maintenance', description: 'View maintenance data', category: 'maintenance' },
  { action: 'manage', subject: 'maintenance', description: 'Manage maintenance', category: 'maintenance' },
  { action: 'view', subject: 'finance', description: 'View financial data', category: 'finance' },
  { action: 'manage', subject: 'finance', description: 'Manage financial data', category: 'finance' },
  { action: 'view', subject: 'dispatch', description: 'View dispatch data', category: 'order' },
  { action: 'manage', subject: 'dispatch', description: 'Manage dispatch', category: 'order' },
  { action: 'use', subject: 'ai', description: 'Use AI copilot features', category: 'ai' },
  { action: 'manage', subject: 'ai', description: 'Manage AI configuration', category: 'ai' },
  { action: 'view', subject: 'analytics', description: 'View analytics and reports', category: 'admin' },
  { action: 'manage', subject: 'analytics', description: 'Manage analytics configuration', category: 'admin' },
  { action: 'view', subject: 'documents', description: 'View documents', category: 'admin' },
  { action: 'manage', subject: 'documents', description: 'Manage documents', category: 'admin' },
  { action: 'view', subject: 'notifications', description: 'View notifications', category: 'admin' },
  { action: 'manage', subject: 'notifications', description: 'Manage notification settings', category: 'admin' },
  { action: 'view', subject: 'workflow', description: 'View workflows', category: 'admin' },
  { action: 'manage', subject: 'workflow', description: 'Manage workflows', category: 'admin' },
  { action: 'view', subject: 'integrations', description: 'View integrations', category: 'admin' },
  { action: 'manage', subject: 'integrations', description: 'Manage integrations', category: 'admin' },
];

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  async findUsers(query: UsersQueryDto) {
    const { page = 1, limit = 20, search, status, role } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { normalizedEmail: { contains: search.toLowerCase(), mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status.toLowerCase();
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          role: true,
          lastLogin: true,
          createdAt: true,
          companyId: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: data.map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: null,
        status: STATUS_MAP[user.status] || user.status.toUpperCase(),
        role: user.role,
        lastLoginAt: user.lastLogin?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        organizationId: user.companyId,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPermissions(query: PermissionsQueryDto) {
    const { page = 1, limit = 50, search, category } = query;
    const skip = (page - 1) * limit;

    let filtered = SYSTEM_PERMISSIONS;

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.action.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    const total = filtered.length;
    const data = filtered.slice(skip, skip + limit);

    return {
      data: data.map((p, i) => ({
        id: `perm_${i + 1 + skip}`,
        action: p.action,
        subject: p.subject,
        description: p.description,
        category: p.category,
        isSystem: true,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
