import { Module } from '@nestjs/common';
import { ParlamentarianGuard } from '../../auth/guards/parliamentarian.guard';
import { IdentidadeModule } from '../../identidade/identidade.module';
import { LegislaturasModule } from '../legislaturas/legislaturas.module';
import { PartidosPoliticosModule } from '../partidos-politicos/partidos-politicos.module';
import { ParliamentariansController } from './application/controllers/parliamentarians.controller';
import { CreateParliamentarianUseCase } from './application/use-cases/create-parliamentarian.use-case';
import { GetParliamentarianByIdUseCase } from './application/use-cases/get-parliamentarian-by-id.use-case';
import { GetParliamentarianProfileUseCase } from './application/use-cases/get-parliamentarian-profile.use-case';
import { GrantParliamentarianAccessUseCase } from './application/use-cases/grant-parliamentarian-access.use-case';
import { ListParliamentariansUseCase } from './application/use-cases/list-parliamentarians.use-case';
import { ListActiveParliamentarianUsersUseCase } from './application/use-cases/list-active-parliamentarian-users.use-case';
import { RemoveParliamentarianUseCase } from './application/use-cases/remove-parliamentarian.use-case';
import { RevokeParliamentarianAccessUseCase } from './application/use-cases/revoke-parliamentarian-access.use-case';
import { UpdateParliamentarianUseCase } from './application/use-cases/update-parliamentarian.use-case';
import { UpdateMeuPerfilUseCase } from './application/use-cases/update-meu-perfil.use-case';
import { UpdateMinhaBiografiaUseCase } from './application/use-cases/update-minha-biografia.use-case';
import { ParlamentarMandatosController } from './mandatos/application/controllers/parlamentar-mandatos.controller';
import { CreateParlamentarMandatoUseCase } from './mandatos/application/use-cases/create-parlamentar-mandato.use-case';
import { FinishParlamentarMandatoUseCase } from './mandatos/application/use-cases/finish-parlamentar-mandato.use-case';
import { ListParlamentarMandatosUseCase } from './mandatos/application/use-cases/list-parlamentar-mandatos.use-case';
import { PrismaActiveParliamentarianMandateChecker } from './mandatos/infra/prisma/prisma-active-parliamentarian-mandate.checker';
import { PrismaParliamentarianMandateRepository } from './mandatos/infra/prisma/prisma-parliamentarian-mandate.repository';
import {
    ACTIVE_PARLIAMENTARIAN_MANDATE_CHECKER,
    PARLIAMENTARIAN_MANDATE_REPOSITORY,
} from './mandatos/mandatos.tokens';
import { PrismaParlamentarianUserRepository } from './infra/prisma/prisma-parlamentarian-user.repository';
import { PrismaParliamentarianRepository } from './infra/prisma/prisma-parliamentarian.repository';
import {
    PARLIAMENTARIAN_REPOSITORY,
    PARLIAMENTARIAN_USER_REPOSITORY,
} from './parlamentares.tokens';

@Module({
    imports: [IdentidadeModule, PartidosPoliticosModule, LegislaturasModule],
    controllers: [ParliamentariansController, ParlamentarMandatosController],
    providers: [
        ParlamentarianGuard,
        CreateParliamentarianUseCase,
        GrantParliamentarianAccessUseCase,
        RevokeParliamentarianAccessUseCase,
        GetParliamentarianProfileUseCase,
        ListParliamentariansUseCase,
        ListActiveParliamentarianUsersUseCase,
        GetParliamentarianByIdUseCase,
        UpdateParliamentarianUseCase,
        RemoveParliamentarianUseCase,
        UpdateMeuPerfilUseCase,
        UpdateMinhaBiografiaUseCase,
        CreateParlamentarMandatoUseCase,
        ListParlamentarMandatosUseCase,
        FinishParlamentarMandatoUseCase,
        PrismaParliamentarianRepository,
        PrismaParlamentarianUserRepository,
        PrismaParliamentarianMandateRepository,
        PrismaActiveParliamentarianMandateChecker,
        {
            provide: PARLIAMENTARIAN_REPOSITORY,
            useExisting: PrismaParliamentarianRepository,
        },
        {
            provide: PARLIAMENTARIAN_USER_REPOSITORY,
            useExisting: PrismaParlamentarianUserRepository,
        },
        {
            provide: PARLIAMENTARIAN_MANDATE_REPOSITORY,
            useExisting: PrismaParliamentarianMandateRepository,
        },
        {
            provide: ACTIVE_PARLIAMENTARIAN_MANDATE_CHECKER,
            useExisting: PrismaActiveParliamentarianMandateChecker,
        },
    ],
    exports: [
        PARLIAMENTARIAN_REPOSITORY,
        PARLIAMENTARIAN_MANDATE_REPOSITORY,
        ACTIVE_PARLIAMENTARIAN_MANDATE_CHECKER,
    ],
})
export class ParlamentaresModule {}
