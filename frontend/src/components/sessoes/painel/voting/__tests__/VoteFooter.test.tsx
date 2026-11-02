import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VoteFooter } from '../VoteFooter';

describe('VoteFooter placar', () => {
    it('exibe rótulos SIM, NÃO e ABSTENÇÃO (não ABS)', () => {
        render(
            <VoteFooter
                clock="14:00:00"
                date="02/11/2026"
                votes={{ sim: 3, nao: 1, abs: 2 }}
                stats={{ presentes: 10, ausentes: 3, total: 13 }}
            />,
        );

        expect(screen.getByText('SIM')).toBeInTheDocument();
        expect(screen.getByText('NÃO')).toBeInTheDocument();
        expect(screen.getByText('ABSTENÇÃO')).toBeInTheDocument();
        expect(screen.queryByText(/^ABS$/)).not.toBeInTheDocument();
    });

    it('expõe placar acessível com totais', () => {
        render(
            <VoteFooter
                clock="14:00:00"
                date="02/11/2026"
                votes={{ sim: 5, nao: 2, abs: 1 }}
                stats={{ presentes: 8, ausentes: 5, total: 13 }}
            />,
        );

        expect(screen.getByRole('status', { name: 'Placar' })).toBeInTheDocument();
        expect(screen.getByLabelText('Sim: 05')).toBeInTheDocument();
        expect(screen.getByLabelText('Não: 02')).toBeInTheDocument();
        expect(screen.getByLabelText('Abstenções: 01')).toBeInTheDocument();
    });
});
