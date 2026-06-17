import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { usePermissions } from '../../hooks/usePermissions';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { PageHeader } from '../../components/PageHeader';
import { MODULE_ICONS } from '../../app/navigation';
import { useAppToast } from '../../hooks/useAppToast';

interface Filiacao {
    id: string;
    partido: { nome: string; sigla: string; numero?: number };
    dataFiliacao?: string;
    dataDesfiliacao?: string;
    isCurrent?: boolean;
}

export function ParlamentarFiliacaoPage() {
    const { parliamentarianId } = usePermissions();
    const { showApiError } = useAppToast();
    const [filiacoes, setFiliacoes] = useState<Filiacao[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!parliamentarianId) { setLoading(false); return; }
        parlamentaresApi
            .getById(parliamentarianId)
            .then((p) => {
                const f = (p as unknown as { filiacoes?: Filiacao[] }).filiacoes;
                setFiliacoes(f ?? []);
            })
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [parliamentarianId, showApiError]);

    if (loading) {
        return (
            <div className="flex justify-content-center p-5">
                <ProgressSpinner />
            </div>
        );
    }

    const atual = filiacoes.find((f) => f.isCurrent);

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.frentes}
                title="Filiação partidária"
                subtitle="Histórico de filiações partidárias."
            />

            {atual && (
                <Card className="mb-3" title="Partido atual">
                    <div className="flex align-items-center gap-3">
                        <Tag value={atual.partido.sigla} severity="success" className="text-lg" />
                        <div>
                            <strong>{atual.partido.nome}</strong>
                            {atual.partido.numero && (
                                <span className="ml-2 text-color-secondary">Nº {atual.partido.numero}</span>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {filiacoes.filter((f) => !f.isCurrent).length > 0 && (
                <Card title="Histórico">
                    <div className="flex flex-column gap-2">
                        {filiacoes
                            .filter((f) => !f.isCurrent)
                            .map((f) => (
                                <div key={f.id} className="flex align-items-center gap-3">
                                    <Tag value={f.partido.sigla} severity="secondary" />
                                    <span>{f.partido.nome}</span>
                                    {f.dataFiliacao && (
                                        <span className="text-sm text-color-secondary">
                                            {f.dataFiliacao}
                                            {f.dataDesfiliacao && ` – ${f.dataDesfiliacao}`}
                                        </span>
                                    )}
                                </div>
                            ))}
                    </div>
                </Card>
            )}

            {filiacoes.length === 0 && (
                <Card>
                    <p className="text-color-secondary text-center">Nenhuma filiação encontrada.</p>
                </Card>
            )}
        </main>
    );
}
