import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { LEGACY_REDIRECTS } from './app/navigation';
import { Layout } from './components/Layout';
import { MasterRoute } from './components/MasterRoute';
import { ProtectedRoute } from './components/ProtectedRoute';

const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const MateriasPage = React.lazy(() => import('./pages/MateriasPage').then((m) => ({ default: m.MateriasPage })));
const SessoesPage = React.lazy(() => import('./pages/SessoesPage').then((m) => ({ default: m.SessoesPage })));
const AgendaPage = React.lazy(() => import('./pages/AgendaPage').then((m) => ({ default: m.AgendaPage })));
const RelatoriosPage = React.lazy(() => import('./pages/RelatoriosPage').then((m) => ({ default: m.RelatoriosPage })));
const NormasPage = React.lazy(() => import('./pages/NormasPage').then((m) => ({ default: m.NormasPage })));
const AtosPage = React.lazy(() => import('./pages/AtosPage').then((m) => ({ default: m.AtosPage })));
const CamaraPage = React.lazy(() => import('./pages/CamaraPage').then((m) => ({ default: m.CamaraPage })));
const ParlamentaresPage = React.lazy(() => import('./pages/ParlamentaresPage').then((m) => ({ default: m.ParlamentaresPage })));
const ComissoesPage = React.lazy(() => import('./pages/ComissoesPage').then((m) => ({ default: m.ComissoesPage })));
const FrentesPage = React.lazy(() => import('./pages/FrentesPage').then((m) => ({ default: m.FrentesPage })));
const MesaDiretoraPage = React.lazy(() => import('./pages/MesaDiretoraPage').then((m) => ({ default: m.MesaDiretoraPage })));
const AutoresPage = React.lazy(() => import('./pages/AutoresPage').then((m) => ({ default: m.AutoresPage })));
const LegislaturasPage = React.lazy(() => import('./pages/LegislaturasPage').then((m) => ({ default: m.LegislaturasPage })));
const UsuariosPage = React.lazy(() => import('./pages/UsuariosPage').then((m) => ({ default: m.UsuariosPage })));

export default function App() {
    return (
        <Suspense
            fallback={
                <div className="flex align-items-center justify-content-center" style={{ height: '100vh' }}>
                    <ProgressSpinner />
                </div>
            }
        >
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="materias" element={<MateriasPage />} />
                        <Route path="sessoes" element={<SessoesPage />} />
                        <Route path="agenda" element={<AgendaPage />} />
                        <Route path="relatorios" element={<RelatoriosPage />} />
                        <Route path="normas-juridicas" element={<NormasPage />} />
                        <Route path="atos-administrativos" element={<AtosPage />} />

                        <Route path="camara" element={<CamaraPage />}>
                            <Route
                                index
                                element={<Navigate to="legislaturas" replace />}
                            />
                            <Route path="parlamentares" element={<ParlamentaresPage />} />
                            <Route path="comissoes" element={<ComissoesPage />} />
                            <Route path="frentes" element={<FrentesPage />} />
                            <Route path="mesa-diretora" element={<MesaDiretoraPage />} />
                            <Route path="autores" element={<AutoresPage />} />
                            <Route path="legislaturas" element={<LegislaturasPage />} />
                        </Route>

                        <Route element={<MasterRoute />}>
                            <Route path="usuarios" element={<UsuariosPage />} />
                        </Route>

                        {LEGACY_REDIRECTS.map(({ from, to }) => (
                            <Route
                                key={from}
                                path={from}
                                element={<Navigate to={to} replace />}
                            />
                        ))}
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}
