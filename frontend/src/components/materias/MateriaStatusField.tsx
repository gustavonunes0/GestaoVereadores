import { Dropdown } from '../ui';
import type { MateriaStatus } from '../../types/legislative';
import { MATERIA_STATUS_LABELS } from '../../types/legislative';

interface Props {
    id?: string;
    value: MateriaStatus;
    options: MateriaStatus[];
    onChange: (value: MateriaStatus) => void;
    disabled?: boolean;
}

export function MateriaStatusField({
    id = 'materia-status',
    value,
    options,
    onChange,
    disabled = false,
}: Props) {
    const dropdownOptions = options.map((s) => ({
        label: MATERIA_STATUS_LABELS[s],
        value: s,
    }));

    const canAdvance = options.length > 1;

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
            {canAdvance ? (
                <p className="materia-form-status-hint">
                    <i className="pi pi-info-circle" aria-hidden />
                    O status só pode avançar. Não é possível retornar a um status anterior.
                </p>
            ) : null}
        </div>
    );
}
