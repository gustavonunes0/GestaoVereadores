import { CommitteeOpinionPolicy } from './committee-opinion.policy';

describe('CommitteeOpinionPolicy', () => {
    const policy = new CommitteeOpinionPolicy();

    it('não exige parecer para tramitação no MVP', () => {
        expect(policy.isRequiredForMatterTramitation()).toBe(false);
    });

    it('não bloqueia tramitação por falta de parecer no MVP', () => {
        expect(policy.shouldBlockTramitationWhenMissing()).toBe(false);
    });
});
