import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerDialog } from '../common/VerDialog';
import { autoresExternosApi, type AutorExterno } from '../../api/autores-externos.api';
import { ROUTES } from '../../app/navigation';
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

type MateriaRef = { id: string; identificacao: string; status: string };

export function AutorExternoVerDialog({ autorId, onClose }: Props) {
    const { showApiError } = useAppToast();
    const navigate = useNavigate();
    const [autor, setAutor] = useState<AutorExterno | null>(null);
    const [loading, setLoading] = useState(true);
    const [materias, setMaterias] = useState<MateriaRef[]>([]);

    useEffect(() => {
        setLoading(true);
        autoresExternosApi.getById(autorId)
            .then(setAutor)
            .catch(showApiError)
            .finally(() => setLoading(false));

        autoresExternosApi.listMaterias(autorId)
            .then((r) => setMaterias(r.data))
            .catch(() => setMaterias([]));
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

                    {materias.length > 0 && (
                        <div className="border-top-1 surface-border pt-3 mt-3">
                            <p className="text-xs text-color-secondary font-semibold mb-2">
                                Matérias como autor ({materias.length})
                            </p>
                            <ul className="m-0 p-0 list-none">
                                {materias.map((m) => (
                                    <li key={m.id} className="mb-1">
                                        <button
                                            type="button"
                                            className="p-button-link p-0 text-left text-primary"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                                            onClick={() => {
                                                onClose();
                                                navigate(`${ROUTES.materias}?autorId=${autorId}`);
                                            }}
                                            aria-label={`Ver matéria ${m.identificacao}`}
                                        >
                                            {m.identificacao}
                                        </button>
                                        <span className="text-xs text-color-secondary ml-2">{m.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </VerDialog>
    );
}
