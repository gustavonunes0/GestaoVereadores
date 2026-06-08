import { useEffect, useState } from 'react';
import { dominiosApi, type Dominios } from '../api/client';

export function useDominios() {
    const [dominios, setDominios] = useState<Dominios | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dominiosApi
            .list()
            .then(setDominios)
            .finally(() => setLoading(false));
    }, []);

    return { dominios, loading };
}
