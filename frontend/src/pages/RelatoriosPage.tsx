import { useState } from 'react';
import { api } from '../api/client';
import { API_PATHS } from '../api/paths';
import { ActionCard } from '../components/common/ActionCard';
import { SiglButton } from '../components/common/SiglButton';
import { MODULE_ICONS } from '../app/navigation';
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
    const { legislaturaId, legislaturaAtiva } = useLegislatura();
    const { showSuccess, showApiError } = useAppToast();
    const [result, setResult] = useState<RelatorioResult | null>(null);
    const [sessaoLegislativaId, setSessaoLegislativaId] = useState('');
    const [loadingAtividade, setLoadingAtividade] = useState(false);
    const [loadingPresenca, setLoadingPresenca] = useState(false);

    const contextReady = Boolean(legislaturaId && sessaoLegislativaId.trim());
    const loading = loadingAtividade || loadingPresenca;

    async function gerarAtividadeCompleto() {
        if (!legislaturaId || !sessaoLegislativaId.trim()) return;
        setLoadingAtividade(true);
        try {
            const data = await api<RelatorioResult>(
                API_PATHS.relatorioAtividade,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        legislaturaId,
                        sessaoLegislativaId: sessaoLegislativaId.trim(),
                    }),
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
        if (!legislaturaId || !sessaoLegislativaId.trim()) return;
        setLoadingPresenca(true);
        try {
            const data = await api<RelatorioResult>(
                API_PATHS.relatorioPresenca,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        legislaturaId,
                        sessaoLegislativaId: sessaoLegislativaId.trim(),
                    }),
                },
            );
            setResult(data);
            showSuccess('Relatório de presença gerado.');
        } catch (err) {
            showApiError(err);
        } finally {
            setLoadingPresenca(false);
        }
    }

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.relatorios}
                title="Relatórios"
                subtitle="Indicadores por legislatura. Informe o ID da sessão legislativa legada quando necessário."
            />


            {legislaturaAtiva && (
                <p className="text-muted page-context">
                    Contexto: Legislatura {legislaturaAtiva.numero}ª
                </p>
            )}

            <label style={{ maxWidth: '28rem', display: 'block' }}>
                ID da sessão legislativa (legado)
                <input
                    value={sessaoLegislativaId}
                    onChange={(e) => setSessaoLegislativaId(e.target.value)}
                    placeholder="UUID da sessão legislativa"
                />
            </label>

            <div className="sigl-card-grid pt-4">
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
        </main>
    );
}
