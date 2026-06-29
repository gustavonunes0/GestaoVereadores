import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../../identidade/users/domain/user.repository';
import { USER_REPOSITORY } from '../../../../identidade/users/users.tokens';
import { TenantPartnerViewModel } from '../../../../identidade/tenant-partners/application/view-models/tenant-partner.view-model';
import { TenantPartnerUserRepository } from '../../../../identidade/tenant-partners/domain/repositories/tenant-partner-user.repository';
import { TENANT_PARTNER_USER_REPOSITORY } from '../../../../identidade/tenant-partners/tenant-partners.tokens';
import { AutorResolverService } from '../../domain/services/autor-resolver.service';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';

@Injectable()
export class ListTenantPartnersForMatterUseCase {
    private readonly autorResolver = new AutorResolverService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
        @Inject(TENANT_PARTNER_USER_REPOSITORY)
        private readonly partnerUserRepo: TenantPartnerUserRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepo: UserRepository,
    ) {}

    async execute(tenantId: string, tipoAutorId?: string) {
        const partners = await this.repository.listTenantPartners(
            tenantId,
            tipoAutorId,
        );
        const links = await this.partnerUserRepo.findLinksByPartnerIds(
            partners.map((p) => p.id),
        );
        const userIdByPartnerId = new Map(
            links.map((link) => [link.tenantPartnerId, link.userId]),
        );
        const uniqueUserIds = [...new Set(links.map((link) => link.userId))];
        const usersById = new Map<string, Awaited<ReturnType<UserRepository['findById']>>>();
        for (const userId of uniqueUserIds) {
            const user = await this.userRepo.findById(userId);
            if (user) usersById.set(userId, user);
        }

        return partners.map((a) => {
            const userId = userIdByPartnerId.get(a.id);
            const user = userId ? usersById.get(userId) : undefined;
            const usuario = user ? TenantPartnerViewModel.userToHttp(user) : null;

            return {
                id: a.id,
                nomeExibicao: this.autorResolver.resolverNomeCompleto({
                    nome: a.nome,
                    cargo: a.cargo,
                    instituicao: a.instituicao,
                    registro: a.registro,
                }),
                nome: a.nome,
                cargo: a.cargo,
                instituicao: a.instituicao,
                registro: a.registro,
                partido: a.partido,
                uf: a.uf,
                tipoAutor: a.tipoAutor,
                usuarioVinculado: !!userId,
                usuario,
            };
        });
    }
}
