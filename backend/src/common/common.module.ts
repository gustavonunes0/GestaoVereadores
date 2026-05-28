import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';

@Global()
@Module({
  providers: [{ provide: APP_FILTER, useClass: PrismaExceptionFilter }],
})
export class CommonModule {}
