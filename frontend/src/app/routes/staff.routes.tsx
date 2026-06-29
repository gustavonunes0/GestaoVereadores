import { AdminRoute } from '../../components/AdminRoute';
import { Layout } from '../../components/Layout';
import { StaffRoute } from '../../components/StaffRoute';
import { camaraRoutes } from './camara.routes';
import { legacyRoutes } from './legacy.routes';
import { Pages } from './lazy-pages';
import { page } from './page-loader';

/** Área autenticada ADMIN_STAFF e STAFF (layout principal + sidebar). */
export const staffRoutes = {
    element: <StaffRoute />,
    children: [
        { path: 'sessoes/:id/painel', element: page(Pages.sessaoPainel) },
        {
            element: <Layout />,
            children: [
                { index: true, element: page(Pages.dashboard) },
                { path: 'materias', element: page(Pages.materias) },
                { path: 'sessoes', element: page(Pages.sessoes) },
                { path: 'sessoes/:id', element: page(Pages.sessaoDetalhe) },
                { path: 'agenda', element: page(Pages.agenda) },
                { path: 'relatorios', element: page(Pages.relatorios) },
                { path: 'normas-juridicas', element: page(Pages.normas) },
                { path: 'atos-administrativos', element: page(Pages.atos) },
                {
                    path: 'camara',
                    element: page(Pages.camara),
                    children: [...camaraRoutes],
                },
                {
                    path: 'usuarios',
                    element: (
                        <AdminRoute>
                            {page(Pages.usuarios)}
                        </AdminRoute>
                    ),
                },
                ...legacyRoutes,
            ],
        },
    ],
};
