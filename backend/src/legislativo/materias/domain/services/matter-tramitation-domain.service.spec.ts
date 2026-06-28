import { MatterTramitationAction } from '../enums/matter-tramitation-action.enum';
import { MatterStatus } from '../enums/matter-status.enum';
import { MatterTramitationDomainService } from './matter-tramitation-domain.service';

describe('MatterTramitationDomainService', () => {
    const service = new MatterTramitationDomainService();

    it('inicia fluxo em DRAFT com ação PROTOCOLAR', () => {
        expect(service.getAvailableActions(MatterStatus.DRAFT)).toContain(
            MatterTramitationAction.PROTOCOLAR,
        );
        expect(
            service.resolveTransition(
                MatterStatus.DRAFT,
                MatterTramitationAction.PROTOCOLAR,
            ),
        ).toBe(MatterStatus.PROTOCOLADA);
    });

    it('permite colocar em pauta a partir de EM_TRAMITACAO', () => {
        expect(
            service.resolveTransition(
                MatterStatus.EM_TRAMITACAO,
                MatterTramitationAction.COLOCAR_EM_PAUTA,
            ),
        ).toBe(MatterStatus.EM_PAUTA);
    });

    it('permite aprovar de EM_PAUTA', () => {
        expect(
            service.resolveTransition(
                MatterStatus.EM_PAUTA,
                MatterTramitationAction.APROVAR,
            ),
        ).toBe(MatterStatus.APROVADA);
    });

    it('inicia votação a partir de EM_PAUTA', () => {
        expect(
            service.resolveTransition(
                MatterStatus.EM_PAUTA,
                MatterTramitationAction.INICIAR_VOTACAO,
            ),
        ).toBe(MatterStatus.EM_VOTACAO);
    });

    it('permite aprovar de EM_VOTACAO', () => {
        expect(
            service.resolveTransition(
                MatterStatus.EM_VOTACAO,
                MatterTramitationAction.APROVAR,
            ),
        ).toBe(MatterStatus.APROVADA);
    });

    it('bloqueia ação inválida no status atual', () => {
        expect(() =>
            service.resolveTransition(
                MatterStatus.ARQUIVADA,
                MatterTramitationAction.APROVAR,
            ),
        ).toThrow('Ação APROVAR não permitida no status ARQUIVADA');
    });

    it('permite transformar matéria aprovada em norma', () => {
        expect(
            service.resolveTransition(
                MatterStatus.APROVADA,
                MatterTramitationAction.TRANSFORMAR_EM_NORMA,
            ),
        ).toBe(MatterStatus.TRANSFORMADA_EM_NORMA);
    });
});
