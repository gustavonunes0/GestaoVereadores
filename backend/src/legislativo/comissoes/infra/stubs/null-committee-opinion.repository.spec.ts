import { NullCommitteeOpinionRepository } from './null-committee-opinion.repository';

describe('NullCommitteeOpinionRepository', () => {
    const repository = new NullCommitteeOpinionRepository();

    it('retorna null para parecer inexistente no MVP', async () => {
        await expect(
            repository.findByMatterAndCommittee({
                tenantId: 'tenant-1',
                matterId: 'matter-1',
                committeeId: 'committee-1',
            }),
        ).resolves.toBeNull();
    });

    it('retorna lista vazia de pareceres no MVP', async () => {
        await expect(
            repository.listByMatter({
                tenantId: 'tenant-1',
                matterId: 'matter-1',
            }),
        ).resolves.toEqual([]);
    });
});
