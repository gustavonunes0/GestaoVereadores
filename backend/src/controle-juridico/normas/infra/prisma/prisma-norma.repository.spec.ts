import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { PrismaNormaRepository } from './prisma-norma.repository';

describe('PrismaNormaRepository', () => {
    it('não lista normas removidas', async () => {
        const findMany = jest.fn().mockResolvedValue([]);
        const count = jest.fn().mockResolvedValue(0);
        const repository = new PrismaNormaRepository({
            norma: { count, findMany },
        } as never);

        await repository.findMany('tenant-1', { page: 1, limit: 20 });

        expect(count).toHaveBeenCalledWith({
            where: expect.objectContaining({ ...tenantWhere('tenant-1') }),
        });
        expect(findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ ...tenantWhere('tenant-1') }),
            }),
        );
    });

    it('usa soft delete em vez de delete físico', async () => {
        const updateMany = jest.fn().mockResolvedValue({ count: 1 });
        const repository = new PrismaNormaRepository({
            norma: { updateMany },
        } as never);

        await repository.softDelete('tenant-1', 'norma-1');

        expect(updateMany).toHaveBeenCalledWith({
            where: { id: 'norma-1', ...tenantWhere('tenant-1') },
            data: { isRemoved: true },
        });
    });
});
