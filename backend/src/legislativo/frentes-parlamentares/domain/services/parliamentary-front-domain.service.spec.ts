import { ParliamentaryFrontDomainService } from './parliamentary-front-domain.service';

describe('ParliamentaryFrontDomainService', () => {
    const service = new ParliamentaryFrontDomainService();

    it('exige tema da frente', () => {
        expect(() => service.assertThemeProvided('  ')).toThrow(
            'Tema da frente é obrigatório',
        );
    });

    it('valida período opcional', () => {
        expect(() =>
            service.assertDateRange(
                new Date('2025-01-01'),
                new Date('2025-12-31'),
            ),
        ).not.toThrow();
    });

    it('bloqueia parlamentar duplicado na frente', () => {
        expect(() =>
            service.assertParliamentarianNotOnFront(true),
        ).toThrow('Parlamentar já integra esta frente parlamentar');
    });
});
