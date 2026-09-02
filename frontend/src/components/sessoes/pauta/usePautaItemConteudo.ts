import { useEffect, useState } from 'react';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { materiasApi, type Materia } from '../../../api/legislative/materias.api';
import { useAppToast } from '../../../hooks/useAppToast';
import type { PautaItemDetalhe } from '../../../types/sessoes';
import {
    pautaItemDescricao,
    resolvePautaCategoria,
} from '../../../types/sessoes';
import {
    resolveMateriaAutorPrincipal,
    resolveMateriaTextoOriginalUrl,
    type MateriaAutorResumo,
} from '../../../utils/materiaDisplay';
import { STATUS_MATERIA_LABELS } from '../../../types/materias';
import type { MateriaStatus } from '../../../types/legislative';

export interface PautaItemConteudo {
    carregando: boolean;
    detalhe: PautaItemDetalhe | null;
    materia: Materia | null;
    autorPrincipal: MateriaAutorResumo | null;
    statusMateria: string | null;
    textoPrincipal: string;
    textoUrl: string | null;
    votacaoResumo: string | null;
    comissaoNome: string | null;
}

const VAZIO: PautaItemConteudo = {
    carregando: false,
    detalhe: null,
    materia: null,
    autorPrincipal: null,
    statusMateria: null,
    textoPrincipal: '',
    textoUrl: null,
    votacaoResumo: null,
    comissaoNome: null,
};

function resolveStatusMateria(status: Materia['status']): string {
    const val = typeof status === 'string' ? status : status.value;
    return STATUS_MATERIA_LABELS[val as MateriaStatus] ?? val;
}

export function usePautaItemConteudo(
    sessaoId: string,
    item: PautaItemDetalhe | null,
): PautaItemConteudo {
    const { showApiError } = useAppToast();
    const [carregando, setCarregando] = useState(false);
    const [detalhe, setDetalhe] = useState<PautaItemDetalhe | null>(null);
    const [materia, setMateria] = useState<Materia | null>(null);

    useEffect(() => {
        if (!item) {
            setDetalhe(null);
            setMateria(null);
            return;
        }

        const itemId = item.id;
        let ativo = true;
        setCarregando(true);

        async function carregar() {
            try {
                const itemApi = await sessoesApi.getPautaItem(sessaoId, itemId);
                if (!ativo) return;
                setDetalhe(itemApi);

                const cat = resolvePautaCategoria(itemApi);
                if (
                    (cat === 'MATERIA' || cat === 'COMISSAO') &&
                    itemApi.materia?.id
                ) {
                    const mat = await materiasApi.getById(itemApi.materia.id);
                    if (ativo) setMateria(mat);
                } else if (ativo) {
                    setMateria(null);
                }
            } catch (err) {
                if (ativo) showApiError(err);
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregar();
        return () => {
            ativo = false;
        };
    }, [sessaoId, item?.id, showApiError]);

    if (!item) return VAZIO;

    const base = detalhe ?? item;
    const textoPrincipal = materia?.ementa ?? pautaItemDescricao(base);
    const textoUrl = materia?.textoOriginalUrl
        ? resolveMateriaTextoOriginalUrl(materia.textoOriginalUrl)
        : null;
    const autorPrincipal = materia ? resolveMateriaAutorPrincipal(materia) : null;
    const statusMateria = materia ? resolveStatusMateria(materia.status) : null;
    const votacaoResumo = base.votacao
        ? base.votacao.finalizada
            ? `Encerrada — Sim ${base.votacao.votosSim ?? 0} · Não ${base.votacao.votosNao ?? 0} · Abstenção ${base.votacao.abstencoes ?? 0}`
            : 'Em andamento'
        : null;
    const comissaoNome =
        base.comissao?.tipo?.nome ?? base.comissao?.titulo ?? null;

    return {
        carregando,
        detalhe: base,
        materia,
        autorPrincipal,
        statusMateria,
        textoPrincipal,
        textoUrl,
        votacaoResumo,
        comissaoNome,
    };
}
