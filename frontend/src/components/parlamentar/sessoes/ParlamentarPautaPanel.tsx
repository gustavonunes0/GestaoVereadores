import { useCallback, useEffect, useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { FasePautaBadge } from '../../sessoes/pauta/PautaBadges';
import { useAppToast } from '../../../hooks/useAppToast';
import {
    pautaItemDescricao,
    pautaItemRotulo,
    resolvePautaFase,
    type PautaItemDetalhe,
} from '../../../types/sessoes';

interface Props {
    sessaoId: string;
}

export function ParlamentarPautaPanel({ sessaoId }: Props) {
    const { showApiError } = useAppToast();
    const [itens, setItens] = useState<PautaItemDetalhe[]>([]);
    const [loading, setLoading] = useState(true);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const data = await sessoesApi.getPauta(sessaoId);
            setItens(data ?? []);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [sessaoId, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    return (
        <section className="parl-sessao-panel">
            <h3 className="parl-sessao-panel__title">Pauta</h3>

            {loading ? (
                <div className="flex justify-content-center py-3">
                    <ProgressSpinner style={{ width: '32px', height: '32px' }} />
                </div>
            ) : itens.length === 0 ? (
                <p className="parl-sessao-panel__hint m-0">
                    Nenhum item na pauta desta sessão.
                </p>
            ) : (
                <ul className="parl-sessao-pauta-list">
                    {itens.map((item, index) => {
                        const descricao = pautaItemDescricao(item);
                        return (
                            <li key={item.id} className="parl-sessao-pauta-item">
                                <div className="parl-sessao-pauta-item__header">
                                    <span className="parl-sessao-pauta-item__ordem">
                                        {item.ordem ?? index + 1}.
                                    </span>
                                    <strong>{pautaItemRotulo(item)}</strong>
                                </div>
                                {descricao ? (
                                    <p className="parl-sessao-pauta-item__desc">{descricao}</p>
                                ) : null}
                                <div className="parl-sessao-pauta-item__meta">
                                    <FasePautaBadge fase={resolvePautaFase(item.fase)} />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
