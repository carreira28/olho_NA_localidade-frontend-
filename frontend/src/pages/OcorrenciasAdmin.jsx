import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import BarraLateralAdmin from "../components/BarraLateralAdmin.jsx";
import BarraTopo from "../components/BarraTopo.jsx";

const TIPO_VALIDACAO = "VALIDACAO";
const TIPO_RESOLUCAO = "RESOLUCAO";

// estados que aparecem no filtro "Estado" (validação + resolução)
const ESTADOS_FILTRO = [
  "Pendente",
  "Validada",
  "Rejeitada",
  "Não iniciada",
  "Em análise",
  "Em resolução",
  "Resolvida",
];

const normalizar = (texto = "") =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const CLASSE_CHIP = {
  PENDENTE: "chip-aviso",
  VALIDADA: "chip-ok",
  REJEITADA: "chip-erro",
  "NAO INICIADA": "chip-neutro",
  "EM ANALISE": "chip-info",
  "EM RESOLUCAO": "chip-info",
  RESOLVIDA: "chip-ok",
};

// "NAO INICIADA" -> "Não iniciada"
const NOMES_BONITOS = Object.fromEntries(
  ESTADOS_FILTRO.map((nome) => [normalizar(nome), nome]),
);
const bonito = (texto) => NOMES_BONITOS[normalizar(texto)] ?? texto;

const estadoAtual = (historico = [], tipo) =>
  historico.find((h) => h.estado.tipo.nome_tipo === tipo)?.estado
    .nome_estado ?? null;

const formatarData = (valor) => {
  const d = new Date(valor);
  const mes = d.toLocaleDateString("pt-PT", { month: "short" });
  return `${d.getDate()} ${mes} ${d.getFullYear()}`;
};

// "2026-10-12" (formato do <input type="date">) a partir de uma data da API
const paraDiaISO = (valor) => {
  const d = new Date(valor);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
};

function Chip({ texto }) {
  const classe = CLASSE_CHIP[normalizar(texto)] ?? "chip-neutro";
  return <span className={`chip ${classe}`}>{bonito(texto)}</span>;
}

export default function OcorrenciasAdmin() {
  const navigate = useNavigate();

  const [problemas, setProblemas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([
      api("/api/gestao/problemas"),
      api("/api/categorias"),
      api("/api/prioridades"),
    ])
      .then(([listaProblemas, listaCategorias, listaPrioridades]) => {
        setProblemas(listaProblemas);
        setCategorias(listaCategorias);
        setPrioridades(listaPrioridades);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, []);

  // cartões do topo
  const total = problemas.length;
  const pendentes = problemas.filter(
    (p) =>
      normalizar(estadoAtual(p.historicoEstados, TIPO_VALIDACAO)) ===
      "PENDENTE",
  ).length;
  const resolvidas = problemas.filter(
    (p) =>
      normalizar(estadoAtual(p.historicoEstados, TIPO_RESOLUCAO)) ===
      "RESOLVIDA",
  ).length;

  const visiveis = useMemo(
    () =>
      problemas.filter((p) => {
        const validacao = estadoAtual(p.historicoEstados, TIPO_VALIDACAO);
        const resolucao =
          estadoAtual(p.historicoEstados, TIPO_RESOLUCAO) ?? "Não iniciada";

        // o filtro "Estado" aceita tanto estados de validação como de resolução
        const passaEstado =
          !filtroEstado ||
          normalizar(validacao) === normalizar(filtroEstado) ||
          normalizar(resolucao) === normalizar(filtroEstado);
        const passaCategoria =
          !filtroCategoria || p.id_categoria === Number(filtroCategoria);
        const passaPrioridade =
          !filtroPrioridade || p.id_prioridade === Number(filtroPrioridade);
        const passaData =
          !filtroData || paraDiaISO(p.data_criacao) === filtroData;

        return passaEstado && passaCategoria && passaPrioridade && passaData;
      }),
    [problemas, filtroEstado, filtroCategoria, filtroPrioridade, filtroData],
  );

  return (
    <div className="painel">
      <BarraLateralAdmin />

      <div className="painel-principal">
        <BarraTopo area="Área de administração" />

        <main className="painel-conteudo">
          <div className="painel-topo">
            <h2>Todas as ocorrências</h2>
          </div>

          <div className="estatisticas">
            <div className="cartao">
              <p>Total de ocorrências</p>
              <strong>{total}</strong>
            </div>
            <div className="cartao">
              <p>Pendentes de validação</p>
              <strong>{pendentes}</strong>
            </div>
            <div className="cartao">
              <p>Resolvidas</p>
              <strong>{resolvidas}</strong>
            </div>
          </div>

          <div className="cartao">
            <h3 className="cartao-titulo">Gestão de ocorrências</h3>

            <div className="filtros filtros-4">
              <div>
                <label htmlFor="f-estado">Estado</label>
                <select
                  id="f-estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos os estados</option>
                  {ESTADOS_FILTRO.map((estado) => (
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
                  <option value="">Todas</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.tipo_categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="f-prioridade">Prioridade</label>
                <select
                  id="f-prioridade"
                  value={filtroPrioridade}
                  onChange={(e) => setFiltroPrioridade(e.target.value)}
                >
                  <option value="">Todas</option>
                  {prioridades.map((pr) => (
                    <option key={pr.id_prioridade} value={pr.id_prioridade}>
                      {pr.tipo_prioridade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="f-data">Data de submissão</label>
                <input
                  id="f-data"
                  type="date"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                />
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
                    <th>Submissão</th>
                    <th>Validação</th>
                    <th>Resolução</th>
                    <th>Gravidade</th>
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
                    const porValidar = normalizar(validacao) === "PENDENTE";

                    return (
                      <tr key={p.id_problema}>
                        <td>
                          <strong>{p.descricao}</strong>
                          <br />
                          <small>{p.categoria.tipo_categoria}</small>
                        </td>
                        <td>
                          <small>{formatarData(p.data_criacao)}</small>
                        </td>
                        <td>
                          <Chip texto={validacao} />
                        </td>
                        <td>
                          <Chip texto={resolucao} />
                        </td>
                        <td>
                          {p.gravidade ? (
                            <span className="chip chip-aviso">Urgente</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <button
                            className={
                              porValidar
                                ? "btn-auth btn-pequeno"
                                : "btn-secundario"
                            }
                            onClick={() =>
                              navigate(`/admin/ocorrencias/${p.id_problema}`)
                            }
                          >
                            {porValidar ? "Validar" : "Ver detalhes"}
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