import { NotFoundException, ConflictException } from '@nestjs/common';
import { StatusMateria } from '@prisma/client';
import { MatterAuthorType } from '../../domain/enums/matter-author-type.enum';
import { MatterAuthorshipDomainService } from '../../domain/services/matter-authorship-domain.service';
import { SetMatterAutorParlamentarUseCase } from './set-matter-autor-parlamentar.use-case';
import { SetMatterAutorExternoUseCase } from './set-matter-autor-externo.use-case';
import {
    AddMatterCoauthorUseCase,
    RemoveMatterCoauthorUseCase,
} from './manage-matter-coauthors.use-case';
import { SetMatterRelatorUseCase } from './set-matter-relator.use-case';
import {
    MatterCoauthorAlreadyExistsError,
    MatterNotFoundError,
    ParliamentarianNotFoundForMatterError,
} from '../errors/matter.errors';
import { MatterAuthorshipViewModel } from '../view-models/matter-authorship.view-model';

function buildMateriaRepositoryMock() {
    return {
        getAutoria: jest.fn(),
        setAutorParlamentar: jest.fn(),
        setAutorExterno: jest.fn(),
        addCoautor: jest.fn(),
        removeCoautor: jest.fn(),
        setRelator: jest.fn(),
    };
}

const authorshipPayload = {
    id: 'matter-1',
    tenantId: 'tenant-1',
    tipoId: 'tipo-1',
    ementa: 'Ementa teste',
    numero: 1,
    anoId: 'ano-1',
    status: StatusMateria.EM_TRAMITACAO,
    emTramitacao: true,
    tramitacaoJson: [],
    autorId: null,
    relatorId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorParliamentarian: {
        id: 'parl-1',
        parliamentaryName: 'Vereador Autor',
        officeNumber: '01',
        politicalParty: { id: 'p1', name: 'PT', acronym: 'PT' },
    },
    rapporteurParliamentarian: null,
    matterCoauthors: [],
    autor: null,
};

describe('MatterAuthorshipDomainService', () => {
    const service = new MatterAuthorshipDomainService();

    it('exige autor externo informado', () => {
        expect(() => service.assertExternalAuthorProvided(null)).toThrow(
            'Autor externo é obrigatório',
        );
    });

    it('impede coautor duplicado', () => {
        expect(() => service.assertCoauthorNotDuplicate(true)).toThrow(
            'Parlamentar já é coautor desta matéria',
        );
    });
});

describe('SetMatterAutorParlamentarUseCase', () => {
    it('registra autor parlamentar', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.setAutorParlamentar.mockResolvedValue(authorshipPayload);

        const useCase = new SetMatterAutorParlamentarUseCase(
            repository as never,
        );
        const result = await useCase.execute('tenant-1', 'matter-1', {
            parliamentarianId: 'parl-1',
        });

        expect(result.primaryAuthor?.type).toBe(MatterAuthorType.PARLIAMENTARIAN);
        expect(repository.setAutorParlamentar).toHaveBeenCalled();
    });

    it('bloqueia parlamentar inexistente', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.setAutorParlamentar.mockRejectedValue(
            new NotFoundException('Parlamentar não encontrado nesta Câmara'),
        );

        const useCase = new SetMatterAutorParlamentarUseCase(
            repository as never,
        );

        await expect(
            useCase.execute('tenant-1', 'matter-1', {
                parliamentarianId: 'parl-x',
            }),
        ).rejects.toBeInstanceOf(ParliamentarianNotFoundForMatterError);
    });
});

describe('SetMatterAutorExternoUseCase', () => {
    it('registra autor externo via AutorExterno', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.setAutorExterno.mockResolvedValue({
            ...authorshipPayload,
            authorParliamentarian: null,
            autor: {
                id: 'autor-1',
                nome: 'Cidadão Externo',
                autorExterno: {
                    id: 'ext-1',
                    nome: 'Cidadão Externo',
                    tipoAutorId: 'tipo-popular',
                },
            },
            autorId: 'autor-1',
        });

        const useCase = new SetMatterAutorExternoUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'matter-1', {
            autorExternoId: 'ext-1',
        });

        expect(result.primaryAuthor?.type).toBe(MatterAuthorType.EXTERNAL);
        expect(
            result.primaryAuthor &&
                'autorExterno' in result.primaryAuthor &&
                result.primaryAuthor.autorExterno?.nome,
        ).toBe('Cidadão Externo');
    });
});

describe('AddMatterCoauthorUseCase', () => {
    it('adiciona coautor parlamentar', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.addCoautor.mockResolvedValue({
            ...authorshipPayload,
            matterCoauthors: [
                {
                    id: 'co-1',
                    ordem: 1,
                    parliamentarian: {
                        id: 'parl-2',
                        parliamentaryName: 'Coautor',
                        officeNumber: '02',
                        politicalParty: null,
                    },
                },
            ],
        });

        const useCase = new AddMatterCoauthorUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'matter-1', {
            parliamentarianId: 'parl-2',
        });

        expect(result.coauthors).toHaveLength(1);
    });

    it('bloqueia coautor duplicado', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.addCoautor.mockRejectedValue(
            new ConflictException('Parlamentar já é coautor desta matéria'),
        );

        const useCase = new AddMatterCoauthorUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'matter-1', {
                parliamentarianId: 'parl-2',
            }),
        ).rejects.toBeInstanceOf(MatterCoauthorAlreadyExistsError);
    });
});

describe('SetMatterRelatorUseCase', () => {
    it('define relator parlamentar', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.setRelator.mockResolvedValue({
            ...authorshipPayload,
            rapporteurParliamentarian: {
                id: 'parl-3',
                parliamentaryName: 'Relator',
                officeNumber: '03',
                politicalParty: null,
            },
        });

        const useCase = new SetMatterRelatorUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'matter-1', {
            parliamentarianId: 'parl-3',
        });

        expect(result.rapporteur?.parliamentaryName).toBe('Relator');
    });
});

describe('MatterAuthorshipViewModel', () => {
    it('diferencia autor parlamentar e externo', () => {
        const parlamentar = MatterAuthorshipViewModel.toHttp(authorshipPayload);
        expect(parlamentar.primaryAuthor?.type).toBe(
            MatterAuthorType.PARLIAMENTARIAN,
        );

        const externo = MatterAuthorshipViewModel.toHttp({
            ...authorshipPayload,
            authorParliamentarian: null,
            autor: {
                id: 'autor-1',
                nome: 'Externo',
                autorExterno: {
                    id: 'ext-1',
                    nome: 'Externo',
                    tipoAutorId: 'tipo-1',
                },
            },
        });
        expect(externo.primaryAuthor?.type).toBe(MatterAuthorType.EXTERNAL);
    });
});

describe('RemoveMatterCoauthorUseCase', () => {
    it('bloqueia matéria inexistente', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.removeCoautor.mockRejectedValue(
            new NotFoundException('Matéria não encontrada'),
        );

        const useCase = new RemoveMatterCoauthorUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'matter-x', 'co-1'),
        ).rejects.toBeInstanceOf(MatterNotFoundError);
    });
});
