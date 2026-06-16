import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { materiasApi } from '../../api/legislative/materias.api';
import { autoresExternosApi } from '../../api/autores-externos.api';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { useAppToast } from '../../hooks/useAppToast';
import type { LookupOption } from '../../api/dominios.api';
import type { Materia } from '../../api/legislative/materias.api';

interface Props {
    materia: Materia;
    onClose: () => void;
    onSaved: () => void;
}

export function MateriaEditDialog({ materia, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();

    const [saving, setSaving] = useState(false);
    const [ementa, setEmenta] = useState(materia.ementa);
    const [justificativa, setJustificativa] = useState('');
    const [dataProtocolo, setDataProtocolo] = useState<Date | null>(
        materia.dataProtocolo ? new Date(materia.dataProtocolo) : null,
    );
    const [relatorIds, setRelatorIds] = useState<string[]>(
        materia.relatores?.map((r) => r.parlamentarId) ?? [],
    );

    const [parlamentares, setParlamentares] = useState<LookupOption[]>([]);
    const [autoresExternos, setAutoresExternos] = useState<LookupOption[]>([]);

    const autorAtual = materia.autor;
    const isParlamentarAutor = autorAtual?.tipo === 'parlamentar';

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

    async function handleSubmit() {
        if (!ementa.trim()) {
            showApiError(new Error('Ementa é obrigatória.'));
            return;
        }
        setSaving(true);
        try {
            await materiasApi.update(materia.id, {
                ementa: ementa.trim(),
                dataProtocolo: dataProtocolo?.toISOString(),
            });
            showSuccess('Matéria atualizada com sucesso.');
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
            header={`Editar — ${materia.identificacao}`}
            visible
            onHide={() => !saving && onClose()}
            style={{ width: 'min(96vw, 700px)' }}
            footer={footer}
            modal
        >
            <div className="grid p-fluid">
                <div className="col-12 md:col-8">
                    <label className="text-xs text-color-secondary">Tipo de Matéria</label>
                    <p className="font-semibold m-0 mt-1">{materia.tipo.nome}</p>
                </div>
                <div className="col-12 md:col-4">
                    <label className="text-xs text-color-secondary">Número / Ano</label>
                    <p className="font-semibold m-0 mt-1">
                        {materia.numero} / {materia.ano}
                    </p>
                </div>

                <div className="col-12 md:col-6">
                    <label className="text-xs text-color-secondary">Autor</label>
                    <p className="m-0 mt-1">{materia.autor?.nome ?? '—'}</p>
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="edit-data-protocolo">Data Protocolo</label>
                    <Calendar
                        id="edit-data-protocolo"
                        value={dataProtocolo}
                        onChange={(e) => setDataProtocolo(e.value ?? null)}
                        dateFormat="dd/mm/yy"
                        showButtonBar
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="edit-relatores">Relator(es)</label>
                    <MultiSelect
                        id="edit-relatores"
                        value={relatorIds}
                        options={parlamentares}
                        optionLabel="nome"
                        optionValue="id"
                        placeholder="Selecione relatores"
                        onChange={(e) => setRelatorIds(e.value ?? [])}
                        display="chip"
                        filter
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="edit-ementa">Ementa *</label>
                    <InputTextarea
                        id="edit-ementa"
                        value={ementa}
                        onChange={(e) => setEmenta(e.target.value)}
                        rows={3}
                        autoResize
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="edit-justificativa">Justificativa</label>
                    <InputTextarea
                        id="edit-justificativa"
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        rows={5}
                        autoResize
                    />
                </div>
            </div>

            {/* autoresExternos mantido no estado para extensão futura */}
            {autoresExternos.length === 0 && isParlamentarAutor && null}
        </Dialog>
    );
}
