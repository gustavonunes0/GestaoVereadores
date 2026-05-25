import { Module } from '@nestjs/common';
import { AtosController } from './atos.controller';
import { AtosService } from './atos.service';

@Module({
  controllers: [AtosController],
  providers: [AtosService],
})
export class AtosModule {}
