import { useState } from 'react';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useRef } from 'react';
import type { MenuItem } from 'primereact/menuitem';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { useAppToast } from '../../hooks/useAppToast';
import type { StatusSessao } from '../../types/sessoes';

interface Props {
    sessaoId: string;
    status: StatusSessao;
    onUpdated: () => void;
}

const ACOES: Record<StatusSessao, Array<{ label: string; path: 'abrir' | 'suspender' | 'encerrar' | 'cancelar'; destrutiva?: boolean }>> = {
    AGENDADA:  [
        { label: 'Abrir sessão',    path: 'abrir' },
        { label: 'Cancelar sessão', path: 'cancelar', destrutiva: true },
    ],
    ABERTA:    [
        { label: 'Suspender sessão', path: 'suspender' },
        { label: 'Encerrar sessão',  path: 'encerrar', destrutiva: true },
    ],
    SUSPENSA:  [
        { label: 'Retomar sessão',  path: 'abrir' },
        { label: 'Encerrar sessão', path: 'encerrar', destrutiva: true },
    ],
    ENCERRADA: [],
    CANCELADA: [],
};

const ACAO_API: Record<string, (id: string) => Promise<unknown>> = {
    abrir:     (id) => sessoesApi.abrir(id),
    suspender: (id) => sessoesApi.suspender(id),
    encerrar:  (id) => sessoesApi.encerrar(id),
    cancelar:  (id) => sessoesApi.cancelar(id),
};

export function SessaoAcoesMenu({ sessaoId, status, onUpdated }: Props) {
    const menu = useRef<Menu>(null);
    const { showSuccess, showApiError, confirmDestructive } = useAppToast();
    const [loading, setLoading] = useState(false);

    const acoes = ACOES[status] ?? [];
    if (acoes.length === 0) return null;

    async function executar(path: string) {
        setLoading(true);
        try {
            await ACAO_API[path](sessaoId);
            showSuccess('Sessão atualizada.');
            onUpdated();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }

    const items: MenuItem[] = acoes.map((a) => ({
        label: a.label,
        icon: a.destrutiva ? 'pi pi-exclamation-triangle' : 'pi pi-play',
        className: a.destrutiva ? 'p-menuitem-danger' : undefined,
        command: () => {
            if (a.destrutiva) {
                confirmDestructive(
                    `Confirma: ${a.label.toLowerCase()}?`,
                    () => executar(a.path),
                    a.label,
                );
            } else {
                void executar(a.path);
            }
        },
    }));

    return (
        <>
            <Menu ref={menu} model={items} popup />
            <Button
                label="Ações"
                icon="pi pi-chevron-down"
                iconPos="right"
                size="small"
                outlined
                loading={loading}
                onClick={(e) => menu.current?.toggle(e)}
                aria-label="Ações da sessão"
            />
        </>
    );
}
