import { Navigate } from 'react-router-dom';
import { PlatformLayout } from '../../components/PlatformLayout';
import { PlatformRoute } from '../../components/PlatformRoute';
import { ROUTES } from '../navigation';
import { Pages } from './lazy-pages';
import { page } from './page-loader';

export const platformRoutes = {
    path: 'super-admin',
    element: <PlatformRoute />,
    children: [
        {
            element: <PlatformLayout />,
            children: [
                { index: true, element: <Navigate to={ROUTES.platform.tenants} replace /> },
                { path: 'tenants', element: page(Pages.platformTenants) },
                { path: 'tenants/:id', element: page(Pages.platformTenantDetail) },
            ],
        },
    ],
};
