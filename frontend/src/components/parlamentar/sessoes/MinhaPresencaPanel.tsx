import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

interface Props {
    hasConfirmed: boolean;
    loading: boolean;
    confirming: boolean;
    onConfirm: () => void;
}

export function MinhaPresencaPanel({
    hasConfirmed,
    loading,
    confirming,
    onConfirm,
}: Props) {
    return (
        <section className="parl-sessao-panel">
            <h3 className="parl-sessao-panel__title">Presença</h3>
            <p className="parl-sessao-panel__hint">
                Confirme sua presença na sessão para poder votar.
            </p>

            {loading ? (
                <div className="flex justify-content-center py-3">
                    <ProgressSpinner style={{ width: '32px', height: '32px' }} />
                </div>
            ) : hasConfirmed ? (
                <div className="parl-sessao-presenca-ok">
                    <i className="pi pi-check-circle" aria-hidden />
                    Presença confirmada
                </div>
            ) : (
                <Button
                    label="Marcar presença"
                    icon="pi pi-user-plus"
                    loading={confirming}
                    onClick={onConfirm}
                />
            )}
        </section>
    );
}
