import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import { usePermissions } from '../../../hooks/usePermissions';
import type {
    PautaItemCategoria,
    PautaItemDetalhe,
    SessaoPlenariaDetalhe,
} from '../../../types/sessoes';
import { resolvePautaCategoria } from '../../../types/sessoes';
import { PautaItemRow } from './PautaItemRow';
import { CategoriaPautaBadge } from './PautaBadges';
import { AddPautaItemDialog } from './AddPautaItemDialog';
import { PublicarPautaDialog } from './PublicarPautaDialog';
import { AbrirVotacaoDialog } from './AbrirVotacaoDialog';
import { FecharVotacaoDialog } from './FecharVotacaoDialog';
import { enviarItemParaPainel, painelUrl } from '../../../utils/sessaoPainelChannel';

const CATEGORIA_ORDEM: PautaItemCategoria[] = ['MATERIA', 'COMISSAO', 'ATO', 'NORMA', 'AVISO'];

interface Props {
    sessao: SessaoPlenariaDetalhe;
    votacaoSyncKey?: string | null;
    onVotacaoFechada?: () => void;
}

export function PautaManager({ sessao, votacaoSyncKey, onVotacaoFechada }: Props) {
    const { canWrite, canManageSessao } = usePermissions();
    const { showApiError } = useAppToast();

    const [itens, setItens] = useState<PautaItemDetalhe[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogAdicionar, setDialogAdicionar] = useState(false);
    const [dialogPublicar, setDialogPublicar] = useState(false);
    const [abrirVotacaoItem, setAbrirVotacaoItem] = useState<PautaItemDetalhe | null>(null);
    const [fecharVotacaoItem, setFecharVotacaoItem] = useState<PautaItemDetalhe | null>(null);

    const pautaPublicada = itens.some((i) => i.status === 'PUBLICADA' || i.status === 'ENCERRADA');
    const somenteLeitura = !canWrite || ['ENCERRADA', 'CANCELADA'].includes(sessao.statusSessao);
    const podePublicar = sessao.statusSessao === 'AGENDADA';
    const podeDeliberar = canManageSessao && sessao.statusSessao === 'ABERTA';

    const contagemPorCategoria = itens.reduce<Record<PautaItemCategoria, number>>(
        (acc, item) => {
            const cat = resolvePautaCategoria(item);
            acc[cat] = (acc[cat] ?? 0) + 1;
            return acc;
        },
        { MATERIA: 0, COMISSAO: 0, ATO: 0, NORMA: 0, AVISO: 0 },
    );
    const categoriasPresentes = CATEGORIA_ORDEM.filter(
        (cat) => contagemPorCategoria[cat] > 0,
    );

    const buscarPauta = useCallback(async () => {
        setLoading(true);
        try {
            const data = await sessoesApi.getPauta(sessao.id);
            setItens(data ?? []);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [sessao.id, showApiError]);

    useEffect(() => { void buscarPauta(); }, [buscarPauta]);

    useEffect(() => {
        if (votacaoSyncKey) void buscarPauta();
    }, [votacaoSyncKey, buscarPauta]);

    async function handleRemover(itemId: string) {
        await sessoesApi.removePautaItem(sessao.id, itemId);
        await buscarPauta();
    }

    function abrirPainel() {
        window.open(painelUrl(sessao.id), '_blank', 'noopener,noreferrer');
    }

    function exibirItemNoPainel(itemId: string) {
        enviarItemParaPainel(sessao.id, itemId);
    }

    async function handleMover(index: number, direction: -1 | 1) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= itens.length) return;

        const anterior = itens;
        const novo = [...itens];
        [novo[index], novo[newIndex]] = [novo[newIndex], novo[index]];
        setItens(novo);

        try {
            await sessoesApi.reordenarPautaItem(sessao.id, itens[index].id, newIndex + 1);
        } catch (err) {
            setItens(anterior);
            showApiError(err);
        }
    }

    return (
        <div className="sessao-tab-stack">
            <div className="sigl-panel">
                <div className="sigl-panel-header">
                    <span className="sigl-panel-title">
                        <i className="pi pi-list" aria-hidden />
                        Pauta da sessão
                    </span>
                    {(pautaPublicada || (canWrite && !somenteLeitura)) && (
                        <div className="sigl-panel-header-actions">
                            {podeDeliberar && (
                                <Button
                                    label="Abrir telão"
                                    icon="pi pi-desktop"
                                    size="small"
                                    severity="secondary"
                                    outlined
                                    onClick={abrirPainel}
                                    tooltip="Abre o monitor do plenário em nova janela"
                                    tooltipOptions={{ position: 'bottom' }}
                                />
                            )}
                            {pautaPublicada && (
                                <span className="badge badge--success">Publicada</span>
                            )}
                            {canWrite && !somenteLeitura && (
                                <Button
                                    label="Adicionar matéria"
                                    icon="pi pi-plus"
                                    size="small"
                                    className="align-self-start"
                                    onClick={() => setDialogAdicionar(true)}
                                />
                            )}
                            {canWrite && !somenteLeitura && (
                                pautaPublicada ? (
                                    <Button
                                        label="Publicada"
                                        icon="pi pi-send"
                                        size="small"
                                        disabled
                                    />
                                ) : podePublicar ? (
                                    <Button
                                        label="Publicar pauta"
                                        icon="pi pi-send"
                                        size="small"
                                        severity="secondary"
                                        outlined
                                        disabled={itens.length === 0}
                                        onClick={() => setDialogPublicar(true)}
                                    />
                                ) : (
                                    <Button
                                        label="Publicar pauta"
                                        icon="pi pi-send"
                                        size="small"
                                        severity="secondary"
                                        outlined
                                        disabled
                                        tooltip="A pauta só pode ser publicada enquanto a sessão está agendada."
                                        tooltipOptions={{ position: 'bottom' }}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>

                <div className="sigl-panel-body sigl-panel-body--flush">
                    {loading ? (
                        <div className="sessao-empty-state">
                            <i className="pi pi-spin pi-spinner" aria-hidden />
                            <span>Carregando pauta…</span>
                        </div>
                    ) : itens.length === 0 ? (
                        <div className="sessao-empty-state">
                            <i className="pi pi-clipboard" aria-hidden />
                            <span>Nenhuma matéria na pauta</span>
                            <span className="sessao-empty-state__hint">
                                Adicione matérias para compor a pauta desta sessão.
                            </span>
                        </div>
                    ) : (
                        <>
                        {categoriasPresentes.length > 1 && (
                            <div className="pauta-cat-legend" aria-label="Resumo por categoria">
                                {categoriasPresentes.map((cat) => (
                                    <span key={cat} className="pauta-cat-legend-item">
                                        <CategoriaPautaBadge categoria={cat} />
                                        <span className="pauta-cat-legend-count">
                                            {contagemPorCategoria[cat]}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}
                        <table className="pauta-table" aria-label="Itens da pauta">
                            <thead>
                                <tr>
                                    <th className="col-ord">#</th>
                                    <th className="col-mat">Item</th>
                                    <th className="col-cat">Categoria</th>
                                    <th className="col-fase">Fase</th>
                                    <th className="col-tipo">Tipo</th>
                                    <th className="col-act" />
                                </tr>
                            </thead>
                            <tbody>
                                {itens.map((item, idx) => (
                                    <PautaItemRow
                                        key={item.id}
                                        sessaoId={sessao.id}
                                        statusSessao={sessao.statusSessao}
                                        item={item}
                                        index={idx}
                                        somenteLeitura={somenteLeitura}
                                        podeDeliberar={podeDeliberar}
                                        isFirst={idx === 0}
                                        isLast={idx === itens.length - 1}
                                        onMoverCima={() => void handleMover(idx, -1)}
                                        onMoverBaixo={() => void handleMover(idx, 1)}
                                        onRemover={() => handleRemover(item.id)}
                                        onAbrirVotacao={() => setAbrirVotacaoItem(item)}
                                        onFecharVotacao={() => setFecharVotacaoItem(item)}
                                        onExibirNoPainel={() => exibirItemNoPainel(item.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                        </>
                    )}
                </div>
            </div>
            {dialogAdicionar && (
                <AddPautaItemDialog
                    sessaoId={sessao.id}
                    onClose={() => setDialogAdicionar(false)}
                    onSaved={() => void buscarPauta()}
                />
            )}
            {dialogPublicar && (
                <PublicarPautaDialog
                    sessaoId={sessao.id}
                    onClose={() => setDialogPublicar(false)}
                    onPublicada={() => void buscarPauta()}
                />
            )}
            {abrirVotacaoItem && (
                <AbrirVotacaoDialog
                    sessaoId={sessao.id}
                    item={abrirVotacaoItem}
                    onClose={() => setAbrirVotacaoItem(null)}
                    onAberta={() => {
                        void buscarPauta();
                    }}
                />
            )}
            {fecharVotacaoItem && (
                <FecharVotacaoDialog
                    sessaoId={sessao.id}
                    item={fecharVotacaoItem}
                    onClose={() => setFecharVotacaoItem(null)}
                    onFechada={() => {
                        void buscarPauta();
                        onVotacaoFechada?.();
                    }}
                />
            )}
        </div>
    );
}
