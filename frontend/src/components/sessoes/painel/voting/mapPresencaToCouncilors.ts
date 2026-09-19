import type { PresencaParlamentar, PresencaSessao } from '../../../../types/presenca';
import { resolveSituacaoCadeira } from '../../../../utils/presencaCadeira';
import { isPresidenteMesa } from '../../../../utils/plenarioLayout';
import type { Councilor, CouncilorRole, CouncilorStatus } from './types';

function mapCargoToRole(cargo?: string): CouncilorRole | undefined {
    if (!cargo) return undefined;
    const c = cargo.toLowerCase();
    if (c.includes('presidente') && !c.includes('vice')) return 'PRESIDENTE';
    if (c.includes('vice')) return 'VICE';
    if (
        c.includes('1') ||
        c.includes('primeiro') ||
        c.includes('1º') ||
        c.includes('1o')
    ) {
        return '1SEC';
    }
    if (
        c.includes('2') ||
        c.includes('segundo') ||
        c.includes('2º') ||
        c.includes('2o')
    ) {
        return '2SEC';
    }
    return undefined;
}

function resolveStatus(
    p: PresencaParlamentar,
    idsQueVotaram: Set<string>,
    revealNominal: boolean,
): CouncilorStatus {
    const situacao = resolveSituacaoCadeira(p);
    if (situacao !== 'PRESENTE') return 'ausente';

    const votou = idsQueVotaram.has(p.parliamentarianId);
    if (!votou) return 'presente';

    // MVP: WS não envia opção individual em tempo real → indicador neutro.
    // Quando houver payload nominal no futuro, mapear para sim/nao/abstencao.
    void revealNominal;
    return 'votou';
}

export function mapPresencaToCouncilors(params: {
    presenca: PresencaSessao;
    idsQueVotaram?: Set<string> | null;
    /** Se true, permite revelar opção (hoje ainda não há dados no placar). */
    revealNominalVotes?: boolean;
}): {
    president: Councilor | null;
    left: Councilor[];
    right: Councilor[];
    all: Councilor[];
} {
    const idsQueVotaram = params.idsQueVotaram ?? new Set<string>();
    const revealNominal = params.revealNominalVotes === true;

    const toCouncilor = (
        p: PresencaParlamentar,
        side: 'left' | 'right',
        role?: CouncilorRole,
    ): Councilor => ({
        id: p.parliamentarianId,
        name: p.parliamentaryName,
        party: (p.partidoSigla ?? '').toUpperCase(),
        role: role ?? mapCargoToRole(p.cargoMesa),
        cargoLabel: p.cargoMesa,
        status: resolveStatus(p, idsQueVotaram, revealNominal),
        side,
        photoUrl: p.fotoUrl ?? null,
    });

    const mesa = params.presenca.mesaMembros;
    const presidenteRaw =
        mesa.find((m) => isPresidenteMesa(m.cargoMesa)) ?? null;

    const president = presidenteRaw
        ? toCouncilor(presidenteRaw, 'left', 'PRESIDENTE')
        : null;

    const left = mesa
        .filter((m) => m.parliamentarianId !== presidenteRaw?.parliamentarianId)
        .map((m) => toCouncilor(m, 'left'));

    const idsMesa = new Set(mesa.map((m) => m.parliamentarianId));
    const right = params.presenca.parlamentares
        .filter((p) => !idsMesa.has(p.parliamentarianId))
        .map((p) => toCouncilor(p, 'right'));

    const all = [
        ...(president ? [president] : []),
        ...left,
        ...right,
    ];

    return { president, left, right, all };
}
