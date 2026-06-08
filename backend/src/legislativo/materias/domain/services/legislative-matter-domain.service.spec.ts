import { StatusMateria } from '@prisma/client';
import { MatterStatus } from '../enums/matter-status.enum';
import { MatterTramitationAction } from '../enums/matter-tramitation-action.enum';
import { LegislativeMatterDomainService } from './legislative-matter-domain.service';
import {
    assertMateriaPodeEntrarNaPauta,
    assertMateriaPodeGerarNorma,
    assertTransicaoStatusPermitida,
    getMatterWorkflowCapabilities,
    mapResultadoVotacaoParaStatus,
    syncEmTramitacaoFromStatus,
} from './materia-workflow';

describe('LegislativeMatterDomainService', () => {
    const service = new LegislativeMatterDomainService();

    it('inicia matéria em DRAFT', () => {
        expect(service.getDefaultStatus()).toBe(MatterStatus.DRAFT);
    });

    it('permite tramitação em PROTOCOLADA e pauta em EM_TRAMITACAO', () => {
        const protocolada = service.getWorkflowCapabilities(
            MatterStatus.PROTOCOLADA,
        );
        expect(protocolada.canTramitate).toBe(true);
        expect(protocolada.canEnterAgenda).toBe(false);

        const emTramitacao = service.getWorkflowCapabilities(
            MatterStatus.EM_TRAMITACAO,
        );
        expect(emTramitacao.canEnterAgenda).toBe(true);
        expect(emTramitacao.canBeVoted).toBe(true);
        expect(emTramitacao.canGenerateNorm).toBe(false);

        const emPauta = service.getWorkflowCapabilities(MatterStatus.EM_PAUTA);
        expect(emPauta.canBeVoted).toBe(true);

        const aprovada = service.getWorkflowCapabilities(MatterStatus.APROVADA);
        expect(aprovada.canTramitate).toBe(false);
        expect(aprovada.canGenerateNorm).toBe(true);
    });

    it('define transições válidas via ações de tramitação', () => {
        expect(
            service.getAllowedTransitions(MatterStatus.EM_TRAMITACAO),
        ).toEqual(
            expect.arrayContaining([
                MatterStatus.EM_PAUTA,
                MatterStatus.APROVADA,
                MatterStatus.REJEITADA,
                MatterStatus.ARQUIVADA,
                MatterStatus.RETIRADA,
            ]),
        );
        expect(
            service.getAllowedTransitions(MatterStatus.RETIRADA),
        ).toContain(MatterStatus.EM_TRAMITACAO);
        expect(service.getAllowedTransitions(MatterStatus.ARQUIVADA)).toEqual(
            [],
        );
    });

    it('bloqueia transição inválida', () => {
        expect(() =>
            service.assertTransitionAllowed(
                MatterStatus.ARQUIVADA,
                MatterStatus.EM_TRAMITACAO,
            ),
        ).toThrow('Transição de status inválida');
    });

    it('mapeia resultado de votação para status final', () => {
        expect(service.mapVoteResultToStatus('APROVADO')).toBe(
            MatterStatus.APROVADA,
        );
        expect(service.mapVoteResultToStatus('REJEITADO')).toBe(
            MatterStatus.REJEITADA,
        );
    });

    it('expõe serviço de tramitação com ação PROTOCOLAR', () => {
        const tramitation = service.getTramitationService();
        expect(
            tramitation.getAvailableActions(MatterStatus.DRAFT),
        ).toContain(MatterTramitationAction.PROTOCOLAR);
    });
});

describe('materia-workflow facade', () => {
    it('sincroniza flag emTramitacao', () => {
        expect(syncEmTramitacaoFromStatus(StatusMateria.EM_TRAMITACAO)).toBe(
            true,
        );
        expect(syncEmTramitacaoFromStatus(StatusMateria.EM_PAUTA)).toBe(true);
        expect(syncEmTramitacaoFromStatus(StatusMateria.APROVADA)).toBe(false);
    });

    it('expõe capacidades do fluxo', () => {
        const caps = getMatterWorkflowCapabilities(StatusMateria.EM_TRAMITACAO);
        expect(caps.canEnterAgenda).toBe(true);
    });

    it('permite matéria em tramitação entrar na pauta', () => {
        expect(() =>
            assertMateriaPodeEntrarNaPauta({
                id: 'm1',
                tenantId: 't1',
                status: StatusMateria.EM_TRAMITACAO,
            }),
        ).not.toThrow();
    });

    it('bloqueia matéria aprovada na pauta', () => {
        expect(() =>
            assertMateriaPodeEntrarNaPauta({
                status: StatusMateria.APROVADA,
            }),
        ).toThrow('Somente matérias com status EM_TRAMITACAO');
    });

    it('permite gerar norma apenas de matéria aprovada', () => {
        expect(() =>
            assertMateriaPodeGerarNorma({ status: StatusMateria.APROVADA }),
        ).not.toThrow();
        expect(() =>
            assertMateriaPodeGerarNorma({ status: StatusMateria.EM_TRAMITACAO }),
        ).toThrow('Norma jurídica só pode ser criada');
    });

    it('valida transição EM_TRAMITACAO → APROVADA', () => {
        expect(() =>
            assertTransicaoStatusPermitida(
                StatusMateria.EM_TRAMITACAO,
                StatusMateria.APROVADA,
            ),
        ).not.toThrow();
    });

    it('mapeia votação para status', () => {
        expect(mapResultadoVotacaoParaStatus('APROVADO')).toBe(
            StatusMateria.APROVADA,
        );
    });
});

describe('LegislativeMatterEntity', () => {
    it('cria proposição com status inicial DRAFT', async () => {
        const { LegislativeMatterEntity } = await import(
            '../entities/legislative-matter.entity'
        );
        const matter = LegislativeMatterEntity.create({
            tenantId: 'tenant-1',
            tipoId: 'tipo-1',
            ementa: 'Dispõe sobre teste legislativo.',
        });
        expect(matter.status).toBe(MatterStatus.DRAFT);
    });
});
