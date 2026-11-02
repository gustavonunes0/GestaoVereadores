import { describe, expect, it } from 'vitest';
import {
    podeControlarPainelSessao,
    podeDeliberarSessao,
} from '../sessaoPainelControle';
import type { StatusSessao } from '../../types/sessoes';

const STATUS: StatusSessao[] = [
    'AGENDADA',
    'CHAMADA',
    'ABERTA',
    'SUSPENSA',
    'ENCERRADA',
    'CANCELADA',
];

describe('podeControlarPainelSessao', () => {
    it('nega sem permissão de gestão', () => {
        for (const status of STATUS) {
            expect(podeControlarPainelSessao(false, status)).toBe(false);
        }
    });

    it('permite antes e durante a sessão (AGENDADA/CHAMADA/ABERTA/SUSPENSA)', () => {
        expect(podeControlarPainelSessao(true, 'AGENDADA')).toBe(true);
        expect(podeControlarPainelSessao(true, 'CHAMADA')).toBe(true);
        expect(podeControlarPainelSessao(true, 'ABERTA')).toBe(true);
        expect(podeControlarPainelSessao(true, 'SUSPENSA')).toBe(true);
    });

    it('bloqueia sessão encerrada ou cancelada', () => {
        expect(podeControlarPainelSessao(true, 'ENCERRADA')).toBe(false);
        expect(podeControlarPainelSessao(true, 'CANCELADA')).toBe(false);
    });
});

describe('podeDeliberarSessao', () => {
    it('só permite com sessão ABERTA e permissão', () => {
        expect(podeDeliberarSessao(true, 'ABERTA')).toBe(true);
        expect(podeDeliberarSessao(true, 'AGENDADA')).toBe(false);
        expect(podeDeliberarSessao(true, 'CHAMADA')).toBe(false);
        expect(podeDeliberarSessao(false, 'ABERTA')).toBe(false);
    });
});
