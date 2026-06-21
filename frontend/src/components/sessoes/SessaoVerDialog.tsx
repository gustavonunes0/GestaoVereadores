import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { materiasApi } from '../../api/legislative/materias.api';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { ROUTES } from '../../app/navigation';
import { VerDialog } from '../common/VerDialog';
import { SiglButton } from '../common/SiglButton';
import { Dropdown } from '../ui';
import { useAppToast } from '../../hooks/useAppToast';
import { usePermissions } from '../../hooks/usePermissions';
import { canAddMateriaToPauta, SESSAO_STATUS } from '../../types/legislative';
import { AbrirSessaoDialog } from './AbrirSessaoDialog';
import { EncerrarSessaoDialog } from './EncerrarSessaoDialog';
import { SessaoDeliberacaoPanel } from './SessaoDeliberacaoPanel';
import { SessaoStatusBadge } from './SessaoStatusBadge';
import {
    type MateriaPauta,
    type Sessao,
    sessaoAceitaPauta,
    sessaoLabel,
} from './sessao.types';

interface Props {
    sessaoId: string;
    onClose: () => void;
    onUpdated: () => void;
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex gap-2 mb-2">
            <span className="font-semibold w-10rem">{label}:</span>
            <span>{value}</span>
        </div>
    );
}

