import { CommitteeMemberRole } from '../../domain/enums/committee-member-role.enum';
import { AddComissaoMembroUseCase } from './add-comissao-membro.use-case';
import { RemoveComissaoMembroUseCase } from './remove-comissao-membro.use-case';
import { ListFuncoesComissaoUseCase } from './list-funcoes-comissao.use-case';
import {
    ComissaoNotFoundError,
    CommitteeExclusiveRoleAlreadyAssignedError,
    ComissaoMembroNotFoundError,
    ParliamentarianAlreadyOnCommitteeError,
    ParliamentarianNotFoundForComissaoError,
} from '../errors/comissao.errors';
import { buildParliamentarianWithRelations } from '../../../parlamentares/application/use-cases/__tests__/parliamentarian-test.helpers';
import {
    buildCommitteeRepositoryMock,
    buildCommitteeWithRelations,
} from './__tests__/comissao-test.helpers';
import { TenantScopedUpdateError } from '../../../../common/prisma/tenant-scoped-update';

describe('AddComissaoMembroUseCase', () => {
    const dto = {
        parliamentarianId: 'parl-1',
        role: CommitteeMemberRole.PRESIDENT,
    };

    it('registra presidente, relator e membros na comissão', async () => {
        const repository = buildCommitteeRepositoryMock();
        const parliamentarianRepository = { findById: jest.fn() };

        const assignments = [
            { parlId: 'parl-1', role: CommitteeMemberRole.PRESIDENT },
            { parlId: 'parl-2', role: CommitteeMemberRole.RAPPORTEUR },
            { parlId: 'parl-3', role: CommitteeMemberRole.MEMBER },
            { parlId: 'parl-4', role: CommitteeMemberRole.MEMBER },
        ];

        repository.findById.mockResolvedValue(buildCommitteeWithRelations());
        repository.existsMemberByParliamentarian.mockResolvedValue(false);
        repository.existsMemberByExclusiveRole.mockResolvedValue(false);
        repository.addMember.mockImplementation(async (data) => ({
            id: `member-${data.parliamentarianId}`,
            role: data.role,
            parliamentarian: {
                id: data.parliamentarianId,
                parliamentaryName: `Parlamentar ${data.parliamentarianId}`,
                officeNumber: null,
            },
            createdAt: new Date(),
        }));

        const useCase = new AddComissaoMembroUseCase(
            repository as never,
            parliamentarianRepository as never,
        );

        for (const { parlId, role } of assignments) {
            parliamentarianRepository.findById.mockResolvedValueOnce(
                buildParliamentarianWithRelations(),
            );
            await useCase.execute('tenant-1', 'committee-1', {
                parliamentarianId: parlId,
                role,
            });
        }

        expect(repository.addMember).toHaveBeenCalledTimes(4);
    });

    it('vincula membro via parliamentarianId', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.findById.mockResolvedValue(buildCommitteeWithRelations());
        repository.existsMemberByParliamentarian.mockResolvedValue(false);
        repository.existsMemberByExclusiveRole.mockResolvedValue(false);
        repository.addMember.mockResolvedValue({
            id: 'member-1',
            role: CommitteeMemberRole.PRESIDENT,
            parliamentarian: {
                id: 'parl-1',
                parliamentaryName: 'Vereador Teste',
                officeNumber: '101',
            },
            createdAt: new Date(),
        });

        const parliamentarianRepository = {
            findById: jest
                .fn()
                .mockResolvedValue(buildParliamentarianWithRelations()),
        };

        const useCase = new AddComissaoMembroUseCase(
            repository as never,
            parliamentarianRepository as never,
        );

        await useCase.execute('tenant-1', 'committee-1', dto);

        expect(repository.addMember).toHaveBeenCalledWith(
            expect.objectContaining({
                parliamentarianId: 'parl-1',
                role: CommitteeMemberRole.PRESIDENT,
            }),
        );
    });

    it('bloqueia parlamentar duplicado na mesma comissão', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.findById.mockResolvedValue(buildCommitteeWithRelations());
        repository.existsMemberByParliamentarian.mockResolvedValue(true);

        const useCase = new AddComissaoMembroUseCase(
            repository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'committee-1', dto),
        ).rejects.toBeInstanceOf(ParliamentarianAlreadyOnCommitteeError);
    });

    it('bloqueia segundo presidente na mesma comissão', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.findById.mockResolvedValue(buildCommitteeWithRelations());
        repository.existsMemberByParliamentarian.mockResolvedValue(false);
        repository.existsMemberByExclusiveRole.mockResolvedValue(true);

        const useCase = new AddComissaoMembroUseCase(
            repository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'committee-1', dto),
        ).rejects.toBeInstanceOf(CommitteeExclusiveRoleAlreadyAssignedError);
    });

    it('bloqueia comissão inexistente', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new AddComissaoMembroUseCase(
            repository as never,
            { findById: jest.fn() } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'committee-1', dto),
        ).rejects.toBeInstanceOf(ComissaoNotFoundError);
    });

    it('bloqueia parlamentar inexistente', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.findById.mockResolvedValue(buildCommitteeWithRelations());

        const useCase = new AddComissaoMembroUseCase(
            repository as never,
            { findById: jest.fn().mockResolvedValue(null) } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'committee-1', dto),
        ).rejects.toBeInstanceOf(ParliamentarianNotFoundForComissaoError);
    });
});

describe('RemoveComissaoMembroUseCase', () => {
    it('remove membro da comissão', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.findById.mockResolvedValue(buildCommitteeWithRelations());
        repository.removeMember.mockResolvedValue(undefined);

        const useCase = new RemoveComissaoMembroUseCase(repository as never);
        await useCase.execute('tenant-1', 'committee-1', 'member-1');

        expect(repository.removeMember).toHaveBeenCalledWith(
            'tenant-1',
            'committee-1',
            'member-1',
        );
    });

    it('bloqueia remoção de membro inexistente', async () => {
        const repository = buildCommitteeRepositoryMock();
        repository.findById.mockResolvedValue(buildCommitteeWithRelations());
        repository.removeMember.mockRejectedValue(
            new TenantScopedUpdateError('Membro não encontrado nesta comissão'),
        );

        const useCase = new RemoveComissaoMembroUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'committee-1', 'member-x'),
        ).rejects.toBeInstanceOf(ComissaoMembroNotFoundError);
    });
});

describe('ListFuncoesComissaoUseCase', () => {
    it('lista funções de membro da comissão', () => {
        const useCase = new ListFuncoesComissaoUseCase();
        const result = useCase.execute();

        expect(result).toEqual(
            expect.arrayContaining([
                { value: CommitteeMemberRole.PRESIDENT, label: 'Presidente' },
                { value: CommitteeMemberRole.RAPPORTEUR, label: 'Relator' },
                { value: CommitteeMemberRole.MEMBER, label: 'Membro' },
            ]),
        );
    });
});
