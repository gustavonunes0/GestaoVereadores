import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { apiList } from '../api/client';

export type SessaoLegislativaRef = { id: string; numero: number };
export type LegislaturaRef = {
    id: string;
    numero: number;
    dataInicio?: string;
    dataFim?: string;
    sessoesLegislativas?: SessaoLegislativaRef[];
};

type LegislaturaContextValue = {
    legislaturas: LegislaturaRef[];
    legislaturaId: string;
    sessaoLegislativaId: string;
    legislaturaAtiva: LegislaturaRef | null;
    sessaoLegislativaAtiva: SessaoLegislativaRef | null;
    loading: boolean;
    setLegislaturaId: (id: string) => void;
    setSessaoLegislativaId: (id: string) => void;
    refresh: () => Promise<LegislaturaRef[]>;
};

const STORAGE_KEY = 'sigl_legislatura_ctx';

const LegislaturaContext = createContext<LegislaturaContextValue | null>(null);

function loadStored(): { legislaturaId: string; sessaoLegislativaId: string } {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw)
            return JSON.parse(raw) as {
                legislaturaId: string;
                sessaoLegislativaId: string;
            };
    } catch {
        /* ignore */
    }
    return { legislaturaId: '', sessaoLegislativaId: '' };
}

export function LegislaturaProvider({ children }: { children: ReactNode }) {
    const [legislaturas, setLegislaturas] = useState<LegislaturaRef[]>([]);
    const [loading, setLoading] = useState(true);
    const [legislaturaId, setLegislaturaIdState] = useState(
        () => loadStored().legislaturaId,
    );
    const [sessaoLegislativaId, setSessaoLegislativaIdState] = useState(
        () => loadStored().sessaoLegislativaId,
    );

    const refresh = useCallback(async () => {
        const res = await apiList<LegislaturaRef>('/legislaturas', {
            limit: 20,
        });
        setLegislaturas(res.data);
        return res.data;
    }, []);

    useEffect(() => {
        refresh()
            .then((list) => {
                if (!list.length) return;
                const stored = loadStored();
                let legId =
                    stored.legislaturaId &&
                    list.some((l) => l.id === stored.legislaturaId)
                        ? stored.legislaturaId
                        : list[0].id;
                const leg = list.find((l) => l.id === legId)!;
                const sessoes = leg.sessoesLegislativas ?? [];
                const sessId =
                    stored.sessaoLegislativaId &&
                    sessoes.some((s) => s.id === stored.sessaoLegislativaId)
                        ? stored.sessaoLegislativaId
                        : (sessoes[0]?.id ?? '');
                setLegislaturaIdState(legId);
                setSessaoLegislativaIdState(sessId);
            })
            .finally(() => setLoading(false));
    }, [refresh]);

    useEffect(() => {
        if (legislaturaId) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ legislaturaId, sessaoLegislativaId }),
            );
        }
    }, [legislaturaId, sessaoLegislativaId]);

    const setLegislaturaId = useCallback(
        (id: string) => {
            setLegislaturaIdState(id);
            const leg = legislaturas.find((l) => l.id === id);
            const primeira = leg?.sessoesLegislativas?.[0];
            setSessaoLegislativaIdState(primeira?.id ?? '');
        },
        [legislaturas],
    );

    const setSessaoLegislativaId = useCallback((id: string) => {
        setSessaoLegislativaIdState(id);
    }, []);

    const legislaturaAtiva = useMemo(
        () => legislaturas.find((l) => l.id === legislaturaId) ?? null,
        [legislaturas, legislaturaId],
    );

    const sessaoLegislativaAtiva = useMemo(
        () =>
            legislaturaAtiva?.sessoesLegislativas?.find(
                (s) => s.id === sessaoLegislativaId,
            ) ?? null,
        [legislaturaAtiva, sessaoLegislativaId],
    );

    const value = useMemo(
        () => ({
            legislaturas,
            legislaturaId,
            sessaoLegislativaId,
            legislaturaAtiva,
            sessaoLegislativaAtiva,
            loading,
            setLegislaturaId,
            setSessaoLegislativaId,
            refresh,
        }),
        [
            legislaturas,
            legislaturaId,
            sessaoLegislativaId,
            legislaturaAtiva,
            sessaoLegislativaAtiva,
            loading,
            setLegislaturaId,
            setSessaoLegislativaId,
            refresh,
        ],
    );

    return (
        <LegislaturaContext.Provider value={value}>
            {children}
        </LegislaturaContext.Provider>
    );
}

export function useLegislatura() {
    const ctx = useContext(LegislaturaContext);
    if (!ctx) throw new Error('useLegislatura fora de LegislaturaProvider');
    return ctx;
}
