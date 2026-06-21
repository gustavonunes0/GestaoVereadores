import { useState } from 'react';
import { AutoComplete, type AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { parlamentaresApi, type UserResumo } from '../../api/legislative/parlamentares.api';
import { formatCpf } from '../../utils/cpf';

interface Props {
    value: UserResumo | null;
    onChange: (u: UserResumo | null) => void;
    label?: string;
    hint?: string;
    disabled?: boolean;
}

function UserAvatar({ user }: { user: UserResumo }) {
    if (user.foto) {
        return (
            <img
                src={user.foto}
                alt={user.nome}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
        );
    }
    return (
        <span
            style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--primary-100)', color: 'var(--primary-700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}
        >
            {user.nome.charAt(0).toUpperCase()}
        </span>
    );
}

export function UserSearchField({ value, onChange, label = 'Usuário *', hint, disabled }: Props) {
    const [sugestoes, setSugestoes] = useState<UserResumo[]>([]);

    const buscar = async (e: AutoCompleteCompleteEvent) => {
        const query = e.query.trim();
        if (query.length < 2) { setSugestoes([]); return; }
        try {
            const res = await parlamentaresApi.searchUsers(query);
            setSugestoes(res.data);
        } catch {
            setSugestoes([]);
        }
    };

    return (
        <div className="sigl-filtro-campo">
            <label>{label}</label>
            <AutoComplete
                value={value ?? undefined}
                suggestions={sugestoes}
                completeMethod={(e) => void buscar(e)}
                field="nome"
                itemTemplate={(u: UserResumo) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                        <UserAvatar user={u} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.nome}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-color-secondary)' }}>
                                CPF: {formatCpf(u.cpf)}
                            </span>
                        </div>
                    </div>
                )}
                onChange={(e) => onChange((e.value as UserResumo | undefined) ?? null)}
                onSelect={(e) => onChange(e.value as UserResumo)}
                onClear={() => onChange(null)}
                placeholder="Digite o nome para buscar…"
                minLength={2}
                disabled={disabled}
                forceSelection
                emptyMessage="Nenhum usuário encontrado"
                style={{ width: '100%' }}
                className="w-full"
            />
            {hint && <small style={{ color: 'var(--text-color-secondary)' }}>{hint}</small>}
        </div>
    );
}
