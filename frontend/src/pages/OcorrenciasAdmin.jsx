import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import BarraLateralAdmin from "../components/BarraLateralAdmin.jsx";
import BarraTopo from "../components/BarraTopo.jsx";

const TIPO_VALIDACAO = "VALIDACAO";
const TIPO_RESOLUCAO = "RESOLUCAO";
const ESTADOS_FILTRO = [
  "Pendente",
  "Validada",
  "Rejeitada",
  "Não iniciada",
  "Em análise",
  "Em resolução",
  "Resolvida",
];

const OPCOES_GRAVIDADE = [
  { valor: "urgente", texto: "Urgente" },
  { valor: "nao-urgente", texto: "Não urgente" },
];
const normalizar = (texto) =>
  (texto ?? "")
    .replace(/_/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const rotulo = (texto) => {
  const limpo = (texto ?? "").replace(/_/g, " ").toLowerCase();
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
};

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
  const data = d.toLocaleDateString("pt-PT");
  return `${data}`;
};

const paraDiaISO = (valor) => {
  const d = new Date(valor);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
};

function Chip({ texto }) {
  const classe = CLASSE_CHIP[normalizar(texto)] ?? "chip-neutro";
  return <span className={`chip ${classe}`}>{rotulo(texto)}</span>;
}

export default function OcorrenciasAdmin() {
  const navigate = useNavigate();

  const [problemas, setProblemas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroGravidade, setFiltroGravidade] = useState("");
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([api("/api/gestao/problemas"), api("/api/categorias")])
      .then(([listaProblemas, listaCategorias]) => {
        setProblemas(listaProblemas);
        setCategorias(listaCategorias);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, []);

  const total = problemas.length;
  const pendentes = problemas.filter(
    (p) =>
      normalizar(estadoAtual(p.historicoEstados, TIPO_VALIDACAO)) ===
      "PENDENTE",
  ).length;

  const visiveis = useMemo(
    () =>
      problemas.filter((p) => {
        const validacao = estadoAtual(p.historicoEstados, TIPO_VALIDACAO);
        const resolucao =
          estadoAtual(p.historicoEstados, TIPO_RESOLUCAO) ?? "Não iniciada";

        const passaEstado =
          !filtroEstado ||
          normalizar(validacao) === normalizar(filtroEstado) ||
          normalizar(resolucao) === normalizar(filtroEstado);

        const passaGravidade =
          !filtroGravidade ||
          (filtroGravidade === "urgente" ? p.gravidade : !p.gravidade);

        const passaCategoria =
          !filtroCategoria || p.id_categoria === Number(filtroCategoria);
        const passaData =
          !filtroData || paraDiaISO(p.data_criacao) === filtroData;

        return passaEstado && passaCategoria && passaGravidade && passaData;
      }),
    [problemas, filtroEstado, filtroCategoria, filtroGravidade, filtroData],
  );

  const valor = visiveis.length;
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
              <p> Total com Filtro</p>
              <strong>{valor}</strong>
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
                <label htmlFor="f-gravidade">Gravidade</label>
                <select
                  id="f-gravidade"
                  value={filtroGravidade}
                  onChange={(e) => setFiltroGravidade(e.target.value)}
                >
                  <option value="">Todas</option>
                  {OPCOES_GRAVIDADE.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.texto}
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
