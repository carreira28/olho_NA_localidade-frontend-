const BASE = import.meta.env.VITE_API_URL || "http://localhost:4242";

export async function api(caminho, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const eFormData = body instanceof FormData;

  const resposta = await fetch(`${BASE}${caminho}`, {
    method,
    headers: {
      ...(!eFormData && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? (eFormData ? body : JSON.stringify(body)) : undefined,
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(dados.message || dados.erro || "Ocorreu um erro. Tente novamente.");
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}