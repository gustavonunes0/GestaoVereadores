import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';
import { AutoComplete } from 'primereact/autocomplete';
import { Dropdown as PrDropdown } from 'primereact/dropdown';
import { materiasApi } from '../../api/legislative/materias.api';
import { parlamentaresApi, type Parliamentarian } from '../../api/legislative/parlamentares.api';
import { tenantPartnersApi, type TenantPartner } from '../../api/tenant-partners.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, FileUpload } from '../../components/ui';
import type { TipoAutorMateria, StatusMateria } from '../../types/materias';
import { TIPOS_AUTOR_OPTIONS } from '../../types/materias';

const ANO_ATUAL = new Date().getFullYear();

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

export function MateriaCreateDialog({ onClose, onSaved }: Props) {
    const { showSuccess, showApiError, showToast } = useAppToast();
    const showWarning = (msg: string) => showToast('warn', 'Aviso', msg);
    const { tiposMateria } = useDominios();
    const [saving, setSaving] = useState(false);

    // Identificação
    const [tipoId, setTipoId] = useState('');
    const [numero, setNumero] = useState('');
    const [dataProtocolo, setDataProtocolo] = useState<Date | null>(null);

    // Autoria
    const [tipoAutor, setTipoAutor] = useState<TipoAutorMateria | ''>('');

    // PARLAMENTAR
    const [parlSugestoes, setParlSugestoes] = useState<Parliamentarian[]>([]);
    const [parlSelecionado, setParlSelecionado] = useState<Parliamentarian | null>(null);

    // TENANT_PARTNER
    const [partners, setPartners] = useState<TenantPartner[]>([]);
    const [partnerSelecionado, setPartnerSelecionado] = useState<TenantPartner | null>(null);
    const [partnerAutorLabel, setPartnerAutorLabel] = useState('');
    const [partnerAutorId, setPartnerAutorId] = useState('');
    const [loadingPartners, setLoadingPartners] = useState(false);

    // EXECUTIVO / COMISSAO
    const [autorTexto, setAutorTexto] = useState('');

    // Conteúdo
    const [ementa, setEmenta] = useState('');
    const [justificativa, setJustificativa] = useState('');
    const [textoOriginal, setTextoOriginal] = useState<File | null>(null);

    const tipoSelecionado = tiposMateria.find((t) => t.id === tipoId);

    useEffect(() => {
        if (tipoAutor !== 'TENANT_PARTNER') return;
        setLoadingPartners(true);
        tenantPartnersApi.list({ limit: 100 })
            .then((r) => setPartners(r.data))
            .catch(() => setPartners([]))
            .finally(() => setLoadingPartners(false));
    }, [tipoAutor]);

    useEffect(() => {
        setParlSelecionado(null);
        setPartnerSelecionado(null);
        setPartnerAutorLabel('');
        setPartnerAutorId('');
        setAutorTexto('');
    }, [tipoAutor]);

    const buscarParlamentar = async (query: string) => {
        if (query.length < 2) { setParlSugestoes([]); return; }
        try {
            const res = await parlamentaresApi.list({ busca: query, limit: 20 });
            setParlSugestoes(res.data);
        } catch {
            setParlSugestoes([]);
        }
    };

    const handleSelectPartner = (partner: TenantPartner | null) => {
        setPartnerSelecionado(partner);
        if (!partner) { setPartnerAutorId(''); setPartnerAutorLabel(''); return; }
        if (!partner.usuario && !partner.usuarioVinculado) {
            showWarning('Esta instituição não possui usuário vinculado. Vincule em Câmara > Autores.');
            setPartnerAutorId('');
            setPartnerAutorLabel('');
            return;
        }
        const usuarioNome = partner.usuario?.nome ?? partner.nome;
        setPartnerAutorId(partner.id);
        setPartnerAutorLabel(`${usuarioNome} (${partner.nome})`);
    };

    async function submit(statusMateria: StatusMateria) {
        if (!tipoId) { showApiError(new Error('Selecione o tipo de matéria.')); return; }
        if (!ementa.trim()) { showApiError(new Error('Ementa é obrigatória.')); return; }
        if (!tipoAutor) { showApiError(new Error('Selecione o tipo de autor.')); return; }

        const body: Record<string, unknown> = {
            tipoId,
            ementa: ementa.trim(),
            statusMateria,
            ...(numero.trim() ? { numero: numero.trim() } : {}),
            ...(dataProtocolo ? { dataProtocolo: dataProtocolo.toISOString() } : {}),
            ...(justificativa.trim() ? { justificativa: justificativa.trim() } : {}),
        };

        if (tipoAutor === 'PARLAMENTAR') {
            if (!parlSelecionado) { showApiError(new Error('Selecione o parlamentar autor.')); return; }
            body.authorParliamentarianId = parlSelecionado.id;
        } else if (tipoAutor === 'TENANT_PARTNER') {
            if (!partnerAutorId) { showApiError(new Error('Selecione a instituição parceira.')); return; }
            body.tenantPartnerId = partnerAutorId;
        } else {
            if (!autorTexto.trim()) { showApiError(new Error('Informe o nome do autor.')); return; }
            body.autorNome = autorTexto.trim();
            body.tipoAutor = tipoAutor;
        }

        setSaving(true);
        try {
            const created = await materiasApi.create(body);
            if (textoOriginal) {
                await materiasApi.uploadTextoOriginal(created.id, textoOriginal);
            }
            const sigla = tipoSelecionado ? (tipoSelecionado as unknown as { sigla?: string; nome: string }).sigla ?? tipoSelecionado.nome : '';
            const idStr = numero.trim() ? `${sigla} ${numero}/${ANO_ATUAL}` : tipoSelecionado?.nome ?? 'Matéria';
            const msg = statusMateria === 'PROTOCOLADA'
                ? `${idStr} protocolada com sucesso.`
                : `${idStr} salva como rascunho.`;
            showSuccess(msg);
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const previewId = tipoSelecionado && numero.trim()
        ? `${(tipoSelecionado as unknown as { sigla?: string; nome: string }).sigla ?? tipoSelecionado.nome} ${numero.trim()}/${ANO_ATUAL}`
        : null;

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={saving} />
            <Button
                label="Salvar rascunho"
                severity="secondary"
                icon="pi pi-save"
                loading={saving}
                onClick={() => void submit('RASCUNHO')}
            />
            <Button
                label="Protocolar"
                icon="pi pi-send"
                loading={saving}
                onClick={() => void submit('PROTOCOLADA')}
            />
        </div>
    );

    return (
        <Dialog
            header="Nova Matéria Legislativa"
            visible
            onHide={() => !saving && onClose()}
            style={{ width: 'min(96vw, 720px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                {/* ── Seção 1: Identificação ── */}
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-3">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="mc-tipo">Tipo de Matéria *</label>
                            <PrDropdown
                                id="mc-tipo"
                                value={tipoId}
                                options={tiposMateria.map((t) => ({ label: t.nome, value: t.id }))}
                                placeholder="Selecione o tipo"
                                onChange={(e) => setTipoId(String(e.value))}
                                filter
                                className="w-full"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="mc-numero">
                                Número *{' '}
                                <i
                                    id="mc-numero-tooltip"
                                    className="pi pi-info-circle text-color-secondary"
                                    style={{ fontSize: '0.75rem', cursor: 'help' }}
                                />
                            </label>
                            <Tooltip
                                target="#mc-numero-tooltip"
                                content="Deixe em branco para gerar automaticamente. Após protocolada, aparecerá como PLO 102/2026."
                                position="top"
                            />
                            <InputText
                                id="mc-numero"
                                value={numero}
                                onChange={(e) => setNumero(e.target.value)}
                                placeholder="Gerado automaticamente"
                                className="w-full"
                            />
                            {previewId && (
                                <small style={{ color: 'var(--text-color-secondary)' }}>
                                    Identificação: <strong>{previewId}</strong>
                                </small>
                            )}
                        </div>
                        <div className="sigl-filtro-campo">
                            <DatePicker
                                id="mc-data-protocolo"
                                label="Data Protocolo"
                                value={dataProtocolo}
                                onChange={setDataProtocolo}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Seção 2: Autoria ── */}
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Autoria</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="mc-tipo-autor">Tipo de Autor *</label>
                            <PrDropdown
                                id="mc-tipo-autor"
                                value={tipoAutor}
                                options={TIPOS_AUTOR_OPTIONS}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione o tipo de autor"
                                onChange={(e) => setTipoAutor(e.value as TipoAutorMateria)}
                                className="w-full"
                            />
                        </div>

                        {tipoAutor === 'PARLAMENTAR' && (
                            <div className="sigl-filtro-campo">
                                <label>Parlamentar *</label>
                                <AutoComplete
                                    value={parlSelecionado ?? undefined}
                                    suggestions={parlSugestoes}
                                    completeMethod={(e) => void buscarParlamentar(e.query)}
                                    field="parliamentaryName"
                                    itemTemplate={(p: Parliamentarian) => (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                {p.parliamentaryName}
                                            </span>
                                        </div>
                                    )}
                                    onChange={(e) => setParlSelecionado((e.value as Parliamentarian | undefined) ?? null)}
                                    onSelect={(e) => setParlSelecionado(e.value as Parliamentarian)}
                                    placeholder="Digite o nome para buscar…"
                                    minLength={2}
                                    forceSelection
                                    emptyMessage="Nenhum parlamentar encontrado"
                                    className="w-full"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}

                        {tipoAutor === 'TENANT_PARTNER' && (
                            <div className="sigl-filtro-campo">
                                <label>Instituição parceira *</label>
                                <PrDropdown
                                    value={partnerSelecionado}
                                    options={partners}
                                    optionLabel="nome"
                                    placeholder={loadingPartners ? 'Carregando...' : 'Selecione a instituição'}
                                    onChange={(e) => handleSelectPartner(e.value as TenantPartner)}
                                    className="w-full"
                                    disabled={loadingPartners}
                                    filter
                                />
                                {partnerAutorLabel && (
                                    <small className="text-color-secondary">{partnerAutorLabel}</small>
                                )}
                            </div>
                        )}

                        {(tipoAutor === 'EXECUTIVO' || tipoAutor === 'COMISSAO') && (
                            <div className="sigl-filtro-campo">
                                <label>
                                    {tipoAutor === 'EXECUTIVO' ? 'Nome do órgão executivo *' : 'Nome da comissão *'}
                                </label>
                                <InputText
                                    value={autorTexto}
                                    onChange={(e) => setAutorTexto(e.target.value)}
                                    placeholder={
                                        tipoAutor === 'EXECUTIVO'
                                            ? 'Ex: Prefeitura Municipal de Baturité'
                                            : 'Ex: Comissão de Finanças'
                                    }
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Seção 3: Conteúdo ── */}
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="mc-ementa">Ementa *</label>
                        <InputTextarea
                            id="mc-ementa"
                            value={ementa}
                            onChange={(e) => setEmenta(e.target.value)}
                            rows={3}
                            autoResize
                            className="w-full"
                        />
                    </div>
                    <div className="sigl-filtro-campo mt-3">
                        <label htmlFor="mc-justificativa">Justificativa</label>
                        <InputTextarea
                            id="mc-justificativa"
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                            rows={4}
                            autoResize
                            className="w-full"
                        />
                    </div>
                    <div className="sigl-filtro-campo mt-3">
                        <FileUpload
                            id="mc-texto-original"
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
