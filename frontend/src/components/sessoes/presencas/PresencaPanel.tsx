import { useCallback, useEffect, useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { confirmDialog } from 'primereact/confirmdialog';
import { api } from '../../../api/client';
import { API_PATHS } from '../../../api/paths';
import { parlamentaresApi } from '../../../api/legislative/parlamentares.api';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSessaoRealtime } from '../../../hooks/useSessaoRealtime';
import { useAppToast } from '../../../hooks/useAppToast';
import type { OrigemPresenca, PresencaSessao } from '../../../types/presenca';
import type { StatusSessao } from '../../../types/sessoes';
import {
    buildPresencaSessao,
    fetchMesaMembrosAtivos,
    type PresencaRegistroApi,
} from '../../../utils/presencaSessao';
import { PresencaMetrics } from './PresencaMetrics';
import { PlenarioMapa } from './PlenarioMapa';

function atualizarParlamentar(
    prev: PresencaSessao,
    parliamentarianId: string,
    patch: Partial<PresencaSessao['parlamentares'][number]>,
): PresencaSessao {
    const map = (p: PresencaSessao['parlamentares'][number]) =>
        p.parliamentarianId === parliamentarianId ? { ...p, ...patch } : p;
    const parlamentares = prev.parlamentares.map(map);
    const mesaMembros = prev.mesaMembros.map(map);
    const vereadores = prev.vereadores.map(map);
    const presentes = parlamentares.filter((p) => p.presente).length;
    const quorumMinimo = prev.quorumMinimo;
    return {
        ...prev,
        parlamentares,
        mesaMembros,
        vereadores,
        presentes,
        ausentes: parlamentares.length - presentes,
        temQuorum: presentes >= quorumMinimo,
    };
}

function togglePresencaLocal(
    prev: PresencaSessao,
    parliamentarianId: string,
    novoPresente: boolean,
    origem: OrigemPresenca,
): PresencaSessao {
    return atualizarParlamentar(prev, parliamentarianId, {
        presente: novoPresente,
        origem,
        registradoEm: new Date().toISOString(),
    });
}

function aplicarUpdate(
    prev: PresencaSessao,
    update: {
        parliamentarianId?: string;
        parlamentarianUserId: string;
        presente: boolean;
        origem: 'APP' | 'STAFF';
        presentes: number;
        ausentes: number;
        temQuorum: boolean;
    },
): PresencaSessao {
    const parliamentarianId = update.parliamentarianId ?? update.parlamentarianUserId;
    const base = atualizarParlamentar(prev, parliamentarianId, {
        presente: update.presente,
        origem: update.origem,
        registradoEm: new Date().toISOString(),
    });
    return {
        ...base,
        presentes: update.presentes,
        ausentes: update.ausentes,
        temQuorum: update.temQuorum,
    };
}

