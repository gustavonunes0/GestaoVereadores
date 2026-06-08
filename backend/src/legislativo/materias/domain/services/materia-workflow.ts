import { BadRequestException } from '@nestjs/common';
import { StatusMateria } from '@prisma/client';
import { MatterStatus } from '../enums/matter-status.enum';
import { assertTramitationNotBlockedByMissingOpinion } from '../policies/matter-tramitation-policy';
import { LegislativeMatterDomainService } from './legislative-matter-domain.service';

const domainService = new LegislativeMatterDomainService();

function toMatterStatus(status: StatusMateria): MatterStatus {
    return status as MatterStatus;
}

function rethrowAsBadRequest(error: unknown): never {
    if (error instanceof Error) {
        throw new BadRequestException(error.message);
    }
    throw error;
}

/** Mantém `emTramitacao` alinhado ao enum durante a transição do modelo legado. */
export function syncEmTramitacaoFromStatus(status: StatusMateria): boolean {
    return domainService.syncEmTramitacaoFlag(toMatterStatus(status));
}

export function assertMateriaPodeEntrarNaPauta(materia: {
    id?: string;
    tenantId?: string;
    status: StatusMateria;
}) {
    assertTramitationNotBlockedByMissingOpinion({
        matterId: materia.id,
        tenantId: materia.tenantId,
    });

    try {
        domainService.assertCanEnterAgenda(toMatterStatus(materia.status));
    } catch (error) {
        rethrowAsBadRequest(error);
    }
}

export function assertMateriaPodeGerarNorma(materia: {
    status: StatusMateria;
}) {
    try {
        domainService.assertCanGenerateNorm(toMatterStatus(materia.status));
    } catch (error) {
        rethrowAsBadRequest(error);
    }
}

export function assertTransicaoStatusPermitida(
    statusAtual: StatusMateria,
    novoStatus: StatusMateria,
    context: { matterId?: string; tenantId?: string } = {},
) {
    assertTramitationNotBlockedByMissingOpinion(context);

    try {
        domainService.assertTransitionAllowed(
            toMatterStatus(statusAtual),
            toMatterStatus(novoStatus),
        );
    } catch (error) {
        rethrowAsBadRequest(error);
    }
}

export function mapResultadoPautaParaStatus(
    resultado: 'APROVADO' | 'REJEITADO',
): StatusMateria {
    return domainService.mapVoteResultToStatus(resultado) as StatusMateria;
}

export function mapResultadoVotacaoParaStatus(
    resultado: 'APROVADO' | 'REJEITADO',
): StatusMateria {
    return mapResultadoPautaParaStatus(resultado);
}

export function getMatterWorkflowCapabilities(status: StatusMateria) {
    return domainService.getWorkflowCapabilities(toMatterStatus(status));
}
