import { FormEvent, useEffect, useState } from 'react';
import { SiglButton } from '../common/SiglButton';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../Modal';
import { RegistrarVotoDialog } from './RegistrarVotoDialog';
import {
    shouldHideNominalVotes,
    type TipoVotacao,
} from '../../types/legislative';

type ParlamentarOption = {
    id: string;
    ativo: boolean;
    pessoa: { nome: string };
};

type Votacao = {
    id: string;
    tipoVotacao: TipoVotacao;
    realizadaAt: string | null;
    votosSim?: number;
    votosNao?: number;
    abstencoes?: number;
    resultado?: string;
    votos?: {
        id: string;
        voto: string;
        parlamentarId: string;
        parlamentar?: { pessoa?: { nome: string } };
    }[];
};

export type PautaItemDeliberacao = {
    id: string;
    ordem: number;
    resultado?: string;
    materia?: { id: string; ementa: string };
    votacao?: Votacao | null;
};

type Presenca = {
    parlamentarId?: string;
    presente: boolean;
    situacao?: string;
    parlamentar?: { id: string; pessoa?: { nome: string } };
};

type Props = {
    sessaoId: string;
    pautaItens: PautaItemDeliberacao[];
    presencas: Presenca[];
    canWrite: boolean;
    sessaoEmAndamento: boolean;
    onUpdated: () => void;
    canManageSessao?: boolean;
    canVotar?: boolean;
};

const TIPO_VOTACAO_OPTIONS: { label: string; value: TipoVotacao }[] = [
    { label: 'Nominal', value: 'NOMINAL' },
    { label: 'Simbólica', value: 'SIMBOLICA' },
    { label: 'Secreta', value: 'SECRETA' },
];

const VOTO_OPTIONS = [
    { label: 'Sim', value: 'SIM' },
    { label: 'Não', value: 'NAO' },
    { label: 'Abstenção', value: 'ABSTENCAO' },
] as const;

