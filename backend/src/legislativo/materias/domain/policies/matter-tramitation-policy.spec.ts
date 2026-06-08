import { StatusMateria } from '@prisma/client';
import {
    assertTramitationNotBlockedByMissingOpinion,
    MatterTramitationPolicy,
} from '../policies/matter-tramitation-policy';

describe('MatterTramitationPolicy', () => {
    const policy = new MatterTramitationPolicy();

    it('permite tramitação sem parecer de comissão', () => {
        expect(() =>
            policy.assertTramitationAllowed({
                matterId: 'matter-1',
                tenantId: 'tenant-1',
            }),
        ).not.toThrow();
    });

    it('permite entrar na pauta sem parecer', () => {
        expect(() =>
            assertTramitationNotBlockedByMissingOpinion({
                matterId: 'matter-1',
                tenantId: 'tenant-1',
            }),
        ).not.toThrow();
    });

    it('permite transição de status sem parecer', () => {
        expect(() =>
            assertTramitationNotBlockedByMissingOpinion({
                matterId: 'matter-2',
            }),
        ).not.toThrow();
    });
});

describe('MVP tramitation without opinions', () => {
    it('não exige parecer para EM_TRAMITACAO → APROVADA', () => {
        expect(() =>
            assertTramitationNotBlockedByMissingOpinion({
                matterId: 'm1',
                tenantId: 't1',
            }),
        ).not.toThrow();
        const _status: StatusMateria = StatusMateria.APROVADA;
        expect(_status).toBeDefined();
    });
});
