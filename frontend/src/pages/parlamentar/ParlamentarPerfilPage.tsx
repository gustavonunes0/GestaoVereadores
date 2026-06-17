import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { parlamentaresApi, type ParliamentarianProfile } from '../../api/legislative/parlamentares.api';
import { useAppToast } from '../../hooks/useAppToast';

export function ParlamentarPerfilPage() {
    const { showApiError } = useAppToast();
    const [perfil, setPerfil] = useState<ParliamentarianProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        parlamentaresApi
            .meuPerfil()
            .then(setPerfil)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [showApiError]);

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
                    {perfil?.photoUrl ? (
                        <Avatar image={perfil.photoUrl} size="xlarge" shape="circle" />
                    ) : (
                        <Avatar
                            label={perfil?.parliamentaryName?.charAt(0).toUpperCase() ?? '?'}
                            size="xlarge"
                            shape="circle"
                        />
                    )}
                    <div>
                        <h2 className="m-0">{perfil?.parliamentaryName}</h2>
                        {perfil?.nomeCompleto && (
                            <p className="text-color-secondary mt-1 mb-0">{perfil.nomeCompleto}</p>
                        )}
                        {perfil?.partido && (
                            <Tag value={perfil.partido.sigla} severity="info" className="mt-2" />
                        )}
                    </div>
                </div>

                {perfil?.biography && (
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-color-secondary mb-1">Biografia</h3>
                        <p>{perfil.biography}</p>
                    </div>
                )}

                <div className="grid">
                    {perfil?.email && (
                        <div className="col-12 md:col-6">
                            <span className="font-semibold">E-mail: </span>
                            <span>{perfil.email}</span>
                        </div>
                    )}
                    {perfil?.officeNumber && (
                        <div className="col-12 md:col-6">
                            <span className="font-semibold">Gabinete: </span>
                            <span>{perfil.officeNumber}</span>
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid">
                <div className="col-12 md:col-4">
                    <Card title="Minhas matérias">
                        <p className="text-color-secondary">Acesse &quot;Minhas Matérias&quot; para ver detalhes.</p>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card title="Próximas sessões">
                        <p className="text-color-secondary">Calendário legislativo em breve.</p>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card title="Comissões">
                        <p className="text-color-secondary">
                            {perfil?.comissoes.length
                                ? `${perfil.comissoes.length} comissão(ões) ativa(s)`
                                : 'Acesse "Comissões" para ver sua participação.'}
                        </p>
                    </Card>
                </div>
            </div>
        </main>
    );
}
