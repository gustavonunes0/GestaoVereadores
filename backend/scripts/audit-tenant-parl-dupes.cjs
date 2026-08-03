/**
 * Diagnóstico: users com vínculo TenantUser que deveriam ser só parlamentares (ou duplicados).
 * Uso: node scripts/audit-tenant-parl-dupes.cjs
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function fullName(u) {
    return `${u.firstName} ${u.lastName}`.trim();
}

function norm(s) {
    return String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function main() {
    const users = await prisma.user.findMany({
        where: { isRemoved: false },
        include: {
            tenantUsers: { where: { isRemoved: false } },
            parliamentarianUser: {
                include: { parliamentarian: true },
            },
        },
        orderBy: [{ createdAt: 'asc' }],
    });

    const both = users.filter((u) => u.tenantUsers.length > 0 && u.parliamentarianUser);
    const onlyTenant = users.filter((u) => u.tenantUsers.length > 0 && !u.parliamentarianUser);
    const onlyParl = users.filter((u) => u.tenantUsers.length === 0 && u.parliamentarianUser);

    console.log('TOTAL_USERS', users.length);
    console.log('BOTH_staff_and_parl', both.length);
    console.log('ONLY_TENANT', onlyTenant.length);
    console.log('ONLY_PARL', onlyParl.length);

    console.log('\n=== ONLY_TENANT ===');
    for (const u of onlyTenant) {
        console.log(
            JSON.stringify({
                id: u.id,
                name: fullName(u),
                cpf: u.cpf,
                email: u.email,
                role: u.tenantUsers.map((t) => t.role).join(','),
                isParliamentarianFlag: u.tenantUsers.some((t) => t.isParliamentarian),
                createdAt: u.createdAt,
            }),
        );
    }

    console.log('\n=== BOTH (mesmo User com staff + parlamentar) ===');
    for (const u of both) {
        console.log(
            JSON.stringify({
                id: u.id,
                name: fullName(u),
                cpf: u.cpf,
                email: u.email,
                role: u.tenantUsers.map((t) => t.role).join(','),
                parlName: u.parliamentarianUser?.parliamentarian?.parliamentaryName,
            }),
        );
    }

    console.log('\n=== Matches TenantUser ↔ Parliamentarian (CPF ou nome) ===');
    const matches = [];
    for (const tu of onlyTenant) {
        const cpfHit = onlyParl.find((p) => p.cpf && tu.cpf && p.cpf === tu.cpf);
        const tn = norm(fullName(tu));
        const nameHit = onlyParl.find((p) => {
            const pn = norm(
                p.parliamentarianUser?.parliamentarian?.parliamentaryName || fullName(p),
            );
            if (pn === tn) return true;
            // primeiro + último token em comum
            const tParts = tn.split(' ').filter((x) => x.length > 2);
            const pParts = pn.split(' ').filter((x) => x.length > 2);
            if (tParts.length < 2 || pParts.length < 2) return false;
            return tParts[0] === pParts[0] && tParts[tParts.length - 1] === pParts[pParts.length - 1];
        });
        const hit = cpfHit || nameHit;
        if (hit) {
            const row = {
                tenantUserId: tu.id,
                tenantName: fullName(tu),
                tenantCpf: tu.cpf,
                tenantEmail: tu.email,
                tenantRole: tu.tenantUsers.map((t) => t.role).join(','),
                parlUserId: hit.id,
                parlName:
                    hit.parliamentarianUser?.parliamentarian?.parliamentaryName || fullName(hit),
                parlCpf: hit.cpf,
                matchBy: cpfHit ? 'cpf' : 'name',
            };
            matches.push(row);
            console.log(JSON.stringify(row));
        }
    }

    // Tenant users marked isParliamentarian flag
    const flagged = onlyTenant.filter((u) => u.tenantUsers.some((t) => t.isParliamentarian));
    console.log('\nONLY_TENANT with isParliamentarian=true on TenantUser:', flagged.length);
    for (const u of flagged) {
        console.log(
            JSON.stringify({
                id: u.id,
                name: fullName(u),
                cpf: u.cpf,
            }),
        );
    }

    // Users created around seed/import that are staff but named like vereadores
    console.log('\n=== ALL ONLY_PARL (login) ===');
    for (const u of onlyParl) {
        console.log(
            JSON.stringify({
                id: u.id,
                name: fullName(u),
                parlName: u.parliamentarianUser?.parliamentarian?.parliamentaryName,
                cpf: u.cpf,
                email: u.email,
            }),
        );
    }

    console.log('\nMATCHES_COUNT', matches.length);
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
