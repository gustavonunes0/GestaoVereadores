import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

interface FiltroLayoutProps {
    children: React.ReactNode;
    onBuscar: () => void;
    onLimpar: () => void;
    loading?: boolean;
}

export function FiltroLayout({ children, onBuscar, onLimpar, loading }: FiltroLayoutProps) {
    return (
        <Card className="mb-3 sigl-filtro-card">
            <div className="grid p-fluid">
                {children}
            </div>
            <div className="flex justify-content-end gap-2 mt-3">
                <Button
                    label="Limpar"
                    severity="secondary"
                    icon="pi pi-times"
                    onClick={onLimpar}
                    disabled={loading}
                />
                <Button
                    label="Pesquisar"
                    icon="pi pi-search"
                    onClick={onBuscar}
                    loading={loading}
                />
            </div>
        </Card>
    );
}
