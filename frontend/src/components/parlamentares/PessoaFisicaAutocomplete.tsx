import { useState } from 'react';
import { AutoComplete, type AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { api } from '../../api/client';
import { API_PATHS } from '../../api/paths';
import { formatCpf } from '../../utils/cpf';
import type { PaginatedResponse } from '../../api/client';

export interface PessoaFisica {
    id: string;
    nome: string;
    cpf: string;
    fotoPerfil?: string | null;
}

interface Props {
    value: PessoaFisica | null;
    onChange: (p: PessoaFisica | null) => void;
    disabled?: boolean;
    className?: string;
    label?: string;
}

export function PessoaFisicaAutocomplete({
    value,
    onChange,
    disabled,
    className,
    label = 'Pessoa Física *',
}: Props) {
    const [sugestoes, setSugestoes] = useState<PessoaFisica[]>([]);

    const buscar = async (e: AutoCompleteCompleteEvent) => {
        const query = e.query;
        if (query.length < 2) { setSugestoes([]); return; }
        try {
            const res = await api<PaginatedResponse<PessoaFisica> | PessoaFisica[]>(
                `${API_PATHS.usuarios}?tipo=PESSOA_FISICA&busca=${encodeURIComponent(query)}&limit=20`,
            );
            const lista = Array.isArray(res) ? res : (res as PaginatedResponse<PessoaFisica>).data ?? [];
            setSugestoes(lista);
        } catch {
            setSugestoes([]);
        }
    };

    return (
        <div className={`sigl-filtro-campo${className ? ` ${className}` : ''}`}>
            <label>{label}</label>
            <AutoComplete
                value={value ?? undefined}
                suggestions={sugestoes}
                completeMethod={(e) => void buscar(e)}
                field="nome"
                itemTemplate={(p: PessoaFisica) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.nome}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-color-secondary)' }}>
                            CPF: {formatCpf(p.cpf)}
                        </span>
                    </div>
                )}
                onChange={(e) => onChange((e.value as PessoaFisica | undefined) ?? null)}
                onSelect={(e) => onChange(e.value as PessoaFisica)}
                onClear={() => onChange(null)}
                placeholder="Digite o nome para buscar…"
                minLength={2}
                disabled={disabled}
                forceSelection
                emptyMessage="Nenhuma pessoa física encontrada"
                style={{ width: '100%' }}
            />
            <small style={{ color: 'var(--text-color-secondary)' }}>
                Busque pelo nome civil completo. Apenas pessoas físicas (CPF) são listadas.
            </small>
        </div>
    );
}
