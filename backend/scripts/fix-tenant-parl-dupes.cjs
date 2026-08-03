/**
 * Limpa TenantUser incorretamente criados para vereadores.
 *
 * Dry-run: node scripts/fix-tenant-parl-dupes.cjs
 * Aplicar: node scripts/fix-tenant-parl-dupes.cjs --apply
 */
const { PrismaClient } = require('@prisma/client');

const apply = process.argv.includes('--apply');
const prisma = new PrismaClient();

/** Staff legítimos a preservar (CPFs). */
const KEEP_STAFF_CPFS = new Set([
    '03672446327', // Yuri admin
    '00000000191', // Admin Câmara (seed)
    '99999999999', // Admin Staff (seed)
    '07415914309', // Gustavo Nunes
]);

async function removeTenantUser(tuId) {
    try {
        await prisma.tenantUser.delete({ where: { id: tuId } });
        return 'deleted';
    } catch (err) {
        await prisma.tenantUser.update({
            where: { id: tuId },
            data: {
                isRemoved: true,
                removedAt: new Date(),
                status: 'DISABLED',
            },
        });
        return `soft-disabled (${err?.code || 'fk'})`;
    }
}

async function main() {
    console.log(apply ? 'MODE: APPLY' : 'MODE: DRY-RUN');

    const dual = await prisma.user.findMany({
        where: {
            isRemoved: false,
            tenantUsers: { some: { isRemoved: false } },
            parliamentarianUser: { isNot: null },
        },
        include: {
            tenantUsers: { where: { isRemoved: false } },
            parliamentarianUser: { include: { parliamentarian: true } },
        },
        orderBy: { firstName: 'asc' },
    });

    console.log(`\n[1] Remover TenantUser de quem já é parlamentar: ${dual.length}`);
    for (const u of dual) {
        console.log(
            `  - ${u.firstName} ${u.lastName} (cpf ${u.cpf}) → keep only ParlamentarianUser`,
        );
        for (const tu of u.tenantUsers) {
            console.log(`      TenantUser ${tu.id} role=${tu.role}`);
            if (apply) {
                const r = await removeTenantUser(tu.id);
                console.log(`      → ${r}`);
            }
        }
        if (u.email?.startsWith('staff.') && u.cpf) {
            const wanted = `parlamentar.${u.cpf}@interno.sigl.local`;
            const clash = await prisma.user.findFirst({
                where: { email: wanted, NOT: { id: u.id } },
            });
            if (!clash) {
                console.log(`      email ${u.email} → ${wanted}`);
                if (apply) {
                    await prisma.user.update({
                        where: { id: u.id },
                        data: { email: wanted },
                    });
                }
            }
        }
    }

    const fakeStaff = await prisma.user.findMany({
        where: {
            isRemoved: false,
            email: { startsWith: 'staff.' },
            tenantUsers: { some: { isRemoved: false } },
            parliamentarianUser: null,
            NOT: { cpf: { in: [...KEEP_STAFF_CPFS] } },
        },
        include: { tenantUsers: { where: { isRemoved: false } } },
        orderBy: { firstName: 'asc' },
    });

    console.log(
        `\n[2] Staff criados por engano (sem parlamentar, e-mail staff.*): ${fakeStaff.length}`,
    );
    for (const u of fakeStaff) {
        console.log(`  - ${u.firstName} ${u.lastName} (cpf ${u.cpf}) → soft-remove user`);
        for (const tu of u.tenantUsers) {
            console.log(`      TenantUser ${tu.id} role=${tu.role}`);
            if (apply) {
                const r = await removeTenantUser(tu.id);
                console.log(`      → ${r}`);
            }
        }
        if (apply) {
            await prisma.user.update({
                where: { id: u.id },
                data: { isRemoved: true },
            });
        }
    }

    if (!apply) console.log('\nNada gravado. Rode com --apply para aplicar.');
    else console.log('\nAplicado.');

    const users = await prisma.user.findMany({
        where: { isRemoved: false },
        include: {
            tenantUsers: { where: { isRemoved: false } },
            parliamentarianUser: true,
        },
    });
    const both = users.filter((u) => u.tenantUsers.length && u.parliamentarianUser);
    const onlyT = users.filter((u) => u.tenantUsers.length && !u.parliamentarianUser);
    const onlyP = users.filter((u) => !u.tenantUsers.length && u.parliamentarianUser);

    console.log('\n=== RESUMO ===');
    console.log('staff+parl (deve ser 0):', both.length);
    console.log(
        'só staff:',
        onlyT.length,
        onlyT.map((u) => `${u.firstName} ${u.lastName}`).join(', '),
    );
    console.log('só parlamentar:', onlyP.length);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
