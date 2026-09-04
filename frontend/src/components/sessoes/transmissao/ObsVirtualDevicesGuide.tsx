import { useEffect, useId, useMemo, useState } from 'react';
import { Button } from 'primereact/button';

type Step = {
    id: string;
    text: string;
};

const VIDEO_STEPS: Step[] = [
    {
        id: 'v1',
        text: 'No OBS, em Fontes, adicione as câmeras/telas da casa (pode ser mais de uma). Ajuste cada fonte com o botão direito → Transformar → Ajustar à tela — o preview não pode ficar preto nem só um quadradinho no canto.',
    },
    {
        id: 'v2',
        text: 'Clique em “Iniciar Câmera Virtual”. O botão deve ficar azul como “Interromper câmera virtual”. Não use “Iniciar transmissão” do OBS para a sessão no sistema.',
    },
    {
        id: 'v3',
        text: 'Só então abra a sala no CâmaraGest (Chrome ou Edge). Se a sala já estava aberta, saia e entre de novo — o navegador só lista a OBS com a câmera virtual já ligada.',
    },
    {
        id: 'v4',
        text: 'Na sala: Configurações → Vídeo → selecione “OBS Virtual Camera” uma vez e confirme OK. Depois disso, trocas de câmera/cena ficam só no OBS; o Jitsi continua recebendo o mesmo dispositivo.',
    },
];

const AUDIO_STEPS: Step[] = [
    {
        id: 'a1',
        text: 'Instale o VB-Audio Virtual Cable (se ainda não tiver). No OBS, no Mixer, em cada faixa de áudio que deve ir à sala: engrenagem → Avançado → Monitoramento de áudio → “Monitorar e Saída”, com saída no cabo virtual.',
    },
    {
        id: 'a2',
        text: 'Na sala: Configurações → Áudio → Microfone → “CABLE Output” (ou “Cabo Virtual”). Se não aparecer, saia da sala, confirme o cabo e entre de novo.',
    },
    {
        id: 'a3',
        text: 'Fale/teste o áudio no OBS e confira o nível no Jitsi. O headset Bluetooth pode ficar só na saída de áudio (fones); o microfone da sala deve ser o cabo virtual se o programa de áudio sair do OBS.',
    },
];

/** Versão no key: limpa checklist antigo ao mudar os passos. */
const STORAGE_KEY = 'obs-jitsi-guide-checklist-v2';

type ChecklistState = Record<string, boolean>;

function loadChecklist(): ChecklistState {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        return JSON.parse(raw) as ChecklistState;
    } catch {
        return {};
    }
}

