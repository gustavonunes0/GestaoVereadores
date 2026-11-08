import { TenantUserRole, TenantUserStatus } from '@prisma/client';
import { StaffUserNameService } from '../../domain/staff-user-name.service';

type TenantStaffRow = {
    id: string;
    userId: string;
    role: TenantUserRole;
    status: TenantUserStatus;
    createdAt: Date;
    user: {
        cpf: string | null;
        email: string;
        firstName: string;
        lastName: string;
    };
};

const nameService = new StaffUserNameService();

export class TenantStaffViewModel {
    static toHttp(row: TenantStaffRow) {
        return {
            id: row.id,
            userId: row.userId,
            cpf: row.user.cpf,
            email: row.user.email,
            nome: nameService.composeDisplayName(
                row.user.firstName,
                row.user.lastName,
            ),
            role: row.role,
            ativo: row.status === TenantUserStatus.ACTIVE,
            createdAt: row.createdAt,
        };
    }
}
