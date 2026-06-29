/** Canal entre a mesa diretora e o monitor do plenário (mesma origem). */

export type PainelMensagem =
    | { tipo: 'EXIBIR_ITEM'; itemId: string }
    | { tipo: 'LIMPAR' };

const PREFIX = 'sigl-sessao-painel-';

export function painelChannelName(sessaoId: string): string {
    return `${PREFIX}${sessaoId}`;
}

export function criarPainelChannel(sessaoId: string): BroadcastChannel {
    return new BroadcastChannel(painelChannelName(sessaoId));
}

export function enviarItemParaPainel(sessaoId: string, itemId: string): void {
    criarPainelChannel(sessaoId).postMessage({ tipo: 'EXIBIR_ITEM', itemId } satisfies PainelMensagem);
}

export function limparPainel(sessaoId: string): void {
    criarPainelChannel(sessaoId).postMessage({ tipo: 'LIMPAR' } satisfies PainelMensagem);
}

export function painelUrl(sessaoId: string, itemId?: string): string {
    const base = `/sessoes/${sessaoId}/painel`;
    return itemId ? `${base}?item=${itemId}` : base;
}
