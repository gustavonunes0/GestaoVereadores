export function toOptionalDate(value?: string): Date | undefined {
    return value ? new Date(value) : undefined;
}

export function buildDateRangeFilter(
    de?: string,
    ate?: string,
): { gte?: Date; lte?: Date } | undefined {
    if (!de && !ate) return undefined;
    return {
        ...(de && { gte: new Date(de) }),
        ...(ate && { lte: new Date(ate) }),
    };
}
