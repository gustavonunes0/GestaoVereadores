import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import { usePermissions } from '../../../hooks/usePermissions';
import type { PautaItemDetalhe, SessaoPlenariaDetalhe } from '../../../types/sessoes';
import { PautaItemRow } from './PautaItemRow';
import { AddPautaItemDialog } from './AddPautaItemDialog';
import { PublicarPautaDialog } from './PublicarPautaDialog';

interface Props {
    sessao: SessaoPlenariaDetalhe;
}

export function PautaManager({ sessao }: Props) {
    const { canWrite } = usePermissions();
    const { showApiError } = useAppToast();

    const [itens, setItens] = useState<PautaItemDetalhe[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogAdicionar, setDialogAdicionar] = useState(false);
    const [dialogPublicar, setDialogPublicar] = useState(false);

    const pautaPublicada = itens.some((i) => i.status === 'PUBLICADA' || i.status === 'ENCERRADA');
    const somenteLeitura = !canWrite || ['ENCERRADA', 'CANCELADA'].includes(sessao.statusSessao);

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

    async function handleRemover(itemId: string) {
        await sessoesApi.removePautaItem(sessao.id, itemId);
        await buscarPauta();
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
                                ) : (
                                    <Button
                                        label="Publicar pauta"
                                        icon="pi pi-send"
                                        size="small"
                                        severity="secondary"
                                        outlined
                                        disabled={itens.length === 0}
                                        onClick={() => setDialogPublicar(true)}
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
                        <table className="pauta-table" aria-label="Itens da pauta">
                            <thead>
                                <tr>
                                    <th className="col-ord">#</th>
                                    <th className="col-mat">Matéria</th>
                                    <th className="col-fase">Fase</th>
                                    <th className="col-tipo">Tipo</th>
                                    <th className="col-act" />
                                </tr>
                            </thead>
                            <tbody>
                                {itens.map((item, idx) => (
                                    <PautaItemRow
                                        key={item.id}
                                        item={item}
                                        index={idx}
                                        somenteLeitura={somenteLeitura}
                                        isFirst={idx === 0}
                                        isLast={idx === itens.length - 1}
                                        onMoverCima={() => void handleMover(idx, -1)}
                                        onMoverBaixo={() => void handleMover(idx, 1)}
                                        onRemover={() => handleRemover(item.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
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
        </div>
    );
}
