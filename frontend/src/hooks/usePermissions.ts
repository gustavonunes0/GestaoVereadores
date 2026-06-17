import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isParlamentarianUser } from '../types/auth';

export function usePermissions() {
    const { user, isAdminStaff, isStaff, isParliamentarian } = useAuth();

    return useMemo(() => {
        if (!user) {
            return {
                user: null,
                isAdminStaff: false,
                isStaff: false,
                isParliamentarian: false,
                canWrite: false,
                canEdit: false,
                canDelete: false,
                canManageSessao: false,
                canVotar: false,
                canManagePessoas: false,
                canRead: false,
                isReadOnly: false,
                sessionType: null,
                parliamentarianId: undefined as string | undefined,
            };
        }

        const canWrite = isAdminStaff || isStaff;
        const canEdit = isAdminStaff;
        const canDelete = isAdminStaff;
        const canManageSessao = isAdminStaff || isStaff;
        const canVotar = isParliamentarian;
        const canManagePessoas = isAdminStaff;

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
            canRead: true,
            isReadOnly: isParliamentarian,
            sessionType: user.sessionType,
            parliamentarianId: isParlamentarianUser(user)
                ? user.parliamentarianId
                : undefined,
        };
    }, [user, isAdminStaff, isStaff, isParliamentarian]);
}
