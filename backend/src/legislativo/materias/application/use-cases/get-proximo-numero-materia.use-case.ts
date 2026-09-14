import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { ProximoNumeroMateriaQueryDto } from '../dto/proximo-numero-materia-query.dto';

@Injectable()
export class GetProximoNumeroMateriaUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
        private readonly prisma: PrismaService,
    ) {}

    async execute(tenantId: string, query: ProximoNumeroMateriaQueryDto) {
        const tipo = await this.prisma.tipoMateria.findFirst({
            where: { id: query.tipoId, tenantId, isRemoved: false },
            select: { id: true },
        });
        if (!tipo) {
            throw new NotFoundException('Tipo de matéria não encontrado nesta Câmara');
        }

        const ano = await this.prisma.ano.findUnique({
            where: { id: query.anoId },
            select: { id: true },
        });
        if (!ano) {
            throw new NotFoundException('Ano legislativo não encontrado');
        }

        const numero = await this.repository.proximoNumero(
            tenantId,
            query.tipoId,
            query.anoId,
        );

        return { numero };
    }
}
