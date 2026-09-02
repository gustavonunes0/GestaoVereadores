import { useEffect, useRef } from 'react';
import type { PautaItemDetalhe, StatusSessao } from '../../../types/sessoes';
import { PautaItemDetalheCard } from './PautaItemDetalheCard';

interface Props {
    sessaoId: string;
    statusSessao: StatusSessao;
    itens: PautaItemDetalhe[];
    selectedId: string | null;
    somenteLeitura: boolean;
    podeDeliberar: boolean;
    onRemover: (itemId: string) => Promise<void>;
    onAbrirVotacao: (item: PautaItemDetalhe) => void;
    onFecharVotacao: (item: PautaItemDetalhe) => void;
    onExibirNoPainel: (itemId: string) => void;
    onActiveChange?: (itemId: string) => void;
}

export function PautaListaDetalhe({
    sessaoId,
    statusSessao,
    itens,
    selectedId,
    somenteLeitura,
    podeDeliberar,
    onRemover,
    onAbrirVotacao,
    onFecharVotacao,
    onExibirNoPainel,
    onActiveChange,
}: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const ignorarObserver = useRef(false);

    useEffect(() => {
        if (!selectedId) return;
        const el = document.getElementById(`pauta-item-${selectedId}`);
        if (!el) return;

        ignorarObserver.current = true;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const t = window.setTimeout(() => {
            ignorarObserver.current = false;
        }, 600);
        return () => window.clearTimeout(t);
    }, [selectedId]);

    useEffect(() => {
        const root = scrollRef.current;
        if (!root || itens.length === 0 || !onActiveChange) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (ignorarObserver.current) return;
                const visivel = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (!visivel?.target.id.startsWith('pauta-item-')) return;
                const id = visivel.target.id.replace('pauta-item-', '');
                if (id !== selectedId) onActiveChange(id);
            },
            { root, threshold: [0.25, 0.5, 0.75], rootMargin: '-8% 0px -55% 0px' },
        );

        for (const item of itens) {
            const el = document.getElementById(`pauta-item-${item.id}`);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, [itens, selectedId, onActiveChange]);

    if (itens.length === 0) {
        return (
            <section
                className="pauta-split__detalhe pauta-split__detalhe--lista"
                aria-label="Itens da pauta"
            >
                <div className="pauta-detalhe__empty">
                    <i className="pi pi-list" aria-hidden />
                    <p>Nenhum item na pauta para exibir.</p>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={scrollRef}
            className="pauta-split__detalhe pauta-split__detalhe--lista"
            aria-label="Detalhes dos itens da pauta"
        >
            {itens.map((item) => (
                <PautaItemDetalheCard
                    key={item.id}
                    sessaoId={sessaoId}
                    statusSessao={statusSessao}
                    item={item}
                    ativo={item.id === selectedId}
                    somenteLeitura={somenteLeitura}
                    podeDeliberar={podeDeliberar}
                    onRemover={() => onRemover(item.id)}
                    onAbrirVotacao={() => onAbrirVotacao(item)}
                    onFecharVotacao={() => onFecharVotacao(item)}
                    onExibirNoPainel={() => onExibirNoPainel(item.id)}
                />
            ))}
        </section>
    );
}
