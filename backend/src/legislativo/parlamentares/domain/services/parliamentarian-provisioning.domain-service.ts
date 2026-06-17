/**
 * Provisionamento de identidade (User + TenantUser) ao cadastrar parlamentar.
 */
export class ParliamentarianProvisioningDomainService {
    splitParliamentaryName(parliamentaryName: string): {
        firstName: string;
        lastName: string;
    } {
        const trimmed = parliamentaryName.trim();
        if (!trimmed) {
            throw new Error('Nome parlamentar é obrigatório');
        }

        const parts = trimmed.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return { firstName: parts[0], lastName: 'Parlamentar' };
        }

        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
        };
    }

    buildEmailFromCpf(cpf: string): string {
        const normalized = cpf.replace(/\D/g, '');
        return `parlamentar.${normalized}@interno.sigl.local`;
    }

    buildInternalEmail(uniqueSuffix: string): string {
        const normalized = uniqueSuffix.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return `parlamentar.${normalized}@interno.sigl.local`;
    }

    buildSyntheticCpf(digits: string): string {
        const numeric = digits.replace(/\D/g, '');
        return numeric.padEnd(11, '0').slice(0, 11);
    }
}
