import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SIGL_WRITE_ROLES = new Set(['MASTER', 'ADMIN', 'OPERADOR']);
const CAMARA_WRITE_ROLES = new Set(['ADMIN', 'OWNER', 'MANAGER']);

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(() => {
    const authType = user?.authType ?? 'sigl';
    const isMaster = user?.role === 'MASTER' && authType === 'sigl';
    const isCamara = authType === 'camara';

    const canWrite = (() => {
      if (!user) return false;
      if (isCamara) {
        return CAMARA_WRITE_ROLES.has(user.role) || user.isAdmin === true;
      }
      return SIGL_WRITE_ROLES.has(user.role);
    })();

    const canRead = !!user;

    return {
      user,
      authType,
      isMaster,
      isCamara,
      canWrite,
      canRead,
      isReadOnly: canRead && !canWrite,
    };
  }, [user]);
}
