import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Registo from "./pages/Registo.jsx";
import OcorrenciasCidadao from "./pages/OcorrenciasCidadao.jsx";
import ReportarOcorrencia from "./pages/Reportar.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registo" element={<Registo />} />
      <Route path="/OcorrenciasCidadao" element={<OcorrenciasCidadao />} />
      <Route path="/reportar" element={<ReportarOcorrencia />} />
    </Routes>
  );
}
