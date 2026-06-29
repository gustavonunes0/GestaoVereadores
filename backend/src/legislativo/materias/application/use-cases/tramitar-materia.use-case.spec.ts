import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MatterStatus } from '../../domain/enums/matter-status.enum';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { TramitarMateriaUseCase } from './tramitar-materia.use-case';
import { MateriaPrismaPayload } from '../view-models/matter.view-model';

function makeMateria(status: MatterStatus): MateriaPrismaPayload {
    return {
        id: 'mat-1',
        tenantId: 'tenant-1',
        tipoId: 'tipo-1',
        ementa: 'Ementa de teste',
        numero: 1,
        anoId: 'ano-1',
        status: status as never,
        emTramitacao: false,
        tramitacaoJson: [],
        autorId: null,
        relatorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

describe('TramitarMateriaUseCase', () => {
    let useCase: TramitarMateriaUseCase;
    let repo: jest.Mocked<MateriaRepository>;

    beforeEach(async () => {
        repo = {
            findOne: jest.fn(),
            tramitar: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            alterarStatus: jest.fn(),
            tramitarMateria: jest.fn(),
            listTramitationActions: jest.fn(),
            remove: jest.fn(),
            listarAutores: jest.fn(),
            adicionarAutor: jest.fn(),
            removerAutor: jest.fn(),
            getAutoria: jest.fn(),
            setAutorParlamentar: jest.fn(),
            setTenantPartner: jest.fn(),
            addCoautor: jest.fn(),
            removeCoautor: jest.fn(),
            setRelator: jest.fn(),
            replaceCoautores: jest.fn(),
            proximoNumero: jest.fn(),
            listTenantPartners: jest.fn(),
            addPublicacao: jest.fn(),
        } as jest.Mocked<MateriaRepository>;

        const module = await Test.createTestingModule({
            providers: [
                TramitarMateriaUseCase,
                { provide: MATERIA_REPOSITORY, useValue: repo },
            ],
        }).compile();

        useCase = module.get(TramitarMateriaUseCase);
    });

    it('lança NotFoundException quando matéria não existe', async () => {
        repo.findOne.mockRejectedValue(new NotFoundException());
        await expect(
            useCase.execute('tenant-1', 'mat-1', {
                novoStatus: MatterStatus.PROTOCOLADA,
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it('lança BadRequestException com mensagem PT para transição inválida', async () => {
        repo.findOne.mockResolvedValue(makeMateria(MatterStatus.APROVADA));
        await expect(
            useCase.execute('tenant-1', 'mat-1', {
                novoStatus: MatterStatus.DRAFT,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('não chama tramitar() para transição inválida', async () => {
        repo.findOne.mockResolvedValue(makeMateria(MatterStatus.DRAFT));
        await expect(
            useCase.execute('tenant-1', 'mat-1', {
                novoStatus: MatterStatus.APROVADA,
            }),
        ).rejects.toThrow(BadRequestException);
        expect(repo.tramitar).not.toHaveBeenCalled();
    });

    it('lança BadRequestException quando despacho ausente para EM_TRAMITACAO', async () => {
        repo.findOne.mockResolvedValue(makeMateria(MatterStatus.PROTOCOLADA));
        await expect(
            useCase.execute('tenant-1', 'mat-1', {
                novoStatus: MatterStatus.EM_TRAMITACAO,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('chama tramitar() e retorna view model para transição válida', async () => {
        const materia = makeMateria(MatterStatus.DRAFT);
        repo.findOne
            .mockResolvedValueOnce(materia)
            .mockResolvedValueOnce({ ...materia, status: 'PROTOCOLADA' as never });
        repo.tramitar.mockResolvedValue(undefined);

        const result = await useCase.execute('tenant-1', 'mat-1', {
            novoStatus: MatterStatus.PROTOCOLADA,
        });

        expect(repo.tramitar).toHaveBeenCalledWith(
            'mat-1',
            'tenant-1',
            expect.objectContaining({
                statusAnterior: MatterStatus.DRAFT,
                novoStatus: MatterStatus.PROTOCOLADA,
            }),
        );
        expect(result).toHaveProperty('id', 'mat-1');
    });
});
