import { YoutubeConfigForm } from './YoutubeConfigForm';

interface Props {
    sessaoId: string;
    linkYoutube: string;
    transmitindo: boolean;
    duracao: number;
    modoTelaCheia: boolean;
    onLinkChange: (link: string) => void;
    onToggleStream: () => void;
    onToggleFullscreen: () => void;
}

function formatarDuracao(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}

export function TransmissaoStreamTab({
    sessaoId,
    linkYoutube,
    transmitindo,
    duracao,
    modoTelaCheia,
    onLinkChange,
    onToggleStream,
    onToggleFullscreen,
}: Props) {
    return (
        <>
            <div className="transmissao-section">
                <div className="transmissao-sec-title">
                    <i className="pi pi-wifi" aria-hidden />
                    Controle de transmissão
                </div>
                <div className="flex align-items-center gap-2 flex-wrap mb-3">
                    <button
                        type="button"
                        className={`transmissao-btn ${transmitindo ? 'transmissao-btn-stop' : 'transmissao-btn-danger'}`}
                        onClick={onToggleStream}
                        disabled={!transmitindo && !linkYoutube.trim()}
                    >
                        <i className={transmitindo ? 'pi pi-stop' : 'pi pi-play'} aria-hidden />
                        {transmitindo ? 'Parar transmissão' : 'Iniciar YouTube'}
                    </button>
                    {transmitindo && (
                        <>
                            <span className="transmissao-badge transmissao-badge-live">
                                <span className="transmissao-dot transmissao-dot-red" />
                                AO VIVO
                            </span>
                            <span className="text-xs text-color-secondary">{formatarDuracao(duracao)}</span>
                        </>
                    )}
                </div>
                <YoutubeConfigForm
                    sessaoId={sessaoId}
                    linkYoutube={linkYoutube}
                    onChange={onLinkChange}
                    variant="inline"
                />
            </div>

            <div className="transmissao-section">
                <div className="transmissao-sec-title">
                    <i className="pi pi-expand" aria-hidden />
                    Tela cheia
                </div>
                <div className="flex align-items-center gap-2 flex-wrap">
                    <button type="button" className="transmissao-btn" onClick={onToggleFullscreen}>
                        <i className={modoTelaCheia ? 'pi pi-compress' : 'pi pi-expand'} aria-hidden />
                        {modoTelaCheia ? 'Sair da tela cheia' : 'Expandir sala de vídeo'}
                    </button>
                    <span className="text-xs text-color-secondary">
                        Expande a sala de vídeo para ocupar toda a janela do navegador.
                    </span>
                </div>
            </div>
        </>
    );
}
