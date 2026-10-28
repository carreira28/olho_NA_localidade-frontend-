import { Navigate, Outlet } from "react-router-dom";
import { lerUtilizador } from "../utils/sessao.js";

export default function RotaProtegida({ tipo }) {
  const token = localStorage.getItem("token");
  const utilizador = lerUtilizador();

  if (!token || !utilizador) {
    return <Navigate to="/login" replace />;
  }

  if (tipo && utilizador.tipo !== tipo) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  return <Outlet />;
}
