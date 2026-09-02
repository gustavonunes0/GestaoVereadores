import WifiOffOutlined from '@mui/icons-material/WifiOffOutlined';
import { useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/** Tempo que o aviso de reconexão fica visível antes de sumir. */
const RECONNECTED_HINT_MS = 4000;

/**
 * Aviso persistente de falta de conexão — sem isso as telas apenas ficam vazias
 * durante a sessão plenária, sem explicar o motivo ao vereador.
 */
export function OfflineBanner() {
    const isOnline = useOnlineStatus();
    const wasOffline = useRef(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            wasOffline.current = true;
            setShowReconnected(false);
            return;
        }

        if (!wasOffline.current) return;
        wasOffline.current = false;
        setShowReconnected(true);

        const timeout = window.setTimeout(() => setShowReconnected(false), RECONNECTED_HINT_MS);
        return () => window.clearTimeout(timeout);
    }, [isOnline]);

    if (!isOnline) {
        return (
            <div className="pwa-banner pwa-banner--offline" role="status" aria-live="polite">
                <div className="pwa-banner__body">
                    <WifiOffOutlined sx={{ fontSize: 20 }} aria-hidden />
                    <div className="pwa-banner__text">
                        <strong>Sem conexão</strong>
                        <span>
                            Você está offline. As informações podem estar desatualizadas e novas
                            ações não serão salvas.
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (!showReconnected) return null;

    return (
        <div className="pwa-banner pwa-banner--reconnected" role="status" aria-live="polite">
            <span>Conexão restabelecida.</span>
            <button
                type="button"
                className="pwa-banner__action"
                onClick={() => window.location.reload()}
            >
                Atualizar dados
            </button>
        </div>
    );
}
