import { Module } from '@nestjs/common';
import { ParlamentaresController } from './parlamentares.controller';
import { ParlamentaresService } from './parlamentares.service';

@Module({
  controllers: [ParlamentaresController],
  providers: [ParlamentaresService],
  exports: [ParlamentaresService],
})
export class ParlamentaresModule {}
