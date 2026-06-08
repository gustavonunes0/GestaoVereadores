export class TenantScopedUpdateError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TenantScopedUpdateError';
    }
}

/**
 * Ensures updateMany affected at least one row scoped to tenant + not removed.
 */
export function assertTenantScopedUpdate(
    count: number,
    notFoundMessage: string,
): void {
    if (count === 0) {
        throw new TenantScopedUpdateError(notFoundMessage);
    }
}
