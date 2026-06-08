import { StatusMateria } from '@prisma/client';

/** Status em que a matéria pode originar uma norma jurídica (task 28). */
export const MATERIA_ORIGEM_STATUSES_PERMITIDOS: readonly StatusMateria[] = [
    StatusMateria.APROVADA,
];

/** Status explicitamente bloqueados para geração de norma (task 28). */
export const MATERIA_ORIGEM_STATUSES_BLOQUEADOS: readonly StatusMateria[] = [
    StatusMateria.REJEITADA,
    StatusMateria.ARQUIVADA,
    StatusMateria.RETIRADA,
];

export function materiaOrigemPodeGerarNorma(status: StatusMateria): boolean {
    return MATERIA_ORIGEM_STATUSES_PERMITIDOS.includes(status);
}

export function assertMateriaOrigemPodeGerarNorma(materia: {
    status: StatusMateria;
}): void {
    if (!materiaOrigemPodeGerarNorma(materia.status)) {
        throw new Error('A matéria informada não pode gerar norma');
    }
}
