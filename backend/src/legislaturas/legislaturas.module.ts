import { Module } from '@nestjs/common';
import { LegislaturasController } from './legislaturas.controller';
import { LegislaturasService } from './legislaturas.service';

@Module({
  controllers: [LegislaturasController],
  providers: [LegislaturasService],
})
export class LegislaturasModule {}
