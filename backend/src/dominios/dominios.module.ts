import { Module } from '@nestjs/common';
import { DominiosController } from './dominios.controller';
import { DominiosService } from './dominios.service';

@Module({
  controllers: [DominiosController],
  providers: [DominiosService],
})
export class DominiosModule {}
