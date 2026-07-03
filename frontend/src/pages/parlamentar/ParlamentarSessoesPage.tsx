import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { ROUTES } from '../../app/navigation';
import { PageHeader } from '../../components/PageHeader';
import { SessaoStatusBadge } from '../../components/sessoes/SessaoStatusBadge';
import { sessaoLabel, type Sessao } from '../../components/sessoes/sessao.types';
import { useAppToast } from '../../hooks/useAppToast';
import type { StatusSessao } from '../../types/sessoes';

const STATUS_ORDER: Record<StatusSessao, number> = {
    ABERTA: 0,
    SUSPENSA: 1,
    AGENDADA: 2,
    ENCERRADA: 3,
    CANCELADA: 4,
};

function sortSessoes(items: Sessao[]): Sessao[] {
    return [...items].sort((a, b) => {
        const statusA = a.statusSessao ?? 'AGENDADA';
        const statusB = b.statusSessao ?? 'AGENDADA';
        const statusDiff = STATUS_ORDER[statusA] - STATUS_ORDER[statusB];
        if (statusDiff !== 0) return statusDiff;
        return new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime();
    });
}

export function ParlamentarSessoesPage() {
    const navigate = useNavigate();
    const { showApiError } = useAppToast();
    const [items, setItems] = useState<Sessao[]>([]);
    const [sessaoAtivaId, setSessaoAtivaId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const [r, ativa] = await Promise.all([
                sessoesApi.list({ limit: 50, page: 1 }),
                sessoesApi.getSessaoAtiva().catch(() => null),
            ]);
            setItems(sortSessoes(r.data as unknown as Sessao[]));
            setSessaoAtivaId(ativa?.id ?? null);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    const sessaoAtiva = useMemo(
        () => items.find((item) => item.id === sessaoAtivaId) ?? null,
        [items, sessaoAtivaId],
    );

    return (
        <div className="parl-sessoes-page">
            <PageHeader
                title="Sessões"
                subtitle="Sessões de votação da Câmara"
                icon="calendar_month"
            />

            {loading ? (
                <div className="flex justify-content-center py-5">
                    <ProgressSpinner />
                </div>
            ) : (
                <>
                    {sessaoAtiva ? (
                        <div className="parl-sessao-ativa-card">
                            <div>
                                <span className="parl-sessao-ativa-card__label">Sessão em andamento</span>
                                <strong>{sessaoLabel(sessaoAtiva)}</strong>
                            </div>
                            <Button
                                label="Entrar na sessão"
                                icon="pi pi-sign-in"
                                onClick={() =>
                                    navigate(`${ROUTES.parlamentar.sessoes}/${sessaoAtiva.id}`)
                                }
                            />
                        </div>
                    ) : null}

                    {items.length === 0 ? (
                        <p className="text-color-secondary">Nenhuma sessão disponível no momento.</p>
                    ) : (
                        <div className="parl-sessao-cards">
                            {items.map((sessao) => (
                                <button
                                    key={sessao.id}
                                    type="button"
                                    className="parl-sessao-card"
                                    onClick={() =>
                                        navigate(`${ROUTES.parlamentar.sessoes}/${sessao.id}`)
                                    }
                                >
                                    <div className="parl-sessao-card__header">
                                        <strong>{sessaoLabel(sessao)}</strong>
                                        {sessao.statusSessao ? (
                                            <SessaoStatusBadge status={sessao.statusSessao} />
                                        ) : null}
                                    </div>
                                    {sessao.mensagem ? (
                                        <p className="parl-sessao-card__desc">{sessao.mensagem}</p>
                                    ) : null}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
