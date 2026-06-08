import { Navigate, Route, Routes } from 'react-router-dom';
import { LEGACY_REDIRECTS } from './app/navigation';
import { Layout } from './components/Layout';
import { MasterRoute } from './components/MasterRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AgendaPage } from './pages/AgendaPage';
import { AtosPage } from './pages/AtosPage';
import { AutoresPage } from './pages/AutoresPage';
import { CamaraPage } from './pages/CamaraPage';
import { ComissoesPage } from './pages/ComissoesPage';
import { DashboardPage } from './pages/DashboardPage';
import { FrentesPage } from './pages/FrentesPage';
import { LegislaturasPage } from './pages/LegislaturasPage';
import { LoginPage } from './pages/LoginPage';
import { MateriasPage } from './pages/MateriasPage';
import { MesaDiretoraPage } from './pages/MesaDiretoraPage';
import { NormasPage } from './pages/NormasPage';
import { ParlamentaresPage } from './pages/ParlamentaresPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { SessoesPage } from './pages/SessoesPage';
import { UsuariosPage } from './pages/UsuariosPage';

export default function App() {
    return (
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
                        <Route
                            path="parlamentares"
                            element={<ParlamentaresPage />}
                        />
                        <Route path="comissoes" element={<ComissoesPage />} />
                        <Route path="frentes" element={<FrentesPage />} />
                        <Route
                            path="mesa-diretora"
                            element={<MesaDiretoraPage />}
                        />
                        <Route path="autores" element={<AutoresPage />} />
                        <Route
                            path="legislaturas"
                            element={<LegislaturasPage />}
                        />
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
    );
}
