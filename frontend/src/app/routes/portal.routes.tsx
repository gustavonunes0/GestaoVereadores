import { PublicPortalLayout } from '../../layouts/PublicPortalLayout';
import { PortalPublicProvider } from '../../contexts/PortalPublicContext';
import { Pages } from './lazy-pages';
import { page } from './page-loader';

/** Rotas públicas do portal institucional — sem autenticação. */
export const portalRoutes = {
    path: 'portal/:slug',
    element: (
        <PortalPublicProvider>
            <PublicPortalLayout />
        </PortalPublicProvider>
    ),
    children: [
        { index: true, element: page(Pages.portalHome) },
        { path: 'vereadores', element: page(Pages.portalVereadores) },
        { path: 'vereadores/:id', element: page(Pages.portalVereadorDetail) },
        { path: 'mesa-diretora', element: page(Pages.portalMesaDiretora) },
        { path: 'comissoes', element: page(Pages.portalComissoes) },
        { path: 'comissoes/:id', element: page(Pages.portalComissaoDetail) },
        { path: 'agenda', element: page(Pages.portalAgenda) },
        { path: 'normas', element: page(Pages.portalNormas) },
        { path: 'contato', element: page(Pages.portalContato) },
    ],
};
