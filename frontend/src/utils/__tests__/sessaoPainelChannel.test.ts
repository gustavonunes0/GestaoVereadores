import { describe, expect, it } from 'vitest';
import { painelUrl } from '../sessaoPainelChannel';

describe('painelUrl', () => {
    it('monta URL do painel sem item', () => {
        expect(painelUrl('abc-123')).toBe('/sessoes/abc-123/painel');
    });

    it('monta URL do painel com item selecionado', () => {
        expect(painelUrl('abc-123', 'item-9')).toBe(
            '/sessoes/abc-123/painel?item=item-9',
        );
    });
});
