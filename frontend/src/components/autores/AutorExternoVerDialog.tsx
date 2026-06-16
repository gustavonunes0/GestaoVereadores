import { useEffect, useState } from 'react';
import { VerDialog } from '../common/VerDialog';
import { autoresExternosApi, type AutorExterno } from '../../api/autores-externos.api';
import { useAppToast } from '../../hooks/useAppToast';

interface Props {
    autorId: string;
    onClose: () => void;
}

function Row({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex gap-2 mb-2">
            <span className="font-semibold w-8rem flex-shrink-0">{label}:</span>
            <span>{value}</span>
        </div>
    );
}

export function AutorExternoVerDialog({ autorId, onClose }: Props) {
    const { showApiError } = useAppToast();
    const [autor, setAutor] = useState<AutorExterno | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        autoresExternosApi.getById(autorId)
            .then(setAutor)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [autorId, showApiError]);

    return (
        <VerDialog visible title="Detalhes do Autor Externo" onClose={onClose}>
            {loading && <p className="text-color-secondary">Carregando…</p>}
            {autor && !loading && (
                <div>
                    <div className="mb-3">
                        <span className="text-lg font-bold">{autor.nome}</span>
                        <span className="ml-2 text-sm text-color-secondary surface-200 border-round px-2 py-1">
                            {autor.tipoAutor.nome}
                        </span>
                    </div>
                    <div className="border-top-1 surface-border pt-3">
                        <Row label="Cargo" value={autor.cargo} />
                        <Row label="Instituição" value={autor.instituicao} />
                        <Row label="Registro" value={autor.registro} />
                        <Row label="Partido" value={autor.partido} />
                        <Row label="UF" value={autor.uf} />
                        <Row label="CPF" value={autor.cpf} />
                        <Row label="E-mail" value={autor.email} />
                        <Row label="Telefone" value={autor.telefone} />
                    </div>
                </div>
            )}
        </VerDialog>
    );
}
