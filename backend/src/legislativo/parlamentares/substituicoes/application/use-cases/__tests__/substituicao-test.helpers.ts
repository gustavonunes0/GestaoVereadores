import { CondicaoMandato } from '../../../../mandatos/domain/enums/condicao-mandato.enum';
import {
    MotivoSubstituicao,
    StatusSubstituicao,
} from '../../../domain/enums/substituicao.enums';
import {
    AtualizarSubstituicaoDados,
    CriarSubstituicaoDados,
    MandatoAtivoResumo,
    RegistroHistorico,
    SubstituicaoHistoricoRecord,
    SubstituicaoRecord,
    SubstituicaoRepository,
} from '../../../domain/repositories/substituicao.repository';

export const HOJE = new Date('2026-10-15T15:00:00.000Z');

export function buildSubstituicao(over: Partial<SubstituicaoRecord> = {}): SubstituicaoRecord {
    const titularId = over.titularId ?? 'titular-1';
    const suplenteId = over.suplenteId ?? 'suplente-1';
    return {
        id: 'sub-1',
        tenantId: 'tenant-1',
        legislatureId: 'leg-1',
        titularId,
        suplenteId,
        motivo: MotivoSubstituicao.LICENCA,
        dataInicio: '2026-10-01',
        dataFim: null,
        observacao: null,
        status: StatusSubstituicao.ATIVA,
        encerradaEm: null,
        createdAt: new Date('2026-09-30'),
        updatedAt: new Date('2026-09-30'),
        titular: { id: titularId, parliamentaryName: titularId },
        suplente: { id: suplenteId, parliamentaryName: suplenteId },
        criadoPor: null,
        encerradoPor: null,
        ...over,
    };
}

/** Repositório em memória com mandatos fixos. */
export class InMemorySubstituicaoRepository extends SubstituicaoRepository {
    substituicoes: SubstituicaoRecord[] = [];
    historico: Array<{ substituicaoId: string } & RegistroHistorico> = [];
    mandatos = new Map<string, MandatoAtivoResumo>([
        ['titular-1', { legislatureId: 'leg-1', condicao: CondicaoMandato.TITULAR, partyAcronym: 'PT' }],
        ['titular-2', { legislatureId: 'leg-1', condicao: CondicaoMandato.TITULAR, partyAcronym: 'PL' }],
        ['suplente-1', { legislatureId: 'leg-1', condicao: CondicaoMandato.SUPLENTE, partyAcronym: 'PT' }],
        ['suplente-2', { legislatureId: 'leg-1', condicao: CondicaoMandato.SUPLENTE, partyAcronym: 'PL' }],
    ]);
    private seq = 0;

    async findById(_tenantId: string, id: string) {
        return this.substituicoes.find((s) => s.id === id) ?? null;
    }

    async listByParlamentar(_tenantId: string, parliamentarianId: string) {
        return this.substituicoes.filter(
            (s) => s.titularId === parliamentarianId || s.suplenteId === parliamentarianId,
        );
    }

    async listNaoCanceladasEnvolvendo(
        _tenantId: string,
        titularId: string,
        suplenteId: string,
        excetoId?: string,
    ) {
        return this.substituicoes.filter(
            (s) =>
                s.status !== StatusSubstituicao.CANCELADA &&
                s.id !== excetoId &&
                (s.titularId === titularId || s.suplenteId === suplenteId),
        );
    }

    async findMandatoAtivo(_tenantId: string, parliamentarianId: string, legislatureId?: string) {
        const m = this.mandatos.get(parliamentarianId) ?? null;
        if (m && legislatureId && m.legislatureId !== legislatureId) return null;
        return m;
    }

    async listSuplentesElegiveis(_tenantId: string, legislatureId: string) {
        return [...this.mandatos.entries()]
            .filter(([, m]) => m.condicao === CondicaoMandato.SUPLENTE && m.legislatureId === legislatureId)
            .map(([id, m]) => ({ id, parliamentaryName: id, partyAcronym: m.partyAcronym }));
    }

    async create(dados: CriarSubstituicaoDados, historico: RegistroHistorico) {
        const created = buildSubstituicao({ ...dados, id: `sub-new-${++this.seq}` });
        this.substituicoes.push(created);
        this.historico.push({ substituicaoId: created.id, ...historico });
        return created;
    }

    async update(
        _tenantId: string,
        id: string,
        dados: AtualizarSubstituicaoDados,
        historico: RegistroHistorico,
    ) {
        const idx = this.substituicoes.findIndex((s) => s.id === id);
        const { encerradoPorId: _ignored, ...campos } = dados;
        this.substituicoes[idx] = { ...this.substituicoes[idx], ...campos };
        this.historico.push({ substituicaoId: id, ...historico });
        return this.substituicoes[idx];
    }

    async listHistorico(_tenantId: string, id: string): Promise<SubstituicaoHistoricoRecord[]> {
        return this.historico
            .filter((h) => h.substituicaoId === id)
            .map((h, i) => ({
                id: `h-${i}`,
                acao: h.acao,
                dataHora: HOJE,
                responsavel: null,
                alteracoes: h.alteracoes ?? null,
            }));
    }
}
