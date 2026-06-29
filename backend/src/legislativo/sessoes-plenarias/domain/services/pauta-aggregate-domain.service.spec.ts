import { StatusPautaItem } from '../enums/status-pauta-item.enum';
import { PautaAggregateDomainService } from './pauta-aggregate-domain.service';

describe('PautaAggregateDomainService', () => {
    const service = new PautaAggregateDomainService();

    describe('assertPodePublicar', () => {
        it('rejeita quando não há pauta', () => {
            expect(() => service.assertPodePublicar(undefined)).toThrow(
                'Não há pauta cadastrada para esta sessão',
            );
        });

        it('rejeita pauta já publicada', () => {
            expect(() =>
                service.assertPodePublicar({
                    status: StatusPautaItem.PUBLICADA,
                    totalItens: 2,
                }),
            ).toThrow('Pauta já está publicada');
        });

        it('rejeita pauta vazia', () => {
            expect(() =>
                service.assertPodePublicar({
                    status: StatusPautaItem.RASCUNHO,
                    totalItens: 0,
                }),
            ).toThrow('Não é possível publicar uma pauta vazia');
        });

        it('aceita pauta em rascunho com itens', () => {
            expect(() =>
                service.assertPodePublicar({
                    status: StatusPautaItem.RASCUNHO,
                    totalItens: 3,
                }),
            ).not.toThrow();
        });
    });

    describe('assertMateriaSemPautaAtivaEmOutraSessao', () => {
        it('rejeita matéria em outra sessão', () => {
            expect(() =>
                service.assertMateriaSemPautaAtivaEmOutraSessao(
                    'mat-1',
                    'sessao-a',
                    { materiaId: 'mat-1', sessaoId: 'sessao-b' },
                ),
            ).toThrow('Matéria já consta na pauta ativa de outra sessão plenária');
        });

        it('aceita quando não há conflito', () => {
            expect(() =>
                service.assertMateriaSemPautaAtivaEmOutraSessao(
                    'mat-1',
                    'sessao-a',
                    null,
                ),
            ).not.toThrow();
        });
    });
});
