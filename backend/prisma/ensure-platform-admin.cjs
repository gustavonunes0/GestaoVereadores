/**
 * Garante o super admin da plataforma (isPlatformAdmin).
 * Usado no deploy Vercel e no start Docker — o seed completo NÃO roda na Vercel.
 *
 * Env opcional:
 *   PLATFORM_ADMIN_EMAIL (default: superadmin@sigl.app)
 *   PLATFORM_ADMIN_CPF (default: 00000000000)
 *   PLATFORM_ADMIN_PASSWORD (default: platform123) — só na criação
 *   PLATFORM_ADMIN_RESET_PASSWORD=1 — força reset da senha
 */
const { randomBytes, scrypt: scryptCallback } = require('crypto');
const { promisify } = require('util');
const { PrismaClient } = require('@prisma/client');

const scrypt = promisify(scryptCallback);

async function hashPassword(value) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scrypt(value, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
    if (!process.env.DATABASE_URL?.trim()) {
        console.warn(
            '[ensure-platform-admin] DATABASE_URL ausente — ignorado.',
        );
        return;
    }

    const email = (
        process.env.PLATFORM_ADMIN_EMAIL || 'superadmin@sigl.app'
    )
        .trim()
        .toLowerCase();
    const cpf = (process.env.PLATFORM_ADMIN_CPF || '00000000000').replace(
        /\D/g,
        '',
    );
    const password = process.env.PLATFORM_ADMIN_PASSWORD || 'platform123';
    const resetPassword = process.env.PLATFORM_ADMIN_RESET_PASSWORD === '1';

    const prisma = new PrismaClient();
    try {
        const byEmail = await prisma.user.findFirst({
            where: { email, isRemoved: false },
        });
        const byCpf = cpf
            ? await prisma.user.findFirst({
                  where: { cpf, isRemoved: false },
              })
            : null;

        const existing = byEmail ?? byCpf;

        if (existing) {
            const data = {
                email,
                cpf,
                isPlatformAdmin: true,
                isRemoved: false,
                firstName: existing.firstName || 'Super',
                lastName: existing.lastName || 'Admin',
            };
            // Define senha ao promover pela 1ª vez, se pedido reset, ou se hash ausente
            if (
                resetPassword ||
                !existing.isPlatformAdmin ||
                !existing.passwordHash
            ) {
                data.passwordHash = await hashPassword(password);
            }
            await prisma.user.update({
                where: { id: existing.id },
                data,
            });
            console.log(
                `[ensure-platform-admin] Super admin atualizado: ${email} (CPF ${cpf})`,
            );
            return;
        }

        await prisma.user.create({
            data: {
                firstName: 'Super',
                lastName: 'Admin',
                email,
                cpf,
                passwordHash: await hashPassword(password),
                isPlatformAdmin: true,
            },
        });
        console.log(
            `[ensure-platform-admin] Super admin criado: ${email} / ${password} (CPF ${cpf})`,
        );
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((err) => {
    console.error('[ensure-platform-admin] Falha:', err);
    process.exit(1);
});
