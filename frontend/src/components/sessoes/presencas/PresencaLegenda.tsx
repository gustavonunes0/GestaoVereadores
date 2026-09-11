import type { SituacaoPresencaValor } from '../../../types/presenca';
import { LABELS_SITUACAO } from '../../../utils/presencaCadeira';

const LEGENDA: Array<{ key: SituacaoPresencaValor | 'INSTITUCIONAL'; label: string }> = [
    { key: 'PRESENTE', label: LABELS_SITUACAO.PRESENTE },
    { key: 'AUSENTE', label: LABELS_SITUACAO.AUSENTE },
    { key: 'JUSTIFICADO', label: LABELS_SITUACAO.JUSTIFICADO },
    { key: 'PENDENTE', label: LABELS_SITUACAO.PENDENTE },
    { key: 'INSTITUCIONAL', label: 'Estado/Cadeira' },
];

export function PresencaLegenda({ votacaoAberta = false }: { votacaoAberta?: boolean }) {
    return (
        <footer className="presenca-legenda" aria-label="Legenda do mapa de presenças">
            {LEGENDA.map((item) => (
                <div key={item.key} className="presenca-legenda__item">
                    <span
                        className={`presenca-legenda__swatch presenca-legenda__swatch--${item.key.toLowerCase()}`}
                        aria-hidden
                    />
                    <span>{item.label}</span>
                </div>
            ))}
            {votacaoAberta ? (
                <>
                    <div className="presenca-legenda__item">
                        <span
                            className="presenca-legenda__voto-badge presenca-legenda__voto-badge--ok"
                            aria-hidden
                        >
                            ✓
                        </span>
                        <span>Votou</span>
                    </div>
                    <div className="presenca-legenda__item">
                        <span
                            className="presenca-legenda__voto-badge presenca-legenda__voto-badge--pendente"
                            aria-hidden
                        >
                            ·
                        </span>
                        <span>Não votou</span>
                    </div>
                </>
            ) : null}
        </footer>
    );
}
