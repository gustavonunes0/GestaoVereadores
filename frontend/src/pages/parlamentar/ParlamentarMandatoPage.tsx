import { useCallback, useEffect, useMemo, useState } from 'react';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import {
    parlamentaresApi,
    type ParlamentarMandato,
} from '../../api/legislative/parlamentares.api';
import { MODULE_ICONS } from '../../app/navigation';
import { DataTableLayout } from '../../components/common/DataTableLayout';
import { PageHeader } from '../../components/PageHeader';
import { useAppToast } from '../../hooks/useAppToast';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDatePt } from '../../utils/formatDate';

const MANDATE_STATUS_LABEL: Record<string, string> = {
    ACTIVE: 'Titular',
    FINISHED: 'Encerrado',
    INTERRUPTED: 'Interrompido',
    LICENSED: 'Licenciado',
};

const MANDATE_STATUS_SEVERITY: Record<
    string,
    'success' | 'secondary' | 'warning' | 'danger' | 'info'
> = {
    ACTIVE: 'success',
    FINISHED: 'secondary',
    INTERRUPTED: 'danger',
    LICENSED: 'warning',
};

function formatPeriodo(inicio?: string, fim?: string, emAberto = 'em exercício'): string {
    const de = formatDatePt(inicio);
    const ate = fim ? formatDatePt(fim) : emAberto;
    return `${de} – ${ate}`;
}

function formatPartido(sigla?: string | null, nome?: string | null): string {
    const s = sigla?.trim();
    const n = nome?.trim();
    if (!s && !n) return '—';
    if (!s) return n!;
    if (!n) return s;
    if (s.toUpperCase() === n.toUpperCase()) return s;
    return `${s} — ${n}`;
}

function ordenarMandatos(items: ParlamentarMandato[]): ParlamentarMandato[] {
    return [...items].sort((a, b) => {
        if (a.legislature.isCurrent !== b.legislature.isCurrent) {
            return a.legislature.isCurrent ? -1 : 1;
        }
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
        if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
        return b.legislature.number - a.legislature.number;
    });
}

function selecionarMandatoAtual(items: ParlamentarMandato[]): ParlamentarMandato | undefined {
    return (
        items.find((m) => m.status === 'ACTIVE' && m.legislature.isCurrent) ??
        items.find((m) => m.status === 'ACTIVE') ??
        items.find((m) => m.legislature.isCurrent)
    );
}

export function ParlamentarMandatoPage() {
    const { parliamentarianId } = usePermissions();
    const { showApiError } = useAppToast();
    const [mandatos, setMandatos] = useState<ParlamentarMandato[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const buscar = useCallback(async () => {
        if (!parliamentarianId) {
            setMandatos([]);
            return;
        }

        setLoading(true);
        try {
            const res = await parlamentaresApi.listMandatos(parliamentarianId);
            setMandatos(ordenarMandatos(res.data));
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [parliamentarianId, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    const mandatoAtual = useMemo(() => selecionarMandatoAtual(mandatos), [mandatos]);

    const columns = (
        <>
            <Column
                header="Legislatura"
                body={(row: ParlamentarMandato) => (
                    <div className="flex align-items-center gap-2 flex-wrap">
                        <span className="font-medium">
                            {row.legislature.number}ª Legislatura
                        </span>
                        {row.legislature.isCurrent ? (
                            <Tag value="Atual" severity="success" />
                        ) : null}
                    </div>
                )}
            />
            <Column
                header="Período legislativo"
                body={(row: ParlamentarMandato) =>
                    formatPeriodo(
                        row.legislature.startDate,
                        row.legislature.endDate,
                        'em curso',
                    )
                }
                style={{ width: '12rem' }}
            />
            <Column
                header="Mandato"
                body={(row: ParlamentarMandato) =>
                    formatPeriodo(row.startedAt, row.endedAt)
                }
                style={{ width: '12rem' }}
            />
            <Column
                header="Partido"
                body={(row: ParlamentarMandato) =>
                    formatPartido(row.partyAcronym, row.partyName)
                }
            />
            <Column
                header="Situação"
                body={(row: ParlamentarMandato) => (
                    <Tag
                        value={
                            MANDATE_STATUS_LABEL[row.status] ?? row.status
                        }
                        severity={MANDATE_STATUS_SEVERITY[row.status] ?? 'info'}
                    />
                )}
                style={{ width: '8rem' }}
            />
        </>
    );

    if (loading) {
        return (
            <div className="flex justify-content-center p-5">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.legislaturas}
                title="Meu mandato"
                subtitle="Legislatura em exercício e histórico de mandatos."
            />

            {mandatoAtual ? (
                <section
                    aria-label="Mandato em exercício"
                    className="parlamentar-mandato-atual"
                >
                    <div className="parlamentar-mandato-atual__header">
                        <div>
                            <span className="parlamentar-mandato-atual__eyebrow">
                                Mandato em exercício
                            </span>
                            <h2 className="parlamentar-mandato-atual__titulo">
                                {mandatoAtual.legislature.number}ª Legislatura
                            </h2>
                        </div>
                        <div className="parlamentar-mandato-atual__tags">
                            {mandatoAtual.legislature.isCurrent ? (
                                <Tag value="Legislatura atual" severity="success" />
                            ) : null}
                            <Tag
                                value={
                                    MANDATE_STATUS_LABEL[mandatoAtual.status] ??
                                    mandatoAtual.status
                                }
                                severity={
                                    MANDATE_STATUS_SEVERITY[mandatoAtual.status] ??
                                    'info'
                                }
                            />
                        </div>
                    </div>

                    <dl className="parlamentar-mandato-atual__grid">
                        <div className="parlamentar-mandato-atual__item">
                            <dt>Período da legislatura</dt>
                            <dd>
                                {formatPeriodo(
                                    mandatoAtual.legislature.startDate,
                                    mandatoAtual.legislature.endDate,
                                    'em curso',
                                )}
                            </dd>
                        </div>
                        <div className="parlamentar-mandato-atual__item">
                            <dt>Início do mandato</dt>
                            <dd>{formatDatePt(mandatoAtual.startedAt)}</dd>
                        </div>
                        <div className="parlamentar-mandato-atual__item">
                            <dt>Término do mandato</dt>
                            <dd>
                                {mandatoAtual.endedAt
                                    ? formatDatePt(mandatoAtual.endedAt)
                                    : 'Em exercício'}
                            </dd>
                        </div>
                        <div className="parlamentar-mandato-atual__item">
                            <dt>Partido no mandato</dt>
                            <dd>
                                {formatPartido(
                                    mandatoAtual.partyAcronym,
                                    mandatoAtual.partyName,
                                )}
                            </dd>
                        </div>
                    </dl>
                </section>
            ) : null}

            <section aria-label="Histórico de mandatos">
                {mandatos.length === 0 ? (
                    <div className="parlamentar-mandato-empty">
                        <p>Nenhum mandato cadastrado para o seu perfil parlamentar.</p>
                    </div>
                ) : (
                    <DataTableLayout<ParlamentarMandato>
                        items={mandatos}
                        total={mandatos.length}
                        loading={false}
                        page={page}
                        onPageChange={setPage}
                        columns={columns}
                        canWrite={false}
                        hideActionsColumn
                        enableSort={false}
                    />
                )}
            </section>
        </main>
    );
}
