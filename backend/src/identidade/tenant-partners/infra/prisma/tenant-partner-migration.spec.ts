import * as fs from 'fs';
import * as path from 'path';

describe('T-20 — Verificação de schema: GuestUser removido, TenantPartner presente', () => {
    let schema: string;

    beforeAll(() => {
        schema = fs.readFileSync(
            path.join(__dirname, '../../../../../prisma/schema.prisma'),
            'utf-8',
        );
    });

    it('model GuestUser não existe mais no schema', () => {
        expect(schema).not.toMatch(/model\s+GuestUser/);
    });

    it('enum GuestUserType não existe mais no schema', () => {
        expect(schema).not.toMatch(/enum\s+GuestUserType/);
    });

    it('enum GuestUserStatus não existe mais no schema', () => {
        expect(schema).not.toMatch(/enum\s+GuestUserStatus/);
    });

    it('model Autor não possui campo guestUserId', () => {
        const autorBlock = schema.match(/model\s+Autor\s*\{[\s\S]*?\n\}/);
        expect(autorBlock).not.toBeNull();
        expect(autorBlock![0]).not.toMatch(/guestUserId/);
    });

    it('model Autor possui campo tenantPartnerId substituindo guestUserId', () => {
        const autorBlock = schema.match(/model\s+Autor\s*\{[\s\S]*?\n\}/);
        expect(autorBlock).not.toBeNull();
        expect(autorBlock![0]).toMatch(/tenantPartnerId/);
    });

    it('model TenantPartner existe no schema', () => {
        expect(schema).toMatch(/model\s+TenantPartner\b/);
    });

    it('model TenantPartnerUser existe no schema', () => {
        expect(schema).toMatch(/model\s+TenantPartnerUser\b/);
    });
});
