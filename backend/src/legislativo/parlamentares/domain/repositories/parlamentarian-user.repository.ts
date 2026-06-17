import { ParlamentarianUserEntity } from '../entities/parlamentarian-user.entity';

export abstract class ParlamentarianUserRepository {
    abstract create(
        entity: ParlamentarianUserEntity,
    ): Promise<ParlamentarianUserEntity>;

    abstract findActiveByParliamentarianId(
        tenantId: string,
        parliamentarianId: string,
    ): Promise<ParlamentarianUserEntity | null>;

    abstract findActiveByUserId(
        tenantId: string,
        userId: string,
    ): Promise<ParlamentarianUserEntity | null>;

    abstract deactivate(
        tenantId: string,
        parliamentarianId: string,
    ): Promise<ParlamentarianUserEntity>;
}
