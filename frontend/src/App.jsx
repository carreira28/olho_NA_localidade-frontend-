import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Registo from "./pages/Registo.jsx";
import OcorrenciasCidadao from "./pages/OcorrenciasCidadao.jsx";
import ReportarOcorrencia from "./pages/Reportar.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";
import SemPermissoes from "./pages/SemPermissoes.jsx";
import DetalheOcorrencia from "./pages/DetalheOcorrencia.jsx";
import OcorrenciasAdmin from "./pages/OcorrenciasAdmin.jsx";
import DetalheOcorrenciaManagement from "./pages/DetalheOcorrenciaManagement.jsx";
import OcorrenciasFuncionario from "./pages/OcorrenciasFuncionario.jsx";
import DetalheOcorrenciaFuncionario from "./pages/DetalheOcorrenciaFuncionario.jsx";
import CategoriasAdmin from "./pages/CategoriasAdmin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registo" element={<Registo />} />
      <Route path="/nao-autorizado" element={<SemPermissoes />} />

      <Route element={<RotaProtegida tipo="cidadao" />}>
        <Route path="/OcorrenciasCidadao" element={<OcorrenciasCidadao />} />
        <Route path="/reportar" element={<ReportarOcorrencia />} />
        <Route path="/ocorrencias/:id" element={<DetalheOcorrencia />} />
      </Route>

      <Route>
        <Route element={<RotaProtegida tipo="administrador" />} />
        <Route path="/admin/Ocorrencias" element={<OcorrenciasAdmin />} />
        <Route
          path="/admin/Ocorrencia/:id"
          element={<DetalheOcorrenciaManagement />}
        />
        <Route path="/admin/categorias" element={<CategoriasAdmin />} />
      </Route>

      <Route>
        <Route element={<RotaProtegida tipo="funcionario" />} />
        <Route
          path="/funcionario/ocorrencias"
          element={<OcorrenciasFuncionario />}
        />
        <Route
          path="/funcionario/Ocorrencia/:id"
          element={<DetalheOcorrenciaFuncionario />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
