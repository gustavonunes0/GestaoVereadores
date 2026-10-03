import { useRouteError } from 'react-router-dom';
import { isChunkLoadError } from './chunk-reload';

export function RouteErrorPage() {
    const error = useRouteError();
    const desatualizado = isChunkLoadError(error);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '2rem',
                textAlign: 'center',
            }}
        >
            <h1 style={{ margin: 0, fontSize: '1.35rem' }}>
                {desatualizado ? 'Nova versão disponível' : 'Algo deu errado'}
            </h1>
            <p style={{ margin: 0, color: '#64748b', maxWidth: '32rem' }}>
                {desatualizado
                    ? 'O sistema foi atualizado. Recarregue a página para continuar.'
                    : 'Ocorreu um erro inesperado ao carregar esta tela.'}
            </p>
            <button
                type="button"
                className="p-button p-component"
                onClick={() => window.location.reload()}
            >
                Recarregar página
            </button>
        </div>
    );
}
