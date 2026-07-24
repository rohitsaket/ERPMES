import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  CreateAccountDto, UpdateAccountDto, AccountQueryDto,
  CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto,
  CreatePaymentDto, PaymentQueryDto,
  CreateJournalEntryDto, JournalEntryQueryDto,
} from './dto/finance.dto';

const prisma = new PrismaClient() as any;

@Injectable()
export class FinanceService {
  // ---- Chart of Accounts ----

  async createAccount(dto: CreateAccountDto) {
    const existing = await prisma.chartOfAccount.findUnique({ where: { companyId_code: { companyId: dto.companyId, code: dto.code } } });
    if (existing) throw new ConflictException(`Account code ${dto.code} already exists in this company`);
    return prisma.chartOfAccount.create({ data: dto });
  }

  async findAllAccounts(query: AccountQueryDto) {
    const { page = 1, limit = 50, companyId, type } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      prisma.chartOfAccount.findMany({ where, skip, take: limit, orderBy: { code: 'asc' } }),
      prisma.chartOfAccount.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneAccount(id: string) {
    const account = await prisma.chartOfAccount.findUnique({ where: { id } });
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    const [parent, children] = await Promise.all([
      account.parentId ? prisma.chartOfAccount.findUnique({ where: { id: account.parentId } }) : null,
      prisma.chartOfAccount.findMany({ where: { parentId: id }, orderBy: { code: 'asc' } }),
    ]);
    return { ...account, parent, children };
  }

  async updateAccount(id: string, dto: UpdateAccountDto) {
    try {
      return await prisma.chartOfAccount.update({ where: { id }, data: dto });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Account ${id} not found`);
      throw error;
    }
  }

  async removeAccount(id: string) {
    const children = await prisma.chartOfAccount.count({ where: { parentId: id } });
    if (children > 0) throw new BadRequestException('Cannot delete account with child accounts');
    try {
      await prisma.chartOfAccount.delete({ where: { id } });
      return { deleted: true };
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Account ${id} not found`);
      throw error;
    }
  }

  // ---- Invoices ----

  async createInvoice(dto: CreateInvoiceDto) {
    const { lines, ...data } = dto;
    const totalAmount = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
    return prisma.invoice.create({
      data: {
        ...data,
        number: `INV-${Date.now()}`,
        amount: totalAmount,
        status: 'draft',
        dueDate: new Date(data.dueDate),
        lines: {
          create: lines.map((l) => ({
            description: l.description,
            qty: Math.trunc(l.qty),
            unitPrice: l.unitPrice,
            lineTotal: l.qty * l.unitPrice,
            accountId: l.accountId,
          })),
        },
      },
      include: { lines: true },
    });
  }

  async findAllInvoices(query: InvoiceQueryDto) {
    const { page = 1, limit = 20, status, companyId, customerId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip, take: limit,
        include: { _count: { select: { lines: true, payments: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneInvoice(id: string) {
    const inv = await prisma.invoice.findUnique({
      where: { id },
      include: { lines: true, payments: true, salesOrder: true },
    });
    if (!inv) throw new NotFoundException(`Invoice ${id} not found`);
    return inv;
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto | Record<string, unknown>) {
    const data: Record<string, unknown> = { ...dto };
    if (data.dueDate) data.dueDate = new Date(data.dueDate as string);
    try {
      return await prisma.invoice.update({
        where: { id },
        data,
        include: { lines: true, payments: true, salesOrder: true },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') throw new NotFoundException(`Invoice ${id} not found`);
      throw error;
    }
  }

  // ---- Payments ----

  async createPayment(dto: CreatePaymentDto) {
    const invoice = await prisma.invoice.findUnique({ where: { id: dto.invoiceId } });
    if (!invoice) throw new NotFoundException(`Invoice ${dto.invoiceId} not found`);

    const payment = await prisma.payment.create({
      data: {
        companyId: invoice.companyId,
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        currency: dto.currency ?? 'USD',
        method: dto.method,
        reference: dto.reference,
      },
      include: { invoice: { select: { id: true, status: true, amount: true } } },
    });

    const totalPaid = await prisma.payment.aggregate({ where: { invoiceId: dto.invoiceId }, _sum: { amount: true } });
    if (Number(totalPaid._sum.amount) >= Number(invoice.amount)) {
      await prisma.invoice.update({ where: { id: dto.invoiceId }, data: { status: 'PAID' } });
    }

    return payment;
  }

  async findAllPayments(query: PaymentQueryDto) {
    const { page = 1, limit = 20, invoiceId, method } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (invoiceId) where.invoiceId = invoiceId;
    if (method) where.method = method;

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where, skip, take: limit,
        include: { invoice: { select: { id: true, status: true, amount: true } } },
        orderBy: { receivedAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOnePayment(id: string) {
    const payment = await prisma.payment.findUnique({ where: { id }, include: { invoice: true } });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  // ---- Journal Entries ----

  async createJournalEntry(dto: CreateJournalEntryDto) {
    const { lines, ...data } = dto;
    const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException('Journal entry must be balanced (total debit = total credit)');
    }
    return prisma.journalEntry.create({
      data: {
        companyId: data.companyId,
        number: `JE-${Date.now()}`,
        date: new Date(data.date),
        memo: data.memo,
        lines: { create: lines.map((l) => ({ accountId: l.accountId, debit: l.debit, credit: l.credit, description: l.description })) },
      },
      include: { lines: true },
    });
  }

  async findAllJournalEntries(query: JournalEntryQueryDto) {
    const { page = 1, limit = 20, companyId, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where, skip, take: limit,
        include: { _count: { select: { lines: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.journalEntry.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOneJournalEntry(id: string) {
    const entry = await prisma.journalEntry.findUnique({
      where: { id },
      include: { lines: { orderBy: { id: 'asc' } } },
    });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    return entry;
  }
}
