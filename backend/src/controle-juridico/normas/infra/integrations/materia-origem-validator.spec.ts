import { StatusMateria } from '@prisma/client';
import { MateriaOrigemValidator } from './materia-origem-validator';
import {
    MateriaNaoPodeGerarNormaError,
    MateriaOrigemNotFoundError,
} from '../../domain/errors/norma.errors';

describe('MateriaOrigemValidator', () => {
    it('bloqueia matéria de outro tenant', async () => {
        const validator = new MateriaOrigemValidator({
            materia: {
                findFirst: jest.fn().mockResolvedValue(null),
            },
        } as never);

        await expect(
            validator.validate('tenant-1', 'materia-1'),
        ).rejects.toBeInstanceOf(MateriaOrigemNotFoundError);
    });

    it.each([
        StatusMateria.EM_TRAMITACAO,
        StatusMateria.REJEITADA,
        StatusMateria.ARQUIVADA,
        StatusMateria.RETIRADA,
    ])('bloqueia matéria com status %s', async (status) => {
        const validator = new MateriaOrigemValidator({
            materia: {
                findFirst: jest.fn().mockResolvedValue({
                    id: 'materia-1',
                    status,
                    tenantId: 'tenant-1',
                }),
            },
        } as never);

        await expect(
            validator.validate('tenant-1', 'materia-1'),
        ).rejects.toBeInstanceOf(MateriaNaoPodeGerarNormaError);
    });

    it('valida matéria aprovada no tenant', async () => {
        const validator = new MateriaOrigemValidator({
            materia: {
                findFirst: jest.fn().mockResolvedValue({
                    id: 'materia-1',
                    status: StatusMateria.APROVADA,
                    tenantId: 'tenant-1',
                }),
            },
        } as never);

        await expect(
            validator.validate('tenant-1', 'materia-1'),
        ).resolves.toBeUndefined();
    });
});
