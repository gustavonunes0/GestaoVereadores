import { Module } from '@nestjs/common';
import { PoliticalPartiesController } from './application/controllers/political-parties.controller';
import { CreatePoliticalPartyUseCase } from './application/use-cases/create-political-party.use-case';
import { GetPoliticalPartyByIdUseCase } from './application/use-cases/get-political-party-by-id.use-case';
import { ListPoliticalPartiesUseCase } from './application/use-cases/list-political-parties.use-case';
import { RemovePoliticalPartyUseCase } from './application/use-cases/remove-political-party.use-case';
import { UpdatePoliticalPartyUseCase } from './application/use-cases/update-political-party.use-case';
import { PrismaPoliticalPartyRepository } from './infra/prisma/prisma-political-party.repository';
import { POLITICAL_PARTY_REPOSITORY } from './partidos-politicos.tokens';

@Module({
    controllers: [PoliticalPartiesController],
    providers: [
        CreatePoliticalPartyUseCase,
        ListPoliticalPartiesUseCase,
        GetPoliticalPartyByIdUseCase,
        UpdatePoliticalPartyUseCase,
        RemovePoliticalPartyUseCase,
        PrismaPoliticalPartyRepository,
        {
            provide: POLITICAL_PARTY_REPOSITORY,
            useExisting: PrismaPoliticalPartyRepository,
        },
    ],
    exports: [POLITICAL_PARTY_REPOSITORY],
})
export class PartidosPoliticosModule {}
