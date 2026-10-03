import { useSyncExternalStore } from 'react';
import { appRouter } from '../../app/routes';

function subscribe(onChange: () => void) {
    return appRouter.subscribe(onChange);
}

function getPathname() {
    return appRouter.state.location.pathname;
}

/** Rota atual para componentes montados fora do `RouterProvider`. */
export function useRouterPathname(): string {
    return useSyncExternalStore(subscribe, getPathname);
}

/** Telão do plenário: monitor sem interação, não deve exibir avisos sobrepostos. */
export function isPainelTelaoPath(pathname: string): boolean {
    return /^\/sessoes\/[^/]+\/painel\/?$/.test(pathname);
}
