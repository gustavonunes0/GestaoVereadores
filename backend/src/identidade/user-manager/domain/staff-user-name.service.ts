/**
 * Splits a staff display name into first/last for the User entity.
 * Single-token names use a stable 2+ char surname placeholder so UserEntity
 * validation (min length 2) does not throw a 500 on invite/update.
 */
export class StaffUserNameService {
    /** Visible placeholder avoided in HTTP responses via {@link composeDisplayName}. */
    static readonly SINGLE_NAME_LAST = 'N/D';

    splitDisplayName(nome: string): { firstName: string; lastName: string } {
        const trimmed = nome.trim();
        if (!trimmed) {
            throw new Error('Nome é obrigatório');
        }

        const parts = trimmed.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return {
                firstName: parts[0],
                lastName: StaffUserNameService.SINGLE_NAME_LAST,
            };
        }

        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
        };
    }

    composeDisplayName(firstName: string, lastName: string): string {
        const first = firstName.trim();
        const last = lastName.trim();
        if (
            !last ||
            last === StaffUserNameService.SINGLE_NAME_LAST ||
            last === '—'
        ) {
            return first;
        }
        return `${first} ${last}`.trim();
    }

    buildEmailFromCpf(cpf: string): string {
        const normalized = cpf.replace(/\D/g, '');
        return `staff.${normalized}@interno.sigl.local`;
    }
}
