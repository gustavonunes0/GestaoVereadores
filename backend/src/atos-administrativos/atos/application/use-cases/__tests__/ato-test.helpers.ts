import { AtoEntity } from '../../../domain/entities/ato.entity';

export function buildAtoEntity(overrides: Partial<ReturnType<AtoEntity['toPrimitives']>> = {}) {
    return AtoEntity.restore({
        id: 'ato-1',
        tenantId: 'tenant-1',
        tipoId: 'tipo-1',
        classificacaoId: 'class-1',
        numero: '001/2024',
        dataInicio: null,
        dataFim: null,
        dataPublicacaoInicio: null,
        dataPublicacaoFim: null,
        mensagem: null,
        ementa: null,
        dataAto: null,
        anexoUrl: null,
        textoUrl: null,
        identificadorId: null,
        isRemoved: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        tipo: { id: 'tipo-1', nome: 'Portaria' },
        classificacao: { id: 'class-1', nome: 'Administrativo' },
        ...overrides,
    });
}

export function buildAtoRepositoryMock() {
    return {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        existsByNumero: jest.fn(),
        existsTipoAto: jest.fn(),
        existsClassificacaoAto: jest.fn(),
    };
}
