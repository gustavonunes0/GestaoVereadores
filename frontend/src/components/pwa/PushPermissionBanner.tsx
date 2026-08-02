import NotificationsActiveOutlined from '@mui/icons-material/NotificationsActiveOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { useEffect, useState } from 'react';
import {
    dismissPushPrompt,
    enablePushNotifications,
    getExistingPushSubscription,
    isPushSupported,
    wasPushDismissed,
} from '../../pwa/pushNotifications';

type Props = {
    /** Só mostra para sessão parlamentar autenticada. */
    enabled?: boolean;
};

/**
 * Banner para o vereador ativar alertas de sessão (Web Push).
 */
export function PushPermissionBanner({ enabled = true }: Props) {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !isPushSupported() || wasPushDismissed()) {
            setVisible(false);
            return;
        }

        if (Notification.permission === 'denied') {
            setVisible(false);
            return;
        }

        let cancelled = false;
        void (async () => {
            const existing = await getExistingPushSubscription();
            if (!cancelled && !existing) {
                setVisible(true);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [enabled]);

    async function activate() {
        setLoading(true);
        setError(null);
        try {
            const ok = await enablePushNotifications();
            if (ok) {
                setVisible(false);
            } else {
                setError('Permissão negada. Ative nas configurações do navegador.');
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Não foi possível ativar as notificações.',
            );
        } finally {
            setLoading(false);
        }
    }

    function dismiss() {
        dismissPushPrompt();
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div
            className="pwa-banner pwa-banner--push"
            role="dialog"
            aria-label="Ativar notificações de sessão"
        >
            <div className="pwa-banner__body">
                <NotificationsActiveOutlined sx={{ fontSize: 20 }} aria-hidden />
                <div className="pwa-banner__text">
                    <strong>Alertas de sessão</strong>
                    <span>
                        Receba um aviso no celular quando a sessão plenária for iniciada.
                    </span>
                    {error ? <span className="pwa-banner__error">{error}</span> : null}
                </div>
            </div>
            <div className="pwa-banner__actions">
                <button
                    type="button"
                    className="pwa-banner__action"
                    disabled={loading}
                    onClick={() => void activate()}
                >
                    {loading ? 'Ativando…' : 'Ativar'}
                </button>
                <button
                    type="button"
                    className="pwa-banner__dismiss"
                    aria-label="Agora não"
                    onClick={dismiss}
                >
                    <CloseOutlined sx={{ fontSize: 18 }} aria-hidden />
                </button>
            </div>
        </div>
    );
}
