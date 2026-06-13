import { Link } from 'react-router-dom';
import { useLegislatura } from '../contexts/LegislaturaContext';

type Props = {
    step?: string;
    hint?: string;
};

export function ContextBanner({ step, hint }: Props) {
    const { legislaturaAtiva, loading } = useLegislatura();

    if (loading || !legislaturaAtiva) return null;

    return (
        <div className="context-banner" role="status">
            <div className="context-banner-main">
                {step && (
                    <span className="context-step">
                        <i className="pi pi-compass" aria-hidden /> {step}
                    </span>
                )}
                <span>
                    <strong>Legislatura {legislaturaAtiva.numero}ª</strong>
                    {legislaturaAtiva.isCurrent && ' · em exercício'}
                </span>
                {hint && <span className="context-hint">{hint}</span>}
            </div>
            <Link to="/camara/legislaturas" className="context-link">
                Ajustar estrutura
            </Link>
        </div>
    );
}
