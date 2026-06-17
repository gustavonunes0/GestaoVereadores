import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AgendaLegislativaModule } from '../legislativo/agenda-legislativa/agenda-legislativa.module';
import { NormasModule } from '../controle-juridico/normas/normas.module';
import { ParlamentaresModule } from '../legislativo/parlamentares/parlamentares.module';
import { MesaDiretoraModule } from '../legislativo/mesa-diretora/mesa-diretora.module';
import { ComissoesModule } from '../legislativo/comissoes/comissoes.module';
import { LegislaturasModule } from '../legislativo/legislaturas/legislaturas.module';
import { PORTAL_CONFIG_REPOSITORY } from './portal.tokens';
import { PortalConfigController } from './application/controllers/portal-config.controller';
import { PortalPublicController } from './application/controllers/portal-public.controller';
import { GetPortalConfigUseCase } from './application/use-cases/get-portal-config.use-case';
import { GetPortalPreviewUrlUseCase } from './application/use-cases/get-portal-preview-url.use-case';
import { UpdatePortalConfigUseCase } from './application/use-cases/update-portal-config.use-case';
import { ResolvePortalTenantUseCase } from './application/use-cases/resolve-portal-tenant.use-case';
import {
    GetPublicPortalConfigUseCase,
    ListPublicPortalAgendaUseCase,
} from './application/use-cases/public-portal.use-cases';
import { ListPublicPortalNormasUseCase } from './application/use-cases/list-public-portal-normas.use-case';
import { ListPublicPortalParlamentaresUseCase } from './application/use-cases/list-public-portal-parlamentares.use-case';
import { GetPublicPortalParliamentarianUseCase } from './application/use-cases/get-public-portal-parliamentarian.use-case';
import { GetPublicPortalMesaDiretoraUseCase } from './application/use-cases/get-public-portal-mesa-diretora.use-case';
import { ListPublicPortalComissoesUseCase } from './application/use-cases/list-public-portal-comissoes.use-case';
import { GetPublicPortalComissaoUseCase } from './application/use-cases/get-public-portal-comissao.use-case';
import { GetPublicPortalTransmissaoUseCase } from './application/use-cases/get-public-portal-transmissao.use-case';
import { PortalConfigRepository } from './domain/repositories/portal-config.repository';
import { PrismaPortalConfigRepository } from './infra/prisma/prisma-portal-config.repository';

@Module({
    imports: [
        PrismaModule,
        AgendaLegislativaModule,
        NormasModule,
        ParlamentaresModule,
        MesaDiretoraModule,
        ComissoesModule,
        LegislaturasModule,
    ],
    controllers: [PortalConfigController, PortalPublicController],
    providers: [
        GetPortalConfigUseCase,
        UpdatePortalConfigUseCase,
        GetPortalPreviewUrlUseCase,
        ResolvePortalTenantUseCase,
        GetPublicPortalConfigUseCase,
        ListPublicPortalAgendaUseCase,
        ListPublicPortalNormasUseCase,
        ListPublicPortalParlamentaresUseCase,
        GetPublicPortalParliamentarianUseCase,
        GetPublicPortalMesaDiretoraUseCase,
        ListPublicPortalComissoesUseCase,
        GetPublicPortalComissaoUseCase,
        GetPublicPortalTransmissaoUseCase,
        PrismaPortalConfigRepository,
        {
            provide: PORTAL_CONFIG_REPOSITORY,
            useExisting: PrismaPortalConfigRepository,
        },
        {
            provide: PortalConfigRepository,
            useExisting: PrismaPortalConfigRepository,
        },
    ],
})
export class PortalModule {}
