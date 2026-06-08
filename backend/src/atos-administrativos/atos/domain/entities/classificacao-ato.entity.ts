export type ClassificacaoAtoPrimitives = {
    id: string;
    nome: string;
};

export class ClassificacaoAtoEntity {
    private constructor(private readonly props: ClassificacaoAtoPrimitives) {}

    static restore(props: ClassificacaoAtoPrimitives) {
        return new ClassificacaoAtoEntity(props);
    }

    get id() {
        return this.props.id;
    }

    get nome() {
        return this.props.nome;
    }

    toPrimitives(): ClassificacaoAtoPrimitives {
        return { ...this.props };
    }
}
