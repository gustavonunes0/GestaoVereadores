export type TipoAtoPrimitives = {
    id: string;
    nome: string;
};

export class TipoAtoEntity {
    private constructor(private readonly props: TipoAtoPrimitives) {}

    static restore(props: TipoAtoPrimitives) {
        return new TipoAtoEntity(props);
    }

    get id() {
        return this.props.id;
    }

    get nome() {
        return this.props.nome;
    }

    toPrimitives(): TipoAtoPrimitives {
        return { ...this.props };
    }
}
