import { ListAtosUseCase } from './list-atos.use-case';
import { buildAtoEntity, buildAtoRepositoryMock } from './__tests__/ato-test.helpers';

const TENANT_ID = 'tenant-1';

describe('ListAtosUseCase', () => {
    it('lista atos com paginação', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findMany.mockResolvedValue({
            data: [buildAtoEntity()],
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        });

        const useCase = new ListAtosUseCase(repository as never);
        const result = await useCase.execute(TENANT_ID, { page: 1, limit: 20 });

        expect(repository.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: TENANT_ID,
                page: 1,
                limit: 20,
            }),
        );
        expect(result.data).toHaveLength(1);
        expect(result.meta.total).toBe(1);
    });

    it('lista atos com filtros', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findMany.mockResolvedValue({
            data: [],
            meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });

        const useCase = new ListAtosUseCase(repository as never);
        await useCase.execute(TENANT_ID, {
            tipoId: 'tipo-1',
            classificacaoId: 'class-1',
            numero: '001',
            dataPublicacaoDe: '2024-01-01',
            page: 1,
            limit: 10,
        });

        expect(repository.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: TENANT_ID,
                tipoId: 'tipo-1',
                classificacaoId: 'class-1',
                numero: '001',
                dataPublicacaoDe: '2024-01-01',
            }),
        );
    });

    it('garante include de tipo e classificacao na resposta', async () => {
        const repository = buildAtoRepositoryMock();
        repository.findMany.mockResolvedValue({
            data: [buildAtoEntity()],
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        });

        const useCase = new ListAtosUseCase(repository as never);
        const result = await useCase.execute(TENANT_ID, {});

        expect(result.data[0].tipo).toBeDefined();
        expect(result.data[0].classificacao).toBeDefined();
    });
});
