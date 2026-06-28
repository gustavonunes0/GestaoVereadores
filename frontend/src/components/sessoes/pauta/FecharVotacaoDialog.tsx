import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import type { VotacaoPlacarEvent } from '../../../types/legislative';
import type { PautaItemDetalhe } from '../../../types/sessoes';
import { pautaItemRotulo } from '../../../types/sessoes';

const RESULTADO_LABEL: Record<string, string> = {
    APROVADO: 'Aprovado',
    REJEITADO: 'Rejeitado',
    EMPATADO: 'Empatado',
};

interface Props {
    sessaoId: string;
    /** Item completo ou mínimo com id para carregar detalhes. */
    item: PautaItemDetalhe | { id: string };
    placar?: VotacaoPlacarEvent | null;
    titulo?: string;
    onClose: () => void;
    onFechada: () => void;
}

export function FecharVotacaoDialog({
    sessaoId,
    item,
    placar,
    titulo,
    onClose,
    onFechada,
}: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [detalhe, setDetalhe] = useState<PautaItemDetalhe | null>(
        'fase' in item ? item : null,
    );
    const [loading, setLoading] = useState(!('fase' in item));
    const [saving, setSaving] = useState(false);

    const [votosSim, setVotosSim] = useState(0);
    const [votosNao, setVotosNao] = useState(0);
    const [abstencoes, setAbstencoes] = useState(0);
    const [votoQualidade, setVotoQualidade] = useState(false);

    const rotulo = titulo ?? (detalhe ? pautaItemRotulo(detalhe) : 'Votação');
    const tipoVotacao = detalhe?.votacao?.tipoVotacao ?? 'NOMINAL';
    const entradaManual = tipoVotacao === 'SIMBOLICA' || tipoVotacao === 'SECRETA';

    const simAtual = placar?.votosSim ?? detalhe?.votacao?.votosSim ?? 0;
    const naoAtual = placar?.votosNao ?? detalhe?.votacao?.votosNao ?? 0;
    const abstAtual = placar?.abstencoes ?? detalhe?.votacao?.abstencoes ?? 0;

    useEffect(() => {
        let ativo = true;
        if ('fase' in item) {
            setDetalhe(item);
            setLoading(false);
            return;
        }

        setLoading(true);
        void sessoesApi
            .getPautaItem(sessaoId, item.id)
            .then((data) => {
                if (!ativo) return;
                setDetalhe(data);
            })
            .catch((err) => {
                if (ativo) showApiError(err);
            })
            .finally(() => {
                if (ativo) setLoading(false);
            });

        return () => {
            ativo = false;
        };
    }, [sessaoId, item, showApiError]);

    useEffect(() => {
        if (entradaManual) {
            setVotosSim(simAtual);
            setVotosNao(naoAtual);
            setAbstencoes(abstAtual);
        }
    }, [entradaManual, simAtual, naoAtual, abstAtual]);

    async function confirmar() {
        if (!detalhe?.votacao) return;
        setSaving(true);
        try {
            if (entradaManual) {
                await sessoesApi.finalizarVotacao(sessaoId, detalhe.id, {
                    votosSim,
                    votosNao,
                    abstencoes,
                });
                showSuccess('Votação encerrada.');
            } else {
                const res = await sessoesApi.encerrarVotacao(sessaoId, detalhe.id, {
                    ...(votoQualidade ? { votoQualidade: true } : {}),
                });
                const label = RESULTADO_LABEL[res.resultado] ?? res.resultado;
                showSuccess(
                    `Votação encerrada — ${label} (Sim ${res.votosSim} · Não ${res.votosNao} · Abstenção ${res.abstencoes})`,
                );
            }
            onFechada();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={saving} />
            <Button
                label="Fechar votação"
                icon="pi pi-stop-circle"
                severity="danger"
                loading={saving}
                disabled={loading || !detalhe?.votacao}
                onClick={() => void confirmar()}
            />
        </div>
    );

    return (
        <Dialog
            header="Fechar votação"
            visible
            onHide={onClose}
            style={{ width: 'min(92vw, 480px)' }}
            footer={footer}
            modal
        >
            {loading ? (
                <div className="flex align-items-center gap-2 text-sm">
                    <i className="pi pi-spin pi-spinner" aria-hidden />
                    Carregando votação…
                </div>
            ) : (
                <div className="flex flex-column gap-3">
                    <p className="mt-0 mb-0 text-sm">
                        Encerrar votação de <strong>{rotulo}</strong>. Novos votos não poderão
                        ser registrados.
                    </p>

                    {!entradaManual && (
                        <Message
                            severity="info"
                            text={`Placar atual — Sim: ${simAtual} · Não: ${naoAtual} · Abstenções: ${abstAtual}`}
                        />
                    )}

                    {entradaManual && (
                        <div className="grid p-fluid">
                            <div className="col-4">
                                <label className="text-sm">Votos SIM</label>
                                <InputNumber
                                    value={votosSim}
                                    onValueChange={(e) => setVotosSim(e.value ?? 0)}
                                    min={0}
                                    className="w-full"
                                />
                            </div>
                            <div className="col-4">
                                <label className="text-sm">Votos NÃO</label>
                                <InputNumber
                                    value={votosNao}
                                    onValueChange={(e) => setVotosNao(e.value ?? 0)}
                                    min={0}
                                    className="w-full"
                                />
                            </div>
                            <div className="col-4">
                                <label className="text-sm">Abstenções</label>
                                <InputNumber
                                    value={abstencoes}
                                    onValueChange={(e) => setAbstencoes(e.value ?? 0)}
                                    min={0}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}

                    {!entradaManual && simAtual === naoAtual && simAtual > 0 && (
                        <div className="flex align-items-center gap-2">
                            <Checkbox
                                inputId="voto-qualidade"
                                checked={votoQualidade}
                                onChange={(e) => setVotoQualidade(!!e.checked)}
                            />
                            <label htmlFor="voto-qualidade" className="text-sm cursor-pointer">
                                Voto de qualidade do presidente (aprovar em empate)
                            </label>
                        </div>
                    )}
                </div>
            )}
        </Dialog>
    );
}
