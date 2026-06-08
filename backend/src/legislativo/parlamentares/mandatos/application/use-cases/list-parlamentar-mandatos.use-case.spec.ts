import { MandateStatus } from '../../domain/enums/mandate-status.enum';
import { ParliamentarianMandateEntity } from '../../domain/entities/parliamentarian-mandate.entity';
import { ListParlamentarMandatosUseCase } from './list-parlamentar-mandatos.use-case';
import { ParliamentarianNotFoundForMandateError } from '../errors/parlamentar-mandato.errors';
import { buildParliamentarianWithRelations } from '../../../application/use-cases/__tests__/parliamentarian-test.helpers';

describe('ListParlamentarMandatosUseCase', () => {
    it('lista mandatos do parlamentar', async () => {
        const mandate = ParliamentarianMandateEntity.create({
            tenantId: 'tenant-1',
            parliamentarianId: 'parl-1',
            legislatureId: 'leg-1',
            startedAt: new Date(),
        });

        const mandateRepository = {
            findMany: jest.fn().mockResolvedValue({
                data: [
                    {
                        entity: mandate,
                        legislature: {
                            id: 'leg-1',
                            number: 20,
                            startDate: new Date(),
                            endDate: null,
                            isCurrent: true,
                        },
                    },
                ],
                total: 1,
                page: 1,
                limit: 20,
                totalPages: 1,
            }),
        };

        const useCase = new ListParlamentarMandatosUseCase(
            mandateRepository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        const result = await useCase.execute('tenant-1', 'parl-1', {});
        expect(result.data).toHaveLength(1);
        expect(result.data[0]?.status).toBe(MandateStatus.ACTIVE);
    });

    it('falha quando parlamentar não existe', async () => {
        const useCase = new ListParlamentarMandatosUseCase(
            { findMany: jest.fn() } as never,
            { findById: jest.fn().mockResolvedValue(null) } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'missing', {}),
        ).rejects.toBeInstanceOf(ParliamentarianNotFoundForMandateError);
    });
});
