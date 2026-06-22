import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Dropdown } from '../ui';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { materiasApi, type MatterTenantPartnerOption } from '../../api/legislative/materias.api';
import { comissoesApi, type Committee } from '../../api/legislative/comissoes.api';
import { useAppToast } from '../../hooks/useAppToast';
import type { AutorSelecionado, TipoAutorMateria } from '../../types/materias';
import { TIPOS_AUTOR_OPTIONS } from '../../types/materias';
import {
    autorSelectedChipText,
    resolveAutorDisplayNome,
} from '../../utils/autorMateria';

interface Props {
    value: AutorSelecionado | null;
    onChange: (value: AutorSelecionado | null) => void;
    labelTipo?: string;
    labelAutor?: string;
    disabled?: boolean;
    compact?: boolean;
}

function FieldWrap({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="materia-form-field">
            <label>{label}</label>
            {children}
        </div>
    );
}

type ParlamentarOption = {
    parliamentarianId: string;
    parliamentaryName: string;
    userNome: string;
};

function ParlamentarDropdown({
    value,
    onChange,
    label,
    disabled,
}: {
    value: AutorSelecionado | null;
    onChange: (v: AutorSelecionado | null) => void;
    label: string;
    disabled?: boolean;
}) {
    const [options, setOptions] = useState<ParlamentarOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setLoadError(false);
        parlamentaresApi
            .listUsuariosAtivos()
            .then((items) => {
                setOptions(items);
                if (items.length === 0) setLoadError(true);
            })
            .catch(() => {
                setOptions([]);
                setLoadError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    const selectedId = value?.parlamentarianId ?? null;
    const dropdownOptions = useMemo(
        () =>
            options.map((o) => ({
                label: o.parliamentaryName,
                value: o.parliamentarianId,
            })),
        [options],
    );

    const placeholder = loading
        ? 'Carregando…'
        : loadError
          ? 'Nenhum vereador com usuário vinculado'
          : 'Selecione o vereador';

    return (
        <FieldWrap label={label}>
            <Dropdown
                value={selectedId}
                options={dropdownOptions}
                placeholder={placeholder}
                filter
                filterPlaceholder="Buscar vereador…"
                loading={loading}
                disabled={disabled}
                onChange={(id) => {
                    const item = options.find((o) => o.parliamentarianId === id);
                    if (!item) {
                        onChange(null);
                        return;
                    }
                    onChange({
                        tipo: 'PARLAMENTAR',
                        parlamentarianId: item.parliamentarianId,
                        parlamentarianUserNome: item.parliamentaryName,
                    });
                }}
                itemTemplate={(opt) => {
                    const item = options.find((o) => o.parliamentarianId === opt.value);
                    if (!item) return opt.label;
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                {item.parliamentaryName}
                            </span>
                            {item.userNome ? (
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-color-secondary)',
                                    }}
                                >
                                    {item.userNome}
                                </span>
                            ) : null}
                        </div>
                    );
                }}
            />
            {loadError && !loading ? (
                <span className="materia-form-hint">
                    Cadastre vereadores com usuário vinculado em Parlamentares.
                </span>
            ) : null}
        </FieldWrap>
    );
}

function TenantPartnerDropdown({
    value,
    onChange,
    label,
    disabled,
}: {
    value: AutorSelecionado | null;
    onChange: (v: AutorSelecionado | null) => void;
    label: string;
    disabled?: boolean;
}) {
    const { showToast } = useAppToast();
    const showWarning = (msg: string) => showToast('warn', 'Aviso', msg);
    const [partners, setPartners] = useState<MatterTenantPartnerOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setLoadError(false);
        materiasApi
            .listTenantPartners()
            .then((items) => {
                setPartners(items);
                if (items.length === 0) setLoadError(true);
            })
            .catch(() => {
                setPartners([]);
                setLoadError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    const selectedId = value?.tenantPartnerId ?? null;
    const dropdownOptions = useMemo(
        () =>
            partners.map((p) => ({
                label: p.nomeExibicao || p.nome,
                value: p.id,
            })),
        [partners],
    );

    const handleSelect = (partner: MatterTenantPartnerOption | null) => {
        if (!partner) {
            onChange(null);
            return;
        }
        if (!partner.usuarioVinculado && !partner.usuario) {
            showWarning(
                'Esta instituição não possui usuário vinculado. Vincule em Câmara > Autores.',
            );
            onChange(null);
            return;
        }
        onChange({
            tipo: 'TENANT_PARTNER',
            tenantPartnerId: partner.id,
            tenantPartnerNome: partner.nome,
            tenantPartnerUserNome: partner.usuario?.nome ?? partner.nome,
        });
    };

    const placeholder = loading
        ? 'Carregando…'
        : loadError
          ? 'Nenhum autor externo cadastrado'
          : 'Selecione a instituição';

    return (
        <FieldWrap label={label}>
            <Dropdown
                value={selectedId}
                options={dropdownOptions}
                placeholder={placeholder}
                filter
                loading={loading}
                disabled={disabled}
                onChange={(id) => {
                    const partner = partners.find((p) => p.id === id) ?? null;
                    handleSelect(partner);
                }}
                itemTemplate={(opt) => {
                    const partner = partners.find((p) => p.id === opt.value);
                    if (!partner) return opt.label;
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                {partner.nomeExibicao || partner.nome}
                            </span>
                            {partner.usuario?.nome ? (
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-color-secondary)',
                                    }}
                                >
                                    {partner.usuario.nome}
                                </span>
                            ) : partner.usuarioVinculado ? (
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-color-secondary)',
                                    }}
                                >
                                    Usuário vinculado
                                </span>
                            ) : (
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--red-500, #ef4444)',
                                    }}
                                >
                                    Sem usuário vinculado
                                </span>
                            )}
                        </div>
                    );
                }}
            />
            {loadError && !loading ? (
                <span className="materia-form-hint">
                    Cadastre autores externos em Câmara &gt; Autores.
                </span>
            ) : null}
        </FieldWrap>
    );
}

