import { useEffect, useState } from 'react';
import { VerDialog } from '../common/VerDialog';
import { tenantPartnersApi, type TenantPartner } from '../../api/tenant-partners.api';
import { useAppToast } from '../../hooks/useAppToast';
import { formatCpfCnpj } from '../../utils/normalizeDocument';

interface Props {
    partnerId: string;
    onClose: () => void;
}

function Row({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex gap-2 mb-2">
            <span className="font-semibold w-8rem flex-shrink-0">{label}:</span>
            <span>{value}</span>
        </div>
    );
}

export function TenantPartnerVerDialog({ partnerId, onClose }: Props) {
    const { showApiError } = useAppToast();
    const [partner, setPartner] = useState<TenantPartner | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        tenantPartnersApi.getById(partnerId)
            .then(setPartner)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [partnerId, showApiError]);

    return (
        <VerDialog visible title="Instituição parceira" onClose={onClose}>
            {loading && <p className="text-color-secondary">Carregando…</p>}
            {partner && !loading && (
                <div>
                    <div className="mb-3">
                        <span className="text-lg font-bold">{partner.nome}</span>
                    </div>
                    <div className="border-top-1 surface-border pt-3">
                        <Row
                            label="Identificação"
                            value={partner.cpf ? formatCpfCnpj(partner.cpf) : undefined}
                        />
                        <Row label="UF" value={partner.uf} />
                        <Row label="Cargo" value={partner.cargo} />
                        <Row label="Registro" value={partner.registro} />
                        <Row label="Partido" value={partner.partido} />
                    </div>
                </div>
            )}
        </VerDialog>
    );
}
