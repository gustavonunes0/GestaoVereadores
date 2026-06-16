import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { TenantUserRole } from '../types/auth';

export function usePermissions() {
    const { user } = useAuth();

    return useMemo(() => {
        const authType = user?.authType ?? 'sigl';
        const role = user?.role as TenantUserRole | string | undefined;

        const isMaster = role === 'MASTER' && authType === 'sigl';
        const isCamara = authType === 'camara';

        const isAdminStaff = role === 'ADMIN_STAFF';
        const isStaff = role === 'STAFF';
        const isParliamentarian = role === 'PARLIAMENTARIAN';

        const canWrite = !!user && (isAdminStaff || isStaff);
        const canEdit = isAdminStaff;
        const canDelete = isAdminStaff;
        const canManageSessao = isAdminStaff || isStaff;
        const canVotar = isParliamentarian;
        const canManagePessoas = isAdminStaff;
        const canRead = !!user;

        return {
            user,
            authType,
            role: role as TenantUserRole | undefined,
            isMaster,
            isCamara,
            canWrite,
            canEdit,
            canDelete,
            canManageSessao,
            canVotar,
            canManagePessoas,
            canRead,
            isReadOnly: isParliamentarian,
        };
    }, [user]);
}
