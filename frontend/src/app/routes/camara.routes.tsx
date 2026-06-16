import { Navigate } from 'react-router-dom';
import { Pages } from './lazy-pages';
import { page } from './page-loader';

/** Rotas aninhadas em /camara/* */
export const camaraRoutes = [
    { index: true, element: <Navigate to="legislaturas" replace /> },
    { path: 'parlamentares', element: page(Pages.parlamentares) },
    { path: 'comissoes', element: page(Pages.comissoes) },
    { path: 'frentes', element: page(Pages.frentes) },
    { path: 'mesa-diretora', element: page(Pages.mesaDiretora) },
    { path: 'autores', element: page(Pages.autores) },
    { path: 'legislaturas', element: page(Pages.legislaturas) },
    { path: 'portal', element: page(Pages.portal) },
];
