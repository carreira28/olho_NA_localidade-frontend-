export function lerUtilizador() {
  try {
    const guardado = localStorage.getItem("utilizador");
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

export function obterPerfil(utilizador) {
  if (!utilizador) return null;
  if (utilizador.tipo === "cidadao") return "cidadao";
  if (utilizador.perfil === "ADMINISTRADOR") return "administrador";
  if (utilizador.perfil === "FUNCIONARIO MUNICIPAL") return "funcionario";
  return null;
}

export function terminarSessao(navigate) {
  localStorage.removeItem("token");
  localStorage.removeItem("perfil");
  localStorage.removeItem("utilizador");
  navigate("/login");
}
