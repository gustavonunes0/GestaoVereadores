import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaSessaoHistoricoRepository } from './infra/prisma/prisma-sessao-historico.repository';
import { SessaoHistoricoRepository } from './domain/repositories/sessao-historico.repository';
import { SESSAO_HISTORICO_REPOSITORY } from './sessao-historico.tokens';
import { ListSessaoHistoricoUseCase } from './application/use-cases/list-sessao-historico.use-case';

/**
 * Módulo pequeno e independente (só depende de PrismaModule) para que possa ser importado
 * tanto por `SessoesPlenariasModule` quanto por `VotacoesModule` sem criar dependência
 * circular entre eles — `VotacoesModule` já é importado por `SessoesPlenariasModule`.
 */
@Module({
    imports: [PrismaModule],
    providers: [
        PrismaSessaoHistoricoRepository,
        {
            provide: SESSAO_HISTORICO_REPOSITORY,
            useExisting: PrismaSessaoHistoricoRepository,
        },
        {
            provide: SessaoHistoricoRepository,
            useExisting: PrismaSessaoHistoricoRepository,
        },
        ListSessaoHistoricoUseCase,
    ],
    exports: [SESSAO_HISTORICO_REPOSITORY, SessaoHistoricoRepository, ListSessaoHistoricoUseCase],
})
export class SessaoHistoricoModule {}
