import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { DatePicker, Dropdown, MultiSelect, mapDropdownOptions } from '../../components/ui';
import { materiasApi } from '../../api/legislative/materias.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import type { LookupOption } from '../../api/dominios.api';
import type { Materia, MatterAuthorship } from '../../api/legislative/materias.api';
import { resolveMateriaIdentificacao, resolveMateriaNumeroAno } from '../../utils/materiaDisplay';

interface Props {
    materia: Materia;
    onClose: () => void;
    onSaved: () => void;
}

/** idNegocio global do tipo Parlamentar (seed). */
const PARLAMENTAR_TIPO_AUTOR_ID_NEGOCIO = '1';

function findParlamentarTipoId(tiposAutor: LookupOption[]): string {
    const match = tiposAutor.find(
        (t) =>
            t.codigo === PARLAMENTAR_TIPO_AUTOR_ID_NEGOCIO ||
            t.nome.trim().toLowerCase() === 'parlamentar',
    );
    return match?.id ?? '';
}

function resolveAutoriaInicial(
    autoria: MatterAuthorship,
    parlamentarTipoId: string,
): { tipoAutorId: string; autorId: string; kind: 'parliamentarian' | 'external' } | null {
    const author = autoria.primaryAuthor;
    if (!author) return null;

    if (author.type === 'parliamentarian' && author.parliamentarian) {
        return {
            tipoAutorId: parlamentarTipoId,
            autorId: author.parliamentarian.id,
            kind: 'parliamentarian',
        };
    }

    if (author.type === 'external') {
        const externoId =
            ('autorExterno' in author && author.autorExterno?.id) ||
            undefined;
        const tipoId =
            ('autorExterno' in author && author.autorExterno?.tipoAutorId) ||
            undefined;
        if (externoId && tipoId) {
            return { tipoAutorId: tipoId, autorId: externoId, kind: 'external' };
        }
    }

    return null;
}

export function MateriaEditDialog({ materia, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { tiposAutor } = useDominios();

    const parlamentarTipoId = useMemo(
        () => findParlamentarTipoId(tiposAutor),
        [tiposAutor],
    );

    const [saving, setSaving] = useState(false);
    const [loadingAutoria, setLoadingAutoria] = useState(true);
    const [ementa, setEmenta] = useState(materia.ementa);
    const [dataProtocolo, setDataProtocolo] = useState<Date | null>(
        materia.dataProtocolo ? new Date(materia.dataProtocolo) : null,
    );
    const [tipoAutorId, setTipoAutorId] = useState('');
    const [autorId, setAutorId] = useState('');
    const [authorKind, setAuthorKind] = useState<'parliamentarian' | 'external' | null>(null);
    const [autorInicial, setAutorInicial] = useState<{ tipoAutorId: string; autorId: string } | null>(null);
    const [relatorIds, setRelatorIds] = useState<string[]>(
        materia.relatores?.map((r) => r.parlamentarId) ?? [],
    );

    const [autorOptions, setAutorOptions] = useState<LookupOption[]>([]);
    const [relatorOptions, setRelatorOptions] = useState<LookupOption[]>([]);
    const [loadingAutores, setLoadingAutores] = useState(false);

    useEffect(() => {
        if (!parlamentarTipoId) return;
        void materiasApi.listOpcoesAutor(parlamentarTipoId).then((res) => {
            setRelatorOptions(res.options.map((o) => ({ id: o.id, nome: o.label })));
        });
    }, [parlamentarTipoId]);

    useEffect(() => {
        if (!parlamentarTipoId) return;
        setLoadingAutoria(true);
        void materiasApi
            .getAutoria(materia.id)
            .then((autoria) => {
                const inicial = resolveAutoriaInicial(autoria, parlamentarTipoId);
                if (inicial) {
                    setTipoAutorId(inicial.tipoAutorId);
                    setAutorId(inicial.autorId);
                    setAuthorKind(inicial.kind);
                    setAutorInicial({
                        tipoAutorId: inicial.tipoAutorId,
                        autorId: inicial.autorId,
                    });
                }
            })
            .catch(showApiError)
            .finally(() => setLoadingAutoria(false));
    }, [materia.id, parlamentarTipoId, showApiError]);

    useEffect(() => {
        if (!tipoAutorId) {
            setAutorOptions([]);
            return;
        }

        setLoadingAutores(true);
        void materiasApi
            .listOpcoesAutor(tipoAutorId)
            .then((res) => {
                setAuthorKind(res.kind);
                setAutorOptions(res.options.map((o) => ({ id: o.id, nome: o.label })));
            })
            .catch(showApiError)
            .finally(() => setLoadingAutores(false));
    }, [tipoAutorId, showApiError]);

    useEffect(() => {
        if (!tipoAutorId || !autorInicial) return;
        if (tipoAutorId !== autorInicial.tipoAutorId) {
            setAutorId('');
        }
    }, [tipoAutorId, autorInicial]);

    async function handleSubmit() {
        if (!ementa.trim()) {
            showApiError(new Error('Ementa é obrigatória.'));
            return;
        }
        if (!tipoAutorId || !autorId) {
            showApiError(new Error('Tipo de autor e autor são obrigatórios.'));
            return;
        }

        setSaving(true);
        try {
            await materiasApi.update(materia.id, {
                ementa: ementa.trim(),
                dataProtocolo: dataProtocolo?.toISOString(),
            });

            const autoriaAlterada =
                !autorInicial ||
                autorInicial.tipoAutorId !== tipoAutorId ||
                autorInicial.autorId !== autorId;

            if (autoriaAlterada) {
                if (authorKind === 'parliamentarian') {
                    await materiasApi.setAutorParlamentar(materia.id, autorId);
                } else {
                    await materiasApi.setAutorExterno(materia.id, autorId);
                }
            }

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
            header={`Editar — ${resolveMateriaIdentificacao(materia)}`}
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
                            <label className="text-xs text-color-secondary">Tipo de Matéria</label>
                            <p className="font-semibold m-0">{materia.tipo.nome}</p>
                        </div>
                        <div className="sigl-filtro-campo">
                            <label className="text-xs text-color-secondary">Número / Ano</label>
                            <p className="font-semibold m-0">{resolveMateriaNumeroAno(materia)}</p>
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Autoria</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="edit-tipo-autor">Tipo de Autor *</label>
                            <Dropdown
                                id="edit-tipo-autor"
                                value={tipoAutorId}
                                options={mapDropdownOptions(tiposAutor, 'nome', 'id')}
                                placeholder={loadingAutoria ? 'Carregando...' : 'Selecione o tipo'}
                                onChange={(v) => setTipoAutorId(String(v))}
                                disabled={loadingAutoria}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="edit-autor">Autor *</label>
                            <Dropdown
                                id="edit-autor"
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
                                disabled={!tipoAutorId || loadingAutoria || loadingAutores}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <DatePicker
                                id="edit-data-protocolo"
                                label="Data Protocolo"
                                value={dataProtocolo}
                                onChange={setDataProtocolo}
                            />
                        </div>
                        <div className="sigl-filtro-campo sigl-col-full">
                            <MultiSelect
                                id="edit-relatores"
                                label="Relator(es)"
                                value={relatorIds}
                                options={mapDropdownOptions(relatorOptions, 'nome', 'id')}
                                placeholder="Selecione relatores"
                                onChange={(ids) => setRelatorIds(ids.map(String))}
                                filter
                            />
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="edit-ementa">Ementa *</label>
                        <InputTextarea
                            id="edit-ementa"
                            value={ementa}
                            onChange={(e) => setEmenta(e.target.value)}
                            rows={3}
                            autoResize
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
