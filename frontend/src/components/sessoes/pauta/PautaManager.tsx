import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import { usePermissions } from '../../../hooks/usePermissions';
import type { PautaItemDetalhe, SessaoPlenariaDetalhe } from '../../../types/sessoes';
import { PautaItemCard } from './PautaItemCard';
import { PautaListaDetalhe } from './PautaListaDetalhe';
import { AddPautaItemDialog } from './AddPautaItemDialog';
import { PublicarPautaDialog } from './PublicarPautaDialog';
import { AbrirVotacaoDialog } from './AbrirVotacaoDialog';
import { FecharVotacaoDialog } from './FecharVotacaoDialog';
import { enviarItemParaPainel, painelUrl } from '../../../utils/sessaoPainelChannel';
import { SIGL_TOOLTIP_BOTTOM } from '../../../utils/primeTooltip';

interface Props {
    sessao: SessaoPlenariaDetalhe;
    votacaoSyncKey?: string | null;
    onVotacaoFechada?: () => void;
}

function itemEmVotacao(item: PautaItemDetalhe): boolean {
    return (
        item.materia?.status === 'EM_VOTACAO' ||
        (!!item.votacao && !item.votacao.finalizada && !item.votacao.resultado)
    );
}

function resolverSelecaoInicial(
    itens: PautaItemDetalhe[],
    atual: string | null,
): string | null {
    if (itens.length === 0) return null;
    if (atual && itens.some((i) => i.id === atual)) return atual;
    const emVotacao = itens.find(itemEmVotacao);
    return emVotacao?.id ?? itens[0].id;
}

