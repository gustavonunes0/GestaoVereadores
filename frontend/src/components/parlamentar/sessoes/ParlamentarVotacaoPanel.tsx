import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { SelectButton } from 'primereact/selectbutton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { usePermissions } from '../../../hooks/usePermissions';
import { useAppToast } from '../../../hooks/useAppToast';
import type { VotacaoAbertaEvent } from '../../../types/legislative';

const VOTO_OPTIONS = [
    { label: 'Sim', value: 'SIM' },
    { label: 'Não', value: 'NAO' },
    { label: 'Abstenção', value: 'ABSTENCAO' },
];

interface Props {
    sessaoId: string;
    hasConfirmed: boolean;
    votacaoAberta: VotacaoAbertaEvent | null;
    statusSessao: string;
}

function findMyVote(
    votos: Record<string, unknown>[] | null | undefined,
    parliamentarianId: string | undefined,
): string | null {
    if (!parliamentarianId || !votos?.length) return null;

    const mine = votos.find((voto) => {
        const id =
            (voto.parlamentarId as string | undefined) ??
            (voto.parliamentarianId as string | undefined);
        return id === parliamentarianId;
    });

    if (!mine) return null;
    return (
        (mine.voto as string | undefined) ??
        (mine.valor as string | undefined) ??
        (mine.value as string | undefined) ??
        null
    );
}

function labelVoto(valor: string): string {
    return VOTO_OPTIONS.find((opt) => opt.value === valor)?.label ?? valor;
}

export function ParlamentarVotacaoPanel({
    sessaoId,
    hasConfirmed,
    votacaoAberta,
    statusSessao,
}: Props) {
    const { parliamentarianId } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();
    const [votoRegistrado, setVotoRegistrado] = useState<string | null>(null);
    const [votoSelecionado, setVotoSelecionado] = useState<string>('SIM');
    const [loadingVoto, setLoadingVoto] = useState(false);
    const [checkingVote, setCheckingVote] = useState(false);

    const pautaItemId = votacaoAberta?.pautaItemId;

    const refreshMyVote = useCallback(async () => {
        if (!pautaItemId) {
            setVotoRegistrado(null);
            return;
        }

        setCheckingVote(true);
        try {
            const votos = await sessoesApi.getVotosPautaItem(sessaoId, pautaItemId);
            setVotoRegistrado(findMyVote(votos, parliamentarianId));
        } catch {
            setVotoRegistrado(null);
        } finally {
            setCheckingVote(false);
        }
    }, [sessaoId, pautaItemId, parliamentarianId]);

    useEffect(() => {
        void refreshMyVote();
    }, [refreshMyVote]);

    const podeVotar =
        hasConfirmed &&
        !!parliamentarianId &&
        !!votacaoAberta?.aceitaVotoIndividual &&
        statusSessao === 'ABERTA';

    function handleConfirmarVoto() {
        if (!pautaItemId || !parliamentarianId || votoRegistrado) return;

        confirmDialog({
            header: 'Confirmar voto',
            message: `Deseja registrar seu voto como "${labelVoto(votoSelecionado)}"?`,
            icon: 'pi pi-question-circle',
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: () => void submitVote(),
        });
    }

    async function submitVote() {
        if (!pautaItemId || !parliamentarianId) return;

        setLoadingVoto(true);
        try {
            await sessoesApi.registrarVoto(sessaoId, pautaItemId, {
                parlamentarId: parliamentarianId,
                voto: votoSelecionado,
            });
            setVotoRegistrado(votoSelecionado);
            showSuccess('Voto registrado com sucesso.');
        } catch (err) {
            showApiError(err);
        } finally {
            setLoadingVoto(false);
        }
    }

    return (
        <section className="parl-sessao-panel">
            <ConfirmDialog />
            <h3 className="parl-sessao-panel__title">Votação</h3>

            {!votacaoAberta ? (
                <div className="parl-sessao-votacao-waiting">
                    <ProgressSpinner style={{ width: '28px', height: '28px' }} />
                    <span>Aguardando início da votação...</span>
                </div>
            ) : (
                <>
                    <p className="parl-sessao-votacao-titulo m-0">
                        <strong>{votacaoAberta.titulo}</strong>
                    </p>
                    {votacaoAberta.ementa ? (
                        <p className="parl-sessao-panel__hint">{votacaoAberta.ementa}</p>
                    ) : null}

                    {!hasConfirmed ? (
                        <p className="parl-sessao-panel__hint m-0">
                            Marque sua presença antes de votar.
                        </p>
                    ) : checkingVote ? (
                        <div className="flex justify-content-center py-2">
                            <ProgressSpinner style={{ width: '24px', height: '24px' }} />
                        </div>
                    ) : votoRegistrado ? (
                        <div className="parl-sessao-presenca-ok">
                            <i className="pi pi-check-circle" aria-hidden />
                            Voto registrado: {labelVoto(votoRegistrado)}
                        </div>
                    ) : podeVotar ? (
                        <div className="parl-sessao-votacao-form">
                            <SelectButton
                                value={votoSelecionado}
                                options={VOTO_OPTIONS}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(e) => setVotoSelecionado(e.value)}
                                disabled={loadingVoto}
                            />
                            <Button
                                label="Registrar voto"
                                icon="pi pi-check"
                                loading={loadingVoto}
                                onClick={handleConfirmarVoto}
                            />
                        </div>
                    ) : (
                        <p className="parl-sessao-panel__hint m-0">
                            Votação indisponível no momento.
                        </p>
                    )}
                </>
            )}
        </section>
    );
}
