import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AutorResolverService } from '../../domain/services/autor-resolver.service';
import { MatterAuthorOptionsDomainService } from '../../domain/services/matter-author-options.domain-service';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { PrismaService } from '../../../../prisma/prisma.service';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';

export type MatterAuthorOptionKind = 'parliamentarian' | 'external';

export type MatterAuthorOptionHttp = {
    id: string;
    label: string;
    kind: MatterAuthorOptionKind;
};

@Injectable()
export class ListMatterAuthorOptionsUseCase {
    private readonly authorOptionsService = new MatterAuthorOptionsDomainService();
    private readonly autorResolver = new AutorResolverService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
        private readonly prisma: PrismaService,
    ) {}

    async execute(tenantId: string, tipoAutorId: string) {
        const tipo = await this.prisma.tipoAutor.findFirst({
            where: {
                id: tipoAutorId,
                OR: [{ tenantId }, { tenantId: null }],
            },
        });
        if (!tipo) {
            throw new NotFoundException(
                'Tipo de autor não configurado para esta Câmara',
            );
        }

        if (this.authorOptionsService.isParlamentarTipoAutor(tipo)) {
            const rows = await this.prisma.parliamentarian.findMany({
                where: {
                    ...tenantWhere(tenantId),
                    isRemoved: false,
                    parliamentarianUser: { isRemoved: false },
                },
                orderBy: { parliamentaryName: 'asc' },
                select: { id: true, parliamentaryName: true },
            });

            const options: MatterAuthorOptionHttp[] = rows.map((row) => ({
                id: row.id,
                label: row.parliamentaryName,
                kind: 'parliamentarian',
            }));

            return { kind: 'parliamentarian' as const, options };
        }

        const externos = await this.repository.listTenantPartners(
            tenantId,
            tipoAutorId,
        );

        const options: MatterAuthorOptionHttp[] = externos.map((autor) => ({
            id: autor.id,
            label: this.autorResolver.resolverNomeCompleto({
                nome: autor.nome,
                cargo: autor.cargo,
                instituicao: autor.instituicao,
                registro: autor.registro,
            }),
            kind: 'external',
        }));

        return { kind: 'external' as const, options };
    }
}
