import { describe, expect, it } from 'vitest';
import type { PresencaParlamentar, PresencaSessao } from '../../../../../types/presenca';
import { mapPresencaToCouncilors } from '../mapPresencaToCouncilors';

function parl(
    partial: Partial<PresencaParlamentar> &
        Pick<PresencaParlamentar, 'parliamentarianId' | 'parliamentaryName'>,
): PresencaParlamentar {
    return {
        parlamentarianUserId: partial.parliamentarianId,
        abreviacao: 'XX',
        presente: true,
        situacao: 'PRESENTE',
        origem: 'STAFF',
        ...partial,
    };
}

function makePresenca(
    mesa: PresencaParlamentar[],
    vereadores: PresencaParlamentar[],
): PresencaSessao {
    const parlamentares = [...mesa, ...vereadores];
    return {
        sessaoId: 's1',
        totalMembros: parlamentares.length,
        presentes: parlamentares.filter((p) => p.presente).length,
        ausentes: 0,
        quorumMinimo: 7,
        temQuorum: true,
        parlamentares,
        mesaMembros: mesa,
        vereadores,
    };
}

describe('mapPresencaToCouncilors', () => {
    it('propaga partido em maiúsculas para cards de parlamentares e mesa', () => {
        const mesa = [
            parl({
                parliamentarianId: 'p1',
                parliamentaryName: 'João Paulo',
                cargoMesa: 'Presidente',
                partidoSigla: 'republicanos',
            }),
        ];
        const vereadores = [
            parl({
                parliamentarianId: 'v1',
                parliamentaryName: 'Edwin Bezerra Oliveira',
                partidoSigla: 'prd',
            }),
        ];

        const mapped = mapPresencaToCouncilors({
            presenca: makePresenca(mesa, vereadores),
        });

        expect(mapped.president?.party).toBe('REPUBLICANOS');
        expect(mapped.right[0]?.party).toBe('PRD');
        expect(mapped.right[0]?.name).toBe('Edwin Bezerra Oliveira');
    });

    it('usa string vazia quando não há partido (card mostra placeholder)', () => {
        const mapped = mapPresencaToCouncilors({
            presenca: makePresenca(
                [],
                [
                    parl({
                        parliamentarianId: 'v1',
                        parliamentaryName: 'Sem Partido',
                    }),
                ],
            ),
        });

        expect(mapped.right[0]?.party).toBe('');
    });

    it('marca ausente quando situação não é PRESENTE', () => {
        const mapped = mapPresencaToCouncilors({
            presenca: makePresenca(
                [],
                [
                    parl({
                        parliamentarianId: 'v1',
                        parliamentaryName: 'Ausente',
                        presente: false,
                        situacao: 'AUSENTE',
                        origem: null,
                        partidoSigla: 'PL',
                    }),
                ],
            ),
        });

        expect(mapped.right[0]?.status).toBe('ausente');
        expect(mapped.right[0]?.party).toBe('PL');
    });
});
