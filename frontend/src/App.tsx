import { RouterProvider } from 'react-router-dom';
import { appRouter } from './app/routes';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { PwaInstallBanner } from './components/pwa/PwaInstallBanner';
import { PwaUpdateBanner } from './components/pwa/PwaUpdateBanner';

export default function App() {
    return (
        <>
            <RouterProvider router={appRouter} />
            <OfflineBanner />
            <PwaUpdateBanner />
            <PwaInstallBanner />
        </>
    );
}
