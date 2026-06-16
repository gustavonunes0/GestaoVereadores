import type { NavItemDef } from '../navigation';
import { LEGACY_REDIRECTS, ROUTES } from '../navigation';

/** Paths absolutos registrados no router (staff + câmara). */
export const REGISTERED_STAFF_PATHS: readonly string[] = [
    ROUTES.dashboard,
    ROUTES.materias,
    ROUTES.sessoes,
    ROUTES.agenda,
    ROUTES.relatorios,
    ROUTES.normasJuridicas,
    ROUTES.atosAdministrativos,
    ROUTES.camara.root,
    ROUTES.camara.parlamentares,
    ROUTES.camara.comissoes,
    ROUTES.camara.frentes,
    ROUTES.camara.mesaDiretora,
    ROUTES.camara.autores,
    ROUTES.camara.legislaturas,
    ROUTES.camara.portal,
    ROUTES.usuarios,
    ...LEGACY_REDIRECTS.map(({ from }) => `/${from}`),
];

/** Paths absolutos registrados no router (parlamentar). */
export const REGISTERED_PARLAMENTAR_PATHS: readonly string[] = [
    ROUTES.parlamentar.root,
    ROUTES.parlamentar.perfil,
    ROUTES.parlamentar.biografia,
    ROUTES.parlamentar.dashboard,
    ROUTES.parlamentar.materias,
    ROUTES.parlamentar.comissoes,
    ROUTES.parlamentar.mandato,
    ROUTES.parlamentar.filiacao,
];

export const REGISTERED_PUBLIC_PATHS: readonly string[] = [ROUTES.login];

function collectNavLeafRoutes(items: NavItemDef[]): string[] {
    const routes: string[] = [];
    for (const item of items) {
        if (item.children?.length) {
            routes.push(...collectNavLeafRoutes(item.children));
        } else if (item.route) {
            routes.push(item.route);
        }
    }
    return routes;
}

/** Valida se cada rota do menu lateral possui rota registrada no router. */
export function validateNavRoutes(
    navRoutes: string[],
    registeredPaths: readonly string[],
): string[] {
    const errors: string[] = [];
    const registered = new Set(registeredPaths);

    for (const navRoute of navRoutes) {
        const isRegistered =
            registered.has(navRoute) ||
            registeredPaths.some(
                (path) => path !== '/' && navRoute.startsWith(`${path}/`),
            );

        if (!isRegistered) {
            errors.push(`Menu aponta para "${navRoute}", mas não há rota registrada.`);
        }
    }

    return errors;
}

export function validateRouteRegistry(navStaffRoutes: string[]): string[] {
    return validateNavRoutes(navStaffRoutes, REGISTERED_STAFF_PATHS);
}

export function collectNavRoutes(items: NavItemDef[]): string[] {
    return collectNavLeafRoutes(items);
}
