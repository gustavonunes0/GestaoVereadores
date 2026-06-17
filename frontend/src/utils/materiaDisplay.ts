import type { Materia } from '../api/legislative/materias.api';
import type { MateriaStatus } from '../types/legislative';

export function resolveMateriaStatus(
    status: Materia['status'],
): MateriaStatus {
    if (typeof status === 'string') return status;
    return status.value;
}

export function resolveMateriaIdentificacao(materia: Materia): string {
    if (materia.identificacao?.trim()) {
        const identificacao = materia.identificacao.trim();
        if (!identificacao.includes('(rascunho')) {
            return identificacao;
        }
    }

    const sigla = materia.tipo?.sigla ?? materia.sigla ?? materia.tipo?.nome ?? 'Matéria';
    const ano =
        typeof materia.ano === 'number'
            ? materia.ano
            : materia.ano?.valor;

    if (materia.numero != null && materia.numero !== '') {
        return `${sigla} nº ${materia.numero}/${ano ?? '?'}`;
    }

    if (materia.numeroProtocolo != null && materia.numeroProtocolo !== '') {
        const protocolo = materia.numeroProtocolo;
        return ano != null
            ? `${sigla} Prot. nº ${protocolo}/${ano}`
            : `${sigla} Prot. nº ${protocolo}`;
    }

    return sigla;
}

export function resolveMateriaAno(materia: Materia): number | null {
    if (materia.ano == null) return null;
    if (typeof materia.ano === 'number') return materia.ano;
    return materia.ano.valor;
}

export function resolveMateriaNumeroAno(materia: Materia): string {
    const ano = resolveMateriaAno(materia);
    if (materia.numero == null || materia.numero === '') {
        return ano != null ? `— / ${ano}` : '—';
    }
    return `${materia.numero} / ${ano ?? '—'}`;
}

/** URL absoluta ou relativa para abrir o arquivo do texto original no navegador. */
export function resolveMateriaTextoOriginalUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    const path = trimmed.replace(/^\/api\/uploads\//, '/uploads/');
    const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
        /\/$/,
        '',
    );
    if (apiBase && path.startsWith('/uploads/')) {
        const origin = apiBase.replace(/\/api$/, '');
        return `${origin}${path}`;
    }

    return path;
}

export function resolveMateriaAutorNome(materia: Materia): string {
    if (materia.autor?.nome) return materia.autor.nome;
    const parliamentarian = materia.authorship?.authorParliamentarian;
    if (parliamentarian?.parliamentaryName) {
        return parliamentarian.parliamentaryName;
    }
    return '—';
}

export function formatProtocoloNumero(
    value: number | string | null | undefined,
): string | null {
    if (value == null || value === '') return null;
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toLocaleString('pt-BR');
}

export function resolveMateriaProtocoloLabel(materia: Materia): string | null {
    const protocolo = formatProtocoloNumero(materia.numeroProtocolo);
    const ano = resolveMateriaAno(materia);
    if (!protocolo) return null;
    return ano != null ? `${protocolo}/${ano}` : protocolo;
}

export function resolveMateriaTitulo(materia: Materia): string {
    const sigla = (materia.tipo?.sigla ?? materia.sigla ?? '').trim();
    const tipoNome = (materia.tipo?.nome ?? 'Matéria').toUpperCase();
    const ano = resolveMateriaAno(materia);
    const prefix = sigla || 'MAT';

    if (materia.numero != null && materia.numero !== '') {
        return `${prefix} ${materia.numero}/${ano ?? '?'} - ${tipoNome}`;
    }

    const protocolo = formatProtocoloNumero(materia.numeroProtocolo);
    if (protocolo) {
        return ano != null
            ? `${prefix} Prot. ${protocolo}/${ano} - ${tipoNome}`
            : `${prefix} Prot. ${protocolo} - ${tipoNome}`;
    }

    return `${prefix} - ${tipoNome}`;
}

export type MateriaAutorResumo = {
    id: string;
    nome: string;
    photoUrl?: string | null;
    tipo: 'parlamentar' | 'externo';
    subtitulo?: string | null;
};

export function resolveMateriaAutores(materia: Materia): MateriaAutorResumo[] {
    const autores: MateriaAutorResumo[] = [];
    const seen = new Set<string>();

    const pushAutor = (autor: MateriaAutorResumo) => {
        if (seen.has(autor.id)) return;
        seen.add(autor.id);
        autores.push(autor);
    };

    if (materia.autor?.nome) {
        pushAutor({
            id: materia.autor.id,
            nome: materia.autor.nome,
            photoUrl: materia.autor.photoUrl ?? null,
            tipo: materia.autor.tipo,
            subtitulo: materia.autor.subtitulo ?? null,
        });
    } else {
        const parliamentarian = materia.authorship?.authorParliamentarian;
        if (parliamentarian?.parliamentaryName) {
            pushAutor({
                id: parliamentarian.id,
                nome: parliamentarian.parliamentaryName,
                photoUrl: parliamentarian.photoUrl ?? null,
                tipo: 'parlamentar',
                subtitulo: parliamentarian.officeNumber
                    ? `Gabinete ${parliamentarian.officeNumber}`
                    : null,
            });
        }
    }

    for (const coauthor of materia.authorship?.coauthors ?? []) {
        const parliamentarian = coauthor.parliamentarian;
        pushAutor({
            id: parliamentarian.id,
            nome: parliamentarian.parliamentaryName,
            photoUrl: parliamentarian.photoUrl ?? null,
            tipo: 'parlamentar',
            subtitulo: null,
        });
    }

    return autores;
}

export function resolveMateriaAutorPrincipal(materia: Materia): MateriaAutorResumo | null {
    return resolveMateriaAutores(materia)[0] ?? null;
}
