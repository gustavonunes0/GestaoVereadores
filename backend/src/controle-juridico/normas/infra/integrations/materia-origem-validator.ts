import { Injectable } from '@nestjs/common';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    MateriaNaoPodeGerarNormaError,
    MateriaOrigemNotFoundError,
} from '../../domain/errors/norma.errors';
import { assertMateriaOrigemPodeGerarNorma } from '../../domain/policies/norma-materia-origem.policy';

@Injectable()
export class MateriaOrigemValidator {
    constructor(private readonly prisma: PrismaService) {}

    async validate(tenantId: string, materiaOrigemId: string): Promise<void> {
        const materia = await this.prisma.materia.findFirst({
            where: { id: materiaOrigemId, ...tenantWhere(tenantId) },
            select: { id: true, status: true, tenantId: true },
        });

        if (!materia) {
            throw new MateriaOrigemNotFoundError();
        }

        try {
            assertMateriaOrigemPodeGerarNorma(materia);
        } catch {
            throw new MateriaNaoPodeGerarNormaError();
        }
    }
}
