import { UserEntity } from '../../../users/domain/user.entity';
import { TenantPartnerEntity } from '../../domain/entities/tenant-partner.entity';

export type TenantPartnerUsuarioHttp = {
    nome: string;
    cpf: string;
    fotoPerfil: string | null;
};

export class TenantPartnerViewModel {
    static userToHttp(user: UserEntity): TenantPartnerUsuarioHttp {
        const pub = user.toPublicPrimitives();
        return {
            nome: `${pub.firstName} ${pub.lastName}`.trim(),
            cpf: pub.cpf ?? '',
            fotoPerfil: pub.profilePicture,
        };
    }

    static toHttp(
        partner: TenantPartnerEntity,
        opts?: {
            usuarioVinculado?: boolean;
            usuario?: TenantPartnerUsuarioHttp | null;
        },
    ) {
        return {
            id: partner.id,
            nome: partner.nome,
            cargo: partner.cargo,
            instituicao: partner.instituicao,
            cpf: partner.cpf,
            email: partner.email,
            telefone: partner.telefone,
            registro: partner.registro,
            partido: partner.partido,
            uf: partner.uf,
            usuarioVinculado: opts?.usuarioVinculado ?? false,
            usuario: opts?.usuario ?? null,
            createdAt: partner.createdAt,
        };
    }
}
