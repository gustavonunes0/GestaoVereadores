import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

await prisma.tenant.update({
    where: { id: DEMO_TENANT_ID },
    data: {
        portalSlug: 'camara-demo',
        settings: {
            portal: {
                ativo: true,
                titulo: 'Câmara Municipal de Teste',
                secoes: {
                    vereadores: true,
                    mesaDiretora: true,
                    comissoes: true,
                    agenda: true,
                    normas: true,
                    materias: false,
                    transmissao: true,
                },
            },
        },
    },
});

console.log('Tenant demo: portalSlug=camara-demo');
await prisma.$disconnect();