export function PautaManager({ sessao, votacaoSyncKey, onVotacaoFechada }: Props) {
    const { canWrite, canManageSessao } = usePermissions();
    const { showApiError } = useAppToast();

    const [itens, setItens] = useState<PautaItemDetalhe[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [dialogAdicionar, setDialogAdicionar] = useState(false);
    const [dialogPublicar, setDialogPublicar] = useState(false);
    const [abrirVotacaoItem, setAbrirVotacaoItem] = useState<PautaItemDetalhe | null>(null);
    const [fecharVotacaoItem, setFecharVotacaoItem] = useState<PautaItemDetalhe | null>(null);

    const pautaPublicada = itens.some((i) => i.status === 'PUBLICADA' || i.status === 'ENCERRADA');
    const somenteLeitura = !canWrite || ['ENCERRADA', 'CANCELADA'].includes(sessao.statusSessao);
    const podePublicar = sessao.statusSessao === 'AGENDADA';
    const podeDeliberar = canManageSessao && sessao.statusSessao === 'ABERTA';

    const selecionarItem = useCallback((itemId: string) => {
        setSelectedId(itemId);
    }, []);

    /**
     * `mostrarLoading` desligado quando a tela já mostra o resultado esperado
     * (reordenação otimista) — aí o refetch só reconcilia, sem piscar o spinner.
     */
    const buscarPauta = useCallback(
        async (mostrarLoading = true) => {
            if (mostrarLoading) setLoading(true);
            try {
                const data = await sessoesApi.getPauta(sessao.id);
                const lista = data ?? [];
                setItens(lista);
                setSelectedId((atual) => resolverSelecaoInicial(lista, atual));
            } catch (err) {
                showApiError(err);
            } finally {
                if (mostrarLoading) setLoading(false);
            }
        },
        [sessao.id, showApiError],
    );

    useEffect(() => {
        void buscarPauta();
    }, [buscarPauta]);

    useEffect(() => {
        if (votacaoSyncKey) void buscarPauta();
    }, [votacaoSyncKey, buscarPauta]);

    async function handleRemover(itemId: string) {
        await sessoesApi.removePautaItem(sessao.id, itemId);
        setSelectedId((atual) => (atual === itemId ? null : atual));
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
            await sessoesApi.moverPautaItem(
                sessao.id,
                itens[index].id,
                direction === -1 ? 'CIMA' : 'BAIXO',
            );
            // A troca pode mudar a fase dos dois itens, e a fase aparece nos badges.
            await buscarPauta(false);
        } catch (err) {
            setItens(anterior);
            showApiError(err);
        }
    }

    return (
        <div className="pauta-split">
            <section className="pauta-split__lista" aria-label="Lista da pauta">
                <header className="pauta-split__lista-header">
                    <h2 className="pauta-split__lista-title">
                        <i className="pi pi-list" aria-hidden />
                        Pauta da sessão
                    </h2>
                    <div className="pauta-split__lista-actions">
                        {pautaPublicada && (
                            <span className="badge badge--success">Publicada</span>
                        )}
                        {podeDeliberar && (
                            <Button
                                icon="pi pi-desktop"
                                size="small"
                                severity="secondary"
                                outlined
                                aria-label="Abrir telão"
                                tooltip="Abre o monitor do plenário em nova janela"
                                tooltipOptions={SIGL_TOOLTIP_BOTTOM}
                                onClick={abrirPainel}
                            />
                        )}
                        {canWrite && !somenteLeitura && (
                            <Button
                                label="Adicionar matéria"
                                icon="pi pi-plus"
                                size="small"
                                onClick={() => setDialogAdicionar(true)}
                            />
                        )}
                    </div>
                </header>

                <div className="pauta-split__col-head" aria-hidden>
                    <span className="pauta-split__col-head-ord">#</span>
                    <span className="pauta-split__col-head-item">Item</span>
                </div>

                <div className="pauta-split__lista-scroll">
                    {loading ? (
                        <div className="sessao-empty-state sessao-empty-state--compact">
                            <i className="pi pi-spin pi-spinner" aria-hidden />
                            <span>Carregando pauta…</span>
                        </div>
                    ) : itens.length === 0 ? (
                        <div className="sessao-empty-state sessao-empty-state--compact">
                            <i className="pi pi-clipboard" aria-hidden />
                            <span>Nenhuma matéria na pauta</span>
                            <span className="sessao-empty-state__hint">
                                Adicione matérias para compor a pauta desta sessão.
                            </span>
                        </div>
                    ) : (
                        itens.map((item, idx) => (
                            <PautaItemCard
                                key={item.id}
                                item={item}
                                index={idx}
                                selected={item.id === selectedId}
                                somenteLeitura={somenteLeitura}
                                isFirst={idx === 0}
                                isLast={idx === itens.length - 1}
                                onSelect={() => selecionarItem(item.id)}
                                onMoverCima={() => void handleMover(idx, -1)}
                                onMoverBaixo={() => void handleMover(idx, 1)}
                            />
                        ))
                    )}
                </div>

                {canWrite && !somenteLeitura && (
                    <footer className="pauta-split__lista-footer">
                        {pautaPublicada ? (
                            <Button
                                label="Publicada"
                                icon="pi pi-send"
                                size="small"
                                text
                                disabled
                            />
                        ) : podePublicar ? (
                            <Button
                                label="Publicar pauta"
                                icon="pi pi-send"
                                size="small"
                                text
                                disabled={itens.length === 0}
                                onClick={() => setDialogPublicar(true)}
                            />
                        ) : (
                            <Button
                                label="Publicar pauta"
                                icon="pi pi-send"
                                size="small"
                                text
                                disabled
                                tooltip="A pauta só pode ser publicada enquanto a sessão está agendada."
                                tooltipOptions={SIGL_TOOLTIP_BOTTOM}
                            />
                        )}
                    </footer>
                )}
            </section>

            <PautaListaDetalhe
                sessaoId={sessao.id}
                statusSessao={sessao.statusSessao}
                itens={itens}
                selectedId={selectedId}
                somenteLeitura={somenteLeitura}
                podeDeliberar={podeDeliberar}
                onActiveChange={selecionarItem}
                onRemover={handleRemover}
                onAbrirVotacao={setAbrirVotacaoItem}
                onFecharVotacao={setFecharVotacaoItem}
                onExibirNoPainel={exibirItemNoPainel}
            />

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
