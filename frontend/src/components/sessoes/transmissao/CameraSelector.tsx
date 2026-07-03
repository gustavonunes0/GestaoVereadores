import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import type { JitsiTokenData } from '../../../types/sessoes';
import { ConvidarParticipantesJitsi } from './ConvidarParticipantesJitsi';
import { JitsiMeetingEmbed } from './JitsiMeetingEmbed';

interface Participante {
    id: string;
    nome: string;
}

interface Props {
    jitsiData: JitsiTokenData;
    userName: string;
    externalApiRef: React.MutableRefObject<unknown>;
    jitsiContainerRef: React.RefObject<HTMLDivElement | null>;
    cameraAtiva: string;
    setCameraAtiva: (id: string) => void;
    participantes: Participante[];
    librasParticipantId: string | null;
    handleApiReady: (api: unknown) => void;
}

function isLibras(p: Participante): boolean {
    return /libras|intérprete|interprete/i.test(p.nome);
}

export function CameraSelector({
    jitsiData,
    userName,
    externalApiRef,
    jitsiContainerRef,
    cameraAtiva,
    setCameraAtiva,
    participantes,
    librasParticipantId,
    handleApiReady,
}: Props) {
    function getApi() {
        return externalApiRef.current as { executeCommand?: (...args: unknown[]) => void } | null;
    }

    function handleFixarParticipante(p: Participante) {
        getApi()?.executeCommand?.('setLargeVideoParticipant', p.id);
        setCameraAtiva(p.id);
    }

    function handleCompartilharTela() {
        getApi()?.executeCommand?.('toggleShareScreen');
    }

    return (
        <div className="flex flex-column gap-4">
            <JitsiMeetingEmbed
                jitsiData={jitsiData}
                userName={userName}
                jitsiContainerRef={jitsiContainerRef}
                onApiReady={handleApiReady}
            />

            <ConvidarParticipantesJitsi jitsiData={jitsiData} />

            <div>
                <div className="flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
                    <p className="text-sm font-semibold m-0">
                        Câmeras na sala{' '}
                        <span className="text-color-secondary">({participantes.length})</span>
                    </p>
                    <Button
                        label="Compartilhar tela"
                        icon="pi pi-window-maximize"
                        size="small"
                        outlined
                        style={{ fontSize: '11px' }}
                        onClick={handleCompartilharTela}
                    />
                </div>

                {participantes.length === 0 ? (
                    <div className="transmissao-cam-empty">
                        <i className="pi pi-video" aria-hidden />
                        <span>Nenhuma câmera conectada à sala ainda.</span>
                        <small className="text-color-secondary">
                            Clique em <strong>Convidar</strong> acima e envie o link da sala para cada
                            dispositivo (câmera do plenário, celular, intérprete de Libras). Ao entrar,
                            eles aparecerão aqui para você escolher qual fica em destaque.
                        </small>
                    </div>
                ) : (
                    <div className="cam-selector-grid">
                        {participantes.map((p) => {
                            const libras = isLibras(p);
                            const ativa = cameraAtiva === p.id || (libras && cameraAtiva === librasParticipantId);
                            let cardClass = 'cam-card';
                            if (ativa && !libras) cardClass += ' ativa';
                            if (ativa && libras) cardClass += ' ativa-libras';

                            return (
                                <div key={p.id} className={cardClass}>
                                    <div
                                        style={{
                                            height: 80,
                                            background: 'var(--surface-900)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                        }}
                                    >
                                        <i
                                            className={`${libras ? 'pi pi-sign-language' : 'pi pi-video'} text-white`}
                                            style={{ fontSize: '1.5rem' }}
                                        />
                                        {ativa && (
                                            <Tag
                                                value={libras ? 'LIBRAS' : 'DESTAQUE'}
                                                severity={libras ? 'success' : 'info'}
                                                style={{ position: 'absolute', top: 4, left: 4, fontSize: '12px' }}
                                            />
                                        )}
                                        {libras && !ativa && (
                                            <Tag
                                                value="Libras"
                                                severity="success"
                                                style={{ position: 'absolute', top: 4, left: 4, fontSize: '12px' }}
                                            />
                                        )}
                                    </div>
                                    <div className="p-2 flex align-items-center justify-content-between gap-1">
                                        <span
                                            style={{ fontSize: '11px', color: 'var(--text-color-secondary)' }}
                                            title={p.nome}
                                        >
                                            {p.nome}
                                        </span>
                                        <Button
                                            label="Destacar"
                                            size="small"
                                            text
                                            style={{ fontSize: '11px', padding: '2px 6px' }}
                                            onClick={() => handleFixarParticipante(p)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex align-items-center gap-2 mt-2">
                    <Tag value="Libras" severity="success" style={{ fontSize: '10px' }} />
                    <small className="text-color-secondary">
                        Participantes cujo nome contém “Libras/Intérprete” são marcados automaticamente.
                    </small>
                </div>
            </div>
        </div>
    );
}
