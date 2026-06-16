import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '../../contexts/AuthContext';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { useAppToast } from '../../hooks/useAppToast';

interface ParlamentarDetalhes {
    id: string;
    nomeParlamentar: string;
    nomeCompleto: string;
    partido?: { sigla: string; nome: string };
    foto?: string;
    biografia?: string;
    email?: string;
    gabinete?: string;
}

export function ParlamentarPerfilPage() {
    const { user } = useAuth();
    const { showApiError } = useAppToast();
    const [perfil, setPerfil] = useState<ParlamentarDetalhes | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.parliamentarianId) {
            setLoading(false);
            return;
        }
        parlamentaresApi
            .getById(user.parliamentarianId)
            .then((p) => setPerfil(p as unknown as ParlamentarDetalhes))
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [user?.parliamentarianId, showApiError]);

    if (loading) {
        return (
            <div className="flex justify-content-center p-5">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <main>
            <Card className="mb-3">
                <div className="flex align-items-center gap-4 mb-4">
                    {perfil?.foto ? (
                        <Avatar image={perfil.foto} size="xlarge" shape="circle" />
                    ) : (
                        <Avatar icon="pi pi-user" size="xlarge" shape="circle" />
                    )}
                    <div>
                        <h2 className="m-0">{perfil?.nomeParlamentar ?? user?.parliamentaryName ?? user?.name}</h2>
                        <p className="text-color-secondary mt-1 mb-0">{perfil?.nomeCompleto}</p>
                        {perfil?.partido && (
                            <Tag value={perfil.partido.sigla} severity="info" className="mt-2" />
                        )}
                    </div>
                </div>

                {perfil?.biografia && (
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-color-secondary mb-1">Biografia</h3>
                        <p>{perfil.biografia}</p>
                    </div>
                )}

                <div className="grid">
                    {perfil?.email && (
                        <div className="col-12 md:col-6">
                            <span className="font-semibold">E-mail: </span>
                            <span>{perfil.email}</span>
                        </div>
                    )}
                    {perfil?.gabinete && (
                        <div className="col-12 md:col-6">
                            <span className="font-semibold">Gabinete: </span>
                            <span>{perfil.gabinete}</span>
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid">
                <div className="col-12 md:col-4">
                    <Card title="Minhas matérias">
                        <p className="text-color-secondary">Acesse "Minhas Matérias" para ver detalhes.</p>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card title="Próximas sessões">
                        <p className="text-color-secondary">Calendário legislativo em breve.</p>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card title="Comissões">
                        <p className="text-color-secondary">Acesse "Comissões" para ver sua participação.</p>
                    </Card>
                </div>
            </div>
        </main>
    );
}
