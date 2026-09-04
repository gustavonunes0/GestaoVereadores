import IosShareOutlined from '@mui/icons-material/IosShareOutlined';
import AddBoxOutlined from '@mui/icons-material/AddBoxOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import PhoneIphoneOutlined from '@mui/icons-material/PhoneIphoneOutlined';
import { useEffect, useId, useState } from 'react';
import { isIosDevice, isIosSafari, isStandaloneDisplay } from '../../pwa/device';

const SESSION_SEEN_KEY = 'sigl.pwa.ios.guide.seen';

type SheetProps = {
    open: boolean;
    onClose: () => void;
};

export function IosInstallSheet({ open, onClose }: SheetProps) {
    const titleId = useId();
    if (!open) return null;

    const inSafari = isIosSafari();

    return (
        <div className="ios-install-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <button
                type="button"
                className="ios-install-sheet__backdrop"
                aria-label="Fechar"
                onClick={onClose}
            />
            <div className="ios-install-sheet__panel">
                <header className="ios-install-sheet__header">
                    <h2 id={titleId}>Colocar na tela inicial</h2>
                    <button
                        type="button"
                        className="ios-install-sheet__close"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <CloseOutlined sx={{ fontSize: 20 }} aria-hidden />
                    </button>
                </header>

                <p className="ios-install-sheet__lead">
                    No iPhone não dá para instalar com um botão (limitação da Apple). O sistema já
                    funciona neste navegador — o atalho é opcional e leva cerca de 20 segundos.
                </p>

                {!inSafari ? (
                    <div className="ios-install-sheet__alert">
                        Abra este site no <strong>Safari</strong> (ícone azul). Nos outros
                        navegadores do iPhone a instalação não funciona.
                    </div>
                ) : (
                    <ol className="ios-install-sheet__steps">
                        <li>
                            <span className="ios-install-sheet__num" aria-hidden>
                                1
                            </span>
                            <div>
                                <strong>Toque em Compartilhar</strong>
                                <span>
                                    Na barra de baixo do Safari:{' '}
                                    <IosShareOutlined
                                        sx={{ fontSize: 16, verticalAlign: 'text-bottom' }}
                                        aria-hidden
                                    />{' '}
                                    quadrado com seta.
                                </span>
                            </div>
                        </li>
                        <li>
                            <span className="ios-install-sheet__num" aria-hidden>
                                2
                            </span>
                            <div>
                                <strong>Adicionar à Tela de Início</strong>
                                <span>
                                    Role a lista e toque em{' '}
                                    <AddBoxOutlined
                                        sx={{ fontSize: 16, verticalAlign: 'text-bottom' }}
                                        aria-hidden
                                    />{' '}
                                    essa opção.
                                </span>
                            </div>
                        </li>
                        <li>
                            <span className="ios-install-sheet__num" aria-hidden>
                                3
                            </span>
                            <div>
                                <strong>Confirme em Adicionar</strong>
                                <span>O ícone CâmaraGest aparece na tela do iPhone.</span>
                            </div>
                        </li>
                    </ol>
                )}

                <div className="ios-install-sheet__actions">
                    <button type="button" className="ios-install-sheet__primary" onClick={onClose}>
                        {inSafari ? 'Entendi' : 'Ok'}
                    </button>
                    <button
                        type="button"
                        className="ios-install-sheet__secondary"
                        onClick={onClose}
                    >
                        Continuar sem instalar
                    </button>
                </div>
            </div>
        </div>
    );
}

type EmbedProps = {
    /** Abre o sheet automaticamente uma vez por sessão no login. */
    autoOpenOnce?: boolean;
};

/** Card compacto na tela de login + sheet com os 3 passos. */
export function IosInstallGuide({ autoOpenOnce = false }: EmbedProps) {
    const [eligible, setEligible] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!isIosDevice() || isStandaloneDisplay()) return;
        setEligible(true);
        if (autoOpenOnce && sessionStorage.getItem(SESSION_SEEN_KEY) !== '1') {
            setOpen(true);
            sessionStorage.setItem(SESSION_SEEN_KEY, '1');
        }
    }, [autoOpenOnce]);

    if (!eligible) return null;

    return (
        <>
            <div className="ios-install-embed">
                <div className="ios-install-embed__copy">
                    <PhoneIphoneOutlined sx={{ fontSize: 22 }} aria-hidden />
                    <div>
                        <strong>Quer o ícone como app?</strong>
                        <span>Opcional — você já pode entrar normalmente.</span>
                    </div>
                </div>
                <button
                    type="button"
                    className="ios-install-embed__btn"
                    onClick={() => setOpen(true)}
                >
                    Ver como fazer
                </button>
            </div>
            <IosInstallSheet open={open} onClose={() => setOpen(false)} />
        </>
    );
}
