import { AcaoSubstituicaoHistorico, MotivoSubstituicao, StatusSubstituicao } from '../../domain/enums/substituicao.enums';
import {
    SubstituicaoNaoEditavelError,
    SubstituicaoPeriodoInvalidoError,
    SuplenteInvalidoError,
    SuplenteJaEmExercicioNoPeriodoError,
    TitularInvalidoError,
    TitularJaSubstituidoNoPeriodoError,
} from '../errors/substituicao.errors';
import { CreateSubstituicaoUseCase } from './create-substituicao.use-case';
import { EncerrarSubstituicaoUseCase } from './encerrar-substituicao.use-case';
import {
    ListSubstituicaoHistoricoUseCase,
    ListSubstituicoesUseCase,
    ListSuplentesElegiveisUseCase,
} from './list-substituicoes.use-case';
import { UpdateSubstituicaoUseCase } from './update-substituicao.use-case';
import {
    buildSubstituicao,
    HOJE,
    InMemorySubstituicaoRepository,
} from './__tests__/substituicao-test.helpers';

const dto = {
    titularId: 'titular-1',
    suplenteId: 'suplente-1',
    motivo: MotivoSubstituicao.LICENCA,
    dataInicio: '2026-10-01',
    dataFim: '2026-10-31',
};

function setup() {
    const repository = new InMemorySubstituicaoRepository();
    const create = new CreateSubstituicaoUseCase(repository);
    const update = new UpdateSubstituicaoUseCase(repository);
    const encerrar = new EncerrarSubstituicaoUseCase(repository);
    for (const uc of [create, update, encerrar]) uc.agora = () => HOJE;
    return { repository, create, update, encerrar };
}

