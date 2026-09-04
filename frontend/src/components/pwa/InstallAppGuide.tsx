import GetAppOutlined from '@mui/icons-material/GetAppOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import { useEffect, useId, useState, useSyncExternalStore, type ReactElement } from 'react';
import {
    isIosSafari,
    isStandaloneDisplay,
    preferredInstallPlatform,
    type InstallPlatform,
} from '../../pwa/device';
import {
    getInstallPromptState,
    promptInstall,
    subscribeToInstallPrompt,
} from '../../pwa/installPrompt';

type PopupProps = {
    open: boolean;
    onClose: () => void;
    initialPlatform?: InstallPlatform;
};

type Step = {
    title: string;
    text: string;
    Illustration: () => ReactElement;
};

function IlluAndroidMenu() {
    return (
        <svg className="install-illu" viewBox="0 0 200 120" aria-hidden>
            <rect x="40" y="8" width="120" height="104" rx="12" fill="#e8edf5" stroke="#c5d0e0" />
            <rect x="48" y="16" width="104" height="12" rx="4" fill="#0e1e46" />
            <circle cx="140" cy="22" r="3" fill="#fff" />
            <circle cx="148" cy="22" r="3" fill="#fff" />
            <circle cx="156" cy="22" r="3" fill="#2563a8" className="install-illu__pulse" />
            <rect x="55" y="40" width="90" height="8" rx="3" fill="#cfd8e6" />
            <rect x="55" y="56" width="70" height="8" rx="3" fill="#cfd8e6" />
            <rect x="118" y="28" width="72" height="58" rx="8" fill="#fff" stroke="#2563a8" strokeWidth="2" />
            <text x="128" y="48" fontSize="9" fill="#0e1e46" fontFamily="sans-serif">
                ⋮ Menu
            </text>
            <text x="128" y="64" fontSize="8" fill="#2563a8" fontFamily="sans-serif" fontWeight="700">
                Instalar app
            </text>
            <text x="128" y="76" fontSize="8" fill="#8492a6" fontFamily="sans-serif">
                Adicionar…
            </text>
        </svg>
    );
}

function IlluAndroidInstall() {
    return (
        <svg className="install-illu" viewBox="0 0 200 120" aria-hidden>
            <rect x="35" y="20" width="130" height="80" rx="10" fill="#fff" stroke="#2563a8" strokeWidth="2" />
            <circle cx="100" cy="48" r="14" fill="#0e1e46" />
            <path d="M100 40v12M94 48h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <text x="100" y="78" textAnchor="middle" fontSize="10" fill="#0e1e46" fontFamily="sans-serif" fontWeight="700">
                Instalar CâmaraGest?
            </text>
            <rect x="50" y="86" width="45" height="10" rx="4" fill="#e8edf5" />
            <rect x="105" y="86" width="45" height="10" rx="4" fill="#2563a8" className="install-illu__pulse" />
        </svg>
    );
}

function IlluAndroidDone() {
    return (
        <svg className="install-illu" viewBox="0 0 200 120" aria-hidden>
            <rect x="0" y="0" width="200" height="120" rx="8" fill="#dbe7f5" />
            <rect x="70" y="28" width="60" height="60" rx="14" fill="#0e1e46" className="install-illu__pulse" />
            <text x="100" y="64" textAnchor="middle" fontSize="22" fill="#fff" fontFamily="sans-serif" fontWeight="700">
                C
            </text>
            <text x="100" y="105" textAnchor="middle" fontSize="9" fill="#0e1e46" fontFamily="sans-serif">
                CâmaraGest
            </text>
        </svg>
    );
}

