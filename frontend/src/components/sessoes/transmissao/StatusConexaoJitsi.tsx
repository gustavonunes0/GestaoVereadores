interface Props {
    conectado: boolean;
    transmitindo: boolean;
    roomName: string;
    participantCount?: number;
}

export function StatusConexaoJitsi({ conectado, transmitindo, roomName, participantCount = 0 }: Props) {
    return (
        <div className="transmissao-status-bar">
            <div className="transmissao-status-item">
                <span className={`transmissao-dot ${conectado ? 'transmissao-dot-green' : 'transmissao-dot-yellow'}`} />
                <span>{conectado ? 'Conectado' : 'Conectando…'}</span>
            </div>
            <div className="transmissao-status-item text-color-secondary">
                <i className="pi pi-video" aria-hidden style={{ fontSize: 13 }} />
                <code className="transmissao-room-code">{roomName}</code>
            </div>
            {conectado && participantCount > 0 && (
                <div className="transmissao-status-item">
                    <span className="transmissao-badge transmissao-badge-connected">
                        <span className="transmissao-dot transmissao-dot-green" />
                        {participantCount} participantes
                    </span>
                </div>
            )}
            {transmitindo && (
                <div className="transmissao-live-badge">
                    <span className="transmissao-dot transmissao-dot-red" />
                    AO VIVO
                </div>
            )}
        </div>
    );
}
