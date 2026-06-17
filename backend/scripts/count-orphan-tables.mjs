import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tables = [
    ['courses', 'SELECT COUNT(*)::int AS c FROM courses'],
    ['Comissao', 'SELECT COUNT(*)::int AS c FROM "Comissao"'],
    ['FrenteParlamentar', 'SELECT COUNT(*)::int AS c FROM "FrenteParlamentar"'],
    ['MesaDiretora', 'SELECT COUNT(*)::int AS c FROM "MesaDiretora"'],
    ['MateriaCoautor', 'SELECT COUNT(*)::int AS c FROM "MateriaCoautor"'],
    ['Parlamentar', 'SELECT COUNT(*)::int AS c FROM "Parlamentar"'],
    ['Parliamentarian', 'SELECT COUNT(*)::int AS c FROM parliamentarians'],
    ['guest_users', 'SELECT COUNT(*)::int AS c FROM guest_users'],
    ['autores_externos', 'SELECT COUNT(*)::int AS c FROM autores_externos'],
];

for (const [name, sql] of tables) {
    try {
        const rows = await prisma.$queryRawUnsafe(sql);
        console.log(`${name}: ${rows[0].c}`);
    } catch (e) {
        console.log(`${name}: ERROR ${String(e).split('\n')[0]}`);
    }
}

await prisma.$disconnect();
