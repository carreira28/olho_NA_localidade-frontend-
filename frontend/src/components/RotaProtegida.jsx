import { Navigate, Outlet } from "react-router-dom";
import { lerUtilizador, obterPerfil } from "../utils/sessao.js";

export default function RotaProtegida({ perfil }) {
  const token = localStorage.getItem("token");
  const utilizador = lerUtilizador();

  if (!token || !utilizador) {
    return <Navigate to="/login" replace />;
  }

  if (perfil && obterPerfil(utilizador) !== perfil) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  return <Outlet />;
}
