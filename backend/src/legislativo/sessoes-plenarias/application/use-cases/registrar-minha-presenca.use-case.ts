import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { ParlamentarianJwtPayload } from '../../../../auth/domain/types/jwt-payload.type';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class RegistrarMinhaPresencaUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
        private readonly prisma: PrismaService,
    ) {}

    async execute(sessaoId: string, user: ParlamentarianJwtPayload) {
        const sessao = await this.repository.findSessaoById(sessaoId, user.tenantId);
        if (!sessao) throw new NotFoundException('Sessão não encontrada');

        if (
            sessao.statusSessao !== StatusSessao.ABERTA &&
            sessao.statusSessao !== StatusSessao.AGENDADA
        ) {
            throw new UnprocessableEntityException(
                'Registro de presença permitido apenas em sessão agendada ou aberta',
            );
        }

        return this.prisma.presencaSessao.upsert({
            where: {
                sessaoId_parliamentarianId: {
                    sessaoId,
                    parliamentarianId: user.parliamentarianId,
                },
            },
            update: {
                presente: true,
                situacao: 'PRESENTE',
                autoRegistrado: true,
                registradoEm: new Date(),
            },
            create: {
                sessaoId,
                parliamentarianId: user.parliamentarianId,
                presente: true,
                situacao: 'PRESENTE',
                autoRegistrado: true,
                registradoEm: new Date(),
            },
        });
    }
}
