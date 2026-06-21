import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { VerDialog } from '../common/VerDialog';
import { atosApi, type Ato } from '../../api/atos.api';
import { useAppToast } from '../../hooks/useAppToast';
import { formatDatePt } from '../../utils/formatDate';

interface Props {
    atoId: string;
    onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex gap-2 mb-2">
            <span className="font-semibold w-10rem">{label}:</span>
            <span>{value}</span>
        </div>
    );
}

export function AtoVerDialog({ atoId, onClose }: Props) {
    const { showApiError } = useAppToast();
    const [ato, setAto] = useState<Ato | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        atosApi.getById(atoId)
            .then(setAto)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [atoId, showApiError]);

    return (
        <VerDialog
            visible
            title="Detalhes do Ato Administrativo"
            onClose={onClose}
        >
            {loading && <p className="text-color-secondary">Carregando…</p>}
            {ato && !loading && (
                <div>
                    <div className="flex align-items-center gap-2 mb-3">
                        <span className="font-bold text-lg">
                            {ato.tipo.nome} nº {ato.numero}
                        </span>
                        {ato.classificacao && (
                            <span className="text-sm surface-200 border-round px-2 py-1">
                                {ato.classificacao.nome}
                            </span>
                        )}
                    </div>

                    {ato.ementa && (
                        <p className="mb-3 line-height-3">{ato.ementa}</p>
                    )}

                    <div className="border-top-1 surface-border pt-3">
                        <DetailRow label="Data do ato" value={formatDatePt(ato.dataAto)} />
                        <DetailRow label="Data de publicação" value={formatDatePt(ato.dataPublicacaoInicio)} />
                        {ato.identificador && (
                            <DetailRow label="Identificador" value={ato.identificador.nome} />
                        )}
                    </div>

                    {ato.anexoUrl && (
                        <div className="flex gap-2 mt-3 border-top-1 surface-border pt-3">
                            <Button
                                label="Ver Anexo"
                                icon="pi pi-file"
                                severity="secondary"
                                outlined
                                size="small"
                                onClick={() => window.open(ato.anexoUrl, '_blank')}
                            />
                        </div>
                    )}
                </div>
            )}
        </VerDialog>
    );
}
