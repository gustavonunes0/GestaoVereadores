import { useState } from 'react';
import { api } from '../api/client';
import { ActionCard } from '../components/common/ActionCard';
import { SiglButton } from '../components/common/SiglButton';
import { ContextBanner } from '../components/ContextBanner';
import { PageHeader } from '../components/PageHeader';
import { useLegislatura } from '../contexts/LegislaturaContext';
import { useAppToast } from '../hooks/useAppToast';

type RelatorioResult = {
  total?: number;
  totalSessoes?: number;
  materias?: unknown[];
  sessoes?: unknown[];
};

export function RelatoriosPage() {
  const { legislaturaId, sessaoLegislativaId, legislaturaAtiva, sessaoLegislativaAtiva } =
    useLegislatura();
  const { showSuccess, showApiError } = useAppToast();
  const [result, setResult] = useState<RelatorioResult | null>(null);
  const [loadingAtividade, setLoadingAtividade] = useState(false);
  const [loadingPresenca, setLoadingPresenca] = useState(false);

  const contextReady = Boolean(legislaturaId && sessaoLegislativaId);
  const loading = loadingAtividade || loadingPresenca;

  async function gerarAtividadeCompleto() {
    if (!legislaturaId || !sessaoLegislativaId) return;
    setLoadingAtividade(true);
    try {
      const data = await api<RelatorioResult>(
        '/relatorios/atividade-legislativa/completo',
        {
          method: 'POST',
          body: JSON.stringify({ legislaturaId, sessaoLegislativaId }),
        },
      );
      setResult(data);
      showSuccess('Relatório de atividade legislativa gerado.');
    } catch (err) {
      showApiError(err);
    } finally {
      setLoadingAtividade(false);
    }
  }

  async function gerarPresenca() {
    if (!legislaturaId || !sessaoLegislativaId) return;
    setLoadingPresenca(true);
    try {
      const data = await api<RelatorioResult>('/relatorios/presenca', {
        method: 'POST',
        body: JSON.stringify({ legislaturaId, sessaoLegislativaId }),
      });
      setResult(data);
      showSuccess('Relatório de presença gerado.');
    } catch (err) {
      showApiError(err);
    } finally {
      setLoadingPresenca(false);
    }
  }

  return (
    <section className="page">
      <PageHeader
        title="Relatórios"
        subtitle="Indicadores da legislatura e sessão legislativa selecionadas no topo."
      />

      <ContextBanner step="Análise" hint="Usa o mesmo contexto de matérias e sessões." />

      {legislaturaAtiva && (
        <p className="text-muted page-context">
          Contexto: Legislatura {legislaturaAtiva.numero}
          {sessaoLegislativaAtiva && ` · Sessão legislativa ${sessaoLegislativaAtiva.numero}`}
        </p>
      )}

      <div className="sigl-card-grid">
        <ActionCard
          title="Atividade legislativa (completo)"
          description="Matérias vinculadas à pauta das sessões desta sessão legislativa."
          onSubmit={(e) => {
            e.preventDefault();
            void gerarAtividadeCompleto();
          }}
          footer={
            <SiglButton
              type="submit"
              label="Gerar"
              icon="pi pi-chart-bar"
              loading={loadingAtividade}
              disabled={loading || !contextReady}
            />
          }
        />
        <ActionCard
          title="Presença em sessões"
          description="Registros de presença nas sessões plenárias do período."
          onSubmit={(e) => {
            e.preventDefault();
            void gerarPresenca();
          }}
          footer={
            <SiglButton
              type="submit"
              label="Gerar"
              icon="pi pi-users"
              loading={loadingPresenca}
              disabled={loading || !contextReady}
            />
          }
        />
      </div>

      {result && (
        <div className="sigl-result-card">
          <h2 className="card-title">Resultado</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
