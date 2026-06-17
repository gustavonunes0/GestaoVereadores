import { Navigate } from 'react-router-dom';
import { LEGACY_REDIRECTS } from '../navigation';

/** Redirects de URLs antigas para os paths atuais. */
export const legacyRoutes = LEGACY_REDIRECTS.map(({ from, to }) => ({
    path: from,
    element: <Navigate to={to} replace />,
}));
