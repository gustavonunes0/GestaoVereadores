import { BadRequestException, ForbiddenException } from '@nestjs/common';

export const MSG_PARLAMENTAR_INATIVO_CRIAR_MATERIA =
    'Parlamentar inativo não pode criar matérias.';
export const MSG_PARLAMENTAR_INATIVO_AUTORIA =
    'Parlamentar inativo não pode ser autor ou coautor de matérias.';

/** Sessão do próprio vereador: ele seria o autor da matéria. */
export function assertVereadorPodeCriarMateria(inativo: boolean): void {
    if (inativo) {
        throw new ForbiddenException(MSG_PARLAMENTAR_INATIVO_CRIAR_MATERIA);
    }
}

export function assertSemAutoresInativos(idsInativos: string[]): void {
    if (idsInativos.length > 0) {
        throw new BadRequestException(MSG_PARLAMENTAR_INATIVO_AUTORIA);
    }
}
