import { Module } from '@nestjs/common';
import { NormasModule } from './normas/normas.module';

@Module({
    imports: [NormasModule],
    exports: [NormasModule],
})
export class ControleJuridicoModule {}
