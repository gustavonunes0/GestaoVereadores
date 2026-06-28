import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useAppToast } from '../../../hooks/useAppToast';
import type { JitsiTokenData } from '../../../types/sessoes';
import { buildJitsiGuestRoomUrlFromToken } from '../../../utils/jitsiRoomUrl';

interface Props {
    jitsiData: JitsiTokenData;
}

const DICAS = [
    'Abra o link em outro PC, celular ou tablet na mesma rede.',
    'Na primeira vez, aceite o certificado HTTPS do Jitsi no navegador.',
    'Use um nome claro ao entrar (ex.: Câmera Plenário, Intérprete Libras).',
    'Cada dispositivo conectado aparece em “Câmeras na sala” para você destacar.',
];

export function ConvidarParticipantesJitsi({ jitsiData }: Props) {
    const { showToast } = useAppToast();
    const [expandido, setExpandido] = useState(false);
    const linkSala = buildJitsiGuestRoomUrlFromToken(jitsiData);

    async function copiarLink() {
        try {
            await navigator.clipboard.writeText(linkSala);
            showToast('success', 'Link copiado', 'Envie para quem vai entrar na sala.');
        } catch {
            showToast('error', 'Não foi possível copiar', 'Selecione o link e copie manualmente.');
        }
    }

    function abrirLink() {
        window.open(linkSala, '_blank', 'noopener,noreferrer');
    }

    return (
        <div className="transmissao-convite">
            <div className="transmissao-convite__header">
                <div>
                    <p className="transmissao-convite__titulo m-0">
                        <i className="pi pi-user-plus" aria-hidden />
                        Adicionar pessoas à chamada
                    </p>
                    <p className="transmissao-convite__sub m-0 text-color-secondary">
                        Compartilhe o link da sala para câmeras extras, intérprete ou operador remoto.
                    </p>
                </div>
                <Button
                    label={expandido ? 'Ocultar' : 'Convidar'}
                    icon={expandido ? 'pi pi-chevron-up' : 'pi pi-link'}
                    size="small"
                    outlined
                    onClick={() => setExpandido((v) => !v)}
                />
            </div>

            {expandido && (
                <div className="transmissao-convite__body">
                    <label className="transmissao-convite__label" htmlFor="jitsi-link-sala">
                        Link da sala
                    </label>
                    <div className="transmissao-convite__link-row">
                        <InputText
                            id="jitsi-link-sala"
                            value={linkSala}
                            readOnly
                            className="transmissao-convite__input"
                            onFocus={(e) => e.target.select()}
                        />
                        <Button
                            icon="pi pi-copy"
                            label="Copiar"
                            size="small"
                            outlined
                            onClick={() => void copiarLink()}
                            aria-label="Copiar link da sala"
                        />
                        <Button
                            icon="pi pi-external-link"
                            label="Abrir"
                            size="small"
                            outlined
                            onClick={abrirLink}
                            aria-label="Abrir link da sala em nova aba"
                        />
                    </div>

                    <p className="transmissao-convite__sala m-0 text-color-secondary">
                        Sala: <code className="transmissao-room-code">{jitsiData.roomName}</code>
                    </p>

                    <ul className="transmissao-convite__dicas">
                        {DICAS.map((dica) => (
                            <li key={dica}>{dica}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
