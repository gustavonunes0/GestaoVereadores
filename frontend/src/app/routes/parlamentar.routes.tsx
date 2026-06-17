import { ParlamentarLayout } from '../../components/ParlamentarLayout';
import { ParlamentarRoute } from '../../components/ParlamentarRoute';
import { Navigate } from 'react-router-dom';
import { Pages } from './lazy-pages';
import { page } from './page-loader';

const parlamentarChildren = [
    { index: true, element: <Navigate to="perfil" replace /> },
    { path: 'perfil', element: page(Pages.parlamentarPerfil) },
    { path: 'biografia', element: page(Pages.parlamentarBiografia) },
    { path: 'dashboard', element: page(Pages.parlamentarDashboard) },
    { path: 'materias', element: page(Pages.parlamentarMaterias) },
    { path: 'comissoes', element: page(Pages.parlamentarComissoes) },
    { path: 'mandato', element: page(Pages.parlamentarMandato) },
    { path: 'filiacao', element: page(Pages.parlamentarFiliacao) },
];

/** Área autenticada PARLIAMENTARIAN (layout próprio). */
export const parlamentarRoutes = {
    element: <ParlamentarRoute />,
    children: [
        {
            path: 'parlamentar',
            element: <ParlamentarLayout />,
            children: [...parlamentarChildren],
        },
    ],
};
