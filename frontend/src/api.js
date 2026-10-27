const BASE = import.meta.env.VITE_API_URL || "http://localhost:4242";

export async function api(caminho, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");

  const resposta = await fetch(`${BASE}${caminho}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.message || dados.erro || "Ocorreu um erro. Tente novamente.");
  }
  return dados;
}