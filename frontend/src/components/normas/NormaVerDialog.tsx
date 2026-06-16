import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { VerDialog } from '../common/VerDialog';
import { normasApi, type Norma } from '../../api/normas.api';
import { NormaStatusBadge } from './NormaStatusBadge';
import { useAppToast } from '../../hooks/useAppToast';
import { formatDatePt } from '../../utils/formatDate';

interface Props {
    normaId: string;
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

export function NormaVerDialog({ normaId, onClose }: Props) {
    const { showApiError } = useAppToast();
    const [norma, setNorma] = useState<Norma | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        normasApi.getById(normaId)
            .then(setNorma)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [normaId, showApiError]);

    return (
        <VerDialog
            visible
            title="Detalhes da Norma Jurídica"
            onClose={onClose}
        >
            {loading && <p className="text-color-secondary">Carregando…</p>}
            {norma && !loading && (
                <div>
                    <div className="flex align-items-center gap-2 mb-3">
                        <span className="font-bold text-lg">
                            {norma.tipo.nome} nº {norma.numero}/{norma.ano}
                        </span>
                        <NormaStatusBadge status={norma.statusDerived} />
                        {norma.complementar && (
                            <span className="text-sm text-color-secondary">(Complementar)</span>
                        )}
                    </div>

                    <p className="mb-3 line-height-3">{norma.ementa}</p>

                    <div className="border-top-1 surface-border pt-3">
                        <DetailRow label="Esfera" value={norma.esferaFederacao?.nome} />
                        <DetailRow label="Sanção" value={formatDatePt(norma.dataSancao)} />
                        <DetailRow label="Veto" value={formatDatePt(norma.dataVeto)} />
                        <DetailRow label="Promulgação" value={formatDatePt(norma.dataPromulgacao)} />
                        <DetailRow label="Publicação" value={formatDatePt(norma.dataPublicacao)} />
                        <DetailRow label="Vigência" value={formatDatePt(norma.dataVigencia)} />
                        <DetailRow label="Revogação" value={formatDatePt(norma.dataRevogacao)} />
                        {norma.materiaOrigem && (
                            <DetailRow
                                label="Matéria de origem"
                                value={norma.materiaOrigem.identificacao}
                            />
                        )}
                    </div>

                    {(norma.textoIntegralUrl || norma.audioUrl) && (
                        <div className="flex gap-2 mt-3 border-top-1 surface-border pt-3">
                            {norma.textoIntegralUrl && (
                                <Button
                                    label="Texto Integral"
                                    icon="pi pi-file-pdf"
                                    severity="secondary"
                                    outlined
                                    size="small"
                                    onClick={() => window.open(norma.textoIntegralUrl, '_blank')}
                                />
                            )}
                            {norma.audioUrl && (
                                <Button
                                    label="Áudio"
                                    icon="pi pi-volume-up"
                                    severity="secondary"
                                    outlined
                                    size="small"
                                    onClick={() => window.open(norma.audioUrl, '_blank')}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </VerDialog>
    );
}
