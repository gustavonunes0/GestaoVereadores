import { useCallback, useEffect, useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import {
    pautaItemRotulo,
    votacaoJaEncerradaNoItem,
    type PautaItemDetalhe,
} from '../../../types/sessoes';
import {
    resolveVotoCorClass,
    resolveVotoLabel,
    resolveVotoValue,
    type VotoCampo,
} from '../../../utils/votoDisplay';

type VotoLinha = {
    id: string;
    nome: string;
    voto: string | null;
};

interface Props {
    sessaoId: string;
    statusSessao: string;
}

/**
 * Histórico persistente de votos por matéria (após encerrar cada votação).
 * Inclui quem votou e quem não registrou voto (ausência/abstenção implícita).
 */
export function ParlamentarHistoricoVotosPanel({ sessaoId, statusSessao }: Props) {
    const [itens, setItens] = useState<PautaItemDetalhe[]>([]);
    const [votosPorItem, setVotosPorItem] = useState<Record<string, VotoLinha[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandidoId, setExpandidoId] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        setLoading(true);
        try {
            const pauta = await sessoesApi.getPauta(sessaoId);
            const encerrados = (pauta ?? []).filter(
                (item) => item.votacao && votacaoJaEncerradaNoItem(item),
            );
            setItens(encerrados);

            let presentes: { id: string; nome: string }[] = [];
            try {
                const regs = await sessoesApi.getPresencas(sessaoId);
                presentes = (regs ?? [])
                    .filter((r) => {
                        const row = r as unknown as Record<string, unknown>;
                        return (
                            row.presente === true ||
                            row.situacao === 'PRESENTE' ||
                            row.situacao === 'JUSTIFICADO'
                        );
                    })
                    .map((r, idx) => {
                        const row = r as unknown as Record<string, unknown>;
                        const parl = row.parliamentarian as
                            | { id?: string; parliamentaryName?: string }
                            | undefined;
                        return {
                            id: String(
                                row.parliamentarianId ??
                                    parl?.id ??
                                    row.parlamentarianUserId ??
                                    idx,
                            ),
                            nome: String(
                                parl?.parliamentaryName ??
                                    row.nome ??
                                    `Parlamentar ${idx + 1}`,
                            ),
                        };
                    });
            } catch {
                presentes = [];
            }

            const mapa: Record<string, VotoLinha[]> = {};
            await Promise.all(
                encerrados.map(async (item) => {
                    try {
                        const votos = await sessoesApi.getVotosPautaItem(sessaoId, item.id);
                        const linhas: VotoLinha[] = (votos ?? []).map((v, idx) => {
                            const row = v as Record<string, unknown>;
                            const parl = row.parliamentarian as
                                | { id?: string; nome?: string }
                                | null
                                | undefined;
                            const pid = String(
                                row.parliamentarianId ??
                                    row.parlamentarId ??
                                    parl?.id ??
                                    `${item.id}-${idx}`,
                            );
                            const nome =
                                parl?.nome ??
                                (row.parlamentarNome as string | undefined) ??
                                (row.parliamentaryName as string | undefined) ??
                                (row.nome as string | undefined) ??
                                `Parlamentar ${idx + 1}`;
                            const voto =
                                resolveVotoValue(row.voto as VotoCampo) ??
                                resolveVotoValue(row.valor as VotoCampo) ??
                                resolveVotoValue(row.value as VotoCampo);
                            return { id: pid, nome, voto };
                        });

                        const votaram = new Set(linhas.map((l) => l.id));
                        for (const p of presentes) {
                            if (!votaram.has(p.id)) {
                                linhas.push({
                                    id: p.id,
                                    nome: p.nome,
                                    voto: null,
                                });
                            }
                        }
                        mapa[item.id] = linhas;
                    } catch {
                        mapa[item.id] = [];
                    }
                }),
            );
            setVotosPorItem(mapa);
        } catch {
            setItens([]);
            setVotosPorItem({});
        } finally {
            setLoading(false);
        }
    }, [sessaoId]);

    useEffect(() => {
        void carregar();
    }, [carregar, statusSessao]);

    return (
        <section className="parl-sessao-panel">
            <h3 className="parl-sessao-panel__title">Histórico de votação</h3>
            <p className="parl-sessao-panel__hint m-0 mb-2">
                Consulte, por matéria, quem votou e quem não registrou voto após o
                encerramento.
            </p>

            {loading ? (
                <div className="flex justify-content-center py-3">
                    <ProgressSpinner style={{ width: '32px', height: '32px' }} />
                </div>
            ) : itens.length === 0 ? (
                <p className="parl-sessao-panel__hint m-0">
                    Nenhuma votação encerrada nesta sessão ainda.
                </p>
            ) : (
                <ul className="parl-sessao-pauta-list">
                    {itens.map((item) => {
                        const votos = votosPorItem[item.id] ?? [];
                        const aberto = expandidoId === item.id;
                        const sim = votos.filter((v) => v.voto === 'SIM').length;
                        const nao = votos.filter((v) => v.voto === 'NAO').length;
                        const abst = votos.filter((v) => v.voto === 'ABSTENCAO').length;
                        return (
                            <li key={item.id} className="parl-sessao-pauta-item">
                                <button
                                    type="button"
                                    className="parl-historico-voto__toggle"
                                    onClick={() =>
                                        setExpandidoId(aberto ? null : item.id)
                                    }
                                >
                                    <strong>{pautaItemRotulo(item)}</strong>
                                    <span className="parl-historico-voto__placar">
                                        <span className="voto-cor--sim">Sim {sim}</span>
                                        <span className="voto-cor--nao">Não {nao}</span>
                                        <span className="voto-cor--abstencao">
                                            Abst. {abst}
                                        </span>
                                    </span>
                                    <i
                                        className={`pi ${aberto ? 'pi-chevron-up' : 'pi-chevron-down'}`}
                                        aria-hidden
                                    />
                                </button>
                                {aberto ? (
                                    <ul className="parl-historico-voto__lista">
                                        {votos.length === 0 ? (
                                            <li className="parl-sessao-panel__hint">
                                                Sem votos individuais registrados.
                                            </li>
                                        ) : (
                                            votos.map((v) => (
                                                <li key={v.id}>
                                                    <span>{v.nome}</span>
                                                    <strong
                                                        className={
                                                            v.voto
                                                                ? resolveVotoCorClass(v.voto)
                                                                : 'voto-cor--abstencao'
                                                        }
                                                    >
                                                        {v.voto
                                                            ? resolveVotoLabel(v.voto)
                                                            : 'Não votou'}
                                                    </strong>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
