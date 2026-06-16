import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { apiFormData } from '../../api/client';
import { API_PATHS } from '../../api/paths';
import { autoresExternosApi } from '../../api/autores-externos.api';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { useAuth } from '../../contexts/AuthContext';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { usePermissions } from '../../hooks/usePermissions';
import type { LookupOption } from '../../api/dominios.api';
import type { Materia } from '../../api/legislative/materias.api';

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

function isTipoAutorParlamentar(nome: string): boolean {
    const lower = nome.toLowerCase();
    return lower.includes('vereador') || lower.includes('parlamentar') || lower.includes('presidente da câmara');
}

export function MateriaCreateDialog({ onClose, onSaved }: Props) {
    const { user } = useAuth();
    const { canVotar } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();
    const { tiposMateria, tiposAutor } = useDominios();
    const fileRef = useRef<HTMLInputElement>(null);

    const [saving, setSaving] = useState(false);
    const [tipoId, setTipoId] = useState('');
    const [dataProtocolo, setDataProtocolo] = useState<Date | null>(null);
    const [tipoAutorId, setTipoAutorId] = useState('');
    const [autorParlamentarianId, setAutorParlamentarianId] = useState('');
    const [autorExternoId, setAutorExternoId] = useState('');
    const [coautorIds, setCoautorIds] = useState<string[]>([]);
    const [relatorIds, setRelatorIds] = useState<string[]>([]);
    const [ementa, setEmenta] = useState('');
    const [justificativa, setJustificativa] = useState('');
    const [textoOriginalNome, setTextoOriginalNome] = useState('');

    const [parlamentares, setParlamentares] = useState<LookupOption[]>([]);
    const [autoresExternos, setAutoresExternos] = useState<LookupOption[]>([]);

    const tipoAutorSelecionado = tiposAutor.find((t) => t.id === tipoAutorId);
    const isParlamentarType = tipoAutorSelecionado
        ? isTipoAutorParlamentar(tipoAutorSelecionado.nome)
        : false;

    useEffect(() => {
        parlamentaresApi.list({ limit: 200 }).then((r) =>
            setParlamentares(
                r.data.map((p) => ({
                    id: p.id,
                    nome: p.parliamentaryName || `${p.user.firstName} ${p.user.lastName}`.trim(),
                })),
            ),
        );
        autoresExternosApi.list({ limit: 200 }).then((r) =>
            setAutoresExternos(r.data.map((a) => ({ id: a.id, nome: a.nome }))),
        );
    }, []);

    useEffect(() => {
        if (canVotar && user?.parliamentarianId) {
            setAutorParlamentarianId(user.parliamentarianId);
        }
    }, [canVotar, user]);

    useEffect(() => {
        setAutorParlamentarianId('');
        setAutorExternoId('');
        setCoautorIds([]);
    }, [tipoAutorId]);

    const autorOptions = isParlamentarType ? parlamentares : autoresExternos;
    const autorValue = isParlamentarType ? autorParlamentarianId : autorExternoId;
    const setAutorValue = isParlamentarType ? setAutorParlamentarianId : setAutorExternoId;
    const isAutorDisabled = canVotar && isParlamentarType && !!user?.parliamentarianId;

    async function handleSubmit() {
        if (!tipoId || !tipoAutorId || !autorValue || !ementa.trim()) {
            showApiError(new Error('Preencha os campos obrigatórios: Tipo, Tipo de Autor, Autor e Ementa.'));
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('tipoId', tipoId);
            fd.append('ementa', ementa.trim());
            if (tipoAutorId) fd.append('tipoAutorId', tipoAutorId);
            if (isParlamentarType && autorParlamentarianId) {
                fd.append('autorParliamentarianId', autorParlamentarianId);
            } else if (!isParlamentarType && autorExternoId) {
                fd.append('autorExternoId', autorExternoId);
            }
            if (dataProtocolo) fd.append('dataProtocolo', dataProtocolo.toISOString());
            if (justificativa.trim()) fd.append('justificativa', justificativa.trim());
            coautorIds.forEach((id) => fd.append('coautorIds[]', id));
            relatorIds.forEach((id) => fd.append('relatorIds[]', id));
            const file = fileRef.current?.files?.[0];
            if (file) fd.append('textoOriginal', file);

            await apiFormData<Materia>(API_PATHS.materias, fd);
            showSuccess('Matéria criada com sucesso.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={saving} />
            <Button label="Salvar" icon="pi pi-check" loading={saving} onClick={() => void handleSubmit()} />
        </div>
    );

    return (
        <Dialog
            header="Nova Matéria"
            visible
            onHide={() => !saving && onClose()}
            style={{ width: 'min(96vw, 700px)' }}
            footer={footer}
            modal
        >
            <div className="grid p-fluid">
                <div className="col-12 md:col-8">
                    <label htmlFor="mat-tipo">Tipo de Matéria *</label>
                    <Dropdown
                        id="mat-tipo"
                        value={tipoId}
                        options={tiposMateria}
                        optionLabel="nome"
                        optionValue="id"
                        placeholder="Selecione o tipo"
                        onChange={(e) => setTipoId(e.value)}
                        filter
                    />
                </div>
                <div className="col-12 md:col-4">
                    <label htmlFor="mat-data-protocolo">Data Protocolo</label>
                    <Calendar
                        id="mat-data-protocolo"
                        value={dataProtocolo}
                        onChange={(e) => setDataProtocolo(e.value ?? null)}
                        dateFormat="dd/mm/yy"
                        showButtonBar
                    />
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="mat-tipo-autor">Tipo de Autor *</label>
                    <Dropdown
                        id="mat-tipo-autor"
                        value={tipoAutorId}
                        options={tiposAutor}
                        optionLabel="nome"
                        optionValue="id"
                        placeholder="Selecione o tipo de autor"
                        onChange={(e) => setTipoAutorId(e.value)}
                        filter
                    />
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="mat-autor">Autor *</label>
                    <Dropdown
                        id="mat-autor"
                        value={autorValue}
                        options={autorOptions}
                        optionLabel="nome"
                        optionValue="id"
                        placeholder={tipoAutorId ? 'Selecione o autor' : 'Selecione o tipo primeiro'}
                        onChange={(e) => setAutorValue(e.value)}
                        disabled={!tipoAutorId || isAutorDisabled}
                        filter
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="mat-coautores">Coautor(es)</label>
                    <MultiSelect
                        id="mat-coautores"
                        value={coautorIds}
                        options={isParlamentarType
                            ? parlamentares.filter((p) => p.id !== autorParlamentarianId)
                            : autoresExternos.filter((a) => a.id !== autorExternoId)
                        }
                        optionLabel="nome"
                        optionValue="id"
                        placeholder="Selecione coautores (opcional)"
                        onChange={(e) => setCoautorIds(e.value ?? [])}
                        display="chip"
                        filter
                        disabled={!tipoAutorId}
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="mat-relatores">Relator(es)</label>
                    <MultiSelect
                        id="mat-relatores"
                        value={relatorIds}
                        options={parlamentares}
                        optionLabel="nome"
                        optionValue="id"
                        placeholder="Selecione relatores (opcional)"
                        onChange={(e) => setRelatorIds(e.value ?? [])}
                        display="chip"
                        filter
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="mat-ementa">Ementa *</label>
                    <InputTextarea
                        id="mat-ementa"
                        value={ementa}
                        onChange={(e) => setEmenta(e.target.value)}
                        rows={3}
                        autoResize
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="mat-justificativa">Justificativa</label>
                    <InputTextarea
                        id="mat-justificativa"
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        rows={5}
                        autoResize
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="mat-texto-original">Texto Original (PDF / DOC)</label>
                    <input
                        id="mat-texto-original"
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="w-full"
                        style={{ padding: '0.4rem 0' }}
                        onChange={(e) => setTextoOriginalNome(e.target.files?.[0]?.name ?? '')}
                    />
                    {textoOriginalNome && (
                        <small className="text-color-secondary">{textoOriginalNome}</small>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
