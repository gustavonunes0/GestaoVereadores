type AutorFKs = {
    parlamentarId?: string | null;
    parliamentarianId?: string | null;
    tenantPartnerId?: string | null;
};

type PartnerData = {
    nome: string;
    cargo?: string | null;
    instituicao?: string | null;
    registro?: string | null;
};

/** Resolve nome de exibição e valida polimorfismo de Autor. Zero imports de infra. */
export class AutorResolverService {
    /**
     * Garante que exatamente uma FK de Autor está preenchida.
     * Lança erro se zero ou mais de uma FK estiver definida.
     */
    validar(autor: AutorFKs): void {
        const preenchidas = [
            autor.parlamentarId,
            autor.parliamentarianId,
            autor.tenantPartnerId,
        ].filter(Boolean).length;

        if (preenchidas !== 1) {
            throw new Error(
                'Autor inválido: exatamente uma referência é obrigatória (parlamentarId, parliamentarianId ou tenantPartnerId)',
            );
        }
    }

    /**
     * Compõe o nome completo de um TenantPartner de acordo com a categoria.
     * Categoria A (entidade): `nome`
     * Categoria B (cargo + pessoa): `nome — cargo (instituicao)`
     * Categoria C (cargo + registro): `nome — cargo (registro)`
     */
    resolverNomeCompleto(partner: PartnerData): string {
        if (!partner.cargo) {
            return partner.nome;
        }
        const sufixo = partner.registro ?? partner.instituicao;
        if (sufixo) {
            return `${partner.nome} — ${partner.cargo} (${sufixo})`;
        }
        return `${partner.nome} — ${partner.cargo}`;
    }
}
