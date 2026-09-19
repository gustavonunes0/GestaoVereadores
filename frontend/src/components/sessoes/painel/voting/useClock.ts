import { useEffect, useState } from 'react';

function pad(n: number): string {
    return String(n).padStart(2, '0');
}

function formatNow(date: Date): { clock: string; dateLabel: string } {
    return {
        clock: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
        dateLabel: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    };
}

/** Relógio local HH:MM:SS + data DD/MM/AAAA, atualizado a cada segundo. */
export function useClock() {
    const [now, setNow] = useState(() => formatNow(new Date()));

    useEffect(() => {
        const tick = () => setNow(formatNow(new Date()));
        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, []);

    return now;
}
