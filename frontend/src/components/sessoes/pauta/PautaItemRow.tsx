import { useState } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { PautaItemLeitura } from './PautaItemLeitura';
import {
    CategoriaPautaBadge,
    CategoriaPautaIcon,
    FasePautaBadge,
    TipoPautaBadge,
} from './PautaBadges';
import type { PautaItemDetalhe, StatusSessao } from '../../../types/sessoes';
import {
    pautaItemDescricao,
    pautaItemRotulo,
    podeAbrirVotacaoNoItem,
    podeFecharVotacaoNoItem,
    resolvePautaCategoria,
    resolvePautaFase,
    resolvePautaTipo,
} from '../../../types/sessoes';
import { STATUS_MATERIA_LABELS } from '../../../types/materias';
import type { MateriaStatus } from '../../../types/legislative';

interface Props {
    sessaoId: string;
    statusSessao: StatusSessao;
    item: PautaItemDetalhe;
    index: number;
    somenteLeitura: boolean;
    podeDeliberar: boolean;
    onMoverCima: () => void;
    onMoverBaixo: () => void;
    onRemover: () => Promise<void>;
    onAbrirVotacao: () => void;
    onFecharVotacao: () => void;
    onExibirNoPainel?: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function PautaItemRow({
    sessaoId,
    statusSessao,
    item,
    index,
    somenteLeitura,
    podeDeliberar,
    onMoverCima,
    onMoverBaixo,
    onRemover,
    onAbrirVotacao,
    onFecharVotacao,
    onExibirNoPainel,
    isFirst,
    isLast,
}: Props) {
    const [confirmando, setConfirmando] = useState(false);
    const [removendo, setRemovendo] = useState(false);
    const [expandido, setExpandido] = useState(false);
    const publicada = item.status === 'PUBLICADA' || item.status === 'ENCERRADA';
    const categoria = resolvePautaCategoria(item);
    const rotulo = pautaItemRotulo(item);
    const descricao = pautaItemDescricao(item);
    const fase = resolvePautaFase(item.fase);
    const tipoPauta = resolvePautaTipo(item.tipoPautaItem);
    const exibirAbrirVotacao =
        podeDeliberar && podeAbrirVotacaoNoItem(item, statusSessao);
    const exibirFecharVotacao =
        podeDeliberar && podeFecharVotacaoNoItem(item, statusSessao);
    const exibirNoPainel = podeDeliberar && publicada && !!onExibirNoPainel;
    const emVotacao =
        item.materia?.status === 'EM_VOTACAO' ||
        (item.votacao && !item.votacao.finalizada && !item.votacao.resultado);
    const statusMateriaLabel = item.materia?.status
        ? STATUS_MATERIA_LABELS[item.materia.status as MateriaStatus] ?? item.materia.status
        : null;

    async function confirmarRemocao() {
        setRemovendo(true);
        try {
            await onRemover();
        } finally {
            setRemovendo(false);
            setConfirmando(false);
        }
    }

    return (
        <>
            <tr className={`data-row pauta-row pauta-row--${categoria.toLowerCase()}${expandido ? ' pauta-row--expandida' : ''}`}>
                <td className="col-ord">
                    <div className="ord-wrap">
                        {!somenteLeitura ? (
                            <>
                                <button
                                    type="button"
                                    className="ord-btn"
                                    disabled={isFirst}
                                    onClick={onMoverCima}
                                    aria-label="Mover para cima"
                                >
                                    <i className="pi pi-chevron-up" aria-hidden />
                                </button>
                                <span className="ord-num">{index + 1}</span>
                                <button
                                    type="button"
                                    className="ord-btn"
                                    disabled={isLast}
                                    onClick={onMoverBaixo}
                                    aria-label="Mover para baixo"
                                >
                                    <i className="pi pi-chevron-down" aria-hidden />
                                </button>
                            </>
                        ) : (
                            <span className="ord-num">{index + 1}</span>
                        )}
                    </div>
                </td>
                <td className="col-mat">
                    <button
                        type="button"
                        className="pauta-mat-toggle"
                        onClick={() => setExpandido((v) => !v)}
                        aria-expanded={expandido}
                        aria-label={expandido ? 'Recolher leitura do item' : 'Ler conteúdo completo do item'}
                    >
                        <div className="pauta-mat-cell">
                            <CategoriaPautaIcon categoria={categoria} />
                            <div className="pauta-mat-text">
                                <span className="mat-id">{rotulo}</span>
                                <span className="mat-ementa">{descricao}</span>
                                {emVotacao && statusMateriaLabel && (
                                    <span className="badge badge--warning pauta-status-materia">
                                        {statusMateriaLabel}
                                    </span>
                                )}
                            </div>
                            <i
                                className={`pi ${expandido ? 'pi-chevron-up' : 'pi-chevron-down'} pauta-expand-icon`}
                                aria-hidden
                            />
                        </div>
                    </button>
                </td>
                <td className="col-cat">
                    <CategoriaPautaBadge categoria={categoria} />
                </td>
                <td className="col-fase">
                    <FasePautaBadge fase={fase} />
                </td>
                <td className="col-tipo">
                    <TipoPautaBadge tipo={tipoPauta} />
                </td>
                <td className="col-act">
                    <div className="pauta-act-wrap">
                        <Tooltip
                            target={`.btn-ler-${item.id}`}
                            content={expandido ? 'Recolher' : 'Ler item'}
                        />
                        <Button
                            icon={expandido ? 'pi pi-eye-slash' : 'pi pi-eye'}
                            text
                            size="small"
                            className={`btn-ler-${item.id}`}
                            aria-label={expandido ? 'Recolher leitura' : 'Ler conteúdo completo'}
                            aria-expanded={expandido}
                            onClick={() => setExpandido((v) => !v)}
                        />
                        {exibirNoPainel && (
                            <>
                                <Tooltip
                                    target={`.btn-painel-${item.id}`}
                                    content="Exibir no telão do plenário"
                                />
                                <Button
                                    icon="pi pi-desktop"
                                    text
                                    size="small"
                                    className={`btn-painel-${item.id}`}
                                    aria-label="Exibir no telão do plenário"
                                    onClick={onExibirNoPainel}
                                />
                            </>
                        )}
                        {exibirFecharVotacao && (
                            <>
                                <Tooltip
                                    target={`.btn-fechar-vot-${item.id}`}
                                    content="Fechar votação"
                                />
                                <Button
                                    icon="pi pi-stop-circle"
                                    text
                                    size="small"
                                    severity="danger"
                                    className={`btn-fechar-vot-${item.id}`}
                                    aria-label="Fechar votação"
                                    onClick={onFecharVotacao}
                                />
                            </>
                        )}
                        {exibirAbrirVotacao && (
                            <>
                                <Tooltip
                                    target={`.btn-votar-${item.id}`}
                                    content="Abrir votação"
                                />
                                <Button
                                    icon="pi pi-play"
                                    text
                                    size="small"
                                    severity="success"
                                    className={`btn-votar-${item.id}`}
                                    aria-label="Abrir votação"
                                    onClick={onAbrirVotacao}
                                />
                            </>
                        )}
                        {!somenteLeitura && (
                            <>
                                <Tooltip
                                    target={`.btn-remover-${item.id}`}
                                    content={publicada ? 'Pauta publicada — remoção bloqueada' : 'Remover'}
                                />
                                <Button
                                    icon="pi pi-times"
                                    text
                                    size="small"
                                    severity="danger"
                                    className={`btn-remover-${item.id} pauta-remove-btn`}
                                    disabled={publicada}
                                    onClick={() => setConfirmando(true)}
                                    aria-label="Remover item da pauta"
                                />
                            </>
                        )}
                    </div>
                </td>
            </tr>
            {expandido && (
                <tr className="pauta-leitura-row">
                    <td colSpan={6}>
                        <PautaItemLeitura
                            sessaoId={sessaoId}
                            item={item}
                            onFechar={() => setExpandido(false)}
                        />
                    </td>
                </tr>
            )}
            {confirmando && (
                <tr className="confirm-row">
                    <td colSpan={6}>
                        <div className="confirm-inner">
                            <i className="pi pi-exclamation-triangle" aria-hidden />
                            <span>
                                Remover <strong>{rotulo}</strong> da pauta?
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
                                onClick={() => setConfirmando(false)}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
