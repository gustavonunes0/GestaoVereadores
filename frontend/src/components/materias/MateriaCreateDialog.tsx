import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { materiasApi } from '../../api/legislative/materias.api';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, Dropdown, FileUpload, MultiSelect, mapDropdownOptions } from '../../components/ui';
import type { LookupOption } from '../../api/dominios.api';

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

/** idNegocio global do tipo Parlamentar (seed). */
export const PARLAMENTAR_TIPO_AUTOR_ID_NEGOCIO = '1';

function findParlamentarTipoId(tiposAutor: LookupOption[]): string {
    const match = tiposAutor.find(
        (t) =>
            t.codigo === PARLAMENTAR_TIPO_AUTOR_ID_NEGOCIO ||
            t.nome.trim().toLowerCase() === 'parlamentar',
    );
    return match?.id ?? '';
}

export function MateriaCreateDialog({ onClose, onSaved }: Props) {
    const { canVotar, parliamentarianId } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();
    const { tiposMateria, tiposAutor } = useDominios();

    const parlamentarTipoId = useMemo(
        () => findParlamentarTipoId(tiposAutor),
        [tiposAutor],
    );

    const [saving, setSaving] = useState(false);
    const [tipoId, setTipoId] = useState('');
    const [dataProtocolo, setDataProtocolo] = useState<Date | null>(null);
    const [tipoAutorId, setTipoAutorId] = useState('');
    const [autorId, setAutorId] = useState('');
    const [authorKind, setAuthorKind] = useState<'parliamentarian' | 'external' | null>(null);
    const [coautorIds, setCoautorIds] = useState<string[]>([]);
    const [relatorIds, setRelatorIds] = useState<string[]>([]);
    const [ementa, setEmenta] = useState('');
    const [justificativa, setJustificativa] = useState('');
    const [textoOriginal, setTextoOriginal] = useState<File | null>(null);

    const [autorOptions, setAutorOptions] = useState<LookupOption[]>([]);
    const [relatorOptions, setRelatorOptions] = useState<LookupOption[]>([]);
    const [loadingAutores, setLoadingAutores] = useState(false);

    const isParlamentarType = authorKind === 'parliamentarian';
    const isAutorDisabled = canVotar && isParlamentarType && !!parliamentarianId;

    useEffect(() => {
        if (!parlamentarTipoId) return;
        void materiasApi.listOpcoesAutor(parlamentarTipoId).then((res) => {
            setRelatorOptions(
                res.options.map((o) => ({ id: o.id, nome: o.label })),
            );
        });
    }, [parlamentarTipoId]);

    useEffect(() => {
        if (!tipoAutorId) {
            setAutorOptions([]);
            setAuthorKind(null);
            return;
        }

        setLoadingAutores(true);
        void materiasApi
            .listOpcoesAutor(tipoAutorId)
            .then((res) => {
                setAuthorKind(res.kind);
                setAutorOptions(
                    res.options.map((o) => ({ id: o.id, nome: o.label })),
                );
            })
            .catch(showApiError)
            .finally(() => setLoadingAutores(false));
    }, [tipoAutorId, showApiError]);

    useEffect(() => {
        if (canVotar && parliamentarianId && isParlamentarType) {
            setAutorId(parliamentarianId);
        }
    }, [canVotar, parliamentarianId, isParlamentarType]);

    useEffect(() => {
        setAutorId('');
        setCoautorIds([]);
    }, [tipoAutorId]);

    async function handleSubmit() {
        if (!tipoId || !tipoAutorId || !autorId || !ementa.trim()) {
            showApiError(
                new Error('Preencha os campos obrigatórios: Tipo, Tipo de Autor, Autor e Ementa.'),
            );
            return;
        }
        setSaving(true);
        try {
            const created = await materiasApi.create({
                tipoId,
                ementa: ementa.trim(),
                ...(isParlamentarType
                    ? { authorParliamentarianId: autorId }
                    : { autorExternoId: autorId }),
                ...(dataProtocolo
                    ? { dataProtocolo: dataProtocolo.toISOString() }
                    : {}),
                ...(justificativa.trim()
                    ? { justificativa: justificativa.trim() }
                    : {}),
                ...(coautorIds.length ? { coautorIds } : {}),
                ...(relatorIds.length ? { relatoresIds: relatorIds } : {}),
            });

            if (textoOriginal) {
                await materiasApi.uploadTextoOriginal(created.id, textoOriginal);
            }

            showSuccess('Matéria criada com sucesso.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const coautorSelectOptions = isParlamentarType
        ? autorOptions.filter((p) => p.id !== autorId)
        : [];

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
                                value={autorId}
                                options={mapDropdownOptions(autorOptions, 'nome', 'id')}
                                placeholder={
                                    loadingAutores
                                        ? 'Carregando...'
                                        : tipoAutorId
                                          ? 'Selecione o autor'
                                          : 'Selecione o tipo primeiro'
                                }
                                onChange={(v) => setAutorId(String(v))}
                                disabled={!tipoAutorId || isAutorDisabled || loadingAutores}
                            />
                        </div>
                        {isParlamentarType && (
                            <div className="sigl-filtro-campo sigl-col-full">
                                <MultiSelect
                                    id="mat-coautores"
                                    label="Coautor(es)"
                                    value={coautorIds}
                                    options={mapDropdownOptions(coautorSelectOptions, 'nome', 'id')}
                                    placeholder="Selecione coautores (opcional)"
                                    onChange={(ids) => setCoautorIds(ids.map(String))}
                                    filter
                                    disabled={!tipoAutorId || loadingAutores}
                                />
                            </div>
                        )}
                        <div className="sigl-filtro-campo sigl-col-full">
                            <MultiSelect
                                id="mat-relatores"
                                label="Relator(es)"
                                value={relatorIds}
                                options={mapDropdownOptions(relatorOptions, 'nome', 'id')}
                                placeholder="Selecione relatores (opcional)"
                                onChange={(ids) => setRelatorIds(ids.map(String))}
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
