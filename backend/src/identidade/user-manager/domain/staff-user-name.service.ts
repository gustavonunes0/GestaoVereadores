export class StaffUserNameService {
    splitDisplayName(nome: string): { firstName: string; lastName: string } {
        const trimmed = nome.trim();
        if (!trimmed) {
            throw new Error('Nome é obrigatório');
        }

        const parts = trimmed.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return { firstName: parts[0], lastName: '—' };
        }

        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
        };
    }

    buildEmailFromCpf(cpf: string): string {
        const normalized = cpf.replace(/\D/g, '');
        return `staff.${normalized}@interno.sigl.local`;
    }
}
