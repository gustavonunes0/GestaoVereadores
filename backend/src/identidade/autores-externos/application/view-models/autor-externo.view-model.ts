import { AutorExternoWithTipo } from '../../domain/repositories/autor-externo.repository';

export class AutorExternoViewModel {
    static toHttp(item: AutorExternoWithTipo) {
        const d = item.entity.toPrimitives();
        return {
            id: d.id,
            tipoAutor: {
                id: item.tipoAutor.id,
                nome: item.tipoAutor.nome,
                ...(item.tipoAutor.idNegocio != null
                    ? { idNegocio: item.tipoAutor.idNegocio }
                    : {}),
            },
            nome: d.nome,
            cargo: d.cargo ?? undefined,
            instituicao: d.instituicao ?? undefined,
            cpf: d.cpf ?? undefined,
            email: d.email ?? undefined,
            telefone: d.telefone ?? undefined,
            registro: d.registro ?? undefined,
            partido: d.partido ?? undefined,
            uf: d.uf ?? undefined,
            isRemoved: d.isRemoved,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        };
    }
}
