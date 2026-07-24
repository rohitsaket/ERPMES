import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MrpException {
  id?: string;
  itemId?: string;
  itemName?: string;
  type?: string;
  severity?: string;
  message?: string;
  suggestedAction?: string;
  createdAt?: string;
}

@Injectable()
export class MrpService {
  async findRuns(companyId?: string) {
    const runs = await prisma.mrpRun.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { startedAt: 'desc' },
      take: 100,
    });

    return {
      data: runs.map((run) => {
        const exceptions = Array.isArray(run.exceptions) ? run.exceptions : [];
        return {
          id: run.id,
          status: run.status.toUpperCase(),
          startedAt: run.startedAt,
          completedAt: run.completedAt,
          itemsPlanned: run.recordsProcessed,
          exceptions: exceptions.length,
        };
      }),
    };
  }

  async findExceptions(
    runId: string,
    filters: { type?: string; severity?: string; search?: string },
  ) {
    const run = await prisma.mrpRun.findUnique({ where: { id: runId } });
    if (!run) throw new NotFoundException(`MRP run ${runId} not found`);

    const source = Array.isArray(run.exceptions) ? run.exceptions : [];
    const normalized = source.map((value, index) => {
      const exception = (value && typeof value === 'object' ? value : {}) as MrpException;
      return {
        id: exception.id ?? `${run.id}-${index + 1}`,
        itemId: exception.itemId ?? 'unknown',
        itemName: exception.itemName ?? exception.itemId ?? 'Unknown item',
        type: (exception.type ?? 'SHORTAGE').toUpperCase(),
        severity: (exception.severity ?? 'MEDIUM').toUpperCase(),
        message: exception.message ?? 'Planning exception',
        suggestedAction: exception.suggestedAction ?? 'Review material requirements',
        createdAt: exception.createdAt ?? run.startedAt.toISOString(),
      };
    });
    const search = filters.search?.trim().toLowerCase();
    const data = normalized.filter((exception) =>
      (!filters.type || exception.type === filters.type.toUpperCase()) &&
      (!filters.severity || exception.severity === filters.severity.toUpperCase()) &&
      (!search ||
        exception.itemName.toLowerCase().includes(search) ||
        exception.message.toLowerCase().includes(search)),
    );

    return { data };
  }
}
