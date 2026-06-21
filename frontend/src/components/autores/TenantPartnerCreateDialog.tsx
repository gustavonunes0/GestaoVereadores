import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { tenantPartnersApi, type CreateTenantPartnerDto } from '../../api/tenant-partners.api';
import { useAppToast } from '../../hooks/useAppToast';
import { Dropdown } from '../../components/ui';
import { digitsOnly, formatCpfCnpj } from '../../utils/normalizeDocument';

const UF_OPTIONS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map((uf) => ({ label: uf, value: uf }));

interface Props {
    onClose: () => void;
    onSaved: () => void;
    initialValues?: Partial<CreateTenantPartnerDto>;
}

export function TenantPartnerCreateDialog({ onClose, onSaved, initialValues }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [loading, setLoading] = useState(false);

    const [nome, setNome] = useState(initialValues?.nome ?? '');
    const [identificacao, setIdentificacao] = useState(
        initialValues?.cpf ? formatCpfCnpj(initialValues.cpf) : '',
    );
    const [cargo, setCargo] = useState(initialValues?.cargo ?? '');
    const [registro, setRegistro] = useState(initialValues?.registro ?? '');
    const [partido, setPartido] = useState(initialValues?.partido ?? '');
    const [uf, setUf] = useState(initialValues?.uf ?? '');

    const nomeValido = nome.trim().length >= 3;

    async function handleSubmit() {
        if (!nomeValido) return;
        setLoading(true);
        const dto: CreateTenantPartnerDto = {
            nome: nome.trim(),
            cpf: digitsOnly(identificacao) || undefined,
            cargo: cargo.trim() || undefined,
            registro: registro.trim() || undefined,
            partido: partido.trim() || undefined,
            uf: uf || undefined,
        };
        try {
            await tenantPartnersApi.create(dto);
            showSuccess('Instituição parceira cadastrada com sucesso.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
            <Button
                label="Cadastrar"
                icon="pi pi-check"
                loading={loading}
                disabled={!nomeValido}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Cadastrar instituição parceira"
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 680px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo sigl-col-full">
                            <label htmlFor="tp-nome">Nome da instituição *</label>
                            <InputText
                                id="tp-nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Ex.: Prefeitura Municipal, OAB Subseção…"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="tp-identificacao">Identificação</label>
                            <InputText
                                id="tp-identificacao"
                                value={identificacao}
                                onChange={(e) => setIdentificacao(formatCpfCnpj(e.target.value))}
                                placeholder="CNPJ ou CPF (opcional)"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="tp-uf">UF</label>
                            <Dropdown
                                id="tp-uf"
                                value={uf}
                                options={UF_OPTIONS}
                                onChange={(v) => setUf(String(v))}
                                placeholder="UF"
                            />
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Complemento</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="tp-cargo">Cargo / função</label>
                            <InputText
                                id="tp-cargo"
                                value={cargo}
                                onChange={(e) => setCargo(e.target.value)}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="tp-reg">Registro</label>
                            <InputText
                                id="tp-reg"
                                value={registro}
                                onChange={(e) => setRegistro(e.target.value)}
                                placeholder="Nº OAB, CRM…"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="tp-partido">Partido</label>
                            <InputText
                                id="tp-partido"
                                value={partido}
                                onChange={(e) => setPartido(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
