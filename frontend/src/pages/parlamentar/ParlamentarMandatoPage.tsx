import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { usePermissions } from '../../hooks/usePermissions';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { PageHeader } from '../../components/PageHeader';
import { MODULE_ICONS } from '../../app/navigation';
import { useAppToast } from '../../hooks/useAppToast';

interface Mandato {
    id: string;
    legislatura?: { nome: string; anoInicio: number; anoFim: number };
    cargo?: string;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
    isCurrent?: boolean;
}

export function ParlamentarMandatoPage() {
    const { parliamentarianId } = usePermissions();
    const { showApiError } = useAppToast();
    const [mandatos, setMandatos] = useState<Mandato[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!parliamentarianId) { setLoading(false); return; }
        parlamentaresApi
            .listMandatos(parliamentarianId)
            .then((res) => setMandatos(res.data as unknown as Mandato[]))
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

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.legislaturas}
                title="Meu mandato"
                subtitle="Histórico de mandatos legislativos."
            />

            {mandatos.length === 0 ? (
                <Card>
                    <p className="text-color-secondary text-center">Nenhum mandato encontrado.</p>
                </Card>
            ) : (
                <div className="flex flex-column gap-3">
                    {mandatos.map((m) => (
                        <Card key={m.id}>
                            <div className="flex align-items-center justify-content-between mb-2">
                                <h3 className="m-0">
                                    {m.legislatura
                                        ? `Legislatura ${m.legislatura.anoInicio}–${m.legislatura.anoFim}`
                                        : 'Mandato'}
                                </h3>
                                {m.isCurrent && <Tag value="Atual" severity="success" />}
                            </div>
                            {m.cargo && <p className="text-color-secondary mb-1">{m.cargo}</p>}
                            <div className="flex gap-4 text-sm">
                                {m.dataInicio && <span>Início: {m.dataInicio}</span>}
                                {m.dataFim && <span>Fim: {m.dataFim}</span>}
                                {m.status && <Tag value={m.status} severity="info" />}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
