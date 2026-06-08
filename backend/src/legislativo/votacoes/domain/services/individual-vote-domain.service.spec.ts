import { IndividualVoteDomainService } from './individual-vote-domain.service';

describe('IndividualVoteDomainService', () => {
    const service = new IndividualVoteDomainService();

    it('impede voto duplicado do parlamentar', () => {
        expect(() => service.assertNoDuplicateVote(true)).toThrow(
            'Parlamentar já registrou voto',
        );
    });

    it('exige presença quando configurado', () => {
        expect(() =>
            service.assertPresenceWhenRequired(true, false),
        ).toThrow('parlamentares presentes');
        expect(() =>
            service.assertPresenceWhenRequired(false, false),
        ).not.toThrow();
    });
});
