import { Module } from '@nestjs/common';
import { NormasController } from './application/controllers/normas.controller';
import { CreateNormaUseCase } from './application/use-cases/create-norma.use-case';
import { GetNormaByIdUseCase } from './application/use-cases/get-norma-by-id.use-case';
import { ListNormasUseCase } from './application/use-cases/list-normas.use-case';
import { ListPublicNormasUseCase } from './application/use-cases/list-public-normas.use-case';
import { RegistrarPromulgacaoUseCase } from './application/use-cases/registrar-promulgacao.use-case';
import { RegistrarPublicacaoUseCase } from './application/use-cases/registrar-publicacao.use-case';
import { RegistrarSancaoUseCase } from './application/use-cases/registrar-sancao.use-case';
import { RegistrarVetoUseCase } from './application/use-cases/registrar-veto.use-case';
import { RemoveNormaUseCase } from './application/use-cases/remove-norma.use-case';
import { RevogarNormaUseCase } from './application/use-cases/revogar-norma.use-case';
import { UpdateNormaUseCase } from './application/use-cases/update-norma.use-case';
import { UploadNormaAudioUseCase } from './application/use-cases/upload-norma-audio.use-case';
import { UploadNormaTextoIntegralUseCase } from './application/use-cases/upload-norma-texto-integral.use-case';
import { NormaRepository } from './domain/repositories/norma.repository';
import { MateriaOrigemValidator } from './infra/integrations/materia-origem-validator';
import { PrismaNormaRepository } from './infra/prisma/prisma-norma.repository';

@Module({
    controllers: [NormasController],
    providers: [
        CreateNormaUseCase,
        ListNormasUseCase,
        ListPublicNormasUseCase,
        GetNormaByIdUseCase,
        UpdateNormaUseCase,
        RemoveNormaUseCase,
        RegistrarSancaoUseCase,
        RegistrarVetoUseCase,
        RegistrarPromulgacaoUseCase,
        RegistrarPublicacaoUseCase,
        RevogarNormaUseCase,
        UploadNormaTextoIntegralUseCase,
        UploadNormaAudioUseCase,
        MateriaOrigemValidator,
        {
            provide: NormaRepository,
            useClass: PrismaNormaRepository,
        },
    ],
    exports: [NormaRepository, ListPublicNormasUseCase],
})
export class NormasModule {}
