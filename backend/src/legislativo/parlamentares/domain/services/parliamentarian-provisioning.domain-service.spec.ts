import { ParliamentarianProvisioningDomainService } from './parliamentarian-provisioning.domain-service';

describe('ParliamentarianProvisioningDomainService', () => {
    const service = new ParliamentarianProvisioningDomainService();

    it('divide nome parlamentar em primeiro nome e sobrenome', () => {
        expect(service.splitParliamentaryName('João Silva')).toEqual({
            firstName: 'João',
            lastName: 'Silva',
        });
    });

    it('usa sobrenome padrão quando há apenas um token', () => {
        expect(service.splitParliamentaryName('Maria')).toEqual({
            firstName: 'Maria',
            lastName: 'Parlamentar',
        });
    });

    it('gera e-mail interno único', () => {
        const email = service.buildInternalEmail('abc-123');
        expect(email).toBe('parlamentar.abc123@interno.sigl.local');
    });

    it('gera e-mail a partir do CPF', () => {
        expect(service.buildEmailFromCpf('52998224725')).toBe(
            'parlamentar.52998224725@interno.sigl.local',
        );
    });

    it('gera CPF sintético com 11 dígitos', () => {
        expect(service.buildSyntheticCpf('123')).toBe('12300000000');
    });
});
