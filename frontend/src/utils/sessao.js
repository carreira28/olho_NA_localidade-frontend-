export function lerUtilizador() {
  try {
    return JSON.parse(localStorage.getItem("utilizador")) ?? {};
  } catch {
    return {};
  }
}

export function terminarSessao(navigate) {
  localStorage.removeItem("token");
  localStorage.removeItem("perfil");
  localStorage.removeItem("utilizador");
  navigate("/login");
}