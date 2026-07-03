import { useState } from 'react';
import { Button } from 'primereact/button';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { useAppToast } from '../../hooks/useAppToast';
import type { StatusSessao } from '../../types/sessoes';
import { AbrirSessaoDialog } from './AbrirSessaoDialog';

interface Props {
    sessaoId: string;
    status: StatusSessao;
    onUpdated: () => void;
}

type AcaoPath = 'abrir' | 'suspender' | 'encerrar' | 'cancelar';

type AcaoDef = {
    label: string;
    path: AcaoPath;
    destrutiva?: boolean;
};

const ACOES: Record<StatusSessao, AcaoDef[]> = {
    AGENDADA: [
        { label: 'Abrir sessão', path: 'abrir' },
        { label: 'Cancelar sessão', path: 'cancelar', destrutiva: true },
    ],
    ABERTA: [
        { label: 'Suspender sessão', path: 'suspender' },
        { label: 'Encerrar sessão', path: 'encerrar', destrutiva: true },
    ],
    SUSPENSA: [
        { label: 'Retomar sessão', path: 'abrir' },
        { label: 'Encerrar sessão', path: 'encerrar', destrutiva: true },
    ],
    ENCERRADA: [],
    CANCELADA: [],
};

const ACAO_API: Record<Exclude<AcaoPath, 'abrir'>, (id: string) => Promise<unknown>> = {
    suspender: (id) => sessoesApi.suspender(id),
    encerrar: (id) => sessoesApi.encerrar(id),
    cancelar: (id) => sessoesApi.cancelar(id),
};

function acaoIcon(path: AcaoPath): string {
    if (path === 'abrir') return 'pi pi-play';
    if (path === 'suspender') return 'pi pi-pause';
    if (path === 'cancelar') return 'pi pi-times';
    return 'pi pi-stop-circle';
}

export function SessaoAcoesMenu({ sessaoId, status, onUpdated }: Props) {
    const { showSuccess, showApiError, confirmDestructive } = useAppToast();
    const [loading, setLoading] = useState(false);
    const [dialogAbrir, setDialogAbrir] = useState(false);

    const acoes = ACOES[status] ?? [];
    if (acoes.length === 0) return null;

    async function executar(path: Exclude<AcaoPath, 'abrir'>) {
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

    function handleAcao(acao: AcaoDef) {
        const path = acao.path;

        if (path === 'abrir') {
            setDialogAbrir(true);
            return;
        }

        if (acao.destrutiva) {
            confirmDestructive(
                `Confirma: ${acao.label.toLowerCase()}?`,
                () => executar(path),
                acao.label,
            );
            return;
        }

        void executar(path);
    }

    return (
        <>
            <div className="sessao-acoes-buttons">
                {acoes.map((acao) => (
                    <Button
                        key={acao.path}
                        label={acao.label}
                        icon={acaoIcon(acao.path)}
                        size="small"
                        outlined={acao.destrutiva || acao.path === 'suspender'}
                        severity={acao.destrutiva ? 'danger' : acao.path === 'suspender' ? 'secondary' : undefined}
                        loading={loading}
                        onClick={() => handleAcao(acao)}
                    />
                ))}
            </div>

            {dialogAbrir && (
                <AbrirSessaoDialog
                    sessaoId={sessaoId}
                    onClose={() => setDialogAbrir(false)}
                    onSaved={onUpdated}
                />
            )}
        </>
    );
}
