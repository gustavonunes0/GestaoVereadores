/**
 * Provisionamento de User ao vincular pessoa à instituição parceira.
 */
export class PartnerUserProvisioningDomainService {
    splitFullName(fullName: string): { firstName: string; lastName: string } {
        const trimmed = fullName.trim();
        if (!trimmed) {
            throw new Error('Nome do usuário é obrigatório');
        }

        const parts = trimmed.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return { firstName: parts[0], lastName: 'Parceiro' };
        }

        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
        };
    }
}
