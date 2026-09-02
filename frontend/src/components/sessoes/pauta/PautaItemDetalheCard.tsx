import { forwardRef, useState } from 'react';
import { Button } from 'primereact/button';
import { PautaItemLeitura } from './PautaItemLeitura';
import { FasePautaBadge, TipoPautaBadge } from './PautaBadges';
import { usePautaItemConteudo } from './usePautaItemConteudo';
import type { PautaItemDetalhe, StatusSessao } from '../../../types/sessoes';
import {
    PAUTA_CATEGORIA_LABELS,
    pautaItemRotuloCompleto,
    podeAbrirVotacaoNoItem,
    podeFecharVotacaoNoItem,
    resolvePautaCategoria,
    resolvePautaFase,
    resolvePautaTipo,
} from '../../../types/sessoes';
import { SIGL_TOOLTIP_BOTTOM } from '../../../utils/primeTooltip';
import { MateriaAutorAvatar } from '../../materias/MateriaAutorAvatar';
import type { MateriaAutorResumo } from '../../../utils/materiaDisplay';

interface PautaItemDetalheCardProps {
    sessaoId: string;
    statusSessao: StatusSessao;
    item: PautaItemDetalhe;
    ativo?: boolean;
    somenteLeitura: boolean;
    podeDeliberar: boolean;
    onRemover: () => Promise<void>;
    onAbrirVotacao: () => void;
    onFecharVotacao: () => void;
    onExibirNoPainel?: () => void;
}

function MetaAutorCampo({ autor }: { autor: MateriaAutorResumo }) {
    return (
        <div className="pauta-detalhe__meta-campo">
            <div className="pauta-detalhe__autor">
                <MateriaAutorAvatar autor={autor} size="sm" />
                <span className="pauta-detalhe__meta-valor">{autor.nome}</span>
            </div>
        </div>
    );
}

function MetaCampo({ label, valor }: { label: string; valor?: string | null }) {
    if (!valor) return null;
    return (
        <div className="pauta-detalhe__meta-campo">
            <span className="pauta-detalhe__meta-label">{label}</span>
            <span className="pauta-detalhe__meta-valor">{valor}</span>
        </div>
    );
}

export const PautaItemDetalheCard = forwardRef<HTMLElement, PautaItemDetalheCardProps>(
    function PautaItemDetalheCard(
        {
            sessaoId,
            statusSessao,
            item,
            ativo = false,
            somenteLeitura,
            podeDeliberar,
            onRemover,
            onAbrirVotacao,
            onFecharVotacao,
            onExibirNoPainel,
        },
        ref,
    ) {
        const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);
        const [removendo, setRemovendo] = useState(false);
        const conteudo = usePautaItemConteudo(sessaoId, item);

        const categoria = resolvePautaCategoria(item);
        const fase = resolvePautaFase(item.fase);
        const tipo = resolvePautaTipo(item.tipoPautaItem);
        const titulo = pautaItemRotuloCompleto(item);
        const publicada = item.status === 'PUBLICADA' || item.status === 'ENCERRADA';
        const exibirAbrirVotacao =
            podeDeliberar && podeAbrirVotacaoNoItem(item, statusSessao);
        const exibirFecharVotacao =
            podeDeliberar && podeFecharVotacaoNoItem(item, statusSessao);
        const exibirNoPainel = podeDeliberar && publicada && !!onExibirNoPainel;

        async function confirmarRemocao() {
            setRemovendo(true);
            try {
                await onRemover();
                setConfirmandoRemocao(false);
            } finally {
                setRemovendo(false);
            }
        }

        const temMetaGrid =
            conteudo.autorPrincipal ||
            conteudo.statusMateria ||
            conteudo.comissaoNome ||
            conteudo.votacaoResumo;

        return (
            <article
                ref={ref}
                id={`pauta-item-${item.id}`}
                className={`pauta-detalhe-card${ativo ? ' pauta-detalhe-card--ativo' : ''}`}
                aria-label={`Item da pauta: ${titulo}`}
            >
                {confirmandoRemocao && (
                    <div className="pauta-detalhe__confirm">
                        <i className="pi pi-exclamation-triangle" aria-hidden />
                        <span>
                            Remover <strong>{titulo}</strong> da pauta?
                        </span>
                        <Button
                            label="Sim, remover"
                            size="small"
                            severity="danger"
                            loading={removendo}
                            onClick={() => void confirmarRemocao()}
                        />
                        <Button
                            label="Não"
                            size="small"
                            severity="secondary"
                            text
                            disabled={removendo}
                            onClick={() => setConfirmandoRemocao(false)}
                        />
                    </div>
                )}

                <header className="pauta-detalhe__header">
                    {temMetaGrid && (
                        <div className="pauta-detalhe__meta-grid lex-dialog-grid">
                            {conteudo.autorPrincipal && (
                                <MetaAutorCampo autor={conteudo.autorPrincipal} />
                            )}
                            <MetaCampo label="Status da matéria" valor={conteudo.statusMateria} />
                            {categoria === 'COMISSAO' && (
                                <MetaCampo label="Comissão" valor={conteudo.comissaoNome} />
                            )}
                            <MetaCampo label="Votação" valor={conteudo.votacaoResumo} />
                        </div>
                    )}

                    <div className="pauta-detalhe__header-row">
                        <div className="pauta-detalhe__header-main">
                            <div className="pauta-detalhe__meta">
                                <FasePautaBadge fase={fase} />
                                <TipoPautaBadge tipo={tipo} />
                                <span className="lex-pauta-chip lex-pauta-chip--cat">
                                    <i className="pi pi-tag" aria-hidden />
                                    {PAUTA_CATEGORIA_LABELS[categoria]}
                                </span>
                            </div>
                            <h2 className="pauta-detalhe__titulo">{titulo}</h2>
                        </div>

                        <div className="pauta-detalhe__acoes">
                            {exibirFecharVotacao && (
                                <Button
                                    label="Fechar votação"
                                    icon="pi pi-stop-circle"
                                    size="small"
                                    severity="danger"
                                    outlined
                                    onClick={onFecharVotacao}
                                />
                            )}
                            {exibirAbrirVotacao && (
                                <Button
                                    label="Abrir votação"
                                    icon="pi pi-check-circle"
                                    size="small"
                                    onClick={onAbrirVotacao}
                                />
                            )}
                            {exibirNoPainel && (
                                <Button
                                    icon="pi pi-desktop"
                                    size="small"
                                    severity="secondary"
                                    outlined
                                    aria-label="Exibir no telão"
                                    tooltip="Exibir no telão do plenário"
                                    tooltipOptions={SIGL_TOOLTIP_BOTTOM}
                                    onClick={onExibirNoPainel}
                                />
                            )}
                            {!somenteLeitura && (
                                <Button
                                    icon="pi pi-times"
                                    size="small"
                                    severity="danger"
                                    outlined
                                    aria-label="Remover item da pauta"
                                    disabled={publicada}
                                    tooltip={
                                        publicada
                                            ? 'Pauta publicada — remoção bloqueada'
                                            : 'Remover item da pauta'
                                    }
                                    tooltipOptions={SIGL_TOOLTIP_BOTTOM}
                                    onClick={() => setConfirmandoRemocao(true)}
                                />
                            )}
                        </div>
                    </div>
                </header>

                <div className="pauta-detalhe__viewer pauta-detalhe__viewer--lista">
                    <PautaItemLeitura
                        sessaoId={sessaoId}
                        item={item}
                        modo="lista"
                        conteudo={conteudo}
                    />
                </div>
            </article>
        );
    },
);
