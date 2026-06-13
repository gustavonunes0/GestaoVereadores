import { Link } from 'react-router-dom';
import { useLegislatura } from '../contexts/LegislaturaContext';

export function LegislaturaBar() {
    const { legislaturas, legislaturaId, loading, setLegislaturaId } =
        useLegislatura();

    if (loading) {
        return (
            <span className="legislatura-bar ui-loading-inline">
                Carregando legislatura…
            </span>
        );
    }

    if (!legislaturas.length) {
        return (
            <Link to="/camara/legislaturas" className="legislatura-bar link">
                Cadastrar legislatura
            </Link>
        );
    }

    return (
        <div className="legislatura-bar">
            <label className="legislatura-bar-field">
                <span className="legislatura-bar-field__label">Legislatura</span>
                <select
                    value={legislaturaId}
                    onChange={(e) => setLegislaturaId(e.target.value)}
                    aria-label="Legislatura em exercício"
                >
                    {legislaturas.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.numero}ª{l.isCurrent ? ' (atual)' : ''}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}
