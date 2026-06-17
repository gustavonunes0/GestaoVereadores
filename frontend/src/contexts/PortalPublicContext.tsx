import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import {
    portalPublicApi,
    type PublicPortalConfig,
} from '../api/portal/portal-public.api';

type PortalPublicContextValue = {
    slug: string;
    config: PublicPortalConfig | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    basePath: string;
};

const PortalPublicContext = createContext<PortalPublicContextValue | null>(null);

export function PortalPublicProvider({ children }: { children: ReactNode }) {
    const { slug = '' } = useParams<{ slug: string }>();
    const [config, setConfig] = useState<PublicPortalConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const basePath = `/portal/${slug}`;

    const reload = useCallback(async () => {
        if (!slug) {
            setError('Portal não encontrado');
            setConfig(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await portalPublicApi.getConfig(slug);
            setConfig(data);
        } catch (err) {
            const msg =
                err instanceof ApiError
                    ? err.message
                    : 'Não foi possível carregar o portal';
            setError(msg);
            setConfig(null);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        void reload();
    }, [reload]);

    const value = useMemo(
        () => ({ slug, config, loading, error, reload, basePath }),
        [slug, config, loading, error, reload, basePath],
    );

    return (
        <PortalPublicContext.Provider value={value}>
            {children}
        </PortalPublicContext.Provider>
    );
}

export function usePortalPublic() {
    const ctx = useContext(PortalPublicContext);
    if (!ctx) {
        throw new Error('usePortalPublic deve ser usado dentro de PortalPublicProvider');
    }
    return ctx;
}
