import { StatusPautaItem } from '../enums/status-pauta-item.enum';

export type PautaResumo = {
    status: StatusPautaItem;
    totalItens: number;
};

/**
 * RN-SPL-PAUTA-01: cada sessão possui no máximo uma pauta ativa.
 * RN-SPL-PAUTA-02: publicação exige itens e status RASCUNHO.
 * RN-SPL-PAUTA-03: matéria não pode constar em pauta ativa de outra sessão.
 */
export class PautaAggregateDomainService {
    assertPodePublicar(pauta: PautaResumo | null | undefined) {
        if (!pauta) {
            throw new Error('Não há pauta cadastrada para esta sessão');
        }
        if (pauta.status === StatusPautaItem.PUBLICADA) {
            throw new Error('Pauta já está publicada');
        }
        if (pauta.status === StatusPautaItem.ENCERRADA) {
            throw new Error('Pauta encerrada não pode ser publicada');
        }
        if (pauta.totalItens === 0) {
            throw new Error('Não é possível publicar uma pauta vazia');
        }
    }

    assertPodeReceberItens(pauta: { status: StatusPautaItem } | null | undefined) {
        if (!pauta) return;
        if (pauta.status === StatusPautaItem.ENCERRADA) {
            throw new Error('Pauta encerrada não aceita novos itens');
        }
    }

    assertMateriaSemPautaAtivaEmOutraSessao(
        materiaId: string,
        sessaoAtualId: string,
        conflito?: { sessaoId: string; materiaId: string | null } | null,
    ) {
        if (
            conflito &&
            conflito.materiaId === materiaId &&
            conflito.sessaoId !== sessaoAtualId
        ) {
            throw new Error(
                'Matéria já consta na pauta ativa de outra sessão plenária',
            );
        }
    }
}
