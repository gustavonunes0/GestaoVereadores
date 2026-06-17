import { TenantUserRole, TenantUserStatus } from '@prisma/client';

type TenantStaffRow = {
    id: string;
    userId: string;
    role: TenantUserRole;
    status: TenantUserStatus;
    createdAt: Date;
    user: {
        cpf: string;
        email: string;
        firstName: string;
        lastName: string;
    };
};

export class TenantStaffViewModel {
    static toHttp(row: TenantStaffRow) {
        return {
            id: row.id,
            userId: row.userId,
            cpf: row.user.cpf,
            email: row.user.email,
            nome: `${row.user.firstName} ${row.user.lastName}`.trim(),
            role: row.role,
            ativo: row.status === TenantUserStatus.ACTIVE,
            createdAt: row.createdAt,
        };
    }
}
