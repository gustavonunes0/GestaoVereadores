import { RouterProvider } from 'react-router-dom';
import { appRouter } from './app/routes';
import { PwaInstallBanner } from './components/pwa/PwaInstallBanner';
import { PwaUpdateBanner } from './components/pwa/PwaUpdateBanner';

export default function App() {
    return (
        <>
            <RouterProvider router={appRouter} />
            <PwaUpdateBanner />
            <PwaInstallBanner />
        </>
    );
}
