import { useEffect, useId, useMemo, useState } from 'react';
import { Button } from 'primereact/button';

type Step = {
    id: string;
    text: string;
};

const VIDEO_STEPS: Step[] = [
    {
        id: 'v1',
        text: 'No OBS Studio, clique em “Iniciar Câmera Virtual”.',
    },
    {
        id: 'v2',
        text: 'Abra a sala no Jitsi Meet pelo navegador (Chrome, Edge ou Firefox).',
    },
    {
        id: 'v3',
        text: 'Clique na seta ao lado do ícone de câmera (ou vá em Configurações → Dispositivos).',
    },
    {
        id: 'v4',
        text: 'Selecione “OBS Virtual Camera” como dispositivo de vídeo.',
    },
];

const AUDIO_STEPS: Step[] = [
    {
        id: 'a1',
        text: 'No OBS, mantenha o VB-Audio Virtual Cable ativo: monitoramento no cabo virtual e Mixer em “Monitorar e Saída”.',
    },
    {
        id: 'a2',
        text: 'Na sala do Jitsi, clique na seta ao lado do ícone de microfone.',
    },
    {
        id: 'a3',
        text: 'Selecione o cabo virtual (ex.: “CABLE Output” ou “Cabo Virtual”) como microfone principal.',
    },
];

const STORAGE_KEY = 'obs-jitsi-guide-checklist';

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
                        Checklist sequencial: primeiro vídeo, depois áudio. Vale para Jitsi e Zoom.
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
                            <strong>Jitsi e Zoom</strong>
                            <p className="m-0">
                                A Câmera Virtual do OBS e o cabo de áudio virtual funcionam da mesma forma
                                no Jitsi Meet e no Zoom — o sistema operacional expõe os dispositivos; o
                                app só precisa selecioná-los.
                            </p>
                        </div>
                    </div>

                    <div className="obs-guide__alert" role="alert">
                        <i className="pi pi-exclamation-triangle" aria-hidden />
                        <div>
                            <strong>Navegador compatível</strong>
                            <p className="m-0">
                                Para o Jitsi reconhecer dispositivos virtuais, use{' '}
                                <strong>Chrome</strong>, <strong>Edge</strong> ou <strong>Firefox</strong>.
                                Evite Safari e navegadores embutidos.
                            </p>
                        </div>
                    </div>

                    <ChecklistSection
                        title="1. Câmera Virtual (OBS → Jitsi)"
                        icon="pi pi-video"
                        steps={VIDEO_STEPS}
                        checked={checked}
                        onToggle={toggle}
                    />

                    <ChecklistSection
                        title="2. Compartilhamento de áudio (OBS → Jitsi)"
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
                                Configuração concluída — vídeo e áudio do OBS prontos no Jitsi.
                            </p>
                        ) : (
                            <p className="obs-guide__hint m-0 text-color-secondary">
                                {videoDone
                                    ? 'Agora marque os passos de áudio.'
                                    : 'Marque cada passo de câmera para liberar o áudio.'}
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
