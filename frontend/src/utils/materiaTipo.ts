const TIPOS_COM_REPRESENTANTES = ['moção', 'mocao', 'requerimento'] as const;

const TIPOS_PROJETO_LEI = ['projeto de lei', 'projeto lei'] as const;

function normalizarNomeTipo(nome: string): string {
    return nome.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

function nomeDoTipo(
    tipoId: string,
    tiposMateria: { id: string; nome: string }[],
): string {
    return normalizarNomeTipo(
        tiposMateria.find((t) => t.id === tipoId)?.nome ?? '',
    );
}

function combinaPadroes(nome: string, padroes: readonly string[]): boolean {
    return padroes.some((padrao) => nome === padrao || nome.includes(padrao));
}

/** Moção e Requerimento — representantes (vereadores signatários). */
export function tipoPermiteMultiplosRepresentantes(
    tipoId: string,
    tiposMateria: { id: string; nome: string }[],
): boolean {
    return combinaPadroes(
        nomeDoTipo(tipoId, tiposMateria),
        TIPOS_COM_REPRESENTANTES,
    );
}

/** Projeto de Lei — autor, coautor(es) e relator. */
export function isTipoProjetoLei(
    tipoId: string,
    tiposMateria: { id: string; nome: string }[],
): boolean {
    return nomeEhProjetoLei(nomeDoTipo(tipoId, tiposMateria));
}

export function nomeEhProjetoLei(nomeTipo: string): boolean {
    return combinaPadroes(normalizarNomeTipo(nomeTipo), TIPOS_PROJETO_LEI);
}
