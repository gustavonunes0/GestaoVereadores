import { CodigoSituacaoSessao } from '@prisma/client';
import { SessionLifecycleAction } from '../../domain/enums/session-lifecycle-action.enum';
import { SessionStatus } from '../../domain/enums/session-status.enum';
import {
    assertSessaoAceitaPauta,
    assertSessaoNaoEncerrada,
    getSessionWorkflowCapabilities,
    resolveSessionStatus,
} from './sessao-workflow';

describe('sessao-workflow', () => {
    it('resolve status pelo código', () => {
        expect(
            resolveSessionStatus({
                codigo: CodigoSituacaoSessao.EM_ANDAMENTO,
                nome: 'Em andamento',
            }),
        ).toBe(SessionStatus.EM_ANDAMENTO);
    });

    it('permite pauta apenas em EM_ANDAMENTO', () => {
        expect(() =>
            assertSessaoAceitaPauta({
                codigo: CodigoSituacaoSessao.EM_ANDAMENTO,
                nome: 'Em andamento',
            }),
        ).not.toThrow();

        expect(() =>
            assertSessaoAceitaPauta({
                codigo: CodigoSituacaoSessao.AGENDADA,
                nome: 'Agendada',
            }),
        ).toThrow('EM_ANDAMENTO');
    });

    it('bloqueia alterações em sessão encerrada', () => {
        expect(() =>
            assertSessaoNaoEncerrada({
                codigo: CodigoSituacaoSessao.ENCERRADA,
                nome: 'Encerrada',
            }),
        ).toThrow('encerrada ou cancelada');
    });

    it('expõe capacidades do fluxo', () => {
        const caps = getSessionWorkflowCapabilities({
            codigo: CodigoSituacaoSessao.AGENDADA,
            nome: 'Agendada',
        });
        expect(caps.canStart).toBe(true);
    });
});