function ComissaoDropdown({
    value,
    onChange,
    label,
    disabled,
}: {
    value: AutorSelecionado | null;
    onChange: (v: AutorSelecionado | null) => void;
    label: string;
    disabled?: boolean;
}) {
    const [comissoes, setComissoes] = useState<Committee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        comissoesApi
            .list({ status: 'ACTIVE', limit: 200 })
            .then((r) => setComissoes(r.data))
            .catch(() => setComissoes([]))
            .finally(() => setLoading(false));
    }, []);

    const selectedId = value?.comissaoId ?? null;
    const dropdownOptions = useMemo(
        () =>
            comissoes.map((c) => ({
                label: c.acronym ? `${c.name} (${c.acronym})` : c.name,
                value: c.id,
            })),
        [comissoes],
    );

    return (
        <FieldWrap label={label}>
            <Dropdown
                value={selectedId}
                options={dropdownOptions}
                placeholder={loading ? 'Carregando…' : 'Selecione a comissão'}
                filter
                filterPlaceholder="Buscar comissão…"
                loading={loading}
                disabled={disabled}
                onChange={(id) => {
                    const comissao = comissoes.find((c) => c.id === id);
                    if (!comissao) {
                        onChange(null);
                        return;
                    }
                    onChange({
                        tipo: 'COMISSAO',
                        comissaoId: comissao.id,
                        comissaoNome: comissao.acronym
                            ? `${comissao.name} (${comissao.acronym})`
                            : comissao.name,
                    });
                }}
            />
            <span className="materia-form-hint">
                Autoria por comissão será habilitada em breve no backend.
            </span>
        </FieldWrap>
    );
}

function AutorEntityField({
    tipoAtual,
    value,
    onChange,
    labelAutor,
    disabled,
}: {
    tipoAtual: TipoAutorMateria | '';
    value: AutorSelecionado | null;
    onChange: (v: AutorSelecionado | null) => void;
    labelAutor: string;
    disabled?: boolean;
}) {
    if (!tipoAtual) {
        return (
            <FieldWrap label={labelAutor}>
                <Dropdown
                    value={null}
                    options={[]}
                    placeholder="Selecione o tipo de autor primeiro"
                    disabled
                    onChange={() => undefined}
                />
            </FieldWrap>
        );
    }

    if (tipoAtual === 'PARLAMENTAR') {
        return (
            <ParlamentarDropdown
                value={value}
                onChange={onChange}
                label={labelAutor}
                disabled={disabled}
            />
        );
    }
    if (tipoAtual === 'TENANT_PARTNER') {
        return (
            <TenantPartnerDropdown
                value={value}
                onChange={onChange}
                label={labelAutor}
                disabled={disabled}
            />
        );
    }
    return (
        <ComissaoDropdown
            value={value}
            onChange={onChange}
            label={labelAutor}
            disabled={disabled}
        />
    );
}

const TIPO_AUTOR_DROPDOWN_OPTIONS = TIPOS_AUTOR_OPTIONS.map((o) => ({
    label: o.label,
    value: o.value,
}));

export function AutorField({
    value,
    onChange,
    labelTipo = 'Tipo de Autor *',
    labelAutor = 'Autor *',
    disabled = false,
    compact = false,
}: Props) {
    const [localTipo, setLocalTipo] = useState<TipoAutorMateria | ''>(value?.tipo ?? '');

    useEffect(() => {
        if (value?.tipo) setLocalTipo(value.tipo);
    }, [value?.tipo]);

    const tipoAtual = value?.tipo ?? localTipo;

    if (disabled && value) {
        return (
            <div className="materia-form-grid-2">
                <div className="materia-form-field">
                    <label>{labelTipo.replace(' *', '')}</label>
                    <p className="materia-form-readonly-value m-0">
                        {TIPOS_AUTOR_OPTIONS.find((o) => o.value === value.tipo)?.label ?? value.tipo}
                    </p>
                </div>
                <div className="materia-form-field">
                    <label>{labelAutor.replace(' *', '')}</label>
                    <p className="materia-form-readonly-value m-0">{resolveAutorDisplayNome(value)}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="materia-form-grid-2">
                <FieldWrap label={labelTipo}>
                    <Dropdown
                        value={tipoAtual || null}
                        options={TIPO_AUTOR_DROPDOWN_OPTIONS}
                        placeholder="Selecionar…"
                        onChange={(v) => {
                            const t = v as TipoAutorMateria;
                            setLocalTipo(t);
                            onChange(null);
                        }}
                        disabled={disabled}
                    />
                </FieldWrap>

                <AutorEntityField
                    tipoAtual={tipoAtual}
                    value={value}
                    onChange={onChange}
                    labelAutor={labelAutor}
                    disabled={disabled}
                />
            </div>

            {!compact && value && (
                <span className="materia-form-selected-chip">{autorSelectedChipText(value)}</span>
            )}
        </div>
    );
}
