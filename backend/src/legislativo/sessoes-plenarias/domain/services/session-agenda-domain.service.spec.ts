import { SessionAgendaDomainService } from './session-agenda-domain.service';
import { AgendaPhase } from '../enums/agenda-phase.enum';

describe('SessionAgendaDomainService', () => {
    const service = new SessionAgendaDomainService();

    it('usa ORDEM_DO_DIA como fase padrão', () => {
        expect(service.getDefaultPhase()).toBe(AgendaPhase.ORDEM_DO_DIA);
    });

    it('impede ordem duplicada na sessão', () => {
        expect(() =>
            service.assertOrderAvailable(1, [
                { id: 'a', materiaId: 'm1', ordem: 1 },
            ]),
        ).toThrow('Ordem 1 já está em uso');
    });

    it('impede matéria duplicada na sessão', () => {
        expect(() =>
            service.assertMatterNotInAgenda('m1', [
                { id: 'a', materiaId: 'm1', ordem: 1 },
            ]),
        ).toThrow('Matéria já consta na pauta');
    });

    it('exige item na pauta para votação', () => {
        expect(() => service.assertItemOnAgenda(null)).toThrow(
            'Matéria precisa estar na pauta',
        );
        expect(() =>
            service.assertItemOnAgenda({ isRemoved: true }),
        ).toThrow('Matéria precisa estar na pauta');
    });

    it('permite reutilizar ordem ao editar outro item', () => {
        expect(() =>
            service.assertOrderAvailable(
                2,
                [
                    { id: 'a', materiaId: 'm1', ordem: 1 },
                    { id: 'b', materiaId: 'm2', ordem: 2 },
                ],
                'b',
            ),
        ).not.toThrow();
    });
});
