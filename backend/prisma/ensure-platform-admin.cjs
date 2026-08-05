/**
 * Upsert do super admin CâmaraGest (uso em container / ops).
 * Env: PLATFORM_ADMIN_EMAIL, PLATFORM_ADMIN_PASSWORD
 */
const { PrismaClient } = require('@prisma/client');
const { randomBytes, scrypt: scryptCallback } = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(scryptCallback);
const prisma = new PrismaClient();

async function hashPassword(value) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(value, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  const email = (process.env.PLATFORM_ADMIN_EMAIL || 'gustavonoroes@outlook.com')
    .trim()
    .toLowerCase();
  const password = process.env.PLATFORM_ADMIN_PASSWORD || 'Gnb.02062003';
  const passwordHash = await hashPassword(password);

  await prisma.user.updateMany({
    where: { email: 'superadmin@sigl.app' },
    data: { isPlatformAdmin: false, isRemoved: true },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      firstName: 'Gustavo',
      lastName: 'Noroes',
      passwordHash,
      isPlatformAdmin: true,
      isRemoved: false,
    },
    create: {
      firstName: 'Gustavo',
      lastName: 'Noroes',
      email,
      passwordHash,
      isPlatformAdmin: true,
    },
  });

  const hosts = (process.env.TENANT_SEED_HOSTS || 'baturite.stellarsolucoes.com.br')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  const tenant = await prisma.tenant.findFirst({
    where: { isRemoved: false },
    orderBy: { createdAt: 'asc' },
  });

  if (tenant) {
    for (let i = 0; i < hosts.length; i++) {
      const host = hosts[i];
      await prisma.tenantDomain.upsert({
        where: { host },
        update: { tenantId: tenant.id, primario: i === 0 },
        create: { tenantId: tenant.id, host, primario: i === 0 },
      });
    }
  }

  console.log(`OK platform admin: ${user.email} (id=${user.id})`);
  if (hosts.length) console.log(`OK tenant hosts: ${hosts.join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
