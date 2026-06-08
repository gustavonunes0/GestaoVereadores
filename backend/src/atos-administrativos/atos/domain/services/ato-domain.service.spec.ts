import { AtoDomainService } from './ato-domain.service';

describe('AtoDomainService', () => {
    const service = new AtoDomainService();

    it('identifica natureza administrativa', () => {
        expect(service.natureza).toBe('ADMINISTRATIVO');
    });

    it('valida existência de tipo e classificação', () => {
        expect(() => service.assertTipoExists(false)).toThrow(
            'Tipo de ato não encontrado',
        );
        expect(() => service.assertClassificacaoExists(false)).toThrow(
            'Classificação de ato não encontrada',
        );
    });

    it('valida vigência: dataFim não anterior a dataInicio', () => {
        const inicio = new Date('2024-06-01');
        const fim = new Date('2024-05-01');

        expect(() => service.assertVigenciaDates(inicio, fim)).toThrow(
            'Data final não pode ser anterior à data inicial',
        );
        expect(() => service.assertVigenciaDates(inicio, null)).not.toThrow();
        expect(() =>
            service.assertVigenciaDates(inicio, new Date('2024-07-01')),
        ).not.toThrow();
    });

    it('valida publicação: dataPublicacaoFim não anterior a dataPublicacaoInicio', () => {
        const inicio = new Date('2024-06-01');
        const fim = new Date('2024-05-01');

        expect(() => service.assertPublicacaoDates(inicio, fim)).toThrow(
            'Data final de publicação não pode ser anterior à data inicial de publicação',
        );
        expect(() =>
            service.assertPublicacaoDates(inicio, new Date('2024-07-01')),
        ).not.toThrow();
    });

    it('valida ambos os intervalos em assertDateRanges', () => {
        expect(() =>
            service.assertDateRanges({
                dataInicio: new Date('2024-06-01'),
                dataFim: new Date('2024-05-01'),
                dataPublicacaoInicio: new Date('2024-06-01'),
                dataPublicacaoFim: new Date('2024-07-01'),
            }),
        ).toThrow('Data final não pode ser anterior à data inicial');
    });
});
