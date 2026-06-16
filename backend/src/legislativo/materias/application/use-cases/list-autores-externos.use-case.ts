import { Inject, Injectable } from '@nestjs/common';
import { AutorResolverService } from '../../domain/services/autor-resolver.service';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';

@Injectable()
export class ListAutoresExternosUseCase {
    private readonly autorResolver = new AutorResolverService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, tipoAutorId?: string) {
        const autores = await this.repository.listAutoresExternos(
            tenantId,
            tipoAutorId,
        );

        return autores.map((a) => ({
            id: a.id,
            nomeExibicao: this.autorResolver.resolverNomeCompleto({
                nome: a.nome,
                cargo: a.cargo,
                instituicao: a.instituicao,
                registro: a.registro,
            }),
            nome: a.nome,
            cargo: a.cargo,
            instituicao: a.instituicao,
            registro: a.registro,
            partido: a.partido,
            uf: a.uf,
            tipoAutor: a.tipoAutor,
        }));
    }
}
