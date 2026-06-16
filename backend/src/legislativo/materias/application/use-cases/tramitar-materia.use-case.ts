import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { MatterStatus } from '../../domain/enums/matter-status.enum';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { TramitarMateriaDto } from '../dto/tramitar-materia.dto';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';

const DESPACHO_OBRIGATORIO: MatterStatus[] = [
    MatterStatus.EM_TRAMITACAO,
    MatterStatus.APROVADA,
    MatterStatus.REJEITADA,
];

@Injectable()
export class TramitarMateriaUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(
        tenantId: string,
        materiaId: string,
        dto: TramitarMateriaDto,
        responsavelId?: string,
    ) {
        let materia: MateriaPrismaPayload;
        try {
            materia = (await this.repository.findOne(
                tenantId,
                materiaId,
            )) as MateriaPrismaPayload;
        } catch {
            throw new NotFoundException('Matéria não encontrada');
        }

        const statusAtual = materia.status as MatterStatus;

        const TRANSICOES: Record<MatterStatus, MatterStatus[]> = {
            [MatterStatus.DRAFT]: [MatterStatus.PROTOCOLADA],
            [MatterStatus.PROTOCOLADA]: [MatterStatus.EM_TRAMITACAO],
            [MatterStatus.EM_TRAMITACAO]: [
                MatterStatus.EM_PAUTA,
                MatterStatus.ARQUIVADA,
                MatterStatus.RETIRADA,
            ],
            [MatterStatus.EM_PAUTA]: [
                MatterStatus.APROVADA,
                MatterStatus.REJEITADA,
                MatterStatus.EM_TRAMITACAO,
            ],
            [MatterStatus.APROVADA]: [MatterStatus.TRANSFORMADA_EM_NORMA],
            [MatterStatus.REJEITADA]: [],
            [MatterStatus.ARQUIVADA]: [],
            [MatterStatus.RETIRADA]: [],
            [MatterStatus.TRANSFORMADA_EM_NORMA]: [],
        };

        if (!(TRANSICOES[statusAtual] ?? []).includes(dto.novoStatus)) {
            throw new BadRequestException(
                `Transição inválida: ${statusAtual} → ${dto.novoStatus}`,
            );
        }

        if (DESPACHO_OBRIGATORIO.includes(dto.novoStatus) && !dto.despacho?.trim()) {
            throw new BadRequestException(
                `Despacho é obrigatório para transição para ${dto.novoStatus}`,
            );
        }

        await this.repository.tramitar(materiaId, tenantId, {
            statusAnterior: statusAtual,
            novoStatus: dto.novoStatus,
            responsavelId,
            despacho: dto.despacho,
            observacao: dto.observacao,
            unidadeDestinoId: dto.unidadeDestinoId,
        });

        const atualizada = (await this.repository.findOne(
            tenantId,
            materiaId,
        )) as MateriaPrismaPayload;

        return MatterViewModel.toHttp(atualizada);
    }
}