describe('Substituição de titular por suplente', () => {
    describe('vincular', () => {
        it('vincula suplente a titular e registra auditoria', async () => {
            const { repository, create } = setup();
            const result = await create.execute('tenant-1', dto, 'tenant-user-1');

            expect(result.titular.id).toBe('titular-1');
            expect(result.suplente.id).toBe('suplente-1');
            expect(result.legislatureId).toBe('leg-1');
            expect(result.situacao).toBe('EM_EXERCICIO');
            expect(repository.historico).toEqual([
                expect.objectContaining({
                    acao: AcaoSubstituicaoHistorico.CRIADA,
                    responsavelId: 'tenant-user-1',
                }),
            ]);
        });

        it('bloqueia quando o suplente não é suplente', async () => {
            const { create } = setup();
            await expect(
                create.execute('tenant-1', { ...dto, suplenteId: 'titular-2' }),
            ).rejects.toBeInstanceOf(SuplenteInvalidoError);
        });

        it('bloqueia quando o titular não é titular', async () => {
            const { create } = setup();
            await expect(
                create.execute('tenant-1', { ...dto, titularId: 'suplente-2' }),
            ).rejects.toBeInstanceOf(TitularInvalidoError);
        });

        it('bloqueia suplente de outra legislatura', async () => {
            const { repository, create } = setup();
            repository.mandatos.set('suplente-1', {
                ...repository.mandatos.get('suplente-1')!,
                legislatureId: 'leg-antiga',
            });
            await expect(create.execute('tenant-1', dto)).rejects.toBeInstanceOf(
                SuplenteInvalidoError,
            );
        });

        it('bloqueia data fim anterior à data início', async () => {
            const { create } = setup();
            await expect(
                create.execute('tenant-1', { ...dto, dataFim: '2026-09-30' }),
            ).rejects.toBeInstanceOf(SubstituicaoPeriodoInvalidoError);
        });

        it('bloqueia sobreposição de períodos para o mesmo titular', async () => {
            const { repository, create } = setup();
            repository.substituicoes.push(buildSubstituicao({ suplenteId: 'suplente-2' }));
            await expect(create.execute('tenant-1', dto)).rejects.toBeInstanceOf(
                TitularJaSubstituidoNoPeriodoError,
            );
        });

        it('bloqueia o mesmo suplente substituindo dois titulares ao mesmo tempo', async () => {
            const { repository, create } = setup();
            repository.substituicoes.push(buildSubstituicao({ titularId: 'titular-2' }));
            await expect(create.execute('tenant-1', dto)).rejects.toBeInstanceOf(
                SuplenteJaEmExercicioNoPeriodoError,
            );
        });

        it('permite novo período depois de uma substituição encerrada', async () => {
            const { repository, create } = setup();
            repository.substituicoes.push(
                buildSubstituicao({
                    status: StatusSubstituicao.ENCERRADA,
                    dataInicio: '2026-09-01',
                    dataFim: '2026-09-30',
                }),
            );
            await expect(create.execute('tenant-1', dto)).resolves.toBeDefined();
        });

        it('ignora substituições canceladas na checagem de sobreposição', async () => {
            const { repository, create } = setup();
            repository.substituicoes.push(
                buildSubstituicao({ status: StatusSubstituicao.CANCELADA }),
            );
            await expect(create.execute('tenant-1', dto)).resolves.toBeDefined();
        });
    });

    describe('editar datas', () => {
        it('altera datas e registra antes/depois', async () => {
            const { repository, update } = setup();
            repository.substituicoes.push(buildSubstituicao());

            const result = await update.execute(
                'tenant-1',
                'sub-1',
                { dataFim: '2026-12-31' },
                'tenant-user-1',
            );

            expect(result.dataFim).toBe('2026-12-31');
            expect(repository.historico).toEqual([
                expect.objectContaining({
                    acao: AcaoSubstituicaoHistorico.DATAS_ALTERADAS,
                    alteracoes: { dataFim: { antes: null, depois: '2026-12-31' } },
                }),
            ]);
        });

        it('bloqueia edição que gera sobreposição', async () => {
            const { repository, update } = setup();
            repository.substituicoes.push(
                buildSubstituicao({ dataInicio: '2026-10-01', dataFim: '2026-10-31' }),
                buildSubstituicao({
                    id: 'sub-2',
                    dataInicio: '2026-11-10',
                    dataFim: null,
                    suplenteId: 'suplente-2',
                }),
            );
            await expect(
                update.execute('tenant-1', 'sub-1', { dataFim: '2026-11-15' }),
            ).rejects.toBeInstanceOf(TitularJaSubstituidoNoPeriodoError);
        });

        it('não edita substituição encerrada', async () => {
            const { repository, update } = setup();
            repository.substituicoes.push(
                buildSubstituicao({ status: StatusSubstituicao.ENCERRADA, dataFim: '2026-10-10' }),
            );
            await expect(
                update.execute('tenant-1', 'sub-1', { dataFim: '2026-10-20' }),
            ).rejects.toBeInstanceOf(SubstituicaoNaoEditavelError);
        });
    });

    describe('encerrar', () => {
        it('devolve o exercício ao titular hoje e preserva o histórico', async () => {
            const { repository, encerrar } = setup();
            repository.substituicoes.push(buildSubstituicao());

            const result = await encerrar.execute('tenant-1', 'sub-1', 'tenant-user-1');

            expect(result.status).toBe(StatusSubstituicao.ENCERRADA);
            expect(result.dataFim).toBe('2026-10-14');
            expect(result.situacao).toBe('FINALIZADA');
            expect(repository.substituicoes).toHaveLength(1);

            const historico = await new ListSubstituicaoHistoricoUseCase(repository).execute(
                'tenant-1',
                'sub-1',
            );
            expect(historico.map((h) => h.acao)).toEqual([AcaoSubstituicaoHistorico.ENCERRADA]);
        });

        it('cancela substituição que ainda não começou', async () => {
            const { repository, encerrar } = setup();
            repository.substituicoes.push(buildSubstituicao({ dataInicio: '2026-10-20' }));

            const result = await encerrar.execute('tenant-1', 'sub-1');
            expect(result.status).toBe(StatusSubstituicao.CANCELADA);
        });

        it('substituição encerrada continua listada no histórico do titular', async () => {
            const { repository, encerrar } = setup();
            repository.substituicoes.push(buildSubstituicao());
            await encerrar.execute('tenant-1', 'sub-1');

            const list = new ListSubstituicoesUseCase(repository);
            list.agora = () => HOJE;
            const items = await list.execute('tenant-1', 'titular-1');
            expect(items).toHaveLength(1);
            expect(items[0].status).toBe(StatusSubstituicao.ENCERRADA);
        });

        it('não encerra duas vezes', async () => {
            const { repository, encerrar } = setup();
            repository.substituicoes.push(buildSubstituicao());
            await encerrar.execute('tenant-1', 'sub-1');
            await expect(encerrar.execute('tenant-1', 'sub-1')).rejects.toBeInstanceOf(
                SubstituicaoNaoEditavelError,
            );
        });
    });

    it('lista suplentes elegíveis com os do mesmo partido primeiro', async () => {
        const repository = new InMemorySubstituicaoRepository();
        const result = await new ListSuplentesElegiveisUseCase(repository).execute(
            'tenant-1',
            'titular-2',
        );
        expect(result.map((s) => [s.id, s.mesmoPartido])).toEqual([
            ['suplente-2', true],
            ['suplente-1', false],
        ]);
    });
});
