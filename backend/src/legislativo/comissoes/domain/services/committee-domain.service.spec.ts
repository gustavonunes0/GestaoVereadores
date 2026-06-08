import { CommitteeDomainService } from './committee-domain.service';
import { CommitteeType } from '../enums/committee-type.enum';
import { CommitteeMemberRole } from '../enums/committee-member-role.enum';

describe('CommitteeDomainService', () => {
    const service = new CommitteeDomainService();

    it('valida período opcional', () => {
        expect(() =>
            service.assertDateRange(
                new Date('2025-01-01'),
                new Date('2025-12-31'),
            ),
        ).not.toThrow();
        expect(() => service.assertDateRange(null, null)).not.toThrow();
    });

    it('bloqueia data fim anterior à data início', () => {
        expect(() =>
            service.assertDateRange(
                new Date('2026-01-01'),
                new Date('2025-01-01'),
            ),
        ).toThrow('Data fim não pode ser anterior à data início');
    });

    it('exige finalidade', () => {
        expect(() => service.assertPurposeProvided('  ')).toThrow(
            'Finalidade da comissão é obrigatória',
        );
    });

    it('bloqueia sigla duplicada', () => {
        expect(() => service.assertAcronymAvailable(true)).toThrow(
            'Já existe comissão com esta sigla no tenant',
        );
    });

    it('bloqueia parlamentar duplicado na comissão', () => {
        expect(() =>
            service.assertParliamentarianNotOnCommittee(true),
        ).toThrow('Parlamentar já integra esta comissão');
    });

    it('bloqueia função exclusiva já ocupada', () => {
        expect(() =>
            service.assertExclusiveRoleNotOccupied(
                CommitteeMemberRole.PRESIDENT,
                true,
            ),
        ).toThrow('Esta função já está ocupada nesta comissão');
    });

    it('permite vários membros com função MEMBER', () => {
        expect(() =>
            service.assertExclusiveRoleNotOccupied(
                CommitteeMemberRole.MEMBER,
                true,
            ),
        ).not.toThrow();
    });
});

describe('CommitteeType', () => {
    it('suporta comissão permanente e temporária', () => {
        expect(CommitteeType.PERMANENT).toBe('PERMANENT');
        expect(CommitteeType.TEMPORARY).toBe('TEMPORARY');
    });
});
