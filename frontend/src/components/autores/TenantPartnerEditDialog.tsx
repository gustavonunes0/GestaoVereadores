import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { TabPanel, TabView } from 'primereact/tabview';
import {
    tenantPartnersApi,
    type TenantPartner,
    type CreateTenantPartnerDto,
} from '../../api/tenant-partners.api';
import { useAppToast } from '../../hooks/useAppToast';
import { Dropdown, FileUpload } from '../../components/ui';
import { isValidCpf, normalizeCpf, formatCpf } from '../../utils/cpf';
import { digitsOnly, formatCpfCnpj } from '../../utils/normalizeDocument';
import { MAX_PHOTO_BYTES, preparePhotoDataUrl } from '../../utils/fileToDataUrl';

const UF_OPTIONS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map((uf) => ({ label: uf, value: uf }));

interface Props {
    partner: TenantPartner;
    onClose: () => void;
    onSaved: () => void;
}

export function TenantPartnerEditDialog({ partner, onClose, onSaved }: Props) {
    const { showSuccess, showApiError, confirmDestructive } = useAppToast();
    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(true);

    const [detail, setDetail] = useState<TenantPartner | null>(null);

    const [nome, setNome] = useState(partner.nome);
    const [identificacao, setIdentificacao] = useState(
        partner.cpf ? formatCpfCnpj(partner.cpf) : '',
    );
    const [cargo, setCargo] = useState(partner.cargo ?? '');
    const [registro, setRegistro] = useState(partner.registro ?? '');
    const [partido, setPartido] = useState(partner.partido ?? '');
    const [uf, setUf] = useState(partner.uf ?? '');

    const [userNome, setUserNome] = useState('');
    const [userCpf, setUserCpf] = useState('');
    const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
    const [userPhotoUrl, setUserPhotoUrl] = useState('');
    const [editingUser, setEditingUser] = useState(false);

    const nomeValido = nome.trim().length >= 3;
    const usuarioVinculado = detail?.usuarioVinculado ?? false;
    const cpfValido = isValidCpf(userCpf);
    const podeVincular = useMemo(
        () => userNome.trim().length >= 3 && cpfValido,
        [userNome, cpfValido],
    );
    const podeSalvarUsuario = podeVincular;

    function resetUserForm() {
        setUserNome('');
        setUserCpf('');
        setUserPhotoFile(null);
        setUserPhotoUrl('');
        setEditingUser(false);
    }

    function startEditUser() {
        if (!detail?.usuario) return;
        setUserNome(detail.usuario.nome);
        setUserCpf(formatCpf(detail.usuario.cpf));
        setUserPhotoFile(null);
        setUserPhotoUrl(detail.usuario.fotoPerfil ?? '');
        setEditingUser(true);
    }

    useEffect(() => {
        setLoadingDetail(true);
        tenantPartnersApi
            .getById(partner.id)
            .then((data) => {
                setDetail(data);
                setNome(data.nome);
                setIdentificacao(data.cpf ? formatCpfCnpj(data.cpf) : '');
                setCargo(data.cargo ?? '');
                setRegistro(data.registro ?? '');
                setPartido(data.partido ?? '');
                setUf(data.uf ?? '');
            })
            .catch(showApiError)
            .finally(() => setLoadingDetail(false));
    }, [partner.id, showApiError]);

    async function handleSubmit() {
        if (!nomeValido) return;
        setLoading(true);
        const dto: Partial<CreateTenantPartnerDto> = {
            nome: nome.trim(),
            cpf: digitsOnly(identificacao) || undefined,
            cargo: cargo.trim() || undefined,
            registro: registro.trim() || undefined,
            partido: partido.trim() || undefined,
            uf: uf || undefined,
        };
        try {
            const updated = await tenantPartnersApi.update(partner.id, dto);
            setDetail(updated);
            showSuccess('Instituição parceira atualizada com sucesso.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }

    async function prepareFotoPerfil(): Promise<string | undefined> {
        if (userPhotoFile) {
            if (userPhotoFile.size > MAX_PHOTO_BYTES) {
                showApiError(new Error('A foto deve ter no máximo 2 MB.'));
                return undefined;
            }
            return preparePhotoDataUrl(userPhotoFile);
        }
        return userPhotoUrl.trim() || undefined;
    }

    async function handleProvisionUser() {
        if (!podeVincular) return;
        setLoadingUser(true);
        try {
            const fotoPerfil = await prepareFotoPerfil();
            if (userPhotoFile && !fotoPerfil) {
                setLoadingUser(false);
                return;
            }

            const updated = await tenantPartnersApi.provisionUser(partner.id, {
                nome: userNome.trim(),
                cpf: normalizeCpf(userCpf),
                ...(fotoPerfil ? { fotoPerfil } : {}),
            });
            setDetail(updated);
            resetUserForm();
            showSuccess('Usuário vinculado com sucesso.');
            onSaved();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoadingUser(false);
        }
    }

    async function handleUpdateUser() {
        if (!podeSalvarUsuario) return;
        setLoadingUser(true);
        try {
            const fotoPerfil = await prepareFotoPerfil();
            if (userPhotoFile && !fotoPerfil) {
                setLoadingUser(false);
                return;
            }

            const updated = await tenantPartnersApi.updateUser(partner.id, {
                nome: userNome.trim(),
                cpf: normalizeCpf(userCpf),
                ...(fotoPerfil !== undefined ? { fotoPerfil } : {}),
            });
            setDetail(updated);
            resetUserForm();
            showSuccess('Usuário atualizado com sucesso.');
            onSaved();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoadingUser(false);
        }
    }

    function handleRemoveUser() {
        confirmDestructive(
            'Deseja remover o usuário vinculado a esta instituição? A identidade interna será excluída.',
            async () => {
                setLoadingUser(true);
                try {
                    const updated = await tenantPartnersApi.removeUser(partner.id);
                    setDetail(updated);
                    resetUserForm();
                    showSuccess('Usuário removido com sucesso.');
                    onSaved();
                } catch (err) {
                    showApiError(err);
                } finally {
                    setLoadingUser(false);
                }
            },
            'Remover usuário',
        );
    }

    function renderUserForm(mode: 'create' | 'edit') {
        const submitLabel = mode === 'create' ? 'Vincular usuário' : 'Salvar usuário';
        const submitIcon = mode === 'create' ? 'pi pi-user-plus' : 'pi pi-check';
        const onSubmit = mode === 'create' ? handleProvisionUser : handleUpdateUser;

        return (
            <div className="sigl-dialog-grid sigl-dialog-grid-2">
                <div className="sigl-filtro-campo sigl-col-full">
                    <label htmlFor="tp-edit-user-nome">Nome *</label>
                    <InputText
                        id="tp-edit-user-nome"
                        value={userNome}
                        onChange={(e) => setUserNome(e.target.value)}
                        placeholder="Nome da pessoa representante"
                    />
                </div>
                <div className="sigl-filtro-campo sigl-col-full">
                    <label htmlFor="tp-edit-user-cpf">CPF *</label>
                    <InputMask
                        id="tp-edit-user-cpf"
                        mask="999.999.999-99"
                        value={userCpf}
                        onChange={(e) => setUserCpf(e.value ?? '')}
                        placeholder="000.000.000-00"
                        className={`w-full${userCpf && !cpfValido ? ' p-invalid' : ''}`}
                    />
                </div>
                <div className="sigl-filtro-campo sigl-col-full">
                    <FileUpload
                        id="tp-edit-user-foto"
                        label="Foto de perfil"
                        accept="image/jpeg,image/png,image/webp"
                        value={userPhotoFile ?? (userPhotoUrl || null)}
                        onChange={(file) => {
                            setUserPhotoFile(file);
                            if (file) setUserPhotoUrl('');
                        }}
                    />
                </div>
                <div className="sigl-filtro-campo sigl-col-full flex gap-2 align-items-end">
                    {mode === 'edit' ? (
                        <Button
                            label="Cancelar"
                            severity="secondary"
                            disabled={loadingUser}
                            onClick={resetUserForm}
                        />
                    ) : null}
                    <Button
                        label={submitLabel}
                        icon={submitIcon}
                        loading={loadingUser}
                        disabled={!podeSalvarUsuario}
                        onClick={() => void onSubmit()}
                    />
                </div>
            </div>
        );
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
            <Button
                label="Salvar"
                icon="pi pi-check"
                loading={loading}
                disabled={!nomeValido || loadingDetail}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header={`Editar — ${partner.nome}`}
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 680px)' }}
            contentStyle={{ minHeight: '26rem' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body sigl-dialog-body--tabs">
                {loadingDetail ? (
                    <div className="sigl-dialog-tabview-loading">Carregando…</div>
                ) : (
                    <TabView className="sigl-dialog-tabview">
                        <TabPanel
                            header={
                                <span className="sigl-dialog-tab-header">
                                    <i className="pi pi-building" aria-hidden />
                                    Instituição
                                </span>
                            }
                        >
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Identificação</span>
                                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                                    <div className="sigl-filtro-campo sigl-col-full">
                                        <label htmlFor="tp-edit-nome">Nome da instituição *</label>
                                        <InputText
                                            id="tp-edit-nome"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                        />
                                    </div>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="tp-edit-identificacao">Identificação</label>
                                        <InputText
                                            id="tp-edit-identificacao"
                                            value={identificacao}
                                            onChange={(e) =>
                                                setIdentificacao(formatCpfCnpj(e.target.value))
                                            }
                                            placeholder="CNPJ ou CPF (opcional)"
                                        />
                                    </div>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="tp-edit-uf">UF</label>
                                        <Dropdown
                                            id="tp-edit-uf"
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
                                        <label htmlFor="tp-edit-cargo">Cargo / função</label>
                                        <InputText
                                            id="tp-edit-cargo"
                                            value={cargo}
                                            onChange={(e) => setCargo(e.target.value)}
                                        />
                                    </div>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="tp-edit-reg">Registro</label>
                                        <InputText
                                            id="tp-edit-reg"
                                            value={registro}
                                            onChange={(e) => setRegistro(e.target.value)}
                                            placeholder="Nº OAB, CRM…"
                                        />
                                    </div>
                                    <div className="sigl-filtro-campo">
                                        <label htmlFor="tp-edit-partido">Partido</label>
                                        <InputText
                                            id="tp-edit-partido"
                                            value={partido}
                                            onChange={(e) => setPartido(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel
                            header={
                                <span className="sigl-dialog-tab-header">
                                    <i className="pi pi-user" aria-hidden />
                                    Usuário
                                </span>
                            }
                        >
                            <div className="sigl-dialog-secao">
                                {usuarioVinculado && detail?.usuario && !editingUser ? (
                                    <>
                                        <div className="flex align-items-center gap-3">
                                            {detail.usuario.fotoPerfil ? (
                                                <img
                                                    src={detail.usuario.fotoPerfil}
                                                    alt=""
                                                    className="border-circle"
                                                    style={{
                                                        width: 48,
                                                        height: 48,
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    className="border-circle bg-primary-100 flex align-items-center justify-content-center"
                                                    style={{ width: 48, height: 48 }}
                                                >
                                                    <i className="pi pi-user text-primary" />
                                                </span>
                                            )}
                                            <div className="flex-1">
                                                <p className="m-0 font-medium">{detail.usuario.nome}</p>
                                                <p className="m-0 text-sm text-color-secondary">
                                                    CPF: {formatCpf(detail.usuario.cpf)}
                                                </p>
                                            </div>
                                        </div>
                                        <Message
                                            severity="success"
                                            text="Usuário vinculado (sem acesso à plataforma)."
                                            className="w-full"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                label="Editar"
                                                icon="pi pi-pencil"
                                                severity="secondary"
                                                disabled={loadingUser}
                                                onClick={startEditUser}
                                            />
                                            <Button
                                                label="Remover"
                                                icon="pi pi-trash"
                                                severity="danger"
                                                outlined
                                                loading={loadingUser}
                                                onClick={handleRemoveUser}
                                            />
                                        </div>
                                    </>
                                ) : editingUser ? (
                                    renderUserForm('edit')
                                ) : (
                                    renderUserForm('create')
                                )}
                            </div>
                        </TabPanel>
                    </TabView>
                )}
            </div>
        </Dialog>
    );
}
