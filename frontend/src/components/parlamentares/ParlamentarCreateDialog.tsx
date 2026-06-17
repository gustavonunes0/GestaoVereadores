import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { apiList } from '../../api/client';
import { API_PATHS } from '../../api/paths';
import {
    parlamentaresApi,
    type CreateParliamentarianInput,
} from '../../api/legislative/parlamentares.api';
import { useAppToast } from '../../hooks/useAppToast';
import { Dropdown, FileUpload } from '../../components/ui';
import { isValidCpf, normalizeCpf } from '../../utils/cpf';
import { MAX_PHOTO_BYTES, preparePhotoDataUrl } from '../../utils/fileToDataUrl';

type Partido = { id: string; name: string; acronym: string };
type PartidoOption = { id: string; label: string };

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

const emptyForm = () => ({
    cpf: '',
    password: '',
    confirmPassword: '',
    email: '',
    parliamentaryName: '',
    politicalPartyId: '',
    officeNumber: '',
    biography: '',
    photoFile: null as File | null,
    photoUrl: '',
});

function isValidEmail(value: string) {
    if (!value.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ParlamentarCreateDialog({ onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [partidoOptions, setPartidoOptions] = useState<PartidoOption[]>([]);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        apiList<Partido>(API_PATHS.partidosPoliticos, { limit: 50 })
            .then((r) =>
                setPartidoOptions([
                    { id: '', label: '— Sem partido —' },
                    ...r.data.map((p) => ({ id: p.id, label: `${p.acronym} — ${p.name}` })),
                ]),
            )
            .catch(() => setPartidoOptions([]));
    }, []);

    const patch = (v: Partial<ReturnType<typeof emptyForm>>) =>
        setForm((f) => ({ ...f, ...v }));

    const cpfValid = isValidCpf(form.cpf);
    const emailValid = isValidEmail(form.email);
    const passwordValid = form.password.length >= 8;
    const passwordsMatch =
        form.password.length > 0 && form.password === form.confirmPassword;
    const canSubmit = useMemo(
        () =>
            Boolean(
                form.parliamentaryName.trim() &&
                    cpfValid &&
                    emailValid &&
                    passwordValid &&
                    passwordsMatch,
            ),
        [form.parliamentaryName, cpfValid, emailValid, passwordValid, passwordsMatch],
    );

    async function handleSubmit() {
        if (!canSubmit) return;
        setLoading(true);
        try {
            let photoUrl: string | undefined;
            if (form.photoFile) {
                if (form.photoFile.size > MAX_PHOTO_BYTES) {
                    showApiError(new Error('A foto deve ter no máximo 2 MB.'));
                    setLoading(false);
                    return;
                }
                photoUrl = await preparePhotoDataUrl(form.photoFile);
            } else if (form.photoUrl.trim()) {
                photoUrl = form.photoUrl.trim();
            }

            const body: CreateParliamentarianInput = {
                cpf: normalizeCpf(form.cpf),
                password: form.password,
                ...(form.email.trim() ? { email: form.email.trim() } : {}),
                parliamentaryName: form.parliamentaryName.trim(),
                politicalPartyId: form.politicalPartyId || undefined,
                officeNumber: form.officeNumber.trim() || undefined,
                biography: form.biography.trim() || undefined,
                ...(photoUrl ? { photoUrl } : {}),
            };
            await parlamentaresApi.create(body);
            showSuccess('Parlamentar cadastrado com sucesso.');
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
                disabled={!canSubmit || loading}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Novo Parlamentar"
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 640px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Dados de acesso</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo sigl-col-full">
                            <label htmlFor="pc-cpf">CPF *</label>
                            <InputMask
                                id="pc-cpf"
                                mask="999.999.999-99"
                                value={form.cpf}
                                onChange={(e) => patch({ cpf: e.value ?? '' })}
                                placeholder="000.000.000-00"
                                className="w-full"
                            />
                        </div>
                        <div className="sigl-filtro-campo sigl-col-full">
                            <label htmlFor="pc-email">E-mail</label>
                            <InputText
                                id="pc-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => patch({ email: e.target.value })}
                                placeholder="vereador@camara.gov.br"
                                className={`w-full${form.email && !emailValid ? ' p-invalid' : ''}`}
                            />
                            {form.email && !emailValid ? (
                                <small className="text-red-500">E-mail inválido</small>
                            ) : null}
                        </div>
                        <div className="sigl-filtro-campo sigl-col-full">
                            <label htmlFor="pc-partido">Partido</label>
                            <Dropdown
                                id="pc-partido"
                                value={form.politicalPartyId}
                                options={partidoOptions.map((p) => ({ label: p.label, value: p.id }))}
                                onChange={(v) => patch({ politicalPartyId: String(v) })}
                                placeholder="Selecione o partido"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-senha">Senha *</label>
                            <div className="p-inputgroup flex-1">
                                <InputText
                                    id="pc-senha"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => patch({ password: e.target.value })}
                                    placeholder="Mínimo 8 caracteres"
                                    className={`w-full${form.password && !passwordValid ? ' p-invalid' : ''}`}
                                />
                                <Button
                                    type="button"
                                    icon={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}
                                    severity="secondary"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                />
                            </div>
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-confirm-senha">Confirmar senha *</label>
                            <div className="p-inputgroup flex-1">
                                <InputText
                                    id="pc-confirm-senha"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={form.confirmPassword}
                                    onChange={(e) => patch({ confirmPassword: e.target.value })}
                                    placeholder="Repita a senha"
                                    className={`w-full${form.confirmPassword && !passwordsMatch ? ' p-invalid' : ''}`}
                                />
                                <Button
                                    type="button"
                                    icon={showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}
                                    severity="secondary"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    aria-label={
                                        showConfirmPassword
                                            ? 'Ocultar confirmação'
                                            : 'Mostrar confirmação'
                                    }
                                />
                            </div>
                            {form.confirmPassword && !passwordsMatch ? (
                                <small className="text-red-500">As senhas não coincidem</small>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-nome">Nome parlamentar *</label>
                            <InputText
                                id="pc-nome"
                                value={form.parliamentaryName}
                                onChange={(e) => patch({ parliamentaryName: e.target.value })}
                                placeholder="Nome que aparecerá nos registros"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-gabinete">Gabinete / Sala</label>
                            <InputText
                                id="pc-gabinete"
                                value={form.officeNumber}
                                onChange={(e) => patch({ officeNumber: e.target.value })}
                                placeholder="Ex.: Sala 05"
                            />
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Foto</span>
                    <FileUpload
                        id="pc-foto"
                        label="Foto do parlamentar"
                        accept="image/jpeg,image/png,image/webp"
                        value={form.photoFile ?? (form.photoUrl || null)}
                        onChange={(file) =>
                            patch({ photoFile: file, photoUrl: file ? '' : form.photoUrl })
                        }
                    />
                    {/* <div className="sigl-filtro-campo mt-2">
                        <label htmlFor="pc-foto-url">Ou informe URL da foto</label>
                        <InputText
                            id="pc-foto-url"
                            value={form.photoUrl}
                            onChange={(e) =>
                                patch({ photoUrl: e.target.value, photoFile: null })
                            }
                            placeholder="https://..."
                            disabled={!!form.photoFile}
                        />
                    </div> */}
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pc-bio">Biografia</label>
                        <InputTextarea
                            id="pc-bio"
                            value={form.biography}
                            onChange={(e) => patch({ biography: e.target.value })}
                            rows={4}
                            placeholder="Resumo da trajetória do parlamentar"
                            autoResize
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
