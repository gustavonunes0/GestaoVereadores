import { PaginationQueryDto, PaginatedResult } from '../dto/pagination.dto';

export function resolvePagination(query?: PaginationQueryDto) {
    const page = Math.max(query?.page ?? 1, 1);
    const limit = Math.min(Math.max(query?.limit ?? 20, 1), 100);
    return { page, limit, skip: (page - 1) * limit };
}

export async function paginatedQuery<T>(
    countFn: () => Promise<number>,
    findFn: (skip: number, take: number) => Promise<T[]>,
    query?: PaginationQueryDto,
): Promise<PaginatedResult<T>> {
    const { page, limit, skip } = resolvePagination(query);
    const [total, data] = await Promise.all([countFn(), findFn(skip, limit)]);
    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
    };
}
