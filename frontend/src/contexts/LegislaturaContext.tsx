import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { legislaturasApi, type Legislature } from '../api/legislative/legislaturas.api';

export type LegislaturaRef = {
    id: string;
    numero: number;
    dataInicio: string;
    dataFim?: string;
    isCurrent: boolean;
};

function mapLegislature(l: Legislature): LegislaturaRef {
    return {
        id: l.id,
        numero: l.number,
        dataInicio: l.startDate,
        dataFim: l.endDate,
        isCurrent: l.isCurrent,
    };
}

type LegislaturaContextValue = {
    legislaturas: LegislaturaRef[];
    legislaturaId: string;
    legislaturaAtiva: LegislaturaRef | null;
    loading: boolean;
    setLegislaturaId: (id: string) => void;
    refresh: () => Promise<LegislaturaRef[]>;
};

const STORAGE_KEY = 'sigl_legislatura_ctx';

const LegislaturaContext = createContext<LegislaturaContextValue | null>(null);

function loadStored(): { legislaturaId: string } {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as { legislaturaId: string };
    } catch {
        /* ignore */
    }
    return { legislaturaId: '' };
}

export function LegislaturaProvider({ children }: { children: ReactNode }) {
    const [legislaturas, setLegislaturas] = useState<LegislaturaRef[]>([]);
    const [loading, setLoading] = useState(true);
    const [legislaturaId, setLegislaturaIdState] = useState(
        () => loadStored().legislaturaId,
    );

    const refresh = useCallback(async () => {
        const res = await legislaturasApi.list({ limit: 50 });
        const list = res.data.map(mapLegislature);
        setLegislaturas(list);
        return list;
    }, []);

    useEffect(() => {
        refresh()
            .then((list) => {
                if (!list.length) return;
                const stored = loadStored();
                const current = list.find((l) => l.isCurrent);
                const legId =
                    stored.legislaturaId &&
                    list.some((l) => l.id === stored.legislaturaId)
                        ? stored.legislaturaId
                        : (current?.id ?? list[0].id);
                setLegislaturaIdState(legId);
            })
            .finally(() => setLoading(false));
    }, [refresh]);

    useEffect(() => {
        if (legislaturaId) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ legislaturaId }),
            );
        }
    }, [legislaturaId]);

    const setLegislaturaId = useCallback((id: string) => {
        setLegislaturaIdState(id);
    }, []);

    const legislaturaAtiva = useMemo(
        () => legislaturas.find((l) => l.id === legislaturaId) ?? null,
        [legislaturas, legislaturaId],
    );

    const value = useMemo(
        () => ({
            legislaturas,
            legislaturaId,
            legislaturaAtiva,
            loading,
            setLegislaturaId,
            refresh,
        }),
        [
            legislaturas,
            legislaturaId,
            legislaturaAtiva,
            loading,
            setLegislaturaId,
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
