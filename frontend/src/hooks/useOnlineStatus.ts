import { useEffect, useState } from 'react';

/**
 * Conectividade do navegador. `navigator.onLine` só garante que há interface de
 * rede — serve para avisar o usuário, não para decidir se uma request vai passar.
 */
export function useOnlineStatus(): boolean {
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);

    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    return isOnline;
}
