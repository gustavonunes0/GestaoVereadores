import { Module } from '@nestjs/common';
import { ParlamentaresModule } from '../parlamentares/parlamentares.module';
import { ComissoesController } from './application/controllers/comissoes.controller';
import { AddComissaoMembroUseCase } from './application/use-cases/add-comissao-membro.use-case';
import { CreateComissaoUseCase } from './application/use-cases/create-comissao.use-case';
import { GetComissaoByIdUseCase } from './application/use-cases/get-comissao-by-id.use-case';
import { ListComissoesUseCase } from './application/use-cases/list-comissoes.use-case';
import { ListFuncoesComissaoUseCase } from './application/use-cases/list-funcoes-comissao.use-case';
import { RemoveComissaoMembroUseCase } from './application/use-cases/remove-comissao-membro.use-case';
import { RemoveComissaoUseCase } from './application/use-cases/remove-comissao.use-case';
import { UpdateComissaoUseCase } from './application/use-cases/update-comissao.use-case';
import { COMMITTEE_REPOSITORY } from './comissoes.tokens';
import { COMMITTEE_OPINION_REPOSITORY } from './comissoes.tokens';
import { PrismaCommitteeRepository } from './infra/prisma/prisma-committee.repository';
import { NullCommitteeOpinionRepository } from './infra/stubs/null-committee-opinion.repository';

@Module({
    imports: [ParlamentaresModule],
    controllers: [ComissoesController],
    providers: [
        CreateComissaoUseCase,
        ListComissoesUseCase,
        GetComissaoByIdUseCase,
        UpdateComissaoUseCase,
        RemoveComissaoUseCase,
        AddComissaoMembroUseCase,
        RemoveComissaoMembroUseCase,
        ListFuncoesComissaoUseCase,
        PrismaCommitteeRepository,
        NullCommitteeOpinionRepository,
        {
            provide: COMMITTEE_REPOSITORY,
            useExisting: PrismaCommitteeRepository,
        },
        {
            provide: COMMITTEE_OPINION_REPOSITORY,
            useExisting: NullCommitteeOpinionRepository,
        },
    ],
    exports: [COMMITTEE_REPOSITORY, COMMITTEE_OPINION_REPOSITORY],
})
export class ComissoesModule {}
