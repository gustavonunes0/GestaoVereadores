import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CouncilorRow } from '../CouncilorRow';
import type { Councilor } from '../types';

function member(partial: Partial<Councilor> = {}): Councilor {
    return {
        id: 'c1',
        name: 'Edwin Bezerra Oliveira',
        party: 'PRD',
        status: 'presente',
        side: 'right',
        photoUrl: null,
        ...partial,
    };
}

describe('CouncilorRow', () => {
    it('mostra nome em maiúsculas e partido político', () => {
        render(<CouncilorRow member={member()} />);

        expect(screen.getByText('EDWIN BEZERRA OLIVEIRA')).toBeInTheDocument();
        expect(screen.getByText('PRD')).toBeInTheDocument();
        expect(screen.getByText('PRD').className).toContain('vp-row__party');
    });

    it('usa placeholder ocultável quando partido está vazio', () => {
        const { container } = render(
            <CouncilorRow member={member({ party: '' })} />,
        );

        const empty = container.querySelector('.vp-row__party--empty');
        expect(empty).toBeTruthy();
        expect(empty?.textContent).toBe('—');
    });

    it('exibe cargo da mesa quando showRole=true', () => {
        render(
            <CouncilorRow
                showRole
                member={member({
                    name: 'João Paulo Farias Lopes',
                    party: 'REPUBLICANOS',
                    role: 'PRESIDENTE',
                    status: 'presente',
                    side: 'left',
                })}
            />,
        );

        expect(screen.getByText('Presidente')).toBeInTheDocument();
        expect(screen.getByText('REPUBLICANOS')).toBeInTheDocument();
    });
});
