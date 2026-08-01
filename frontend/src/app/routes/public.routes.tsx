import { Pages } from './lazy-pages';
import { page } from './page-loader';

/** Rotas públicas — SEM autenticação, SEM StaffRoute. Consomem só endpoints @Public() do backend. */
export const publicRoutes = {
    path: 'publico',
    children: [
        { path: 'sessoes/:id/resumo', element: page(Pages.sessaoResumoPublico) },
    ],
};
