import { PortalSettings } from '../types/portal-settings.types';

export type PortalTenantRecord = {
    tenantId: string;
    name: string;
    logo: string | null;
    portalSlug: string;
    portal: PortalSettings;
};

export type UpdatePortalConfigInput = {
    portalSlug?: string | null;
    portal?: Partial<PortalSettings>;
};

export abstract class PortalConfigRepository {
    abstract findByTenantId(
        tenantId: string,
    ): Promise<PortalTenantRecord | null>;

    abstract findByPortalSlug(
        slug: string,
    ): Promise<PortalTenantRecord | null>;

    abstract updateByTenantId(
        tenantId: string,
        input: UpdatePortalConfigInput,
    ): Promise<PortalTenantRecord>;

    abstract isPortalSlugTaken(
        slug: string,
        ignoreTenantId?: string,
    ): Promise<boolean>;
}
