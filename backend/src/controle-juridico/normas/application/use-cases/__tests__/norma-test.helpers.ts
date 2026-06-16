import { NormaEntity } from '../../../domain/entities/norma.entity';

export function buildNormaEntity(
    overrides: Partial<ReturnType<NormaEntity['toPrimitives']>> = {},
) {
    return NormaEntity.restore({
        id: 'norma-1',
        tenantId: 'tenant-1',
        tipoId: 'tipo-1',
        numero: '001/2024',
        ementa: 'Dispõe sobre testes',
        anoId: 'ano-1',
        data: null,
        dataPublicacaoInicio: null,
        dataPublicacaoFim: null,
        esferaFederacaoId: null,
        identificadorId: null,
        materiaOrigemId: null,
        mensagem: null,
        dataSancao: null,
        dataVeto: null,
        tipoVeto: null,
        motivoVeto: null,
        dataPromulgacao: null,
        dataPublicacao: null,
        dataVigencia: null,
        dataRevogacao: null,
        normaRevoganteId: null,
        textoUrl: null,
        complementar: false,
        textoIntegralUrl: null,
        audioUrl: null,
        isRemoved: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        tipo: { id: 'tipo-1', nome: 'Lei' },
        ano: { id: 'ano-1', valor: 2024 },
        ...overrides,
    });
}

export function buildNormaRepositoryMock() {
    return {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        existsTipoNorma: jest.fn(),
        existsAno: jest.fn(),
        existsEsferaFederacao: jest.fn(),
        existsIdentificadorNorma: jest.fn(),
    };
}

export function buildMateriaOrigemValidatorMock() {
    return {
        validate: jest.fn(),
    };
}
