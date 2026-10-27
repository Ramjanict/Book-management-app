import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    let retries = 5;
    const delay = 3000;

    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to Neon PostgreSQL database.');
        break;
      } catch (error) {
        retries -= 1;
        this.logger.warn(
          `Database connection attempt failed. Neon compute might be waking up. Retrying in ${delay / 1000}s... (${retries} attempts left)`,
        );
        if (retries === 0) {
          this.logger.error('Could not connect to database after several attempts.', error);
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database.');
  }
}
