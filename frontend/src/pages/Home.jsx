import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";
import BarraLateral from "../components/BarraLateral.jsx";
import BarraTopo from "../components/BarraTopo.jsx";
import Chip from "../components/Chip.jsx";
import { lerUtilizador, terminarSessao } from "../utils/sessao.js";

/* ---------- Funções auxiliares ---------- */
function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function primeiroTexto(obj) {
  if (!obj || typeof obj !== "object") return "";
  for (const [chave, valor] of Object.entries(obj)) {
    if (typeof valor === "string" && !chave.startsWith("id") && !chave.includes("data")) {
      return valor;
    }
  }
  return "";
}

function estadoPor(ocorrencia, palavra) {
  const entrada = (ocorrencia.historicoEstados ?? []).find((h) =>
    normalizar(primeiroTexto(h.estado?.tipo)).includes(palavra)
  );
  return entrada ? primeiroTexto(entrada.estado) : "";
}

function formatarData(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const mes = d.toLocaleDateString("pt-PT", { month: "short" }).replace(".", "");
  return `${String(d.getDate()).padStart(2, "0")} ${mes}. ${d.getFullYear()}`;
}

function prepararLinhas(ocorrencias) {
  return ocorrencias.map((o) => ({
    id: o.id_problema ?? o.id,
    titulo: o.titulo ?? o.nome ?? o.descricao ?? "Sem título",
    categoria: primeiroTexto(o.categoria) || "—",
    data: formatarData(o.data_criacao),
    validacao: estadoPor(o, "valid") || "—",
    resolucao: estadoPor(o, "resol") || "Não iniciada",
  }));
}

function PaginaCidadao() {
  const navigate = useNavigate();
  const utilizador = lerUtilizador();

  const [linhas, setLinhas] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroValidacao, setFiltroValidacao] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    api("/api/problemas")
      .then((dados) => {
        console.log("Problemas recebidos:", dados);
        setLinhas(prepararLinhas(dados));
      })
      .catch((err) => {
        if (err.status === 401) {
          terminarSessao(navigate); // sessão expirada
          return;
        }
        setErro(err.message);
      })
      .finally(() => setACarregar(false));
  }, [navigate]);

  const validacoes = [...new Set(linhas.map((l) => l.validacao))];
  const categorias = [...new Set(linhas.map((l) => l.categoria))];

  const visiveis = linhas.filter(
    (l) =>
      (!filtroValidacao || l.validacao === filtroValidacao) &&
      (!filtroCategoria || l.categoria === filtroCategoria)
  );

  return (
    <div className="painel">
      <BarraLateral />

      <div className="painel-principal">
        <BarraTopo />

        <main className="painel-conteudo">
          <div className="painel-topo">
            <div>
              <h2>As minhas ocorrências</h2>
              <p className="painel-sub">
                Olá, {utilizador.nome}. Acompanhe as suas ocorrências e
                contribua para um concelho melhor.
              </p>
            </div>
            <button className="btn-auth btn-pequeno">+ Reportar ocorrência</button>
          </div>

          <div className="cartao">
            <h3 className="cartao-titulo">Os seus pedidos</h3>

            <div className="filtros">
              <div>
                <label htmlFor="f-validacao">Validação</label>
                <select
                  id="f-validacao"
                  value={filtroValidacao}
                  onChange={(e) => setFiltroValidacao(e.target.value)}
                >
                  <option value="">Todos os estados</option>
                  {validacoes.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="f-categoria">Categoria</label>
                <select
                  id="f-categoria"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {aCarregar && <p className="mensagem-tabela">A carregar...</p>}
            {erro && <p className="auth-erro" role="alert">{erro}</p>}
            {!aCarregar && !erro && visiveis.length === 0 && (
              <p className="mensagem-tabela">Não há ocorrências para mostrar.</p>
            )}

            {visiveis.length > 0 && (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Ocorrências</th>
                    <th>Validação</th>
                    <th>Resolução</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.titulo}</strong>
                        <div className="sub-linha">{l.categoria}</div>
                        <div className="sub-linha">{l.data}</div>
                      </td>
                      <td>
                        <div className="estado-celula">
                          <small>Validação</small>
                          <Chip texto={l.validacao} />
                        </div>
                      </td>
                      <td>
                        <div className="estado-celula">
                          <small>Resolução</small>
                          <Chip texto={l.resolucao} />
                        </div>
                      </td>
                      <td>
                        <button className="btn-contorno">Ver detalhes</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Escolhe o que mostrar ---------- */
export default function Home() {
  const perfil = localStorage.getItem("perfil");
  const token = localStorage.getItem("token");

  if (!perfil || !token) {
    return <Navigate to="/login" replace />;
  }

  if (perfil !== "cidadao") {
    return (
      <div className="painel-conteudo">
        <p>Esta área ainda está em desenvolvimento.</p>
      </div>
    );
  }

  return <PaginaCidadao />;
}