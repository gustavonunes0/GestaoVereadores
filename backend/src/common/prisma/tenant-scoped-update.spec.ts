import {
    assertTenantScopedUpdate,
    TenantScopedUpdateError,
} from './tenant-scoped-update';

describe('assertTenantScopedUpdate', () => {
    it('não lança quando count > 0', () => {
        expect(() =>
            assertTenantScopedUpdate(1, 'não encontrado'),
        ).not.toThrow();
    });

    it('lança TenantScopedUpdateError quando count = 0', () => {
        expect(() => assertTenantScopedUpdate(0, 'não encontrado')).toThrow(
            TenantScopedUpdateError,
        );
        expect(() => assertTenantScopedUpdate(0, 'não encontrado')).toThrow(
            'não encontrado',
        );
    });
});
