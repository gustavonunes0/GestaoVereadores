import { Tag } from 'primereact/tag';
import type { AudioChannel } from '../../../types/sessoes';

interface Props {
    canais: AudioChannel[];
    librasConectado: boolean;
    audioLevels: Record<string, number>;
    onVolumeChange: (id: string, valor: number) => void;
    onMute: (id: string) => void;
}

const CANAL_ICONS: Record<string, string> = {
    mic:     'pi pi-microphone',
    camera1: 'pi pi-video',
    camera2: 'pi pi-video',
    libras:  'pi pi-sign-language',
    master:  'pi pi-volume-up',
};

function vuColor(vol: number): string {
    if (vol > 90) return 'clip';
    if (vol > 70) return 'warn';
    return '';
}

export function AudioMixer({ canais, librasConectado, audioLevels, onVolumeChange, onMute }: Props) {
    const canaisPrincipais = canais.filter((c) => c.id !== 'master');
    const master = canais.find((c) => c.id === 'master');

    function renderCanal(canal: AudioChannel) {
        const isLibras = canal.id === 'libras';
        const disabled = isLibras && !librasConectado;
        const vuLevel = audioLevels[canal.id] ?? (canal.muted ? 0 : canal.volume);
        const vuClass = `vu-fill${vuColor(vuLevel) ? ' ' + vuColor(vuLevel) : ''}`;

        return (
            <div key={canal.id}>
                <div className={`mixer-row${disabled ? ' mixer-row-disabled' : ''}`}>
                    <div className="mixer-label">
                        <i className={CANAL_ICONS[canal.id] ?? 'pi pi-volume-up'} style={{ fontSize: 12 }} />
                        <span>{canal.label}</span>
                        {isLibras && librasConectado && (
                            <Tag value="Conectado" severity="success" style={{ fontSize: '9px', padding: '1px 4px' }} />
                        )}
                    </div>
                    <input
                        type="range"
                        className="mixer-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={canal.volume}
                        disabled={disabled || canal.muted}
                        onChange={(e) => onVolumeChange(canal.id, Number(e.target.value))}
                        aria-label={`Volume ${canal.label}`}
                    />
                    <div className="mixer-val">{Math.round(canal.volume)}%</div>
                    <button
                        className={`mixer-mute${canal.muted ? ' muted' : ''}`}
                        disabled={disabled}
                        onClick={() => onMute(canal.id)}
                        aria-label={canal.muted ? `Desmutar ${canal.label}` : `Mutar ${canal.label}`}
                        title={canal.muted ? 'Desmutar' : 'Mutar'}
                    >
                        <i className={canal.muted ? 'pi pi-volume-off' : (CANAL_ICONS[canal.id] ?? 'pi pi-volume-up')} style={{ fontSize: 12 }} />
                    </button>
                </div>
                <div className="vu-bar" style={{ marginLeft: 96, marginRight: 74 }}>
                    <div
                        className={vuClass}
                        style={{ width: `${canal.muted ? 0 : vuLevel}%` }}
                    />
                </div>
                {isLibras && !librasConectado && (
                    <p className="mixer-canal-hint">Intérprete não conectado — canal reservado</p>
                )}
            </div>
        );
    }

    return (
        <div className="audio-mixer">
            {canaisPrincipais.map(renderCanal)}
            {master && (
                <>
                    <hr style={{ borderColor: 'var(--surface-border)', margin: '0.5rem 0' }} />
                    {renderCanal(master)}
                </>
            )}
        </div>
    );
}
