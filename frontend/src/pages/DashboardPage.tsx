import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MODULE_ICONS, ROUTES } from '../app/navigation';
import { apiList, apiTotal } from '../api/client';
import { API_PATHS } from '../api/paths';
import { PageHeader } from '../components/PageHeader';
import { useLegislatura } from '../contexts/LegislaturaContext';

type MateriaResumo = {
    id: string;
    ementa: string;
    emTramitacao: boolean;
    tipo?: { nome: string };
};

const pipeline = [
    {
        step: '1',
        title: 'Estrutura',
        desc: 'Parlamentares, comissões, mesa e legislatura',
        to: ROUTES.camara.parlamentares,
    },
    {
        step: '2',
        title: 'Matérias',
        desc: 'Protocolo, autores e tramitação',
        to: ROUTES.materias,
    },
    {
        step: '3',
        title: 'Sessões',
        desc: 'Pauta, presença e votação',
        to: ROUTES.sessoes,
    },
    {
        step: '4',
        title: 'Normas jurídicas',
        desc: 'Leis, resoluções e normas oficiais',
        to: ROUTES.normasJuridicas,
    },
    {
        step: '5',
        title: 'Atos administrativos',
        desc: 'Portarias, nomeações e gestão interna',
        to: ROUTES.atosAdministrativos,
    },
];

export function DashboardPage() {
    const { legislaturaAtiva } = useLegislatura();
    const [stats, setStats] = useState({
        parlamentares: 0,
        materias: 0,
        emTramitacao: 0,
        sessoes: 0,
    });
    const [recentes, setRecentes] = useState<MateriaResumo[]>([]);

    useEffect(() => {
        Promise.all([
            apiTotal(API_PATHS.parlamentares),
            apiTotal(API_PATHS.materias),
            apiList<MateriaResumo>(API_PATHS.materias, {
                limit: 5,
                emTramitacao: true,
            }),
            apiTotal(API_PATHS.sessoes),
        ]).then(([parlamentares, materias, tram, sessoes]) => {
            setStats({
                parlamentares,
                materias,
                emTramitacao: tram.meta.total,
                sessoes,
            });
            setRecentes(tram.data);
        });
    }, []);

    return (
        <main className="dashboard-page">
            <PageHeader
                icon={MODULE_ICONS.dashboard}
                title="Painel legislativo"
                subtitle="Acompanhe o fluxo da legislatura em exercício e acesse cada etapa em sequência."
            />


            <div className="pipeline">
                {pipeline.map((p, i) => (
                    <Link key={p.to} to={p.to} className="pipeline-step">
                        <span className="pipeline-num">{p.step}</span>
                        <div>
                            <strong>{p.title}</strong>
                            <p>{p.desc}</p>
                        </div>
                        {i < pipeline.length - 1 && (
                            <span className="pipeline-arrow" aria-hidden>
                                →
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            <div className="stats-row">
                {[
                    [
                        'Parlamentares',
                        stats.parlamentares,
                        ROUTES.camara.parlamentares,
                    ],
                    ['Matérias', stats.materias, ROUTES.materias],
                    ['Em tramitação', stats.emTramitacao, ROUTES.materias],
                    ['Sessões plenárias', stats.sessoes, ROUTES.sessoes],
                ].map(([label, value, to]) => (
                    <Link
                        key={String(label)}
                        to={String(to)}
                        className="stat-card"
                    >
                        <div className="stat-value">{value}</div>
                        <div className="stat-label">{label}</div>
                    </Link>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <h2 className="card-title">Contexto atual</h2>
                    {legislaturaAtiva ? (
                        <ul className="context-list">
                            <li>
                                <span>Legislatura</span>
                                <strong>{legislaturaAtiva.numero}ª</strong>
                            </li>
                            <li>
                                <span>Em exercício</span>
                                <strong>
                                    {legislaturaAtiva.isCurrent ? 'Sim' : 'Não'}
                                </strong>
                            </li>
                        </ul>
                    ) : (
                        <p className="muted">
                            Cadastre uma legislatura em{' '}
                            <Link to={ROUTES.camara.legislaturas}>
                                Estrutura da Câmara
                            </Link>
                            .
                        </p>
                    )}
                    <div className="quick-actions">
                        <Link
                            to={ROUTES.materias}
                            className="btn btn-primary btn-sm"
                        >
                            Nova matéria
                        </Link>
                        <Link
                            to={ROUTES.sessoes}
                            className="btn btn-secondary btn-sm"
                        >
                            Sessões
                        </Link>
                        <Link
                            to={ROUTES.relatorios}
                            className="btn btn-secondary btn-sm"
                        >
                            Relatórios
                        </Link>
                    </div>
                </div>

                <div className="card">
                    <h2 className="card-title">Matérias em tramitação</h2>
                    {recentes.length === 0 ? (
                        <p className="muted">
                            Nenhuma matéria em tramitação no momento.
                        </p>
                    ) : (
                        <ul className="materia-list">
                            {recentes.map((m) => (
                                <li key={m.id}>
                                    <span className="badge">
                                        {m.tipo?.nome ?? 'Matéria'}
                                    </span>
                                    <span>{m.ementa}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link to={ROUTES.materias} className="link-more">
                        Ver todas as matérias →
                    </Link>
                </div>
            </div>
        </main>
    );
}
