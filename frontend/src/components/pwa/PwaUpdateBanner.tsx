import { useEffect, useState } from 'react';
import { onPwaUpdateAvailable } from '../../pwa/registerPwa';
import { isPainelTelaoPath, useRouterPathname } from './useRouterPathname';

/**
 * Banner discreto quando há nova versão do app (service worker).
 */
export function PwaUpdateBanner() {
    const [reload, setReload] = useState<(() => void) | null>(null);
    const pathname = useRouterPathname();

    useEffect(() => {
        onPwaUpdateAvailable((doReload) => setReload(() => doReload));
    }, []);

    if (!reload || isPainelTelaoPath(pathname)) return null;

    return (
        <div className="pwa-banner pwa-banner--update" role="status">
            <span>Nova versão disponível.</span>
            <button type="button" className="pwa-banner__action" onClick={reload}>
                Atualizar
            </button>
        </div>
    );
}
