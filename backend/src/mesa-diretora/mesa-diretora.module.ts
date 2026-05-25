import { Module } from '@nestjs/common';
import { MesaDiretoraController } from './mesa-diretora.controller';
import { MesaDiretoraService } from './mesa-diretora.service';

@Module({
  controllers: [MesaDiretoraController],
  providers: [MesaDiretoraService],
})
export class MesaDiretoraModule {}
