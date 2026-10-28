export function lerUtilizador() {
  try {
    const guardado = localStorage.getItem("utilizador"); // usa a chave que já tens
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

export function terminarSessao(navigate) {
  localStorage.removeItem("token");
  localStorage.removeItem("perfil");
  localStorage.removeItem("utilizador");
  navigate("/login");
}
