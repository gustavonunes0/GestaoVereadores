type AutorFKs = {
    parlamentarId?: string | null;
    parliamentarianId?: string | null;
    autorExternoId?: string | null;
    guestUserId?: string | null;
};

type AutorExternoData = {
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
            autor.autorExternoId,
            autor.guestUserId,
        ].filter(Boolean).length;

        if (preenchidas !== 1) {
            throw new Error(
                'Autor inválido: exatamente uma referência é obrigatória (parlamentarId, parliamentarianId, autorExternoId ou guestUserId)',
            );
        }
    }

    /**
     * Compõe o nome completo de um AutorExterno de acordo com a categoria.
     * Categoria A (entidade): `nome`
     * Categoria B (cargo + pessoa): `nome — cargo (instituicao)`
     * Categoria C (cargo + registro): `nome — cargo (registro)`
     */
    resolverNomeCompleto(autorExterno: AutorExternoData): string {
        if (!autorExterno.cargo) {
            return autorExterno.nome;
        }
        const sufixo = autorExterno.registro ?? autorExterno.instituicao;
        if (sufixo) {
            return `${autorExterno.nome} — ${autorExterno.cargo} (${sufixo})`;
        }
        return `${autorExterno.nome} — ${autorExterno.cargo}`;
    }
}
