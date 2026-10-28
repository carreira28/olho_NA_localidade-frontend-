import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import BarraLateral from "../components/BarraLateralCidadao.jsx";
import BarraTopo from "../components/BarraTopo.jsx";
import { lerUtilizador } from "../utils/sessao.js";

const TIPO_VALIDACAO = "VALIDACAO";
const TIPO_RESOLUCAO = "RESOLUCAO";
const ESTADOS_VALIDACAO = ["Pendente", "Validada", "Rejeitada"];

const normalizar = (texto = "") =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

//class css correspondente
const CLASSE_CHIP = {
  PENDENTE: "chip-aviso",
  VALIDADA: "chip-ok",
  REJEITADA: "chip-erro",
  "NAO INICIADA": "chip-neutro",
  "EM ANALISE": "chip-info",
  "EM RESOLUCAO": "chip-info",
  RESOLVIDA: "chip-ok",
};

const estadoAtual = (historico = [], tipo) =>
  historico.find((h) => h.estado.tipo.nome_tipo === tipo)?.estado.nome_estado ??
  null;

const formatarData = (valor) => {
  const d = new Date(valor);
  const mes = d.toLocaleDateString("pt-PT", { month: "short" });
  return `${d.getDate()} ${mes} ${d.getFullYear()}`;
};

function Chip({ texto }) {
  const classe = CLASSE_CHIP[normalizar(texto)] ?? "chip-neutro";
  return <span className={`chip ${classe}`}>{texto}</span>;
}

export default function PaginaInicial() {
  const utilizador = lerUtilizador();
  const navigate = useNavigate();

  const [problemas, setProblemas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([api("/api/problemas"), api("/api/categorias")])
      .then(([listaProblemas, listaCategorias]) => {
        setProblemas(listaProblemas);
        setCategorias(listaCategorias);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, []);

  const visiveis = useMemo(
    () =>
      problemas.filter((p) => {
        const validacao = estadoAtual(p.historicoEstados, TIPO_VALIDACAO);
        const passaEstado =
          !filtroEstado || normalizar(validacao) === normalizar(filtroEstado);
        const passaCategoria =
          !filtroCategoria || p.id_categoria === Number(filtroCategoria);
        return passaEstado && passaCategoria;
      }),
    [problemas, filtroEstado, filtroCategoria],
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
            <button
              className="btn-auth btn-pequeno"
              onClick={() => navigate("/reportar")}
            >
              + Reportar ocorrência
            </button>
          </div>

          <div className="cartao">
            <h3 className="cartao-titulo">Os seus pedidos</h3>

            <div className="filtros">
              <div>
                <label htmlFor="f-estado">Validação</label>
                <select
                  id="f-estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos os estados</option>
                  {ESTADOS_VALIDACAO.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
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
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.tipo_categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {erro && <p className="auth-erro">{erro}</p>}
            {aCarregar && <p className="painel-sub">A carregar…</p>}
            {!aCarregar && !erro && visiveis.length === 0 && (
              <p className="painel-sub">Sem ocorrências para mostrar.</p>
            )}

            {visiveis.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Ocorrências</th>
                    <th>Validação</th>
                    <th>Resolução</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((p) => {
                    const validacao =
                      estadoAtual(p.historicoEstados, TIPO_VALIDACAO) ?? "—";
                    const resolucao =
                      estadoAtual(p.historicoEstados, TIPO_RESOLUCAO) ??
                      "Não iniciada";

                    return (
                      <tr key={p.id_problema}>
                        <td>
                          <strong>{p.descricao}</strong>
                          <br />
                          <small>{p.categoria.tipo_categoria}</small>
                          <br />
                          <small>{formatarData(p.data_criacao)}</small>
                        </td>
                        <td>
                          <Chip texto={validacao} />
                        </td>
                        <td>
                          <Chip texto={resolucao} />
                        </td>
                        <td>
                          <button
                            className="btn-secundario"
                            onClick={() =>
                              navigate(`/ocorrencias/${p.id_problema}`)
                            }
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
