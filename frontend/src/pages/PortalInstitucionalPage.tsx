import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { TabPanel, TabView } from 'primereact/tabview';
import { MODULE_ICONS } from '../app/navigation';
import {
    portalConfigApi,
    type PortalConfig,
    type PortalSettings,
} from '../api/portal/portal-config.api';
import { PageHeader } from '../components/PageHeader';
import { useAppToast } from '../hooks/useAppToast';

const SECOES_LABELS: Record<keyof PortalSettings['secoes'], string> = {
    vereadores: 'Vereadores',
    mesaDiretora: 'Mesa Diretora',
    comissoes: 'Comissões',
    agenda: 'Agenda Legislativa',
    normas: 'Normas Jurídicas',
    materias: 'Matérias Legislativas',
    transmissao: 'Transmissão ao vivo',
};

export function PortalInstitucionalPage() {
    const { showApiError, showSuccess } = useAppToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<PortalConfig | null>(null);
    const [portalSlug, setPortalSlug] = useState('');
    const [portal, setPortal] = useState<PortalSettings | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await portalConfigApi.get();
            setConfig(data);
            setPortalSlug(data.portalSlug ?? '');
            setPortal(data.portal);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [showApiError]);

    useEffect(() => {
        void load();
    }, [load]);

    function updatePortal(patch: Partial<PortalSettings>) {
        setPortal((prev) => (prev ? { ...prev, ...patch } : prev));
    }

    function updateSecao(
        key: keyof PortalSettings['secoes'],
        value: boolean,
    ) {
        setPortal((prev) =>
            prev
                ? {
                      ...prev,
                      secoes: { ...prev.secoes, [key]: value },
                  }
                : prev,
        );
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!portal) return;
        setSaving(true);
        try {
            const updated = await portalConfigApi.update({
                portalSlug: portalSlug.trim() || null,
                portal,
            });
            setConfig(updated);
            setPortalSlug(updated.portalSlug ?? '');
            setPortal(updated.portal);
            showSuccess('Configuração do portal salva.');
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const previewUrl = config?.previewUrl;

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.camara}
                title="Portal Institucional"
                subtitle="Configure o site público da câmara para cidadãos."
            />

            {loading || !portal ? (
                <p className="text-color-secondary pt-4">Carregando…</p>
            ) : (
                <form onSubmit={handleSubmit} className="pt-4">
                    <TabView>
                        <TabPanel header="Geral">
                            <div className="sigl-dialog-grid sigl-dialog-grid-2 pt-3">
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="portal-slug">Slug público</label>
                                    <input
                                        id="portal-slug"
                                        value={portalSlug}
                                        onChange={(e) =>
                                            setPortalSlug(e.target.value)
                                        }
                                        placeholder="camara-municipio"
                                    />
                                    <small className="text-color-secondary">
                                        URL: /portal/{portalSlug || 'seu-slug'}
                                    </small>
                                </div>
                                <div className="sigl-filtro-campo flex align-items-center gap-2">
                                    <label htmlFor="portal-ativo">Portal ativo</label>
                                    <InputSwitch
                                        inputId="portal-ativo"
                                        checked={portal.ativo}
                                        onChange={(e) =>
                                            updatePortal({
                                                ativo: e.value ?? false,
                                            })
                                        }
                                    />
                                </div>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="portal-titulo">Título</label>
                                    <input
                                        id="portal-titulo"
                                        value={portal.titulo}
                                        onChange={(e) =>
                                            updatePortal({ titulo: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="portal-subtitulo">Subtítulo</label>
                                    <input
                                        id="portal-subtitulo"
                                        value={portal.subtitulo ?? ''}
                                        onChange={(e) =>
                                            updatePortal({
                                                subtitulo: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="sigl-filtro-campo sigl-dialog-grid-full">
                                    <label htmlFor="portal-sobre">Sobre a câmara</label>
                                    <textarea
                                        id="portal-sobre"
                                        rows={4}
                                        value={portal.sobre ?? ''}
                                        onChange={(e) =>
                                            updatePortal({ sobre: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel header="Contato">
                            <div className="sigl-dialog-grid sigl-dialog-grid-2 pt-3">
                                <div className="sigl-filtro-campo sigl-dialog-grid-full">
                                    <label htmlFor="portal-endereco">Endereço</label>
                                    <input
                                        id="portal-endereco"
                                        value={portal.endereco ?? ''}
                                        onChange={(e) =>
                                            updatePortal({ endereco: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="portal-telefone">Telefone</label>
                                    <input
                                        id="portal-telefone"
                                        value={portal.telefone ?? ''}
                                        onChange={(e) =>
                                            updatePortal({ telefone: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="portal-email">E-mail</label>
                                    <input
                                        id="portal-email"
                                        type="email"
                                        value={portal.email ?? ''}
                                        onChange={(e) =>
                                            updatePortal({ email: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel header="Seções">
                            <div className="flex flex-column gap-3 pt-3">
                                {(
                                    Object.keys(SECOES_LABELS) as Array<
                                        keyof PortalSettings['secoes']
                                    >
                                ).map((key) => (
                                    <div
                                        key={key}
                                        className="flex align-items-center justify-content-between"
                                    >
                                        <span>{SECOES_LABELS[key]}</span>
                                        <InputSwitch
                                            checked={portal.secoes[key]}
                                            onChange={(e) =>
                                                updateSecao(key, e.value ?? false)
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </TabPanel>

                        <TabPanel header="Preview">
                            <div className="pt-3 flex flex-column gap-3">
                                {previewUrl ? (
                                    <>
                                        <p className="m-0">
                                            <a
                                                href={previewUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {previewUrl}
                                            </a>
                                        </p>
                                        <Button
                                            type="button"
                                            label="Abrir portal"
                                            icon="pi pi-external-link"
                                            onClick={() =>
                                                window.open(previewUrl, '_blank')
                                            }
                                        />
                                    </>
                                ) : (
                                    <p className="text-color-secondary m-0">
                                        Defina um slug e salve para gerar o link
                                        público.
                                    </p>
                                )}
                            </div>
                        </TabPanel>
                    </TabView>

                    <div className="flex justify-content-end pt-4">
                        <Button
                            type="submit"
                            label="Salvar configuração"
                            icon="pi pi-save"
                            loading={saving}
                        />
                    </div>
                </form>
            )}
        </main>
    );
}
