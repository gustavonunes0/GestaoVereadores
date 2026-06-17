import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { apiFormData } from '../../api/client';
import { API_PATHS } from '../../api/paths';
import { autoresExternosApi } from '../../api/autores-externos.api';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, Dropdown, FileUpload, mapDropdownOptions } from '../../components/ui';
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
    const { canVotar, parliamentarianId } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();
    const { tiposMateria, tiposAutor } = useDominios();

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
    const [textoOriginal, setTextoOriginal] = useState<File | null>(null);

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
                    nome: p.parliamentaryName || (p.user ? `${p.user.firstName} ${p.user.lastName}`.trim() : p.parliamentaryName),
                })),
            ),
        );
        autoresExternosApi.list({ limit: 200 }).then((r) =>
            setAutoresExternos(r.data.map((a) => ({ id: a.id, nome: a.nome }))),
        );
    }, []);

    useEffect(() => {
        if (canVotar && parliamentarianId) {
            setAutorParlamentarianId(parliamentarianId);
        }
    }, [canVotar, parliamentarianId]);

    useEffect(() => {
        setAutorParlamentarianId('');
        setAutorExternoId('');
        setCoautorIds([]);
    }, [tipoAutorId]);

    const autorOptions = isParlamentarType ? parlamentares : autoresExternos;
    const autorValue = isParlamentarType ? autorParlamentarianId : autorExternoId;
    const setAutorValue = isParlamentarType ? setAutorParlamentarianId : setAutorExternoId;
    const isAutorDisabled = canVotar && isParlamentarType && !!parliamentarianId;

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
            if (textoOriginal) fd.append('textoOriginal', textoOriginal);

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
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="mat-tipo">Tipo de Matéria *</label>
                            <Dropdown
                                id="mat-tipo"
                                value={tipoId}
                                options={mapDropdownOptions(tiposMateria, 'nome', 'id')}
                                placeholder="Selecione o tipo"
                                onChange={(v) => setTipoId(String(v))}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <DatePicker
                                id="mat-data-protocolo"
                                label="Data Protocolo"
                                value={dataProtocolo}
                                onChange={setDataProtocolo}
                            />
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Autoria</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="mat-tipo-autor">Tipo de Autor *</label>
                            <Dropdown
                                id="mat-tipo-autor"
                                value={tipoAutorId}
                                options={mapDropdownOptions(tiposAutor, 'nome', 'id')}
                                placeholder="Selecione o tipo de autor"
                                onChange={(v) => setTipoAutorId(String(v))}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="mat-autor">Autor *</label>
                            <Dropdown
                                id="mat-autor"
                                value={autorValue}
                                options={mapDropdownOptions(autorOptions, 'nome', 'id')}
                                placeholder={tipoAutorId ? 'Selecione o autor' : 'Selecione o tipo primeiro'}
                                onChange={(v) => setAutorValue(String(v))}
                                disabled={!tipoAutorId || isAutorDisabled}
                            />
                        </div>
                        <div className="sigl-filtro-campo sigl-col-full">
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
                        <div className="sigl-filtro-campo sigl-col-full">
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
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="mat-ementa">Ementa *</label>
                        <InputTextarea
                            id="mat-ementa"
                            value={ementa}
                            onChange={(e) => setEmenta(e.target.value)}
                            rows={3}
                            autoResize
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="mat-justificativa">Justificativa</label>
                        <InputTextarea
                            id="mat-justificativa"
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                            rows={5}
                            autoResize
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <FileUpload
                            id="mat-texto-original"
                            label="Texto Original (PDF / DOC)"
                            value={textoOriginal}
                            onChange={setTextoOriginal}
                            accept=".pdf,.doc,.docx"
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
