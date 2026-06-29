import type { Parliamentarian } from '../api/legislative/parlamentares.api';
import type { BoardMember } from '../api/legislative/mesa-diretora.api';
import type { PresencaParlamentar, PresencaSessao } from '../types/presenca';
import { abreviarNome, ordenarCargosMesa } from './plenarioLayout';

export interface PresencaRegistroApi {
    id: string;
    sessaoId: string;
    parlamentarId?: string | null;
    parliamentarianId?: string | null;
    presente: boolean;
    situacao: { value: string; label: string };
    autoRegistrado?: boolean;
    registradoEm?: string | null;
    createdAt?: string;
    parlamentar?: { id: string; nome: string | null } | null;
    parliamentarian?: { id: string; parliamentaryName?: string | null } | null;
}

function estaPresente(registro: PresencaRegistroApi | undefined): boolean {
    if (!registro) return false;
    if (!registro.presente) return false;
    return registro.situacao.value === 'PRESENTE';
}

function origemFromRegistro(registro: PresencaRegistroApi | undefined): PresencaParlamentar['origem'] {
    if (!registro || !estaPresente(registro)) return null;
    return registro.autoRegistrado ? 'APP' : 'STAFF';
}

function mapParlamentar(
    p: Parliamentarian,
    registro: PresencaRegistroApi | undefined,
    cargoMesa?: string,
): PresencaParlamentar {
    const partido =
        p.user?.politicalParty?.acronym ??
        p.user?.politicalParty?.name;

    return {
        parliamentarianId: p.id,
        parlamentarianUserId: p.id,
        presencaId: registro?.id,
        parliamentaryName: p.parliamentaryName,
        abreviacao: abreviarNome(p.parliamentaryName),
        partidoSigla: partido,
        gabinete: p.officeNumber,
        cargoMesa,
        fotoUrl: p.photoUrl,
        presente: estaPresente(registro),
        origem: origemFromRegistro(registro),
        registradoEm: registro?.registradoEm ?? registro?.createdAt,
    };
}

function mapFromBoardMember(
    membro: BoardMember,
    registro: PresencaRegistroApi | undefined,
): PresencaParlamentar {
    const p = membro.parliamentarian;
    const partido = p.politicalParty?.acronym ?? p.politicalParty?.name;

    return {
        parliamentarianId: p.id,
        parlamentarianUserId: p.id,
        presencaId: registro?.id,
        parliamentaryName: p.parliamentaryName,
        abreviacao: abreviarNome(p.parliamentaryName),
        partidoSigla: partido,
        gabinete: p.officeNumber ?? undefined,
        cargoMesa: membro.boardRole.name,
        fotoUrl: p.photoUrl ?? undefined,
        presente: estaPresente(registro),
        origem: origemFromRegistro(registro),
        registradoEm: registro?.registradoEm ?? registro?.createdAt,
    };
}

export function indexPresencasPorParliamentarian(
    registros: PresencaRegistroApi[],
): Map<string, PresencaRegistroApi> {
    const map = new Map<string, PresencaRegistroApi>();
    for (const registro of registros) {
        if (registro.parliamentarianId) {
            map.set(registro.parliamentarianId, registro);
        }
    }
    return map;
}

export function buildPresencaSessao(params: {
    sessaoId: string;
    parlamentares: Parliamentarian[];
    mesaMembros: BoardMember[];
    registros: PresencaRegistroApi[];
    quorumMinimo?: number;
}): PresencaSessao {
    const porParl = indexPresencasPorParliamentarian(params.registros);
    const parlPorId = new Map(params.parlamentares.map((p) => [p.id, p]));

    const mesaOrdenada = [...params.mesaMembros].sort((a, b) =>
        ordenarCargosMesa(a.boardRole.name, b.boardRole.name),
    );

    const mesaIds = new Set(mesaOrdenada.map((m) => m.parliamentarian.id));

    const mesaMembros = mesaOrdenada.map((membro) => {
        const registro = porParl.get(membro.parliamentarian.id);
        const parl = parlPorId.get(membro.parliamentarian.id);
        if (parl) {
            return mapParlamentar(parl, registro, membro.boardRole.name);
        }
        return mapFromBoardMember(membro, registro);
    });

    const vereadores = params.parlamentares
        .filter((p) => !mesaIds.has(p.id))
        .map((p) => mapParlamentar(p, porParl.get(p.id)));

    const parlamentares = [...mesaMembros, ...vereadores];
    const presentes = parlamentares.filter((p) => p.presente).length;
    const total = parlamentares.length;
    const quorumMinimo = params.quorumMinimo ?? Math.floor(total / 2) + 1;

    return {
        sessaoId: params.sessaoId,
        totalMembros: total,
        presentes,
        ausentes: total - presentes,
        quorumMinimo,
        temQuorum: presentes >= quorumMinimo,
        parlamentares,
        mesaMembros,
        vereadores,
    };
}

export async function resolveLegislatureIdEn(params: {
    /** ID do model `Legislature` (EN) — preferido quando já conhecido. */
    legislatureId?: string;
    /** Número da legislatura — resolve o ID EN quando a sessão só traz `Legislatura` (PT legado). */
    legislaturaNumero?: number;
}): Promise<string | undefined> {
    const { legislaturasApi } = await import('../api/legislative/legislaturas.api');
    const res = await legislaturasApi.list({ limit: 50 });

    if (params.legislatureId) {
        const byId = res.data.find((l) => l.id === params.legislatureId);
        if (byId) return byId.id;
    }

    if (params.legislaturaNumero != null) {
        const byNum = res.data.find((l) => l.number === params.legislaturaNumero);
        if (byNum) return byNum.id;
    }

    return undefined;
}

export async function fetchMesaMembrosAtivos(params: {
    legislatureId?: string;
    legislaturaNumero?: number;
}): Promise<BoardMember[]> {
    const legislatureIdEn = await resolveLegislatureIdEn(params);
    if (!legislatureIdEn) return [];

    const { mesaDiretoraApi } = await import('../api/legislative/mesa-diretora.api');
    const res = await mesaDiretoraApi.list({
        legislatureId: legislatureIdEn,
        status: 'ACTIVE',
        limit: 10,
    });
    const board =
        res.data.find((b) => b.status === 'ACTIVE' && b.members.length > 0) ??
        res.data[0];
    return board?.members ?? [];
}
