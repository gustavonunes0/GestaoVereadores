import { ProgressSpinner } from 'primereact/progressspinner';

export function RouteFallback() {
    return (
        <div className="flex align-items-center justify-content-center" style={{ height: '100vh' }}>
            <ProgressSpinner />
        </div>
    );
}
