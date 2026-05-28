import { Module } from '@nestjs/common';
import { AutoresController } from './autores.controller';
import { AutoresService } from './autores.service';

@Module({
  controllers: [AutoresController],
  providers: [AutoresService],
})
export class AutoresModule {}
