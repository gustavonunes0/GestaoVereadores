import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { materiasApi, type Materia } from '../../../api/legislative/materias.api';
import { PreviewImg } from '../../ui';
import { useAppToast } from '../../../hooks/useAppToast';
import type { PautaItemDetalhe } from '../../../types/sessoes';
import {
    PAUTA_CATEGORIA_LABELS,
    pautaItemDescricao,
    pautaItemRotulo,
    resolvePautaCategoria,
    resolvePautaFase,
    resolvePautaTipo,
} from '../../../types/sessoes';
import { CategoriaPautaBadge, FasePautaBadge, TipoPautaBadge } from './PautaBadges';
import {
    resolveMateriaAutorPrincipal,
    resolveMateriaTextoOriginalUrl,
    resolveMateriaTitulo,
} from '../../../utils/materiaDisplay';
import { STATUS_MATERIA_LABELS } from '../../../types/materias';
import type { MateriaStatus } from '../../../types/legislative';

interface Props {
    sessaoId: string;
    item: PautaItemDetalhe;
    onFechar: () => void;
}

type ArquivoPreview = {
    src: string;
    fileName: string;
    mimeType?: string;
};

function MetaLinha({ label, valor }: { label: string; valor?: string | null }) {
    if (!valor) return null;
    return (
        <div className="pauta-leitura-meta">
            <span className="pauta-leitura-meta-label">{label}</span>
            <span className="pauta-leitura-meta-valor">{valor}</span>
        </div>
    );
}

function resolveStatusMateria(status: Materia['status']): string {
    const val = typeof status === 'string' ? status : status.value;
    return STATUS_MATERIA_LABELS[val as MateriaStatus] ?? val;
}

export function PautaItemLeitura({ sessaoId, item, onFechar }: Props) {
    const { showApiError } = useAppToast();
    const [carregando, setCarregando] = useState(true);
    const [detalhe, setDetalhe] = useState<PautaItemDetalhe>(item);
    const [materia, setMateria] = useState<Materia | null>(null);
    const [previewArquivo, setPreviewArquivo] = useState<ArquivoPreview | null>(null);

    const categoria = resolvePautaCategoria(detalhe);
    const fase = resolvePautaFase(detalhe.fase);
    const tipo = resolvePautaTipo(detalhe.tipoPautaItem);
    const rotulo = pautaItemRotulo(detalhe);
    const textoPrincipal = materia?.ementa ?? pautaItemDescricao(detalhe);
    const textoUrl = materia?.textoOriginalUrl
        ? resolveMateriaTextoOriginalUrl(materia.textoOriginalUrl)
        : null;
    const autor = materia ? resolveMateriaAutorPrincipal(materia)?.nome : null;

    function abrirTextoIntegral() {
        if (!textoUrl) return;
        const isPdf = textoUrl.toLowerCase().includes('.pdf');
        const fileName = materia
            ? `${resolveMateriaTitulo(materia)}${isPdf ? '.pdf' : ''}`
            : rotulo;
        setPreviewArquivo({
            src: textoUrl,
            fileName,
            mimeType: isPdf ? 'application/pdf' : undefined,
        });
    }

    useEffect(() => {
        let ativo = true;
        setCarregando(true);

        async function carregar() {
            try {
                const itemApi = await sessoesApi.getPautaItem(sessaoId, item.id);
                if (!ativo) return;
                setDetalhe(itemApi);

                if (
                    (resolvePautaCategoria(itemApi) === 'MATERIA' ||
                        resolvePautaCategoria(itemApi) === 'COMISSAO') &&
                    itemApi.materia?.id
                ) {
                    const mat = await materiasApi.getById(itemApi.materia.id);
                    if (ativo) setMateria(mat);
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
    }, [sessaoId, item.id, showApiError]);

    return (
        <div className="pauta-leitura" role="region" aria-label={`Leitura: ${rotulo}`}>
            <div className="pauta-leitura-header">
                <div className="pauta-leitura-titulo-wrap">
                    <span className="pauta-leitura-titulo">{rotulo}</span>
                    <div className="pauta-leitura-badges">
                        <CategoriaPautaBadge categoria={categoria} />
                        <FasePautaBadge fase={fase} />
                        <TipoPautaBadge tipo={tipo} />
                        {detalhe.status && (
                            <span className="badge badge--neutral">{detalhe.status}</span>
                        )}
                        {detalhe.resultado && (
                            <span className="badge badge--info">{detalhe.resultado}</span>
                        )}
                    </div>
                </div>
                <Button
                    icon="pi pi-times"
                    text
                    rounded
                    size="small"
                    aria-label="Fechar leitura"
                    onClick={onFechar}
                />
            </div>

            {carregando ? (
                <div className="pauta-leitura-loading">
                    <i className="pi pi-spin pi-spinner" aria-hidden />
                    <span>Carregando conteúdo…</span>
                </div>
            ) : (
                <div className="pauta-leitura-body">
                    <div className="pauta-leitura-grid">
                        <MetaLinha label="Categoria" valor={PAUTA_CATEGORIA_LABELS[categoria]} />
                        {categoria === 'COMISSAO' && detalhe.comissao && (
                            <MetaLinha
                                label="Comissão"
                                valor={
                                    detalhe.comissao.tipo?.nome ??
                                    detalhe.comissao.titulo ??
                                    undefined
                                }
                            />
                        )}
                        {materia && (
                            <MetaLinha label="Status da matéria" valor={resolveStatusMateria(materia.status)} />
                        )}
                        {autor && <MetaLinha label="Autor" valor={autor} />}
                        {detalhe.votacao && (
                            <MetaLinha
                                label="Votação"
                                valor={
                                    detalhe.votacao.finalizada
                                        ? `Encerrada — Sim ${detalhe.votacao.votosSim ?? 0} · Não ${detalhe.votacao.votosNao ?? 0} · Abstenção ${detalhe.votacao.abstencoes ?? 0}`
                                        : 'Em andamento'
                                }
                            />
                        )}
                    </div>

                    <div className="pauta-leitura-texto">
                        <h4 className="pauta-leitura-sec-title">
                            {categoria === 'MATERIA' || categoria === 'COMISSAO'
                                ? 'Ementa'
                                : 'Conteúdo'}
                        </h4>
                        <p className="pauta-leitura-ementa">{textoPrincipal || 'Sem texto disponível.'}</p>
                    </div>

                    {textoUrl && (
                        <div className="pauta-leitura-acoes">
                            <button
                                type="button"
                                className="pauta-leitura-link"
                                onClick={abrirTextoIntegral}
                            >
                                <i className="pi pi-eye" aria-hidden />
                                Ver texto integral
                            </button>
                        </div>
                    )}
                </div>
            )}

            {previewArquivo && (
                <PreviewImg
                    src={previewArquivo.src}
                    fileName={previewArquivo.fileName}
                    mimeType={previewArquivo.mimeType}
                    onClose={() => setPreviewArquivo(null)}
                />
            )}
        </div>
    );
}
