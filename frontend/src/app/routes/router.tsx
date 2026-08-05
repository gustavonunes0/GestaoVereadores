import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../navigation';
import { CatchAllRoute } from './catch-all.route';
import { Pages } from './lazy-pages';
import { page } from './page-loader';
import { parlamentarRoutes } from './parlamentar.routes';
import { platformRoutes } from './platform.routes';
import { publicRoutes } from './public.routes';
import { staffRoutes } from './staff.routes';

export const appRouter = createBrowserRouter([
    {
        path: ROUTES.login,
        element: page(Pages.login),
    },
    publicRoutes,
    platformRoutes,
    staffRoutes,
    parlamentarRoutes,
    {
        path: '*',
        element: <CatchAllRoute />,
    },
]);
