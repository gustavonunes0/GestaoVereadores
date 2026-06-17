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
            <div className="sigl-filtro-campos">{children}</div>
            <div className="sigl-filtro-acoes">
                <Button
                    label="Limpar"
                    severity="secondary"
                    icon="pi pi-times"
                    size="small"
                    onClick={onLimpar}
                    disabled={loading}
                />
                <Button
                    label="Pesquisar"
                    icon="pi pi-search"
                    size="small"
                    onClick={onBuscar}
                    loading={loading}
                />
            </div>
        </Card>
    );
}
