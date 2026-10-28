import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Registo from "./pages/Registo.jsx";
import OcorrenciasCidadao from "./pages/OcorrenciasCidadao.jsx";
import ReportarOcorrencia from "./pages/Reportar.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";
import SemPermissoes from "./pages/SemPermissoes.jsx";

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
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
