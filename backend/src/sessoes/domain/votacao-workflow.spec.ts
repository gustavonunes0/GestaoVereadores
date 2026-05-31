import { Voto } from '@prisma/client';
import {
  assertQuorumAtingido,
  calcularResultadoVotacao,
  contarVotos,
} from './votacao-workflow';

describe('votacao-workflow', () => {
  it('exige 50% de presentes quando requer quorum', () => {
    expect(() => assertQuorumAtingido(4, 10, true)).toThrow(/Quorum não atingido/);
    expect(() => assertQuorumAtingido(5, 10, true)).not.toThrow();
  });

  it('ignora quorum quando tipo de sessão não exige', () => {
    expect(() => assertQuorumAtingido(0, 10, false)).not.toThrow();
  });

  it('conta votos e define resultado', () => {
    expect(contarVotos([Voto.SIM, Voto.NAO, Voto.ABSTENCAO])).toEqual({
      votosSim: 1,
      votosNao: 1,
      abstencoes: 1,
    });
    expect(calcularResultadoVotacao(6, 4)).toBe('APROVADO');
    expect(calcularResultadoVotacao(4, 6)).toBe('REJEITADO');
    expect(calcularResultadoVotacao(5, 5)).toBe('EMPATADO');
  });
});
