import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from '../ui';
import type { MateriaStatus } from '../../types/legislative';
import { MATERIA_STATUS_LABELS } from '../../types/legislative';

interface Props {
    id?: string;
    value: MateriaStatus;
    options: MateriaStatus[];
    onChange: (value: MateriaStatus) => void;
    disabled?: boolean;
    /** Texto do despacho — obrigatório em parte das transições. */
    despacho?: string;
    onDespachoChange?: (value: string) => void;
    /** Quando true, exibe o campo de despacho e o marca como obrigatório. */
    despachoObrigatorio?: boolean;
}

export function MateriaStatusField({
    id = 'materia-status',
    value,
    options,
    onChange,
    disabled = false,
    despacho = '',
    onDespachoChange,
    despachoObrigatorio = false,
}: Props) {
    const dropdownOptions = options.map((s) => ({
        label: MATERIA_STATUS_LABELS[s],
        value: s,
    }));

    const canAdvance = options.length > 1;
    const showDespacho = despachoObrigatorio && onDespachoChange != null;
    const despachoId = `${id}-despacho`;

    return (
        <div className="materia-form-status-block">
            <div className="materia-form-secao-titulo">
                <i className="pi pi-sitemap" aria-hidden />
                Status da matéria
            </div>
            <div className="materia-form-field materia-form-status-select">
                <label htmlFor={id}>Status</label>
                <Dropdown
                    id={id}
                    value={value}
                    options={dropdownOptions}
                    onChange={(v) => onChange(v as MateriaStatus)}
                    disabled={disabled || !canAdvance}
                />
            </div>
            {showDespacho ? (
                <div className="materia-form-field">
                    <label htmlFor={despachoId}>
                        Despacho <span className="field-required">*</span>
                    </label>
                    <InputTextarea
                        id={despachoId}
                        value={despacho}
                        onChange={(e) => onDespachoChange(e.target.value)}
                        rows={3}
                        autoResize
                        disabled={disabled}
                        placeholder={`Justifique a mudança para "${MATERIA_STATUS_LABELS[value]}".`}
                    />
                    <small className="field-hint">
                        Registrado no histórico de tramitação da matéria.
                    </small>
                </div>
            ) : null}
            {canAdvance ? (
                <p className="materia-form-status-hint">
                    <i className="pi pi-info-circle" aria-hidden />
                    O status só pode avançar. Não é possível retornar a um status anterior.
                </p>
            ) : null}
        </div>
    );
}