export function PresencaPanel({
    sessaoId,
    legislatureId,
    legislaturaNumero,
    statusSessao,
}: {
    sessaoId: string;
    legislatureId?: string | null;
    /** Número da legislatura da sessão — usado para resolver o ID EN da mesa diretora. */
    legislaturaNumero?: number | null;
    statusSessao?: StatusSessao | null;
}) {
    const { canWrite } = useAuth();
    const { showApiError, showSuccess } = useAppToast();
    const [presenca, setPresenca] = useState<PresencaSessao | null>(null);
    const [chamando, setChamando] = useState(false);
    const [dialogReiniciar, setDialogReiniciar] = useState(false);
    const [justificativa, setJustificativa] = useState('');
    const [reiniciando, setReiniciando] = useState(false);
    const sessaoAceitaPresenca = ['AGENDADA', 'ABERTA', 'SUSPENSA'].includes(statusSessao ?? '');
    const podeRegistrar = canWrite && sessaoAceitaPresenca;
    const podeChamar = canWrite && statusSessao === 'ABERTA';

    const carregar = useCallback(async () => {
        try {
            const [parlamentares, registros, quorum, mesaMembros] = await Promise.all([
                parlamentaresApi.listActiveAll(),
                api<PresencaRegistroApi[]>(API_PATHS.sessoesPresencas(sessaoId)),
                sessoesApi.getQuorum(sessaoId),
                fetchMesaMembrosAtivos({
                    legislatureId: legislatureId ?? undefined,
                    legislaturaNumero: legislaturaNumero ?? undefined,
                }),
            ]);

            setPresenca(
                buildPresencaSessao({
                    sessaoId,
                    parlamentares,
                    mesaMembros,
                    registros,
                    quorumMinimo: quorum.minimo,
                }),
            );
        } catch (err) {
            showApiError(err);
        }
    }, [sessaoId, legislatureId, legislaturaNumero, showApiError]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    const { presencaUpdate, wsConectado } = useSessaoRealtime(sessaoId);
    useEffect(() => {
        if (presencaUpdate) {
            setPresenca((prev) => (prev ? aplicarUpdate(prev, presencaUpdate) : prev));
        }
    }, [presencaUpdate]);

    useEffect(() => {
        if (wsConectado) return;
        const timer = window.setInterval(() => void carregar(), 10000);
        return () => window.clearInterval(timer);
    }, [wsConectado, carregar]);

    const handleToggle = async (parliamentarianId: string) => {
        if (!presenca) return;
        const atual = presenca.parlamentares.find(
            (p) => p.parliamentarianId === parliamentarianId,
        );
        const novoPresente = !atual?.presente;
        const origemAnterior: OrigemPresenca = atual?.origem ?? null;

        setPresenca((prev) =>
            prev ? togglePresencaLocal(prev, parliamentarianId, novoPresente, 'STAFF') : prev,
        );

        try {
            if (atual?.presencaId) {
                await api(API_PATHS.sessaoPresencaToggle(sessaoId, atual.presencaId), {
                    method: 'PATCH',
                    body: JSON.stringify({
                        presente: novoPresente,
                        situacao: novoPresente ? 'PRESENTE' : 'AUSENTE',
                    }),
                });
            } else if (novoPresente) {
                const criado = await sessoesApi.registrarPresenca(sessaoId, {
                    parliamentarianId,
                    presente: true,
                    situacao: 'PRESENTE',
                });
                const presencaId = (criado as { id?: string }).id;
                if (presencaId) {
                    setPresenca((prev) =>
                        prev ? atualizarParlamentar(prev, parliamentarianId, { presencaId }) : prev,
                    );
                }
            }
        } catch (err) {
            setPresenca((prev) =>
                prev
                    ? togglePresencaLocal(prev, parliamentarianId, !novoPresente, origemAnterior)
                    : prev,
            );
            showApiError(err);
        }
    };

    async function chamarVereadores() {
        setChamando(true);
        try {
            const resultado = await sessoesApi.chamarVereadores(sessaoId);
            showSuccess(
                `Chamada realizada — ${resultado.totalPresentes} presentes, ${resultado.totalAusentes} ausentes.`,
            );
            await carregar();
        } catch (err) {
            showApiError(err);
        } finally {
            setChamando(false);
        }
    }

    function confirmarChamada() {
        confirmDialog({
            header: 'Realizar chamada',
            message: 'Isso registra a presença de todos os parlamentares ainda sem registro nesta sessão como ausentes. Confirma?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: () => void chamarVereadores(),
        });
    }

    async function reiniciarChamada() {
        if (justificativa.trim().length < 3) return;
        setReiniciando(true);
        try {
            await sessoesApi.reiniciarChamada(sessaoId, justificativa.trim());
            showSuccess('Chamada reiniciada.');
            setDialogReiniciar(false);
            setJustificativa('');
            await carregar();
        } catch (err) {
            showApiError(err);
        } finally {
            setReiniciando(false);
        }
    }

    if (!presenca) {
        return (
            <div className="flex justify-content-center p-4">
                <ProgressSpinner style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    if (presenca.parlamentares.length === 0) {
        return (
            <div className="sessao-empty-state sessao-empty-state--compact">
                <i className="pi pi-users" aria-hidden />
                <span>Nenhum parlamentar ativo cadastrado</span>
                <span className="sessao-empty-state__hint">
                    Cadastre vereadores ativos em Parlamentares.
                </span>
            </div>
        );
    }

    return (
        <div className="presenca-panel">
            {podeChamar && (
                <div className="flex gap-2 mb-3">
                    <Button
                        label="Realizar chamada"
                        icon="pi pi-verified"
                        size="small"
                        loading={chamando}
                        onClick={confirmarChamada}
                    />
                    <Button
                        label="Reiniciar chamada"
                        icon="pi pi-refresh"
                        size="small"
                        outlined
                        severity="secondary"
                        onClick={() => setDialogReiniciar(true)}
                    />
                </div>
            )}
            <PresencaMetrics presenca={presenca} />
            <PlenarioMapa
                presenca={presenca}
                podeRegistrar={podeRegistrar}
                onToggle={handleToggle}
            />

            <Dialog
                header="Reiniciar chamada"
                visible={dialogReiniciar}
                onHide={() => setDialogReiniciar(false)}
                style={{ width: '30rem' }}
            >
                <p>Esta ação reseta a presença de todos os parlamentares para ausente. Informe a justificativa:</p>
                <InputTextarea
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    rows={3}
                    className="w-full"
                    autoResize
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Cancelar" text onClick={() => setDialogReiniciar(false)} />
                    <Button
                        label="Confirmar"
                        severity="danger"
                        disabled={justificativa.trim().length < 3}
                        loading={reiniciando}
                        onClick={() => void reiniciarChamada()}
                    />
                </div>
            </Dialog>
            {!podeRegistrar && canWrite && !sessaoAceitaPresenca && (
                <p className="presenca-readonly-hint">
                    Sessão encerrada ou cancelada — alteração de presença não é permitida.
                </p>
            )}
            {!podeRegistrar && !canWrite && (
                <p className="presenca-readonly-hint">
                    Visualização em tempo real. A presença é registrada pelos parlamentares no
                    aplicativo — as cadeiras ficam verdes conforme o registro.
                </p>
            )}
        </div>
    );
}
