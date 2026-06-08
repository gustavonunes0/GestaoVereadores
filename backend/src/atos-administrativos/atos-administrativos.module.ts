import { Module } from '@nestjs/common';
import { AtosModule } from './atos/atos.module';

@Module({
    imports: [AtosModule],
    exports: [AtosModule],
})
export class AtosAdministrativosModule {}
