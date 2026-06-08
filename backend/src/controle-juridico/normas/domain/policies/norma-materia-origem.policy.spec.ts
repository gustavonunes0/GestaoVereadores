import { StatusMateria } from '@prisma/client';
import {
    assertMateriaOrigemPodeGerarNorma,
    materiaOrigemPodeGerarNorma,
    MATERIA_ORIGEM_STATUSES_BLOQUEADOS,
    MATERIA_ORIGEM_STATUSES_PERMITIDOS,
} from './norma-materia-origem.policy';

describe('norma-materia-origem.policy', () => {
    it('permite apenas matéria APROVADA', () => {
        expect(MATERIA_ORIGEM_STATUSES_PERMITIDOS).toEqual([
            StatusMateria.APROVADA,
        ]);
        expect(materiaOrigemPodeGerarNorma(StatusMateria.APROVADA)).toBe(true);
    });

    it('bloqueia matéria rejeitada, arquivada e retirada', () => {
        for (const status of MATERIA_ORIGEM_STATUSES_BLOQUEADOS) {
            expect(materiaOrigemPodeGerarNorma(status)).toBe(false);
            expect(() =>
                assertMateriaOrigemPodeGerarNorma({ status }),
            ).toThrow('A matéria informada não pode gerar norma');
        }
    });

    it('bloqueia matéria em tramitação', () => {
        expect(materiaOrigemPodeGerarNorma(StatusMateria.EM_TRAMITACAO)).toBe(
            false,
        );
        expect(() =>
            assertMateriaOrigemPodeGerarNorma({
                status: StatusMateria.EM_TRAMITACAO,
            }),
        ).toThrow('A matéria informada não pode gerar norma');
    });

    it('não lança para matéria aprovada', () => {
        expect(() =>
            assertMateriaOrigemPodeGerarNorma({
                status: StatusMateria.APROVADA,
            }),
        ).not.toThrow();
    });
});
