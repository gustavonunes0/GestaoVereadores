import { FormEvent, useState } from 'react';
import { api } from '../api/client';
import { ContextBanner } from '../components/ContextBanner';
import { PageHeader } from '../components/PageHeader';
import { useLegislatura } from '../contexts/LegislaturaContext';

type RelatorioResult = {
  total?: number;
  totalSessoes?: number;
  materias?: unknown[];
  sessoes?: unknown[];
};

export function RelatoriosPage() {
  const { legislaturaId, sessaoLegislativaId, legislaturaAtiva, sessaoLegislativaAtiva } =
    useLegislatura();
  const [result, setResult] = useState<RelatorioResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function gerarAtividadeCompleto(e: FormEvent) {
    e.preventDefault();
    if (!legislaturaId || !sessaoLegislativaId) return;
    setLoading(true);
    try {
      const data = await api<RelatorioResult>(
        '/relatorios/atividade-legislativa/completo',
        {
          method: 'POST',
          body: JSON.stringify({ legislaturaId, sessaoLegislativaId }),
        },
      );
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  async function gerarPresenca(e: FormEvent) {
    e.preventDefault();
    if (!legislaturaId || !sessaoLegislativaId) return;
    setLoading(true);
    try {
      const data = await api<RelatorioResult>('/relatorios/presenca', {
        method: 'POST',
        body: JSON.stringify({ legislaturaId, sessaoLegislativaId }),
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Indicadores da legislatura e sessão legislativa selecionadas no topo."
      />

      <ContextBanner step="Análise" hint="Usa o mesmo contexto de matérias e sessões." />

      {legislaturaAtiva && (
        <p className="muted" style={{ marginBottom: '1rem' }}>
          Contexto: Legislatura {legislaturaAtiva.numero}
          {sessaoLegislativaAtiva && ` · Sessão legislativa ${sessaoLegislativaAtiva.numero}`}
        </p>
      )}

      <div className="form-grid">
        <form className="card" onSubmit={gerarAtividadeCompleto}>
          <h2 className="card-title">Atividade legislativa (completo)</h2>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            Matérias vinculadas à pauta das sessões desta sessão legislativa.
          </p>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !sessaoLegislativaId}
          >
            Gerar
          </button>
        </form>
        <form className="card" onSubmit={gerarPresenca}>
          <h2 className="card-title">Presença em sessões</h2>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            Registros de presença nas sessões plenárias do período.
          </p>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !sessaoLegislativaId}
          >
            Gerar
          </button>
        </form>
      </div>

      {result && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h2 className="card-title">Resultado</h2>
          <pre style={{ fontSize: '0.85rem', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}
