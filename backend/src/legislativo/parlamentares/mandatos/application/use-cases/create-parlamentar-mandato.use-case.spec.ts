import { LegislatureEntity } from '../../../../legislaturas/domain/entities/legislature.entity';
import { MandateStatus } from '../../domain/enums/mandate-status.enum';
import { ParliamentarianMandateEntity } from '../../domain/entities/parliamentarian-mandate.entity';
import { CreateParlamentarMandatoUseCase } from './create-parlamentar-mandato.use-case';
import {
    ActiveParlamentarMandatoAlreadyExistsError,
    LegislatureNotFoundForMandateError,
    ParliamentarianNotFoundForMandateError,
} from '../errors/parlamentar-mandato.errors';
import { buildParliamentarianWithRelations } from '../../../application/use-cases/__tests__/parliamentarian-test.helpers';

function buildMandateRepositoryMock() {
    return {
        create: jest.fn(),
        findByParliamentarianAndLegislature: jest.fn(),
        update: jest.fn(),
    };
}

describe('CreateParlamentarMandatoUseCase', () => {
    const dto = {
        legislatureId: 'leg-1',
        partyAcronym: 'PT',
    };

    it('cria mandato para parlamentar e legislatura válidos', async () => {
        const mandateRepository = buildMandateRepositoryMock();
        const parliamentarianRepository = {
            findById: jest.fn().mockResolvedValue(buildParliamentarianWithRelations()),
        };
        const legislatureRepository = {
            findById: jest.fn().mockResolvedValue(
                LegislatureEntity.restore({
                    id: 'leg-1',
                    tenantId: 'tenant-1',
                    number: 20,
                    startDate: new Date('2025-01-01'),
                    endDate: null,
                    isCurrent: true,
                    isRemoved: false,
                    removedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
            ),
        };
        mandateRepository.findByParliamentarianAndLegislature.mockResolvedValue(
            null,
        );
        mandateRepository.create.mockResolvedValue({
            entity: ParliamentarianMandateEntity.create({
                tenantId: 'tenant-1',
                parliamentarianId: 'parl-1',
                legislatureId: 'leg-1',
                startedAt: new Date(),
                partyAcronym: 'PT',
            }),
            legislature: {
                id: 'leg-1',
                number: 20,
                startDate: new Date('2025-01-01'),
                endDate: null,
                isCurrent: true,
            },
        });

        const useCase = new CreateParlamentarMandatoUseCase(
            mandateRepository as never,
            parliamentarianRepository as never,
            legislatureRepository as never,
        );

        const result = await useCase.execute('tenant-1', 'parl-1', dto);
        expect(result.legislature.number).toBe(20);
        expect(result.status).toBe(MandateStatus.ACTIVE);
    });

    it('bloqueia mandato ativo duplicado', async () => {
        const mandateRepository = buildMandateRepositoryMock();
        mandateRepository.findByParliamentarianAndLegislature.mockResolvedValue({
            entity: ParliamentarianMandateEntity.create({
                tenantId: 'tenant-1',
                parliamentarianId: 'parl-1',
                legislatureId: 'leg-1',
                startedAt: new Date(),
            }),
            legislature: {
                id: 'leg-1',
                number: 20,
                startDate: new Date(),
                endDate: null,
                isCurrent: true,
            },
        });

        const useCase = new CreateParlamentarMandatoUseCase(
            mandateRepository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
            {
                findById: jest.fn().mockResolvedValue(
                    LegislatureEntity.restore({
                        id: 'leg-1',
                        tenantId: 'tenant-1',
                        number: 20,
                        startDate: new Date(),
                        endDate: null,
                        isCurrent: true,
                        isRemoved: false,
                        removedAt: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }),
                ),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'parl-1', dto),
        ).rejects.toBeInstanceOf(ActiveParlamentarMandatoAlreadyExistsError);
    });

    it('falha quando parlamentar não existe', async () => {
        const useCase = new CreateParlamentarMandatoUseCase(
            buildMandateRepositoryMock() as never,
            { findById: jest.fn().mockResolvedValue(null) } as never,
            { findById: jest.fn() } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'parl-1', dto),
        ).rejects.toBeInstanceOf(ParliamentarianNotFoundForMandateError);
    });

    it('falha quando legislatura não existe', async () => {
        const useCase = new CreateParlamentarMandatoUseCase(
            buildMandateRepositoryMock() as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
            { findById: jest.fn().mockResolvedValue(null) } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'parl-1', dto),
        ).rejects.toBeInstanceOf(LegislatureNotFoundForMandateError);
    });
});
