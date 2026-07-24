import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    const models = Object.keys(this).filter(
      (key) => !key.startsWith('_') && !key.startsWith('$'),
    );
    for (const model of models) {
      const delegate = (this as unknown as Record<string, { deleteMany?: () => Promise<unknown> }>)[model];
      if (delegate?.deleteMany) {
        await delegate.deleteMany();
      }
    }
  }
}
