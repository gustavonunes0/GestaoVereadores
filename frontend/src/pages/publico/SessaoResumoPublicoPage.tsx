import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { sessoesApi, type ResumoPublicoSessao } from '../../api/legislative/sessoes.api';
import { API_PATHS } from '../../api/paths';
import { ApiError } from '../../api/client';
import { FooterBar } from '../../components/FooterBar';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

function formatarData(data: string | null): string {
    if (!data) return '—';
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function SessaoResumoPublicoPage() {
    const { id } = useParams<{ id: string }>();
    const [resumo, setResumo] = useState<ResumoPublicoSessao | null>(null);
    const [loading, setLoading] = useState(true);
    const [naoDisponivel, setNaoDisponivel] = useState(false);
    const [ataDisponivel, setAtaDisponivel] = useState(false);

    useEffect(() => {
        if (!id) return;
        let ativo = true;

        sessoesApi
            .getResumoPublico(id)
            .then((data) => {
                if (ativo) setResumo(data);
            })
            .catch((err) => {
                if (!ativo) return;
                if (err instanceof ApiError && err.status === 404) {
                    setNaoDisponivel(true);
                } else {
                    setNaoDisponivel(true);
                }
            })
            .finally(() => {
                if (ativo) setLoading(false);
            });

        fetch(`${API_BASE}${API_PATHS.sessaoAtaPdf(id)}`, { method: 'HEAD' })
            .then((res) => {
                if (ativo) setAtaDisponivel(res.ok);
            })
            .catch(() => {
                if (ativo) setAtaDisponivel(false);
            });

        return () => {
            ativo = false;
        };
    }, [id]);

    if (!id) return null;

    return (
        <div className="portal-publico-page">
            <div className="portal-publico-content">
                {loading && (
                    <div className="flex justify-content-center py-6">
                        <ProgressSpinner />
                    </div>
                )}

                {!loading && naoDisponivel && (
                    <div className="flex flex-column align-items-center py-6 gap-2">
                        <i className="pi pi-info-circle text-2xl" aria-hidden />
                        <span>Esta sessão ainda não está disponível para consulta pública.</span>
                    </div>
                )}

                {!loading && resumo && (
                    <>
                        <h1>Resumo da Sessão</h1>
                        <p className="text-muted">{resumo.sessaoTitulo}</p>
                        <p>
                            <strong>Abertura:</strong> {formatarData(resumo.dataAbertura)}
                            {' · '}
                            <strong>Encerramento:</strong> {formatarData(resumo.dataEncerramento)}
                        </p>

                        <div className="flex gap-2 my-3">
                            <a
                                href={`${API_BASE}${API_PATHS.sessaoListaPresencaPdf(id)}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button label="Baixar lista de presença (PDF)" icon="pi pi-download" outlined />
                            </a>
                            {ataDisponivel && (
                                <a href={`${API_BASE}${API_PATHS.sessaoAtaPdf(id)}`} target="_blank" rel="noreferrer">
                                    <Button label="Baixar ata (PDF)" icon="pi pi-file-pdf" outlined />
                                </a>
                            )}
                        </div>

                        <h2>Mesa Diretora</h2>
                        {resumo.mesaDiretora.length === 0 ? (
                            <p className="text-muted">Não informada.</p>
                        ) : (
                            <ul>
                                {resumo.mesaDiretora.map((m, i) => (
                                    <li key={i}>
                                        {m.nome} — {m.cargo}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <h2>Lista de Presença</h2>
                        {resumo.presencas.length === 0 ? (
                            <p className="text-muted">Nenhum registro de presença.</p>
                        ) : (
                            <ul>
                                {resumo.presencas.map((p, i) => (
                                    <li key={i}>
                                        {p.nome}
                                        {p.partido ? ` (${p.partido})` : ''} — {p.situacao}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <h2>Matérias da Pauta</h2>
                        {resumo.materias.length === 0 ? (
                            <p className="text-muted">Nenhuma matéria registrada.</p>
                        ) : (
                            <ul>
                                {resumo.materias.map((m, i) => (
                                    <li key={i}>
                                        <strong>{m.identificacao}</strong> — {m.ementa}
                                        {m.resultado ? ` — ${m.resultado}` : ''}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
            <FooterBar />
        </div>
    );
}
