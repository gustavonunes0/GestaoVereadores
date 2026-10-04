import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

interface Props {
    hasConfirmed: boolean;
    loading: boolean;
    confirming: boolean;
    onConfirm: () => void;
    /** Fora de exercício na sessão: oculta a ação e mostra o motivo. */
    bloqueio?: string | null;
    /** Suplente em exercício: nome do titular substituído. */
    substituindo?: string | null;
}

export function MinhaPresencaPanel({
    hasConfirmed,
    loading,
    confirming,
    onConfirm,
    bloqueio = null,
    substituindo = null,
}: Props) {
    return (
        <section className="parl-sessao-panel">
            <h3 className="parl-sessao-panel__title">Presença</h3>
            <p className="parl-sessao-panel__hint">
                Confirme sua presença na sessão para poder votar.
            </p>
            {substituindo ? (
                <p className="parl-sessao-panel__hint">
                    Em exercício como suplente, substituindo {substituindo}.
                </p>
            ) : null}

            {loading ? (
                <div className="flex justify-content-center py-3">
                    <ProgressSpinner style={{ width: '32px', height: '32px' }} />
                </div>
            ) : bloqueio ? (
                <p className="parl-sessao-panel__hint m-0">
                    <i className="pi pi-lock mr-1" aria-hidden />
                    {bloqueio}
                </p>
            ) : hasConfirmed ? (
                <div className="parl-sessao-presenca-ok">
                    <i className="pi pi-check-circle" aria-hidden />
                    Presença confirmada
                </div>
            ) : (
                <Button
                    className="parl-sessao-presenca-cta"
                    label="Marcar presença"
                    icon="pi pi-user-plus"
                    loading={confirming}
                    onClick={onConfirm}
                />
            )}
        </section>
    );
}
