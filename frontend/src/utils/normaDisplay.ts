import type { Norma } from '../api/normas.api';
import type { NormaStatus } from '../types/legislative';

export const LEI_TIPO_NOME = 'Lei';
export const LEI_COMPLEMENTAR_TIPO_NOME = 'Lei Complementar';

type TipoNormaOption = { id: string; nome: string };

export function findTipoNormaIdByNome(
    tipos: TipoNormaOption[],
    nome: string,
): string | undefined {
    return tipos.find((t) => t.nome === nome)?.id;
}

export function resolveDefaultTipoNormaId(tipos: TipoNormaOption[]): string {
    return findTipoNormaIdByNome(tipos, LEI_TIPO_NOME) ?? tipos[0]?.id ?? '';
}

export function isLeiComplementarTipo(
    tipos: TipoNormaOption[],
    tipoId?: string,
): boolean {
    if (!tipoId) return false;
    return tipos.find((t) => t.id === tipoId)?.nome === LEI_COMPLEMENTAR_TIPO_NOME;
}

export function resolveNormaAnoValor(
    ano: Norma['ano'] | number | undefined | null,
): number | undefined {
    if (ano == null) return undefined;
    if (typeof ano === 'number') return ano;
    return ano.valor;
}

export function resolveNormaStatus(norma: Pick<Norma, 'status'>): NormaStatus {
    return norma.status;
}

export function formatNormaIdentificacao(norma: Pick<Norma, 'tipo' | 'numero' | 'ano'>): string {
    const ano = resolveNormaAnoValor(norma.ano);
    return ano != null
        ? `${norma.tipo.nome} nº ${norma.numero}/${ano}`
        : `${norma.tipo.nome} nº ${norma.numero}`;
}

export function formatNormaEspecie(norma: Pick<Norma, 'tipo' | 'complementar'>): string {
    if (norma.complementar && norma.tipo.nome !== LEI_COMPLEMENTAR_TIPO_NOME) {
        return `${norma.tipo.nome} (complementar)`;
    }
    return norma.tipo.nome;
}
