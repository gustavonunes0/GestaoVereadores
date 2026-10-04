import { UnprocessableEntityException } from '@nestjs/common';
import {
    MSG_PARLAMENTAR_INATIVO,
    MSG_SUPLENTE_SEM_EXERCICIO,
    MSG_TITULAR_SUBSTITUIDO,
} from '../../domain/services/exercicio-mandato';
import { ExercicioMandatoService } from './exercicio-mandato.service';

type Sessao = {
    dataInicio: Date;
    statusSessao: string;
    elencoExercicio: Array<{ titularId: string; emExercicioId: string; substituicaoId: string | null }>;
};

function buildPrisma(opts: {
    sessao: Sessao;
    titulares: string[];
    /** Titulares devolvidos quando a consulta não filtra por legislatura. */
    titularesSemFiltro?: string[];
    substituicoes: Array<{
        id: string;
        titularId: string;
        suplenteId: string;
        dataInicio: Date;
        dataFim: Date | null;
        status: string;
    }>;
    condicoes?: Record<string, 'TITULAR' | 'SUPLENTE'>;
    inativos?: string[];
}) {
    const inativos = new Set(opts.inativos ?? []);
    const createMany = jest.fn().mockImplementation(({ data }) => {
        opts.sessao.elencoExercicio = data.map(
            ({ sessaoId: _sessaoId, ...vaga }: { sessaoId: string }) => vaga,
        );
        return Promise.resolve({ count: data.length });
    });
    const prisma = {
        sessaoPlenaria: {
            findFirst: jest.fn().mockImplementation(() =>
                Promise.resolve({
                    ...opts.sessao,
                    sessaoLegislativa: null,
                    elencoExercicio: [...opts.sessao.elencoExercicio],
                }),
            ),
        },
        legislature: { findFirst: jest.fn().mockResolvedValue({ id: 'leg-1' }) },
        parliamentarian: {
            findFirst: jest.fn().mockImplementation(({ where }) =>
                Promise.resolve({ status: inativos.has(where.id) ? 'INACTIVE' : 'ACTIVE' }),
            ),
            findMany: jest.fn().mockImplementation(({ where }) =>
                Promise.resolve(
                    (where.id.in as string[]).filter((id) => inativos.has(id)).map((id) => ({ id })),
                ),
            ),
        },
        parliamentarianMandate: {
            findMany: jest
                .fn()
                .mockImplementation(({ where }) =>
                    Promise.resolve(
                        (where.legislatureId
                            ? opts.titulares
                            : (opts.titularesSemFiltro ?? opts.titulares)
                        ).map((parliamentarianId) => ({ parliamentarianId })),
                    ),
                ),
            findFirst: jest.fn().mockImplementation(({ where }) => {
                const condicao = opts.condicoes?.[where.parliamentarianId];
                return Promise.resolve(condicao ? { condicao } : null);
            }),
        },
        substituicaoMandato: {
            findMany: jest.fn().mockImplementation(() => Promise.resolve(opts.substituicoes)),
        },
        sessaoElencoExercicio: { createMany },
    };
    return { prisma, createMany };
}

const DIA_SESSAO = new Date('2026-10-15T13:00:00.000Z');
const substituicaoAtiva = {
    id: 'sub-1',
    titularId: 'titular-1',
    suplenteId: 'suplente-1',
    dataInicio: new Date('2026-10-01T00:00:00.000Z'),
    dataFim: null,
    status: 'ATIVA',
};

