/** idNegocio global do tipo "Parlamentar" (seed). */
export const PARLAMENTAR_TIPO_AUTOR_ID_NEGOCIO = 1;

export type TipoAutorRef = {
    idNegocio: number | null;
    nome: string;
};

export class MatterAuthorOptionsDomainService {
    isParlamentarTipoAutor(tipo: TipoAutorRef): boolean {
        if (tipo.idNegocio === PARLAMENTAR_TIPO_AUTOR_ID_NEGOCIO) {
            return true;
        }
        return tipo.nome.trim().toLowerCase() === 'parlamentar';
    }
}
