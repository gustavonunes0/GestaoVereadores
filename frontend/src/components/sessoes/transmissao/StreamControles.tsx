import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

interface Props {
    transmitindo: boolean;
    duracao: number;
    linkYoutube: string;
    modoTelaCheia: boolean;
    onIniciarStream: () => void;
    onPararStream: () => void;
    handleFullscreen: () => void;
}

function formatarDuracao(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}

export function StreamControles({
    transmitindo,
    duracao,
    linkYoutube,
    modoTelaCheia,
    onIniciarStream,
    onPararStream,
    handleFullscreen,
}: Props) {
    return (
        <div className="flex flex-column gap-4">
            <div>
                <p className="text-sm font-semibold mb-2">Controle de transmissão</p>
                <div className="flex align-items-center gap-3 flex-wrap">
                    {!transmitindo ? (
                        <Button
                            label="Iniciar YouTube"
                            icon="pi pi-play"
                            severity="danger"
                            size="small"
                            disabled={!linkYoutube}
                            tooltip={!linkYoutube ? 'Configure o link do YouTube abaixo' : undefined}
                            tooltipOptions={{ position: 'top' }}
                            onClick={onIniciarStream}
                        />
                    ) : (
                        <Button
                            label="Parar transmissão"
                            icon="pi pi-stop"
                            severity="secondary"
                            size="small"
                            onClick={onPararStream}
                        />
                    )}
                    {transmitindo && (
                        <div className="flex align-items-center gap-2">
                            <span
                                style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: 'var(--red-500)',
                                    animation: 'sigl-pulse 0.9s infinite',
                                    display: 'inline-block',
                                }}
                            />
                            <Tag value="AO VIVO" severity="danger" style={{ fontSize: '11px' }} />
                            <code className="text-sm">{formatarDuracao(duracao)}</code>
                        </div>
                    )}
                </div>
            </div>

            <hr style={{ borderColor: 'var(--surface-border)', margin: 0 }} />

            <div>
                <p className="text-sm font-semibold mb-1">Tela cheia</p>
                <Button
                    label={modoTelaCheia ? 'Sair da tela cheia' : 'Expandir sala de vídeo'}
                    icon={modoTelaCheia ? 'pi pi-compress' : 'pi pi-expand'}
                    size="small"
                    outlined
                    onClick={handleFullscreen}
                />
                <small className="block text-color-secondary mt-1">Expande o iframe Jitsi para ocupar toda a janela.</small>
            </div>
        </div>
    );
}
