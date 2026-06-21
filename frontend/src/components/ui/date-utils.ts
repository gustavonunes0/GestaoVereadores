const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function isSameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addMonths(date: Date, months: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function isSameMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function formatMonthYear(date: Date): string {
    const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getWeekdayLabels(): string[] {
    return WEEKDAY_LABELS;
}

/** Dias do mês + células vazias (semana começa na segunda). */
export function getCalendarDays(month: Date): (Date | null)[] {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push(new Date(year, monthIndex, day));
    }
    while (cells.length % 7 !== 0) {
        cells.push(null);
    }
    return cells;
}

export function isDateInRange(
    day: Date,
    start: Date | null,
    end: Date | null,
    hoverDate: Date | null,
): boolean {
    if (!start) return false;

    const d = startOfDay(day).getTime();
    const s = startOfDay(start).getTime();

    if (end) {
        const e = startOfDay(end).getTime();
        const min = Math.min(s, e);
        const max = Math.max(s, e);
        return d > min && d < max;
    }

    if (!hoverDate) return false;
    const h = startOfDay(hoverDate).getTime();
    const min = Math.min(s, h);
    const max = Math.max(s, h);
    return d > min && d < max;
}

export function formatDateShort(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function formatRange([start, end]: [Date | null, Date | null]): string {
    if (start && end) return `${formatDateShort(start)} — ${formatDateShort(end)}`;
    if (start) return formatDateShort(start);
    return '';
}
