import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { sessoesApi } from '../api/legislative/sessoes.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { PageHeader } from '../components/PageHeader';
import { SessaoCreateDialog } from '../components/sessoes/SessaoCreateDialog';
import { SessaoEditDialog } from '../components/sessoes/SessaoEditDialog';
import {
    SessaoPesquisaFilters,
    type SessaoFiltrosForm,
} from '../components/sessoes/SessaoPesquisaFilters';
import { SessaoStatusBadge } from '../components/sessoes/SessaoStatusBadge';
import { sessaoLabel, type Sessao } from '../components/sessoes/sessao.types';
import { useLegislatura } from '../contexts/LegislaturaContext';
import type { LegislaturaRef } from '../contexts/LegislaturaContext';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import { buildSessaoDataRange } from '../utils/sessaoPesquisa';

const EMPTY_FILTROS: SessaoFiltrosForm = {
    legislaturaId: '',
    sessaoLegislativaId: '',
    ano: String(new Date().getFullYear()),
    mes: '',
    dia: '',
    dataDe: '',
    dataAte: '',
    tipoSessaoId: '',
    situacaoId: '',
};

function filtrosToQuery(
    f: SessaoFiltrosForm,
    page: number,
): Record<string, string | number | undefined> {
    const params: Record<string, string | number | undefined> = { limit: 20, page };
    if (f.legislaturaId) params.legislaturaId = f.legislaturaId;
    if (f.sessaoLegislativaId) params.sessaoLegislativaId = f.sessaoLegislativaId;
    if (f.tipoSessaoId) params.tipoSessaoId = f.tipoSessaoId;
    if (f.situacaoId) params.situacaoId = f.situacaoId;
    const range = buildSessaoDataRange({
        ano: f.ano ? Number(f.ano) : undefined,
        mes: f.mes ? Number(f.mes) : undefined,
        dia: f.dia ? Number(f.dia) : undefined,
        dataDe: f.dataDe || undefined,
        dataAte: f.dataAte || undefined,
    });
    if (range.dataInicioDe) params.dataInicioDe = range.dataInicioDe;
    if (range.dataInicioAte) params.dataInicioAte = range.dataInicioAte;
    return params;
}

export function SessoesPage() {
    const navigate = useNavigate();
    const { tiposSessao, situacoesSessao } = useDominios();
    const { canWrite, canEdit, canDelete } = usePermissions();
    const { showApiError } = useAppToast();
    const { legislaturas, refresh } = useLegislatura();

    const [legislaturasList, setLegislaturasList] = useState<LegislaturaRef[]>([]);
    const [items, setItems] = useState<Sessao[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<SessaoFiltrosForm>({ ...EMPTY_FILTROS });
    const [filtrosApplied, setFiltrosApplied] = useState<SessaoFiltrosForm>({
        ...EMPTY_FILTROS,
    });

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogEditar, setDialogEditar] = useState<Sessao | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Sessao | null>(null);

    useEffect(() => {
        void refresh().then(setLegislaturasList);
    }, [refresh]);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const r = await sessoesApi.list(filtrosToQuery(filtrosApplied, page));
            setItems(r.data as unknown as Sessao[]);
            setTotal(r.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtrosApplied, page, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    function aplicarFiltros() {
        setPage(1);
        setFiltrosApplied({ ...filtros });
    }

    function limparFiltros() {
        setFiltros({ ...EMPTY_FILTROS });
        setFiltrosApplied({ ...EMPTY_FILTROS });
        setPage(1);
    }

    const colunas = (
        <>
            <Column
                header="Data início"
                style={{ minWidth: '10rem' }}
                body={(s: Sessao) =>
                    new Date(s.dataInicio).toLocaleString('pt-BR')
                }
            />
            <Column
                header="Tipo"
                style={{ minWidth: '8rem' }}
                body={(s: Sessao) => s.tipo?.nome ?? '—'}
            />
            <Column
                header="Situação"
                style={{ width: '9rem' }}
                body={(s: Sessao) =>
                    s.statusSessao ? (
                        <SessaoStatusBadge status={s.statusSessao} />
                    ) : (
                        s.situacao?.nome ?? '—'
                    )
                }
            />
            <Column
                header="Legislatura"
                style={{ width: '7rem' }}
                body={(s: Sessao) =>
                    s.sessaoLegislativa?.legislatura?.numero
                        ? `${s.sessaoLegislativa.legislatura.numero}ª`
                        : '—'
                }
            />
            <Column
                header="Pauta"
                style={{ width: '5rem' }}
                body={(s: Sessao) => s.pautaItens?.length ?? 0}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.sessoes}
                title="Sessões plenárias"
                actions={
                    canWrite ? (
                        <Button
                            label="Nova sessão"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) : undefined
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout
                    onBuscar={aplicarFiltros}
                    onLimpar={limparFiltros}
                    loading={loading}
                >
                    <SessaoPesquisaFilters
                        embedded
                        filtros={filtros}
                        onChange={(patch) =>
                            setFiltros((f) => ({ ...f, ...patch }))
                        }
                        legislaturas={
                            legislaturasList.length ? legislaturasList : legislaturas
                        }
                        tiposSessao={tiposSessao}
                        situacoesSessao={situacoesSessao}
                        onPesquisar={aplicarFiltros}
                        onClear={limparFiltros}
                        hasFilters={
                            JSON.stringify(filtros) !== JSON.stringify(EMPTY_FILTROS)
                        }
                        resultCount={total}
                    />
                </FiltroLayout>
            </section>

            <section aria-label="Lista de sessões plenárias" className="pt-3">
                <DataTableLayout<Sessao>
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={colunas}
                    canWrite={canEdit}
                    onVer={(s) => navigate(`/sessoes/${s.id}`)}
                    onEditar={canEdit ? (s) => setDialogEditar(s) : undefined}
                    onDeletar={canDelete ? (s) => setDialogDeletar(s) : undefined}
                />
            </section>

            {dialogCriar && (
                <SessaoCreateDialog
                    sessaoLegislativaId={filtrosApplied.sessaoLegislativaId || undefined}
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}


            {dialogEditar && (
                <SessaoEditDialog
                    sessao={dialogEditar}
                    onClose={() => setDialogEditar(null)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir sessão plenária"
                    message={`Deseja excluir a sessão "${sessaoLabel(dialogDeletar)}"? Esta ação não pode ser desfeita.`}
                    onConfirm={async () => {
                        await sessoesApi.remove(dialogDeletar.id);
                        void buscar();
                    }}
                    onClose={() => setDialogDeletar(null)}
                />
            )}
        </main>
    );
}