export function SessaoVerDialog({ sessaoId, onClose, onUpdated }: Props) {
    const { canWrite, canManageSessao, canVotar } = usePermissions();
    const { showApiError, showSuccess } = useAppToast();

    const [detail, setDetail] = useState<Sessao | null>(null);
    const [loading, setLoading] = useState(true);
    const [lifecycleBusy, setLifecycleBusy] = useState(false);

    const [pautaOpen, setPautaOpen] = useState(false);
    const [materias, setMaterias] = useState<MateriaPauta[]>([]);
    const [materiaId, setMateriaId] = useState('');
    const [ordemPauta, setOrdemPauta] = useState(1);

    const [dialogAbrir, setDialogAbrir] = useState(false);
    const [dialogEncerrar, setDialogEncerrar] = useState(false);

    const loadDetail = useCallback(async () => {
        setLoading(true);
        try {
            const raw = await sessoesApi.getById(sessaoId);
            setDetail(raw as unknown as Sessao);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [sessaoId, showApiError]);

    useEffect(() => {
        void loadDetail();
    }, [loadDetail]);

    const sessaoEmAndamento = useMemo(
        () => !!detail && sessaoAceitaPauta(detail),
        [detail],
    );

    const podeIncluirPauta = sessaoEmAndamento && canWrite;

    function refresh() {
        void loadDetail();
        onUpdated();
    }

    async function handleLifecycle(action: 'suspender' | 'cancelar') {
        setLifecycleBusy(true);
        try {
            await sessoesApi[action](sessaoId);
            const labels = {
                suspender: 'Sessão suspensa.',
                cancelar: 'Sessão cancelada.',
            };
            showSuccess(labels[action]);
            refresh();
        } catch (err) {
            showApiError(err);
        } finally {
            setLifecycleBusy(false);
        }
    }

    async function openPautaModal() {
        if (!podeIncluirPauta || !detail) return;
        try {
            const response = await materiasApi.list({
                limit: 100,
                status: 'EM_TRAMITACAO',
            });
            const lista = response.data as unknown as MateriaPauta[];
            const elegiveis = lista.filter((m) => canAddMateriaToPauta(m));
            setMaterias(elegiveis);
            if (elegiveis[0]) setMateriaId(elegiveis[0].id);
            setOrdemPauta((detail.pautaItens?.length ?? 0) + 1);
            setPautaOpen(true);
        } catch (err) {
            showApiError(err);
        }
    }

    async function handleAddPauta(e: FormEvent) {
        e.preventDefault();
        if (!podeIncluirPauta) return;
        try {
            await sessoesApi.addPautaItem(sessaoId, {
                materiaId,
                ordem: ordemPauta,
            });
            setPautaOpen(false);
            showSuccess('Matéria incluída na pauta.');
            refresh();
        } catch (err) {
            showApiError(err);
        }
    }

    const titulo = detail ? sessaoLabel(detail) : 'Sessão plenária';

    return (
        <>
            <VerDialog
                visible
                title={titulo}
                onClose={onClose}
                width="min(95vw, 44rem)"
            >
                {loading && <p className="text-color-secondary m-0">Carregando…</p>}

                {detail && !loading && (
                    <div className="flex flex-column gap-3">
                        <div className="flex align-items-center gap-2 flex-wrap">
                            {detail.statusSessao && (
                                <SessaoStatusBadge status={detail.statusSessao} />
                            )}
                            <span className="text-color-secondary">
                                {detail.tipo?.nome ?? '—'}
                            </span>
                        </div>

                        <div className="border-top-1 surface-border pt-3">
                            <DetailRow
                                label="Data início"
                                value={new Date(detail.dataInicio).toLocaleString('pt-BR')}
                            />
                            <DetailRow
                                label="Situação"
                                value={
                                    detail.statusSessao
                                        ? SESSAO_STATUS[detail.statusSessao]
                                        : detail.situacao?.nome
                                }
                            />
                            <DetailRow
                                label="Legislatura"
                                value={
                                    detail.sessaoLegislativa?.legislatura?.numero
                                        ? `${detail.sessaoLegislativa.legislatura.numero}ª`
                                        : undefined
                                }
                            />
                            {detail.mensagem && (
                                <DetailRow label="Mensagem" value={detail.mensagem} />
                            )}
                        </div>

                        <div className="detail-actions sigl-cluster">
                            {canWrite && (
                                <SiglButton
                                    label="Incluir na pauta"
                                    icon="pi pi-list"
                                    disabled={!podeIncluirPauta}
                                    onClick={() => void openPautaModal()}
                                />
                            )}
                            <Link to={ROUTES.materias}>
                                <SiglButton
                                    label="Ver matérias"
                                    icon="pi pi-file"
                                    severity="secondary"
                                    outlined
                                />
                            </Link>
                        </div>

                        {canManageSessao && detail.statusSessao && (
                            <div className="sigl-cluster">
                                {detail.statusSessao === 'AGENDADA' && (
                                    <>
                                        <SiglButton
                                            label="Abrir sessão"
                                            icon="pi pi-play"
                                            onClick={() => setDialogAbrir(true)}
                                            disabled={lifecycleBusy}
                                        />
                                        <SiglButton
                                            label="Cancelar sessão"
                                            icon="pi pi-times"
                                            severity="danger"
                                            outlined
                                            onClick={() => void handleLifecycle('cancelar')}
                                            disabled={lifecycleBusy}
                                        />
                                    </>
                                )}
                                {detail.statusSessao === 'ABERTA' && (
                                    <>
                                        <SiglButton
                                            label="Suspender"
                                            icon="pi pi-pause"
                                            severity="secondary"
                                            outlined
                                            onClick={() => void handleLifecycle('suspender')}
                                            disabled={lifecycleBusy}
                                        />
                                        <SiglButton
                                            label="Encerrar sessão"
                                            icon="pi pi-stop"
                                            severity="warning"
                                            onClick={() => setDialogEncerrar(true)}
                                            disabled={lifecycleBusy}
                                        />
                                    </>
                                )}
                                {detail.statusSessao === 'SUSPENSA' && (
                                    <>
                                        <SiglButton
                                            label="Retomar"
                                            icon="pi pi-play"
                                            onClick={() => setDialogAbrir(true)}
                                            disabled={lifecycleBusy}
                                        />
                                        <SiglButton
                                            label="Encerrar sessão"
                                            icon="pi pi-stop"
                                            severity="warning"
                                            onClick={() => setDialogEncerrar(true)}
                                            disabled={lifecycleBusy}
                                        />
                                    </>
                                )}
                            </div>
                        )}

                        <div className="border-top-1 surface-border pt-3">
                            <h4 className="mt-0 mb-2 text-base font-semibold">
                                Pauta, presenças e votação
                            </h4>
                            <SessaoDeliberacaoPanel
                                sessaoId={sessaoId}
                                pautaItens={detail.pautaItens ?? []}
                                presencas={detail.presencas ?? []}
                                canWrite={canWrite}
                                canManageSessao={canManageSessao}
                                canVotar={canVotar}
                                sessaoEmAndamento={sessaoEmAndamento}
                                onUpdated={refresh}
                            />
                        </div>
                    </div>
                )}
            </VerDialog>

            {pautaOpen && (
                <VerDialog
                    visible
                    title="Incluir matéria na pauta"
                    onClose={() => setPautaOpen(false)}
                    width="min(90vw, 480px)"
                >
                    <form onSubmit={handleAddPauta} className="flex flex-column gap-3">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pauta-materia">Matéria *</label>
                            <Dropdown
                                id="pauta-materia"
                                value={materiaId}
                                options={materias.map((m) => ({
                                    label: `${m.tipo?.nome ? `${m.tipo.nome}: ` : ''}${m.ementa.slice(0, 80)}`,
                                    value: m.id,
                                }))}
                                onChange={(v) => setMateriaId(String(v))}
                                placeholder={
                                    materias.length
                                        ? undefined
                                        : 'Nenhuma matéria em tramitação'
                                }
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pauta-ordem">Ordem na pauta *</label>
                            <InputText
                                id="pauta-ordem"
                                type="number"
                                min={1}
                                value={String(ordemPauta)}
                                onChange={(e) => setOrdemPauta(Number(e.target.value))}
                                required
                            />
                        </div>
                        <Button type="submit" label="Incluir" icon="pi pi-check" />
                    </form>
                </VerDialog>
            )}

            {dialogAbrir && (
                <AbrirSessaoDialog
                    sessaoId={sessaoId}
                    onClose={() => setDialogAbrir(false)}
                    onSaved={refresh}
                />
            )}

            {dialogEncerrar && (
                <EncerrarSessaoDialog
                    sessaoId={sessaoId}
                    onClose={() => setDialogEncerrar(false)}
                    onSaved={refresh}
                />
            )}
        </>
    );
}
