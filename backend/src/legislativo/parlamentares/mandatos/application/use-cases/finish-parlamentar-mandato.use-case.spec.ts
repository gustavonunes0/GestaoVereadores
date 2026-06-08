import { MandateStatus } from '../../domain/enums/mandate-status.enum';
import { ParliamentarianMandateEntity } from '../../domain/entities/parliamentarian-mandate.entity';
import { FinishParlamentarMandatoUseCase } from './finish-parlamentar-mandato.use-case';
import {
    ParlamentarMandatoAlreadyFinishedError,
    ParlamentarMandatoNotFoundError,
} from '../errors/parlamentar-mandato.errors';
import { buildParliamentarianWithRelations } from '../../../application/use-cases/__tests__/parliamentarian-test.helpers';

describe('FinishParlamentarMandatoUseCase', () => {
    const activeMandate = {
        entity: ParliamentarianMandateEntity.create({
            tenantId: 'tenant-1',
            parliamentarianId: 'parl-1',
            legislatureId: 'leg-1',
            startedAt: new Date('2024-01-01'),
        }),
        legislature: {
            id: 'leg-1',
            number: 20,
            startDate: new Date('2024-01-01'),
            endDate: null,
            isCurrent: true,
        },
    };

    it('encerra mandato ativo', async () => {
        const mandateRepository = {
            findById: jest.fn().mockResolvedValue(activeMandate),
            update: jest.fn().mockImplementation((_t, _id, data) =>
                Promise.resolve({
                    entity: ParliamentarianMandateEntity.restore({
                        ...activeMandate.entity.toPrimitives(),
                        status: data.status,
                        endedAt: data.endedAt,
                    }),
                    legislature: activeMandate.legislature,
                }),
            ),
        };

        const useCase = new FinishParlamentarMandatoUseCase(
            mandateRepository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        const result = await useCase.execute(
            'tenant-1',
            'parl-1',
            activeMandate.entity.id,
            { status: MandateStatus.FINISHED },
        );
        expect(result.status).toBe(MandateStatus.FINISHED);
        expect(result.endedAt).toBeDefined();
    });

    it('bloqueia encerrar mandato inexistente', async () => {
        const useCase = new FinishParlamentarMandatoUseCase(
            { findById: jest.fn().mockResolvedValue(null) } as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'parl-1', 'missing', {}),
        ).rejects.toBeInstanceOf(ParlamentarMandatoNotFoundError);
    });

    it('bloqueia encerrar mandato já finalizado', async () => {
        const finished = ParliamentarianMandateEntity.restore({
            ...activeMandate.entity.toPrimitives(),
            status: MandateStatus.FINISHED,
            endedAt: new Date('2025-01-01'),
        });

        const useCase = new FinishParlamentarMandatoUseCase(
            {
                findById: jest.fn().mockResolvedValue({
                    entity: finished,
                    legislature: activeMandate.legislature,
                }),
            } as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'parl-1', finished.id, {}),
        ).rejects.toBeInstanceOf(ParlamentarMandatoAlreadyFinishedError);
    });
});