export function SessaoDeliberacaoPanel({
    sessaoId,
    pautaItens,
    presencas,
    canWrite,
    sessaoEmAndamento,
    onUpdated,
    canManageSessao,
    canVotar,
}: Props) {
    const { showApiError, showSuccess } = useAppToast();
    const { user } = useAuth();
    const [parlamentares, setParlamentares] = useState<ParlamentarOption[]>([]);
    const [presencaOpen, setPresencaOpen] = useState(false);
    const [parlamentarPresencaId, setParlamentarPresencaId] = useState('');
    const [presente, setPresente] = useState(true);
    const [abrirVotacaoItemId, setAbrirVotacaoItemId] = useState<string | null>(
        null,
    );
    const [tipoVotacao, setTipoVotacao] = useState<TipoVotacao>('NOMINAL');
    const [votosSim, setVotosSim] = useState(0);
    const [votosNao, setVotosNao] = useState(0);
    const [abstencoes, setAbstencoes] = useState(0);
    const [votoParlamentarId, setVotoParlamentarId] = useState('');
    const [votoValor, setVotoValor] =
        useState<(typeof VOTO_OPTIONS)[number]['value']>('SIM');
    const [busy, setBusy] = useState(false);
    const [registrarVotoItem, setRegistrarVotoItem] = useState<string | null>(null);

    const podeDeliberar = (canManageSessao ?? canWrite) && sessaoEmAndamento;
    const podeVotar = (canVotar ?? false) && sessaoEmAndamento && !!user?.parliamentarianId;

    useEffect(() => {
        parlamentaresApi.list({ limit: 200 })
            .then((r) =>
                setParlamentares(
                    r.data
                        .filter((p) => p.status === 'ACTIVE')
                        .map((p) => ({
                            id: p.id,
                            ativo: p.status === 'ACTIVE',
                            pessoa: {
                                nome:
                                    p.parliamentaryName ||
                                    `${p.user.firstName} ${p.user.lastName}`.trim(),
                            },
                        })),
                ),
            )
            .catch(() => setParlamentares([]));
    }, []);

    useEffect(() => {
        if (parlamentares[0] && !parlamentarPresencaId) {
            setParlamentarPresencaId(parlamentares[0].id);
        }
        if (parlamentares[0] && !votoParlamentarId) {
            setVotoParlamentarId(parlamentares[0].id);
        }
    }, [parlamentares, parlamentarPresencaId, votoParlamentarId]);

    async function handlePresenca(e: FormEvent) {
        e.preventDefault();
        if (!parlamentarPresencaId) return;
        setBusy(true);
        try {
            await sessoesApi.registrarPresenca(sessaoId, {
                parlamentarId: parlamentarPresencaId,
                presente,
                situacao: presente ? 'PRESENTE' : 'AUSENTE',
            });
            setPresencaOpen(false);
            showSuccess('Presença registrada.');
            onUpdated();
        } catch (err) {
            showApiError(err);
        } finally {
            setBusy(false);
        }
    }

    async function handleAbrirVotacao(pautaItemId: string) {
        setBusy(true);
        try {
            await sessoesApi.abrirVotacao(sessaoId, pautaItemId, {
                tipoVotacao,
            });
            setAbrirVotacaoItemId(null);
            showSuccess('Votação aberta.');
            onUpdated();
        } catch (err) {
            showApiError(err);
        } finally {
            setBusy(false);
        }
    }

    async function handleRegistrarVoto(pautaItemId: string) {
        if (!votoParlamentarId) return;
        setBusy(true);
        try {
            await sessoesApi.registrarVoto(sessaoId, pautaItemId, {
                parlamentarId: votoParlamentarId,
                voto: votoValor,
            });
            showSuccess('Voto registrado.');
            onUpdated();
        } catch (err) {
            showApiError(err);
        } finally {
            setBusy(false);
        }
    }

    async function handleFinalizar(pautaItemId: string, votacao: Votacao) {
        setBusy(true);
        const body: Record<string, number> = {};
        if (
            votacao.tipoVotacao === 'SIMBOLICA' ||
            votacao.tipoVotacao === 'SECRETA'
        ) {
            body.votosSim = votosSim;
            body.votosNao = votosNao;
            body.abstencoes = abstencoes;
        }
        try {
            await sessoesApi.finalizarVotacao(sessaoId, pautaItemId, body);
            showSuccess(
                'Votação finalizada. Resultado aplicado à pauta e à matéria quando aplicável.',
            );
            onUpdated();
        } catch (err) {
            showApiError(err);
        } finally {
            setBusy(false);
        }
    }

    function votacaoAberta(v: Votacao) {
        return v.realizadaAt == null;
    }

    return (
        <>
            <div className="detail-actions sigl-cluster">
                {podeDeliberar && (
                    <SiglButton
                        label="Registrar presença"
                        icon="pi pi-users"
                        severity="secondary"
                        outlined
                        onClick={() => setPresencaOpen(true)}
                    />
                )}
            </div>

            <h3 className="detail-subtitle">Presenças ({presencas.length})</h3>
            {presencas.length ? (
                <ul className="presenca-list">
                    {presencas.map((p, i) => (
                        <li key={p.parlamentarId ?? p.parlamentar?.id ?? i}>
                            {p.parlamentar?.pessoa?.nome ?? '—'} —{' '}
                            {p.presente || p.situacao === 'PRESENTE'
                                ? 'Presente'
                                : 'Ausente'}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="muted">
                    {podeDeliberar
                        ? 'Registre a presença dos parlamentares antes da votação nominal.'
                        : 'Nenhuma presença registrada nesta sessão.'}
                </p>
            )}

            <h3 className="detail-subtitle">Pauta e votação</h3>
            {!pautaItens.length ? (
                <p className="muted">
                    Pauta vazia — inclua matérias com status EM_TRAMITACAO
                    enquanto a sessão estiver em andamento.
                </p>
            ) : (
                <ol className="pauta-list pauta-list--deliberacao">
                    {pautaItens.map((item) => {
                        const votacao = item.votacao ?? null;
                        const aberta = votacao ? votacaoAberta(votacao) : false;
                        const hideVotes = votacao
                            ? shouldHideNominalVotes(votacao.tipoVotacao)
                            : false;

                        return (
                            <li
                                key={item.id}
                                className="pauta-item-deliberacao"
                            >
                                <div className="pauta-item-deliberacao__head">
                                    <span className="pauta-ordem">
                                        {item.ordem}
                                    </span>
                                    <div>
                                        <div>{item.materia?.ementa ?? '—'}</div>
                                        {item.resultado && (
                                            <span className="badge badge-muted">
                                                Pauta: {item.resultado}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {votacao && !aberta && (
                                    <p className="muted pauta-item-deliberacao__meta">
                                        Votação{' '}
                                        {votacao.tipoVotacao.toLowerCase()}{' '}
                                        encerrada
                                        {votacao.resultado
                                            ? ` — ${votacao.resultado}`
                                            : ''}
                                        {!hideVotes &&
                                            votacao.votos?.length != null &&
                                            ` (${votacao.votosSim ?? 0} sim / ${votacao.votosNao ?? 0} não)`}
                                        {hideVotes &&
                                            ' — votos individuais não exibidos (secreta)'}
                                    </p>
                                )}

                                {votacao && aberta && (
                                    <div className="pauta-item-deliberacao__votacao">
                                        <p className="muted">
                                            Votação{' '}
                                            {votacao.tipoVotacao.toLowerCase()}{' '}
                                            em andamento
                                        </p>

                                        {!hideVotes &&
                                            votacao.votos &&
                                            votacao.votos.length > 0 && (
                                                <ul className="presenca-list">
                                                    {votacao.votos.map((v) => (
                                                        <li key={v.id}>
                                                            {v.parlamentar
                                                                ?.pessoa
                                                                ?.nome ??
                                                                v.parlamentarId}
                                                            : {v.voto}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                        {hideVotes && (
                                            <p className="alert-warn">
                                                Votação secreta: a interface não
                                                exibe votos nominais
                                                individuais.
                                            </p>
                                        )}

                                        {podeVotar &&
                                            votacao.tipoVotacao === 'NOMINAL' && (
                                                <div className="sigl-cluster" style={{ marginTop: '0.5rem' }}>
                                                    <SiglButton
                                                        label="Registrar meu voto"
                                                        icon="pi pi-check-circle"
                                                        onClick={() => setRegistrarVotoItem(item.id)}
                                                    />
                                                </div>
                                            )}

                                        {podeDeliberar &&
                                            votacao.tipoVotacao ===
                                                'NOMINAL' && (
                                                <div className="sigl-cluster sigl-cluster--loose">
                                                    <select
                                                        value={
                                                            votoParlamentarId
                                                        }
                                                        onChange={(e) =>
                                                            setVotoParlamentarId(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        {parlamentares.map(
                                                            (p) => (
                                                                <option
                                                                    key={p.id}
                                                                    value={p.id}
                                                                >
                                                                    {
                                                                        p.pessoa
                                                                            .nome
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <select
                                                        value={votoValor}
                                                        onChange={(e) =>
                                                            setVotoValor(
                                                                e.target
                                                                    .value as (typeof VOTO_OPTIONS)[number]['value'],
                                                            )
                                                        }
                                                    >
                                                        {VOTO_OPTIONS.map(
                                                            (o) => (
                                                                <option
                                                                    key={
                                                                        o.value
                                                                    }
                                                                    value={
                                                                        o.value
                                                                    }
                                                                >
                                                                    {o.label}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <SiglButton
                                                        label="Registrar voto"
                                                        icon="pi pi-check"
                                                        loading={busy}
                                                        onClick={() =>
                                                            void handleRegistrarVoto(
                                                                item.id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )}

                                        {podeDeliberar &&
                                            (votacao.tipoVotacao ===
                                                'SIMBOLICA' ||
                                                votacao.tipoVotacao ===
                                                    'SECRETA') && (
                                                <div className="form-grid">
                                                    <label>
                                                        Votos sim
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={votosSim}
                                                            onChange={(e) =>
                                                                setVotosSim(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </label>
                                                    <label>
                                                        Votos não
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={votosNao}
                                                            onChange={(e) =>
                                                                setVotosNao(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </label>
                                                    <label>
                                                        Abstenções
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={abstencoes}
                                                            onChange={(e) =>
                                                                setAbstencoes(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </label>
                                                </div>
                                            )}

                                        {podeDeliberar && (
                                            <SiglButton
                                                label="Finalizar votação"
                                                icon="pi pi-flag"
                                                severity="success"
                                                loading={busy}
                                                onClick={() =>
                                                    void handleFinalizar(
                                                        item.id,
                                                        votacao,
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                )}

                                {podeDeliberar && !votacao && (
                                    <div className="sigl-cluster">
                                        {abrirVotacaoItemId === item.id ? (
                                            <>
                                                <select
                                                    value={tipoVotacao}
                                                    onChange={(e) =>
                                                        setTipoVotacao(
                                                            e.target
                                                                .value as TipoVotacao,
                                                        )
                                                    }
                                                >
                                                    {TIPO_VOTACAO_OPTIONS.map(
                                                        (o) => (
                                                            <option
                                                                key={o.value}
                                                                value={o.value}
                                                            >
                                                                {o.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <SiglButton
                                                    label="Confirmar abertura"
                                                    icon="pi pi-play"
                                                    loading={busy}
                                                    onClick={() =>
                                                        void handleAbrirVotacao(
                                                            item.id,
                                                        )
                                                    }
                                                />
                                                <SiglButton
                                                    label="Cancelar"
                                                    severity="secondary"
                                                    text
                                                    onClick={() =>
                                                        setAbrirVotacaoItemId(
                                                            null,
                                                        )
                                                    }
                                                />
                                            </>
                                        ) : (
                                            <SiglButton
                                                label="Abrir votação"
                                                icon="pi pi-play"
                                                outlined
                                                onClick={() =>
                                                    setAbrirVotacaoItemId(
                                                        item.id,
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}

            {registrarVotoItem && user?.parliamentarianId && (
                <RegistrarVotoDialog
                    sessaoId={sessaoId}
                    pautaItemId={registrarVotoItem}
                    parlamentarId={user.parliamentarianId}
                    onClose={() => setRegistrarVotoItem(null)}
                    onSaved={onUpdated}
                />
            )}

            {presencaOpen && (
                <Modal
                    title="Registrar presença"
                    onClose={() => !busy && setPresencaOpen(false)}
                >
                    <form onSubmit={handlePresenca}>
                        <div className="sigl-dialog-body">
                            <div className="sigl-dialog-secao">
                                <span className="sigl-dialog-secao-titulo">Presença</span>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="pres-parl">Parlamentar *</label>
                                    <select
                                        id="pres-parl"
                                        value={parlamentarPresencaId}
                                        onChange={(e) => setParlamentarPresencaId(e.target.value)}
                                        required
                                    >
                                        {parlamentares.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.pessoa.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sigl-filtro-campo flex align-items-center gap-2">
                                    <input
                                        id="pres-presente"
                                        type="checkbox"
                                        checked={presente}
                                        onChange={(e) => setPresente(e.target.checked)}
                                    />
                                    <label htmlFor="pres-presente">Presente na sessão</label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={busy}
                                onClick={() => setPresencaOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={busy}
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}