function ChecklistSection({
    title,
    icon,
    steps,
    checked,
    locked,
    onToggle,
}: {
    title: string;
    icon: string;
    steps: Step[];
    checked: ChecklistState;
    locked?: boolean;
    onToggle: (id: string) => void;
}) {
    const baseId = useId();
    const done = steps.filter((s) => checked[s.id]).length;

    return (
        <section
            className={`obs-guide__section${locked ? ' obs-guide__section--locked' : ''}`}
            aria-disabled={locked || undefined}
        >
            <header className="obs-guide__section-head">
                <h4 className="obs-guide__section-title m-0">
                    <i className={icon} aria-hidden />
                    {title}
                </h4>
                <span className="obs-guide__progress">
                    {done}/{steps.length}
                </span>
            </header>
            {locked && (
                <p className="obs-guide__lock-hint m-0">
                    Conclua a configuração de câmera virtual antes de configurar o áudio.
                </p>
            )}
            <ol className="obs-guide__steps">
                {steps.map((step, index) => {
                    const inputId = `${baseId}-${step.id}`;
                    const isChecked = !!checked[step.id];
                    return (
                        <li key={step.id} className="obs-guide__step">
                            <label
                                className={`obs-guide__step-label${isChecked ? ' is-done' : ''}`}
                                htmlFor={inputId}
                            >
                                <input
                                    id={inputId}
                                    type="checkbox"
                                    className="obs-guide__check"
                                    checked={isChecked}
                                    disabled={locked}
                                    onChange={() => onToggle(step.id)}
                                />
                                <span className="obs-guide__step-num" aria-hidden>
                                    {index + 1}
                                </span>
                                <span className="obs-guide__step-text">{step.text}</span>
                            </label>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

interface Props {
    /** Inicia expandido (útil quando a sala Jitsi já está aberta). */
    defaultExpanded?: boolean;
}

export function ObsVirtualDevicesGuide({ defaultExpanded = false }: Props) {
    const [expandido, setExpandido] = useState(defaultExpanded);
    const [checked, setChecked] = useState<ChecklistState>(() => loadChecklist());

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    }, [checked]);

    const videoDone = useMemo(
        () => VIDEO_STEPS.every((s) => checked[s.id]),
        [checked],
    );
    const audioDone = useMemo(
        () => AUDIO_STEPS.every((s) => checked[s.id]),
        [checked],
    );
    const allDone = videoDone && audioDone;

    function toggle(id: string) {
        setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    function resetChecklist() {
        setChecked({});
    }

    return (
        <div className="obs-guide transmissao-convite">
            <div className="transmissao-convite__header">
                <div>
                    <p className="transmissao-convite__titulo m-0">
                        <i className="pi pi-desktop" aria-hidden />
                        OBS → Jitsi (câmera e áudio)
                    </p>
                    <p className="transmissao-convite__sub m-0 text-color-secondary">
                        O OBS gerencia as câmeras da casa; o Jitsi recebe só a Câmera Virtual.
                        Checklist: primeiro vídeo, depois áudio.
                    </p>
                </div>
                <Button
                    label={expandido ? 'Ocultar' : 'Ver guia'}
                    icon={expandido ? 'pi pi-chevron-up' : 'pi pi-list-check'}
                    size="small"
                    outlined
                    onClick={() => setExpandido((v) => !v)}
                />
            </div>

            {expandido && (
                <div className="transmissao-convite__body obs-guide__body">
                    <div className="obs-guide__banner" role="note">
                        <i className="pi pi-info-circle" aria-hidden />
                        <div>
                            <strong>Como funciona</strong>
                            <p className="m-0">
                                Várias câmeras ficam no OBS (cenas/fontes). A sala enxerga um único
                                dispositivo — <strong>OBS Virtual Camera</strong> — definido uma vez
                                nas Configurações. Trocas de ângulo depois disso são só no OBS.
                                O mesmo padrão vale no Zoom.
                            </p>
                        </div>
                    </div>

                    <div className="obs-guide__alert" role="alert">
                        <i className="pi pi-exclamation-triangle" aria-hidden />
                        <div>
                            <strong>Problemas comuns</strong>
                            <p className="m-0">
                                <strong>OBS não na lista:</strong> ligue a câmera virtual antes de
                                entrar; se a sala já estiver aberta, saia e entre de novo (Chrome/Edge).
                                <br />
                                <strong>Preview preto:</strong> Fontes vazias ou fonte sem “Ajustar à
                                tela”.
                                <br />
                                <strong>Diálogo apertado:</strong> use Tela cheia na sala antes de abrir
                                Configurações.
                            </p>
                        </div>
                    </div>

                    <ChecklistSection
                        title="1. Vídeo (OBS → Câmera Virtual → Jitsi)"
                        icon="pi pi-video"
                        steps={VIDEO_STEPS}
                        checked={checked}
                        onToggle={toggle}
                    />

                    <ChecklistSection
                        title="2. Áudio (OBS → cabo virtual → Jitsi)"
                        icon="pi pi-volume-up"
                        steps={AUDIO_STEPS}
                        checked={checked}
                        locked={!videoDone}
                        onToggle={toggle}
                    />

                    <footer className="obs-guide__footer">
                        {allDone ? (
                            <p className="obs-guide__done m-0">
                                <i className="pi pi-check-circle" aria-hidden />
                                Pronto — programa de vídeo/áudio do OBS na sala. Gerencie as câmeras
                                só no OBS.
                            </p>
                        ) : (
                            <p className="obs-guide__hint m-0 text-color-secondary">
                                {videoDone
                                    ? 'Agora marque os passos de áudio.'
                                    : 'Marque cada passo de vídeo para liberar o áudio.'}
                            </p>
                        )}
                        <Button
                            label="Limpar checklist"
                            icon="pi pi-refresh"
                            size="small"
                            text
                            severity="secondary"
                            onClick={resetChecklist}
                            disabled={Object.keys(checked).length === 0}
                        />
                    </footer>
                </div>
            )}
        </div>
    );
}
