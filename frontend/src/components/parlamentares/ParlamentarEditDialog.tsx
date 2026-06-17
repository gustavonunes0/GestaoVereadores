import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { apiList } from '../../api/client';
import { API_PATHS } from '../../api/paths';
import {
    parlamentaresApi,
    type Parliamentarian,
    type UpdateParliamentarianInput,
} from '../../api/legislative/parlamentares.api';
import { useAppToast } from '../../hooks/useAppToast';
import { Dropdown, FileUpload } from '../../components/ui';
import { MAX_PHOTO_BYTES, preparePhotoDataUrl } from '../../utils/fileToDataUrl';

type Partido = { id: string; name: string; acronym: string };
type PartidoOption = { id: string; label: string };

interface Props {
    parlamentar: Parliamentarian;
    onClose: () => void;
    onSaved: () => void;
}

export function ParlamentarEditDialog({ parlamentar, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [loading, setLoading] = useState(false);
    const [partidoOptions, setPartidoOptions] = useState<PartidoOption[]>([]);
    const [form, setForm] = useState({
        parliamentaryName: parlamentar.parliamentaryName,
        politicalPartyId: parlamentar.user?.politicalParty?.id ?? '',
        officeNumber: parlamentar.officeNumber ?? '',
        biography: parlamentar.biography ?? '',
        photoFile: null as File | null,
        photoUrl: parlamentar.photoUrl ?? '',
    });

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

    const patch = (v: Partial<typeof form>) => setForm((f) => ({ ...f, ...v }));

    async function handleSubmit() {
        if (!form.parliamentaryName.trim()) return;
        setLoading(true);
        try {
            let photoUrl: string | undefined = form.photoUrl.trim() || undefined;
            if (form.photoFile) {
                if (form.photoFile.size > MAX_PHOTO_BYTES) {
                    showApiError(new Error('A foto deve ter no máximo 2 MB.'));
                    setLoading(false);
                    return;
                }
                photoUrl = await preparePhotoDataUrl(form.photoFile);
            }

            const body: UpdateParliamentarianInput = {
                parliamentaryName: form.parliamentaryName.trim(),
                politicalPartyId: form.politicalPartyId || undefined,
                officeNumber: form.officeNumber.trim() || undefined,
                biography: form.biography.trim() || undefined,
                ...(photoUrl !== undefined ? { photoUrl } : {}),
            };
            await parlamentaresApi.update(parlamentar.id, body);
            showSuccess('Parlamentar atualizado com sucesso.');
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
                label="Salvar"
                icon="pi pi-check"
                loading={loading}
                onClick={() => void handleSubmit()}
                disabled={!form.parliamentaryName.trim()}
            />
        </div>
    );

    return (
        <Dialog
            header={`Editar — ${parlamentar.parliamentaryName}`}
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 600px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pe-nome">Nome parlamentar *</label>
                            <InputText
                                id="pe-nome"
                                value={form.parliamentaryName}
                                onChange={(e) => patch({ parliamentaryName: e.target.value })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pe-gabinete">Gabinete / Sala</label>
                            <InputText
                                id="pe-gabinete"
                                value={form.officeNumber}
                                onChange={(e) => patch({ officeNumber: e.target.value })}
                                placeholder="Ex.: Sala 05"
                            />
                        </div>
                        <div className="sigl-filtro-campo sigl-col-full">
                            <label htmlFor="pe-partido">Partido</label>
                            <Dropdown
                                id="pe-partido"
                                value={form.politicalPartyId}
                                options={partidoOptions.map((p) => ({ label: p.label, value: p.id }))}
                                onChange={(v) => patch({ politicalPartyId: String(v) })}
                                placeholder="Selecione o partido"
                                disabled={!parlamentar.hasAccess}
                            />
                            {!parlamentar.hasAccess ? (
                                <small className="text-500">
                                    Partido vinculado ao acesso do parlamentar no sistema.
                                </small>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Foto</span>
                    <FileUpload
                        id="pe-foto"
                        label="Foto do parlamentar"
                        accept="image/jpeg,image/png,image/webp"
                        value={form.photoFile ?? (form.photoUrl || null)}
                        onChange={(file) =>
                            patch({ photoFile: file, photoUrl: file ? '' : form.photoUrl })
                        }
                    />
                    {/* <div className="sigl-filtro-campo mt-2">
                        <label htmlFor="pe-foto-url">Ou informe URL da foto</label>
                        <InputText
                            id="pe-foto-url"
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
                        <label htmlFor="pe-bio">Biografia</label>
                        <InputTextarea
                            id="pe-bio"
                            value={form.biography}
                            onChange={(e) => patch({ biography: e.target.value })}
                            rows={4}
                            autoResize
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
