/**
 * Importa parlamentares + acesso de login a partir de usuarios.json
 * Uso (na pasta backend): node scripts/import-parlamentares-usuarios.cjs
 */
const path = require('path');
const fs = require('fs');
const {
    PrismaClient,
    ParliamentarianStatus,
    ParlamentarianUserStatus,
} = require('@prisma/client');
const { randomBytes, scrypt: scryptCb } = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(scryptCb);
const prisma = new PrismaClient();

const JSON_PATH = path.resolve(
    __dirname,
    '../../usuarios.json',
);
// fallback if script run from repo root layout differently
const JSON_PATH_ALT = path.resolve(
    __dirname,
    '../../../usuarios.json',
);

function loadUsuarios() {
    const p = fs.existsSync(JSON_PATH) ? JSON_PATH : JSON_PATH_ALT;
    if (!fs.existsSync(p)) {
        throw new Error(`Arquivo não encontrado: ${JSON_PATH}`);
    }
    return { data: JSON.parse(fs.readFileSync(p, 'utf8')), path: p };
}

function splitName(nome) {
    const parts = nome.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return { firstName: parts[0], lastName: 'Parlamentar' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function normalizeCpf(cpf) {
    return cpf.replace(/\D/g, '');
}

async function hashPassword(value) {
    const salt = randomBytes(16).toString('hex');
    const derived = await scrypt(value, salt, 64);
    return `${salt}:${derived.toString('hex')}`;
}

async function main() {
    const { data: usuarios, path: usedPath } = loadUsuarios();
    console.log(`Lendo ${usuarios.length} registros de ${usedPath}`);

    const tenant = await prisma.tenant.findFirst({
        where: { isRemoved: false },
        orderBy: { createdAt: 'asc' },
    });
    if (!tenant) {
        throw new Error('Nenhum tenant ativo encontrado. Rode o seed ou crie uma câmara primeiro.');
    }
    console.log(`Tenant: ${tenant.name} (${tenant.id})`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of usuarios) {
        const nome = String(row.nome || '').trim();
        // CPF e senha sempre só dígitos (sem ponto/hífen)
        const cpfDigits = normalizeCpf(String(row.cpf || ''));
        const senha = normalizeCpf(String(row.senha || row.cpf || ''));

        if (!nome || cpfDigits.length !== 11) {
            console.warn('  SKIP inválido:', row);
            skipped++;
            continue;
        }
        if (!senha || senha.length < 6) {
            console.warn('  SKIP senha inválida (mín. 6 dígitos):', nome);
            skipped++;
            continue;
        }

        const { firstName, lastName } = splitName(nome);
        const email = `parlamentar.${cpfDigits}@interno.sigl.local`;
        const passwordHash = await hashPassword(senha);

        const existingByCpf = await prisma.user.findFirst({
            where: { cpf: cpfDigits },
            include: { parliamentarianUser: true },
        });

        let user;
        if (existingByCpf) {
            user = await prisma.user.update({
                where: { id: existingByCpf.id },
                data: {
                    firstName,
                    lastName,
                    email: existingByCpf.email || email,
                    passwordHash,
                    isRemoved: false,
                },
            });
        } else {
            const emailTaken = await prisma.user.findFirst({ where: { email } });
            const resolvedEmail = emailTaken
                ? `parlamentar.${cpfDigits}.${Date.now()}@interno.sigl.local`
                : email;
            user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    cpf: cpfDigits,
                    email: resolvedEmail,
                    passwordHash,
                },
            });
        }

        let parliamentarian;
        const existingLink = await prisma.parlamentarianUser.findFirst({
            where: {
                OR: [{ userId: user.id }, { userId: user.id, tenantId: tenant.id }],
                isRemoved: false,
            },
            include: { parliamentarian: true },
        });

        if (existingLink?.parliamentarian) {
            parliamentarian = await prisma.parliamentarian.update({
                where: { id: existingLink.parliamentarianId },
                data: {
                    parliamentaryName: nome,
                    status: ParliamentarianStatus.ACTIVE,
                    isRemoved: false,
                    removedAt: null,
                },
            });
            await prisma.parlamentarianUser.update({
                where: { id: existingLink.id },
                data: {
                    tenantId: tenant.id,
                    status: ParlamentarianUserStatus.ACTIVE,
                    isRemoved: false,
                    removedAt: null,
                },
            });
            updated++;
            console.log(`  UPD ${cpfDigits} ${nome}`);
        } else {
            // user may already be linked elsewhere with soft-remove
            const anyLink = await prisma.parlamentarianUser.findUnique({
                where: { userId: user.id },
            });
            if (anyLink) {
                parliamentarian = await prisma.parliamentarian.update({
                    where: { id: anyLink.parliamentarianId },
                    data: {
                        tenantId: tenant.id,
                        parliamentaryName: nome,
                        status: ParliamentarianStatus.ACTIVE,
                        isRemoved: false,
                        removedAt: null,
                    },
                });
                await prisma.parlamentarianUser.update({
                    where: { id: anyLink.id },
                    data: {
                        tenantId: tenant.id,
                        status: ParlamentarianUserStatus.ACTIVE,
                        isRemoved: false,
                        removedAt: null,
                    },
                });
                updated++;
                console.log(`  UPD ${cpfDigits} ${nome}`);
            } else {
                parliamentarian = await prisma.parliamentarian.create({
                    data: {
                        tenantId: tenant.id,
                        parliamentaryName: nome,
                        status: ParliamentarianStatus.ACTIVE,
                    },
                });
                await prisma.parlamentarianUser.create({
                    data: {
                        tenantId: tenant.id,
                        parliamentarianId: parliamentarian.id,
                        userId: user.id,
                        status: ParlamentarianUserStatus.ACTIVE,
                    },
                });
                created++;
                console.log(`  NEW ${cpfDigits} ${nome}`);
            }
        }
    }

    console.log(`\nConcluído: ${created} criados, ${updated} atualizados, ${skipped} ignorados.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
