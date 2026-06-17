import { Link } from 'react-router-dom';

type Props = {
    message?: string;
};

export function PortalNotFoundPage({ message = 'Portal não encontrado' }: Props) {
    return (
        <div className="portal-public portal-public--not-found">
            <div className="portal-public__not-found-card">
                <h1>Portal indisponível</h1>
                <p>{message}</p>
                <Link to="/login" className="portal-public__btn">
                    Acessar sistema interno
                </Link>
            </div>
        </div>
    );
}