function IlluIosShare() {
    return (
        <svg className="install-illu" viewBox="0 0 200 120" aria-hidden>
            <rect x="50" y="4" width="100" height="112" rx="14" fill="#1c1c1e" />
            <rect x="56" y="14" width="88" height="72" rx="6" fill="#f5f6f8" />
            <rect x="56" y="92" width="88" height="18" rx="6" fill="#2c2c2e" />
            <path d="M72 101h6M82 101h6" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" />
            {/* share — middle, highlighted */}
            <rect x="94" y="95" width="12" height="12" rx="2" fill="#0a84ff" className="install-illu__pulse" />
            <path
                d="M100 97.5v5M97.5 99.5L100 97l2.5 2.5"
                stroke="#fff"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
            />
            <text x="100" y="88" textAnchor="middle" fontSize="8" fill="#0a84ff" fontFamily="sans-serif" fontWeight="700">
                ↑ Compartilhar
            </text>
            <path d="M122 101h6M132 101h6" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function IlluIosAddHome() {
    return (
        <svg className="install-illu" viewBox="0 0 200 120" aria-hidden>
            <rect x="30" y="10" width="140" height="100" rx="12" fill="#f2f2f7" stroke="#c7c7cc" />
            <text x="100" y="28" textAnchor="middle" fontSize="9" fill="#8e8e93" fontFamily="sans-serif">
                Role para baixo…
            </text>
            <rect x="42" y="38" width="116" height="22" rx="8" fill="#fff" />
            <rect x="42" y="66" width="116" height="28" rx="8" fill="#fff" stroke="#0a84ff" strokeWidth="2" className="install-illu__pulse" />
            <rect x="50" y="72" width="16" height="16" rx="3" fill="#0a84ff" />
            <path d="M58 75v10M53 80h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            <text x="74" y="84" fontSize="9" fill="#0e1e46" fontFamily="sans-serif" fontWeight="700">
                Adicionar à Tela de Início
            </text>
        </svg>
    );
}

function IlluIosDone() {
    return (
        <svg className="install-illu" viewBox="0 0 200 120" aria-hidden>
            <rect x="0" y="0" width="200" height="120" rx="8" fill="#e8f0fa" />
            <rect x="72" y="26" width="56" height="56" rx="12" fill="#0e1e46" className="install-illu__pulse" />
            <text x="100" y="60" textAnchor="middle" fontSize="20" fill="#fff" fontFamily="sans-serif" fontWeight="700">
                C
            </text>
            <text x="100" y="100" textAnchor="middle" fontSize="9" fill="#0e1e46" fontFamily="sans-serif">
                CâmaraGest
            </text>
            <circle cx="118" cy="34" r="8" fill="#22c55e" />
            <path d="M114 34l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
    );
}

const ANDROID_STEPS: Step[] = [
    {
        title: 'Abra o menu',
        text: 'No Chrome, toque nos três pontos ⋮ no canto superior direito.',
        Illustration: IlluAndroidMenu,
    },
    {
        title: 'Instalar aplicativo',
        text: 'Toque em Instalar app ou Adicionar à tela inicial e confirme.',
        Illustration: IlluAndroidInstall,
    },
    {
        title: 'Pronto!',
        text: 'O ícone CâmaraGest aparece na tela. Abra por ele da próxima vez.',
        Illustration: IlluAndroidDone,
    },
];

const IOS_STEPS: Step[] = [
    {
        title: 'Compartilhar',
        text: 'Na barra de baixo do Safari, toque no ícone do meio (quadrado com seta ↑). Se não aparecer: ··· → Compartilhar.',
        Illustration: IlluIosShare,
    },
    {
        title: 'Tela de Início',
        text: 'Role a lista e toque em Adicionar à Tela de Início. Se não achar, use Ver mais.',
        Illustration: IlluIosAddHome,
    },
    {
        title: 'Pronto!',
        text: 'Confirme em Adicionar. Abra pelo ícone — sem barra do Safari.',
        Illustration: IlluIosDone,
    },
];

export function InstallAppPopup({ open, onClose, initialPlatform }: PopupProps) {
    const titleId = useId();
    const [platform, setPlatform] = useState<InstallPlatform>(
        () => initialPlatform ?? preferredInstallPlatform(),
    );
    const [step, setStep] = useState(0);
    const [installing, setInstalling] = useState(false);
    const { canPrompt } = useSyncExternalStore(
        subscribeToInstallPrompt,
        getInstallPromptState,
    );

    const steps = platform === 'android' ? ANDROID_STEPS : IOS_STEPS;
    const current = steps[step] ?? steps[0];
    const Illu = current.Illustration;

    useEffect(() => {
        if (open) {
            setPlatform(initialPlatform ?? preferredInstallPlatform());
            setStep(0);
        }
    }, [open, initialPlatform]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, steps.length - 1));
            if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0));
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose, steps.length]);

    if (!open) return null;

    const inSafari = isIosSafari();
    const isLast = step >= steps.length - 1;

    async function handleNativeInstall() {
        setInstalling(true);
        try {
            const outcome = await promptInstall();
            if (outcome === 'accepted') onClose();
        } finally {
            setInstalling(false);
        }
    }

    function switchPlatform(next: InstallPlatform) {
        setPlatform(next);
        setStep(0);
    }

    return (
        <div className="install-app-popup" role="presentation">
            <button
                type="button"
                className="install-app-popup__backdrop"
                aria-label="Fechar"
                onClick={onClose}
            />
            <div
                className="install-app-popup__card install-app-popup__card--interactive"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <header className="install-app-popup__header">
                    <h2 id={titleId}>Baixar app</h2>
                    <button
                        type="button"
                        className="install-app-popup__close"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <CloseOutlined sx={{ fontSize: 18 }} aria-hidden />
                    </button>
                </header>

                <div className="install-app-popup__tabs" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={platform === 'android'}
                        className={`install-app-popup__tab${platform === 'android' ? ' is-active' : ''}`}
                        onClick={() => switchPlatform('android')}
                    >
                        Android
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={platform === 'ios'}
                        className={`install-app-popup__tab${platform === 'ios' ? ' is-active' : ''}`}
                        onClick={() => switchPlatform('ios')}
                    >
                        iPhone
                    </button>
                </div>

                {platform === 'android' && canPrompt && step === 0 ? (
                    <button
                        type="button"
                        className="install-app-popup__native"
                        disabled={installing}
                        onClick={() => void handleNativeInstall()}
                    >
                        <GetAppOutlined sx={{ fontSize: 18 }} aria-hidden />
                        {installing ? 'Abrindo…' : 'Instalar com 1 toque'}
                    </button>
                ) : null}

                {platform === 'ios' && !inSafari ? (
                    <p className="install-app-popup__alert">
                        Abra no <strong>Safari</strong> (ícone azul) para instalar no iPhone.
                    </p>
                ) : null}

                <div className="install-app-popup__stage" key={`${platform}-${step}`}>
                    <Illu />
                    <div className="install-app-popup__step-meta">
                        <span className="install-app-popup__step-count">
                            Passo {step + 1} de {steps.length}
                        </span>
                        <strong className="install-app-popup__step-title">{current.title}</strong>
                        <p className="install-app-popup__step-text">{current.text}</p>
                    </div>
                </div>

                <div className="install-app-popup__dots" aria-hidden>
                    {steps.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`install-app-popup__dot${i === step ? ' is-active' : ''}`}
                            onClick={() => setStep(i)}
                            aria-label={`Ir para passo ${i + 1}`}
                        />
                    ))}
                </div>

                <div className="install-app-popup__nav">
                    <button
                        type="button"
                        className="install-app-popup__nav-btn"
                        disabled={step === 0}
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                    >
                        <ChevronLeftOutlined sx={{ fontSize: 20 }} aria-hidden />
                        Voltar
                    </button>
                    {isLast ? (
                        <button type="button" className="install-app-popup__ok" onClick={onClose}>
                            Entendi
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="install-app-popup__ok"
                            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                        >
                            Próximo
                            <ChevronRightOutlined sx={{ fontSize: 20 }} aria-hidden />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Compat com banner antigo */
export const InstallAppSheet = InstallAppPopup;

type ButtonProps = {
    className?: string;
};

export function BaixarAppButton({ className = '' }: ButtonProps) {
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(!isStandaloneDisplay());
    }, []);

    if (!visible) return null;

    return (
        <>
            <button
                type="button"
                className={`baixar-app-btn ${className}`.trim()}
                onClick={() => setOpen(true)}
            >
                <GetAppOutlined sx={{ fontSize: 18 }} aria-hidden />
                Baixar app
            </button>
            <InstallAppPopup open={open} onClose={() => setOpen(false)} />
        </>
    );
}
