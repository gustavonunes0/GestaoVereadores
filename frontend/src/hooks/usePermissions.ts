import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function usePermissions() {
    const { user, isAdminStaff, isStaff, isParliamentarian } = useAuth();

    return useMemo(() => {
        const canWrite = !!user && (isAdminStaff || isStaff);
        const canEdit = isAdminStaff;
        const canDelete = isAdminStaff;
        const canManageSessao = isAdminStaff || isStaff;
        const canVotar = isParliamentarian;
        const canManagePessoas = isAdminStaff;
        const canRead = !!user;

        return {
            user,
            isAdminStaff,
            isStaff,
            isParliamentarian,
            canWrite,
            canEdit,
            canDelete,
            canManageSessao,
            canVotar,
            canManagePessoas,
            canRead,
            isReadOnly: isParliamentarian,
        };
    }, [user, isAdminStaff, isStaff, isParliamentarian]);
}
