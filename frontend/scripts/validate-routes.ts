/**
 * Valida paridade entre menu lateral e rotas registradas no router.
 * Executar: npx tsx scripts/validate-routes.ts
 */
import {
    PARLAMENTAR_NAV_ITEMS,
    STAFF_NAV_GROUPS,
} from '../src/app/navigation.ts';
import {
    REGISTERED_PARLAMENTAR_PATHS,
    REGISTERED_STAFF_PATHS,
    collectNavRoutes,
    validateNavRoutes,
} from '../src/app/routes/route-registry.ts';

const staffNavRoutes = collectNavRoutes(STAFF_NAV_GROUPS);
const parlamentarNavRoutes = collectNavRoutes(PARLAMENTAR_NAV_ITEMS);

const errors = [
    ...validateNavRoutes(staffNavRoutes, REGISTERED_STAFF_PATHS),
    ...validateNavRoutes(parlamentarNavRoutes, REGISTERED_PARLAMENTAR_PATHS),
];

if (errors.length > 0) {
    console.error('Falhas na validação de rotas:\n');
    for (const error of errors) {
        console.error(`  - ${error}`);
    }
    process.exit(1);
}

console.log('Rotas OK');
console.log(`  Staff: ${staffNavRoutes.length} itens de menu × ${REGISTERED_STAFF_PATHS.length} rotas registradas`);
console.log(`  Parlamentar: ${parlamentarNavRoutes.length} itens de menu × ${REGISTERED_PARLAMENTAR_PATHS.length} rotas registradas`);
