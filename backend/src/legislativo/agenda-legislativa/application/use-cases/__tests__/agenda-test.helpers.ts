import { AgendaEventType } from '../../../domain/enums/agenda-event-type.enum';
import {
    AgendaLegislativaEntity,
    AgendaLegislativaPrimitives,
} from '../../../domain/entities/agenda-legislativa.entity';

export function buildAgendaEntity(
    overrides: Partial<AgendaLegislativaPrimitives> = {},
) {
    return AgendaLegislativaEntity.restore({
        id: 'agenda-1',
        tenantId: 'tenant-1',
        tipo: AgendaEventType.SESSAO,
        numero: '001/2024',
        titulo: 'Sessão Ordinária',
        dataInicio: new Date('2024-06-01T14:00:00Z'),
        dataFim: new Date('2024-06-01T18:00:00Z'),
        mensagem: null,
        local: null,
        descricao: null,
        sessaoPlenariaId: null,
        publicoExterno: false,
        linkTransmissao: null,
        recorrencia: null,
        recorrenciaPaiId: null,
        isRemoved: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        ...overrides,
    });
}

export function buildAgendaRepositoryMock() {
    return {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };
}
