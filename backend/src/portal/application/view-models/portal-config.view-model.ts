import { PortalTenantRecord } from '../../domain/repositories/portal-config.repository';

export class PortalConfigViewModel {
    static toHttp(record: PortalTenantRecord, previewUrl: string | null) {
        return {
            portalSlug: record.portalSlug || null,
            name: record.name,
            logo: record.logo,
            portal: record.portal,
            previewUrl,
        };
    }
}

export class PublicPortalConfigViewModel {
    static toHttp(record: PortalTenantRecord) {
        const { portal } = record;
        return {
            slug: record.portalSlug,
            name: record.name,
            logo: record.logo,
            titulo: portal.titulo,
            subtitulo: portal.subtitulo,
            sobre: portal.sobre,
            endereco: portal.endereco,
            telefone: portal.telefone,
            email: portal.email,
            redesSociais: portal.redesSociais,
            cores: portal.cores,
            bannerUrl: portal.bannerUrl,
            secoes: portal.secoes,
        };
    }
}
