import type { JitsiTokenData } from '../types/sessoes';

/** URL pública da sala para convidados (sem JWT — requer ENABLE_GUESTS no Jitsi). */
export function buildJitsiGuestRoomUrl(domain: string, roomName: string): string {
    const host = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${host}/${roomName}`;
}

export function buildJitsiGuestRoomUrlFromToken(data: Pick<JitsiTokenData, 'domain' | 'roomName'>): string {
    return buildJitsiGuestRoomUrl(data.domain, data.roomName);
}