describe('ExercicioMandatoService', () => {
    it('titular substituído não registra presença/voto e suplente vinculado sim', async () => {
        const { prisma } = buildPrisma({
            sessao: { dataInicio: DIA_SESSAO, statusSessao: 'AGENDADA', elencoExercicio: [] },
            titulares: ['titular-1', 'titular-2'],
            substituicoes: [substituicaoAtiva],
            condicoes: { 'titular-1': 'TITULAR', 'suplente-1': 'SUPLENTE', 'suplente-2': 'SUPLENTE' },
        });
        const service = new ExercicioMandatoService(prisma as never);

        await expect(
            service.assertPodeExercerNaSessao('tenant-1', 'sessao-1', 'titular-1'),
        ).rejects.toThrow(new UnprocessableEntityException(MSG_TITULAR_SUBSTITUIDO));
        await expect(
            service.assertPodeExercerNaSessao('tenant-1', 'sessao-1', 'suplente-1'),
        ).resolves.toBeUndefined();
        await expect(
            service.assertPodeExercerNaSessao('tenant-1', 'sessao-1', 'suplente-2'),
        ).rejects.toThrow(new UnprocessableEntityException(MSG_SUPLENTE_SEM_EXERCICIO));
    });

    it('quórum conta a vaga uma única vez', async () => {
        const { prisma } = buildPrisma({
            sessao: { dataInicio: DIA_SESSAO, statusSessao: 'AGENDADA', elencoExercicio: [] },
            titulares: ['titular-1', 'titular-2'],
            substituicoes: [substituicaoAtiva],
        });
        const service = new ExercicioMandatoService(prisma as never);

        const ids = await service.idsEmExercicioDaSessao('tenant-1', 'sessao-1');
        expect([...ids].sort()).toEqual(['suplente-1', 'titular-2']);
    });

    it('após o encerramento o titular volta a exercer nas sessões seguintes', async () => {
        const { prisma } = buildPrisma({
            sessao: { dataInicio: DIA_SESSAO, statusSessao: 'AGENDADA', elencoExercicio: [] },
            titulares: ['titular-1'],
            substituicoes: [],
            condicoes: { 'titular-1': 'TITULAR', 'suplente-1': 'SUPLENTE' },
        });
        const service = new ExercicioMandatoService(prisma as never);

        await expect(
            service.assertPodeExercerNaSessao('tenant-1', 'sessao-1', 'titular-1'),
        ).resolves.toBeUndefined();
        await expect(
            service.assertPodeExercerNaSessao('tenant-1', 'sessao-1', 'suplente-1'),
        ).rejects.toThrow(MSG_SUPLENTE_SEM_EXERCICIO);
    });

    it('sessão aberta congela o elenco: mudança só vale a partir da próxima sessão', async () => {
        const sessao: Sessao = { dataInicio: DIA_SESSAO, statusSessao: 'ABERTA', elencoExercicio: [] };
        const opts = {
            sessao,
            titulares: ['titular-1'],
            substituicoes: [] as Array<typeof substituicaoAtiva>,
            condicoes: { 'titular-1': 'TITULAR', 'suplente-1': 'SUPLENTE' } as Record<
                string,
                'TITULAR' | 'SUPLENTE'
            >,
        };
        const { prisma, createMany } = buildPrisma(opts);
        const service = new ExercicioMandatoService(prisma as never);

        await service.congelarElencoDaSessao('tenant-1', 'sessao-1');
        expect(createMany).toHaveBeenCalledTimes(1);

        opts.substituicoes.push(substituicaoAtiva);

        const elenco = await service.elencoDaSessao('tenant-1', 'sessao-1');
        expect(elenco.congelado).toBe(true);
        expect(elenco.vagas).toEqual([
            { titularId: 'titular-1', emExercicioId: 'titular-1', substituicaoId: null },
        ]);
        await expect(
            service.assertPodeExercerNaSessao('tenant-1', 'sessao-1', 'titular-1'),
        ).resolves.toBeUndefined();
    });

    it('sessão agendada não congela e acompanha a substituição vigente', async () => {
        const { prisma, createMany } = buildPrisma({
            sessao: { dataInicio: DIA_SESSAO, statusSessao: 'AGENDADA', elencoExercicio: [] },
            titulares: ['titular-1'],
            substituicoes: [substituicaoAtiva],
        });
        const service = new ExercicioMandatoService(prisma as never);

        const elenco = await service.elencoDaSessao('tenant-1', 'sessao-1');
        expect(elenco.congelado).toBe(false);
        expect(elenco.vagas[0].emExercicioId).toBe('suplente-1');
        expect(createMany).not.toHaveBeenCalled();
    });

    it('legislatura da sessão sem titulares usa todos os titulares ativos', async () => {
        const { prisma } = buildPrisma({
            sessao: { dataInicio: DIA_SESSAO, statusSessao: 'AGENDADA', elencoExercicio: [] },
            titulares: [],
            titularesSemFiltro: ['titular-1', 'titular-2'],
            substituicoes: [],
        });
        const service = new ExercicioMandatoService(prisma as never);

        const ids = await service.idsEmExercicioDaSessao('tenant-1', 'sessao-1');
        expect([...ids].sort()).toEqual(['titular-1', 'titular-2']);
    });

    it('parlamentar inativo não registra presença/voto e sai do quórum', async () => {
        const { prisma } = buildPrisma({
            sessao: { dataInicio: DIA_SESSAO, statusSessao: 'AGENDADA', elencoExercicio: [] },
            titulares: ['titular-1', 'titular-2'],
            substituicoes: [],
            condicoes: { 'titular-1': 'TITULAR', 'titular-2': 'TITULAR' },
            inativos: ['titular-2'],
        });
        const service = new ExercicioMandatoService(prisma as never);

        await expect(
            service.assertPodeExercerNaSessao('tenant-1', 'sessao-1', 'titular-2'),
        ).rejects.toThrow(new UnprocessableEntityException(MSG_PARLAMENTAR_INATIVO));
        await expect(
            service.assertPodeExercerNaSessao('tenant-1', 'sessao-1', 'titular-1'),
        ).resolves.toBeUndefined();
        const ids = await service.idsEmExercicioDaSessao('tenant-1', 'sessao-1');
        expect([...ids]).toEqual(['titular-1']);
    });

    it('titular inativo substituído mantém a vaga com o suplente ativo', async () => {
        const { prisma } = buildPrisma({
            sessao: { dataInicio: DIA_SESSAO, statusSessao: 'AGENDADA', elencoExercicio: [] },
            titulares: ['titular-1'],
            substituicoes: [substituicaoAtiva],
            condicoes: { 'titular-1': 'TITULAR', 'suplente-1': 'SUPLENTE' },
            inativos: ['titular-1'],
        });
        const service = new ExercicioMandatoService(prisma as never);

        const ids = await service.idsEmExercicioDaSessao('tenant-1', 'sessao-1');
        expect([...ids]).toEqual(['suplente-1']);
        await expect(
            service.assertPodeExercerNaSessao('tenant-1', 'sessao-1', 'suplente-1'),
        ).resolves.toBeUndefined();
    });
});
