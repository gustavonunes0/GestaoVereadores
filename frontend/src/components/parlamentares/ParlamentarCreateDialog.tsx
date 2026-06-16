import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { apiList } from '../../api/client';
import { API_PATHS } from '../../api/paths';
import {
    parlamentaresApi,
    type CreateParliamentarianInput,
} from '../../api/legislative/parlamentares.api';
import { useAppToast } from '../../hooks/useAppToast';

type Partido = { id: string; name: string; acronym: string };
type PartidoOption = { id: string; label: string };

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

const emptyForm = () => ({
    tenantUserId: '',
    parliamentaryName: '',
    politicalPartyId: '',
    officeNumber: '',
    biography: '',
});

export function ParlamentarCreateDialog({ onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [loading, setLoading] = useState(false);
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

    async function handleSubmit() {
        if (!form.tenantUserId.trim() || !form.parliamentaryName.trim()) return;
        setLoading(true);
        try {
            const body: CreateParliamentarianInput = {
                tenantUserId: form.tenantUserId.trim(),
                parliamentaryName: form.parliamentaryName.trim(),
                politicalPartyId: form.politicalPartyId || undefined,
                officeNumber: form.officeNumber.trim() || undefined,
                biography: form.biography.trim() || undefined,
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
                onClick={() => void handleSubmit()}
                disabled={!form.tenantUserId.trim() || !form.parliamentaryName.trim()}
            />
        </div>
    );

    return (
        <Dialog
            header="Novo Parlamentar"
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 600px)' }}
            footer={footer}
            modal
        >
            <div className="grid p-fluid">
                <div className="col-12">
                    <label htmlFor="pc-userId">ID do usuário do tenant *</label>
                    <InputText
                        id="pc-userId"
                        value={form.tenantUserId}
                        onChange={(e) => patch({ tenantUserId: e.target.value })}
                        placeholder="UUID do TenantUser"
                    />
                </div>
                <div className="col-12 md:col-8">
                    <label htmlFor="pc-nome">Nome parlamentar *</label>
                    <InputText
                        id="pc-nome"
                        value={form.parliamentaryName}
                        onChange={(e) => patch({ parliamentaryName: e.target.value })}
                        placeholder="Nome que aparecerá nos registros"
                    />
                </div>
                <div className="col-12 md:col-4">
                    <label htmlFor="pc-gabinete">Gabinete / Sala</label>
                    <InputText
                        id="pc-gabinete"
                        value={form.officeNumber}
                        onChange={(e) => patch({ officeNumber: e.target.value })}
                        placeholder="Ex.: Sala 05"
                    />
                </div>
                <div className="col-12">
                    <label htmlFor="pc-partido">Partido</label>
                    <Dropdown
                        id="pc-partido"
                        value={form.politicalPartyId}
                        options={partidoOptions}
                        optionLabel="label"
                        optionValue="id"
                        onChange={(e) => patch({ politicalPartyId: e.value })}
                        placeholder="Selecione o partido"
                        showClear
                    />
                </div>
                <div className="col-12">
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
        </Dialog>
    );
}
