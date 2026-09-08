import { useState } from 'react';
import { Button } from 'primereact/button';
import { PreviewImg } from '../../ui';
import type { PautaItemDetalhe } from '../../../types/sessoes';
import {
    PAUTA_CATEGORIA_LABELS,
    ataReferenciadaRotulo,
    pautaItemRotulo,
    resolvePautaCategoria,
    resolvePautaFase,
    resolvePautaTipo,
} from '../../../types/sessoes';
import { API_PATHS } from '../../../api/paths';
import { CategoriaPautaBadge, FasePautaBadge, TipoPautaBadge } from './PautaBadges';
import { resolveMateriaTitulo } from '../../../utils/materiaDisplay';
import { usePautaItemConteudo, type PautaItemConteudo } from './usePautaItemConteudo';

interface Props {
    sessaoId: string;
    item: PautaItemDetalhe;
    onFechar?: () => void;
    modo?: 'inline' | 'painel' | 'lista';
    /** Quando fornecido (painel), evita fetch duplicado no filho. */
    conteudo?: PautaItemConteudo;
}

type ArquivoPreview = {
    src: string;
    fileName: string;
    mimeType?: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

function MetaLinha({ label, valor }: { label: string; valor?: string | null }) {
    if (!valor) return null;
    return (
        <div className="pauta-leitura-meta">
            <span className="pauta-leitura-meta-label">{label}</span>
            <span className="pauta-leitura-meta-valor">{valor}</span>
        </div>
    );
}

export function PautaItemLeitura({
    sessaoId,
    item,
    onFechar,
    modo = 'inline',
    conteudo: conteudoProp,
}: Props) {
    const conteudoHook = usePautaItemConteudo(sessaoId, conteudoProp ? null : item);
    const conteudo = conteudoProp ?? conteudoHook;
    const [previewArquivo, setPreviewArquivo] = useState<ArquivoPreview | null>(null);

    const detalhe = conteudo.detalhe ?? item;
    const categoria = resolvePautaCategoria(detalhe);
    const fase = resolvePautaFase(detalhe.fase);
    const tipo = resolvePautaTipo(detalhe.tipoPautaItem);
    const rotulo = pautaItemRotulo(detalhe);
    const { carregando, textoPrincipal, textoUrl, materia, autorPrincipal, statusMateria, votacaoResumo, comissaoNome } =
        conteudo;

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

    // Ata vinculada: o PDF é gerado a partir da sessão de origem, não desta.
    const ataVinculada = detalhe.ata?.ataReferenciada ?? null;
    const ataPdfUrl = ataVinculada?.sessao
        ? `${API_BASE}${API_PATHS.sessaoAtaPdf(ataVinculada.sessao.id)}`
        : null;

    const isPainel = modo === 'painel';
    const isLista = modo === 'lista';
    const isPdf = textoUrl?.toLowerCase().includes('.pdf');

    if (isPainel || isLista) {
        const fill = isPainel;
        return (
            <div
                className={`pauta-leitura pauta-leitura--painel${isLista ? ' pauta-leitura--lista' : ''}`}
                role="region"
                aria-label={`Conteúdo: ${rotulo}`}
            >
                {carregando ? (
                    <div
                        className={`pauta-leitura-loading${fill ? ' pauta-leitura-loading--fill' : ''}`}
                    >
                        <i className="pi pi-spin pi-spinner" aria-hidden />
                        <span>Carregando conteúdo…</span>
                    </div>
                ) : (
                    <div className={`pauta-doc-card${fill ? ' pauta-doc-card--fill' : ''}`}>
                        {textoUrl && isPdf ? (
                            <iframe
                                className={`pauta-doc-iframe${fill ? '' : ' pauta-doc-iframe--compact'}`}
                                src={textoUrl}
                                title={`Texto integral — ${rotulo}`}
                            />
                        ) : (
                            <div
                                className={`pauta-doc-card__inner${fill ? ' pauta-doc-card__inner--fill' : ''}`}
                            >
                                <p className="pauta-doc-card__ementa">
                                    {textoPrincipal || 'Sem texto disponível.'}
                                </p>
                                {textoUrl && (
                                    <button
                                        type="button"
                                        className="pauta-leitura-link"
                                        onClick={abrirTextoIntegral}
                                    >
                                        <i className="pi pi-eye" aria-hidden />
                                        Ver texto integral
                                    </button>
                                )}
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
                {onFechar ? (
                    <Button
                        icon="pi pi-times"
                        text
                        rounded
                        size="small"
                        aria-label="Fechar leitura"
                        onClick={onFechar}
                    />
                ) : null}
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
                        {categoria === 'COMISSAO' && (
                            <MetaLinha label="Comissão" valor={comissaoNome} />
                        )}
                        {categoria === 'ATA' && detalhe.ata && (
                            <MetaLinha
                                label="Ata vinculada"
                                valor={
                                    ataReferenciadaRotulo(detalhe.ata) ??
                                    'Não vinculada a uma ata do sistema'
                                }
                            />
                        )}
                        {statusMateria && (
                            <MetaLinha label="Status da matéria" valor={statusMateria} />
                        )}
                        {autorPrincipal && (
                            <MetaLinha label="Autor" valor={autorPrincipal.nome} />
                        )}
                        {votacaoResumo && (
                            <MetaLinha label="Votação" valor={votacaoResumo} />
                        )}
                    </div>

                    <div className="pauta-leitura-texto">
                        <h4 className="pauta-leitura-sec-title">
                            {categoria === 'MATERIA' || categoria === 'COMISSAO'
                                ? 'Ementa'
                                : 'Conteúdo'}
                        </h4>
                        <p className="pauta-leitura-ementa">
                            {textoPrincipal || 'Sem texto disponível.'}
                        </p>
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

                    {ataPdfUrl && (
                        <div className="pauta-leitura-acoes">
                            <a
                                className="pauta-leitura-link"
                                href={ataPdfUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <i className="pi pi-file-pdf" aria-hidden />
                                Abrir ata em PDF
                            </a>
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
