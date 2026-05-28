import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiList, apiTotal } from '../api/client';
import { ContextBanner } from '../components/ContextBanner';
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
    to: '/camara/parlamentares',
  },
  {
    step: '2',
    title: 'Matérias',
    desc: 'Protocolo, autores e tramitação',
    to: '/materias',
  },
  {
    step: '3',
    title: 'Sessões',
    desc: 'Pauta, presença e deliberação',
    to: '/sessoes',
  },
  {
    step: '4',
    title: 'Publicação',
    desc: 'Normas e atos resultantes',
    to: '/publicacao/normas',
  },
];

export function DashboardPage() {
  const { legislaturaAtiva, sessaoLegislativaAtiva } = useLegislatura();
  const [stats, setStats] = useState({
    parlamentares: 0,
    materias: 0,
    emTramitacao: 0,
    sessoes: 0,
  });
  const [recentes, setRecentes] = useState<MateriaResumo[]>([]);

  useEffect(() => {
    Promise.all([
      apiTotal('/parlamentares'),
      apiTotal('/materias'),
      apiList<MateriaResumo>('/materias', { limit: 5, emTramitacao: true }),
      apiTotal('/sessoes'),
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
    <>
      <PageHeader
        title="Painel legislativo"
        subtitle="Acompanhe o fluxo da legislatura em exercício e acesse cada etapa em sequência."
      />

      <ContextBanner hint="O contexto abaixo vale para matérias, sessões e relatórios." />

      <div className="pipeline">
        {pipeline.map((p, i) => (
          <Link key={p.to} to={p.to} className="pipeline-step">
            <span className="pipeline-num">{p.step}</span>
            <div>
              <strong>{p.title}</strong>
              <p>{p.desc}</p>
            </div>
            {i < pipeline.length - 1 && <span className="pipeline-arrow" aria-hidden>→</span>}
          </Link>
        ))}
      </div>

      <div className="form-grid" style={{ margin: '1.25rem 0' }}>
        {[
          ['Parlamentares', stats.parlamentares, '/camara/parlamentares'],
          ['Matérias', stats.materias, '/materias'],
          ['Em tramitação', stats.emTramitacao, '/materias'],
          ['Sessões plenárias', stats.sessoes, '/sessoes'],
        ].map(([label, value, to]) => (
          <Link key={String(label)} to={String(to)} className="stat-card card">
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
                <span>Sessão legislativa</span>
                <strong>
                  {sessaoLegislativaAtiva
                    ? `${sessaoLegislativaAtiva.numero}ª`
                    : '—'}
                </strong>
              </li>
            </ul>
          ) : (
            <p className="muted">
              Cadastre uma legislatura em{' '}
              <Link to="/camara/legislaturas">Estrutura da Câmara</Link>.
            </p>
          )}
          <div className="quick-actions">
            <Link to="/materias" className="btn btn-primary btn-sm">
              Nova matéria
            </Link>
            <Link to="/sessoes" className="btn btn-secondary btn-sm">
              Sessões
            </Link>
            <Link to="/relatorios" className="btn btn-secondary btn-sm">
              Relatórios
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Matérias em tramitação</h2>
          {recentes.length === 0 ? (
            <p className="muted">Nenhuma matéria em tramitação no momento.</p>
          ) : (
            <ul className="materia-list">
              {recentes.map((m) => (
                <li key={m.id}>
                  <span className="badge">{m.tipo?.nome ?? 'Matéria'}</span>
                  <span>{m.ementa}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/materias" className="link-more">
            Ver todas as matérias →
          </Link>
        </div>
      </div>
    </>
  );
}
