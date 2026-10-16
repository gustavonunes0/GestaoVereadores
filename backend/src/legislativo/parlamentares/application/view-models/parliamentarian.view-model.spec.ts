import { ParliamentarianEntity } from '../../domain/entities/parliamentarian.entity';
import { ParliamentarianStatus } from '../../domain/enums/parliamentarian-status.enum';
import { buildParliamentarianWithRelations } from '../use-cases/__tests__/parliamentarian-test.helpers';
import { ParliamentarianViewModel } from './parliamentarian.view-model';

describe('ParliamentarianViewModel', () => {
    it('selo legislativo segue conta inativa (BUG-11 / Opção A)', () => {
        const data = buildParliamentarianWithRelations({
            accessStatus: 'INACTIVE',
        });
        expect(data.entity.toPrimitives().status).toBe(ParliamentarianStatus.ACTIVE);

        const http = ParliamentarianViewModel.toHttp(data);
        expect(http.status).toBe('INACTIVE');
        expect(http.hasAccess).toBe(false);
        expect(http.accessStatus).toBe('INACTIVE');
    });

    it('selo legislativo segue conta ativa quando status estava INACTIVE', () => {
        const base = buildParliamentarianWithRelations().entity.toPrimitives();
        const data = buildParliamentarianWithRelations({
            accessStatus: 'ACTIVE',
            entity: ParliamentarianEntity.restore({
                ...base,
                status: ParliamentarianStatus.INACTIVE,
            }),
        });

        const http = ParliamentarianViewModel.toHttp(data);
        expect(http.status).toBe('ACTIVE');
        expect(http.hasAccess).toBe(true);
    });
});
