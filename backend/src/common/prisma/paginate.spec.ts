import { resolvePagination } from './paginate';

describe('resolvePagination', () => {
    it('usa padrões page=1 limit=20', () => {
        expect(resolvePagination()).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it('limita máximo a 100', () => {
        expect(resolvePagination({ page: 2, limit: 500 })).toEqual({
            page: 2,
            limit: 100,
            skip: 100,
        });
    });
});
