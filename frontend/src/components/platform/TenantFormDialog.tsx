import { FormEvent, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import {
    tenantsApi,
    type ProvisionTenantPayload,
} from '../../api/tenants.api';
import { FileUpload } from '../ui';
import { useAppToast } from '../../hooks/useAppToast';
import { MAX_PHOTO_BYTES, preparePhotoDataUrl } from '../../utils/fileToDataUrl';

type Props = {
    visible: boolean;
    onHide: () => void;
    onCreated: () => void;
};

export function TenantFormDialog({ visible, onHide, onCreated }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [loading, setLoading] = useState(false);
    const [withAdmin, setWithAdmin] = useState(true);
    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [adminFirstName, setAdminFirstName] = useState('');
    const [adminLastName, setAdminLastName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminCpf, setAdminCpf] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    function reset() {
        setName('');
        setCnpj('');
        setLogoFile(null);
        setWithAdmin(true);
        setAdminFirstName('');
        setAdminLastName('');
        setAdminEmail('');
        setAdminCpf('');
        setAdminPassword('');
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: ProvisionTenantPayload = {
                name: name.trim(),
                cnpj,
            };
            if (logoFile) {
                if (logoFile.size > MAX_PHOTO_BYTES) {
                    throw new Error('A logo deve ter no máximo 2 MB.');
                }
                payload.logo = await preparePhotoDataUrl(logoFile);
            }
            if (withAdmin) {
                payload.admin = {
                    firstName: adminFirstName.trim(),
                    lastName: adminLastName.trim(),
                    email: adminEmail.trim(),
                    cpf: adminCpf.replace(/\D/g, '') || undefined,
                    password: adminPassword,
                };
            }
            await tenantsApi.provision(payload);
            showSuccess('Cliente criado com sucesso.');
            reset();
            onCreated();
            onHide();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            header="Novo cliente (tenant)"
            visible={visible}
            onHide={onHide}
            style={{ width: 'min(520px, 96vw)' }}
            modal
        >
            <form className="sigl-dialog-body" onSubmit={(e) => void handleSubmit(e)}>
                <div className="sigl-filtro-campo">
                    <label htmlFor="tenant-name">Nome da câmara</label>
                    <InputText
                        id="tenant-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full"
                        required
                        minLength={3}
                    />
                </div>
                <div className="sigl-filtro-campo">
                    <label htmlFor="tenant-cnpj">CNPJ</label>
                    <InputMask
                        id="tenant-cnpj"
                        mask="99.999.999/9999-99"
                        value={cnpj}
                        onChange={(e) => setCnpj(e.value ?? '')}
                        className="w-full"
                        required
                    />
                </div>
                <FileUpload
                    id="tenant-logo"
                    label="Logo da câmara"
                    accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                    value={logoFile}
                    onChange={setLogoFile}
                />

                <div className="flex align-items-center gap-2 mb-3 mt-3">
                    <Checkbox
                        inputId="with-admin"
                        checked={withAdmin}
                        onChange={(e) => setWithAdmin(Boolean(e.checked))}
                    />
                    <label htmlFor="with-admin">Criar administrador inicial</label>
                </div>

                {withAdmin ? (
                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Administrador</span>
                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            <div className="sigl-filtro-campo">
                                <label htmlFor="admin-fn">Nome</label>
                                <InputText
                                    id="admin-fn"
                                    value={adminFirstName}
                                    onChange={(e) => setAdminFirstName(e.target.value)}
                                    className="w-full"
                                    required={withAdmin}
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="admin-ln">Sobrenome</label>
                                <InputText
                                    id="admin-ln"
                                    value={adminLastName}
                                    onChange={(e) => setAdminLastName(e.target.value)}
                                    className="w-full"
                                    required={withAdmin}
                                />
                            </div>
                            <div className="sigl-filtro-campo sigl-col-full">
                                <label htmlFor="admin-email">E-mail</label>
                                <InputText
                                    id="admin-email"
                                    type="email"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    className="w-full"
                                    required={withAdmin}
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="admin-cpf">CPF (opcional)</label>
                                <InputMask
                                    id="admin-cpf"
                                    mask="999.999.999-99"
                                    value={adminCpf}
                                    onChange={(e) => setAdminCpf(e.value ?? '')}
                                    className="w-full"
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="admin-pass">Senha</label>
                                <Password
                                    id="admin-pass"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    className="w-full"
                                    inputClassName="w-full"
                                    feedback={false}
                                    toggleMask
                                    required={withAdmin}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-content-end gap-2 mt-3">
                    <Button type="button" label="Cancelar" severity="secondary" onClick={onHide} />
                    <Button type="submit" label="Criar cliente" icon="pi pi-check" loading={loading} />
                </div>
            </form>
        </Dialog>
    );
}
