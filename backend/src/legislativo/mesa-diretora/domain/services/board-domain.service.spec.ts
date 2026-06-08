import { BoardDomainService } from './board-domain.service';

describe('BoardDomainService', () => {
    const service = new BoardDomainService();

    it('valida período customizado sem exigir duração fixa', () => {
        const oneYearStart = new Date('2025-01-01');
        const oneYearEnd = new Date('2025-12-31');
        expect(() =>
            service.assertDateRange(oneYearStart, oneYearEnd),
        ).not.toThrow();

        const fourYearsEnd = new Date('2028-12-31');
        expect(() =>
            service.assertDateRange(oneYearStart, fourYearsEnd),
        ).not.toThrow();
    });

    it('permite mesa sem data fim', () => {
        expect(() =>
            service.assertDateRange(new Date('2025-01-01'), null),
        ).not.toThrow();
    });

    it('bloqueia data fim anterior à data início', () => {
        expect(() =>
            service.assertDateRange(
                new Date('2026-01-01'),
                new Date('2025-01-01'),
            ),
        ).toThrow('Data fim não pode ser anterior à data início');
    });

    it('bloqueia cargo já ocupado na mesma mesa', () => {
        expect(() => service.assertRoleNotOccupied(true)).toThrow(
            'Este cargo já está ocupado nesta mesa diretora',
        );
    });

    it('bloqueia parlamentar com segundo cargo na mesma mesa', () => {
        expect(() => service.assertParliamentarianNotOnBoard(true)).toThrow(
            'Parlamentar já integra esta mesa diretora',
        );
    });

    it('bloqueia nome de cargo duplicado no tenant', () => {
        expect(() => service.assertRoleNameAvailable(true)).toThrow(
            'Já existe cargo da mesa com este nome',
        );
    });
});
