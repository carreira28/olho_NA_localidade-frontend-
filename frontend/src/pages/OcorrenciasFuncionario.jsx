import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import BarraLateralFuncionario from "../components/BarraLateralFuncionario.jsx";
import BarraTopo from "../components/BarraTopo.jsx";

const TIPO_VALIDACAO = "VALIDACAO";
const TIPO_RESOLUCAO = "RESOLUCAO";

const ESTADOS_RESOLUCAO = [
  "Não iniciada",
  "Em análise",
  "Em resolução",
  "Resolvida",
];

const CLASSE_CHIP = {
  PENDENTE: "chip-aviso",
  VALIDADA: "chip-ok",
  REJEITADA: "chip-erro",
  "NAO INICIADA": "chip-neutro",
  "EM ANALISE": "chip-info",
  "EM RESOLUCAO": "chip-info",
  RESOLVIDA: "chip-ok",
};

const CLASSE_PRIORIDADE = {
  BAIXA: "chip-neutro",
  MEDIA: "chip-ok",
  ALTA: "chip-aviso",
  URGENTE: "chip-erro",
};

const estadoAtual = (historico = [], tipo) =>
  historico.find((h) => h.estado.tipo.nome_tipo === tipo)?.estado.nome_estado ??
  null;

const formatarData = (valor) => new Date(valor).toLocaleDateString("pt-PT");

const paraDiaISO = (valor) => {
  const d = new Date(valor);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
};

function Chip({ texto }) {
  const classe = CLASSE_CHIP[texto] ?? "chip-neutro";
  return <span className={`chip ${classe}`}>{texto}</span>;
}

function ChipPrioridade({ prioridade }) {
  const classe = CLASSE_PRIORIDADE[prioridade.tipo_prioridade] ?? "chip-neutro";
  return <span className={`chip ${classe}`}>{prioridade.tipo_prioridade}</span>;
}

export default function OcorrenciasFuncionario() {
  const navigate = useNavigate();

  const [problemas, setProblemas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroResolucao, setFiltroResolucao] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([api("/api/gestao/problemas"), api("/api/prioridades")])
      .then(([listaProblemas, listaPrioridades]) => {
        setProblemas(listaProblemas);
        setPrioridades(listaPrioridades);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, []);

  const total = problemas.length;
  const terminadas = problemas.filter(
    (p) => estadoAtual(p.historicoEstados, TIPO_RESOLUCAO) === "RESOLVIDA",
  ).length;

  const visiveis = useMemo(
    () =>
      problemas.filter((p) => {
        const resolucao =
          estadoAtual(p.historicoEstados, TIPO_RESOLUCAO) ?? "Não iniciada";

        const passaPrioridade =
          !filtroPrioridade || p.id_prioridade === Number(filtroPrioridade);
        const passaResolucao =
          !filtroResolucao || resolucao === filtroResolucao;
        const passaData =
          !filtroData || paraDiaISO(p.data_criacao) === filtroData;

        return passaPrioridade && passaResolucao && passaData;
      }),
    [problemas, filtroPrioridade, filtroResolucao, filtroData],
  );

  return (
    <div className="painel">
      <BarraLateralFuncionario />

      <div className="painel-principal">
        <BarraTopo area="Área do funcionário" />

        <main className="painel-conteudo">
          <div className="painel-topo">
            <h2>Ocorrências do departamento</h2>
          </div>

          <div className="estatisticas">
            <div className="cartao">
              <p>Total de ocorrências</p>
              <strong>{total}</strong>
            </div>
            <div className="cartao">
              <p>Ocorrências terminadas</p>
              <strong>{terminadas}</strong>
            </div>
            <div className="cartao">
              <p>Total com filtro</p>
              <strong>{visiveis.length}</strong>
            </div>
          </div>

          <div className="cartao">
            <h3 className="cartao-titulo">Gestão de ocorrências</h3>

            <div className="filtros filtros-3">
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
                <label htmlFor="f-resolucao">Resolução</label>
                <select
                  id="f-resolucao"
                  value={filtroResolucao}
                  onChange={(e) => setFiltroResolucao(e.target.value)}
                >
                  <option value="">Todos os estados</option>
                  {ESTADOS_RESOLUCAO.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
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
                    <th>Prioridade</th>
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
                    const porValidar = validacao === "PENDENTE";

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
                          <ChipPrioridade prioridade={p.prioridade} />
                        </td>
                        <td>
                          <Chip texto={resolucao} />
                        </td>
                        <td>
                          <button
                            className={
                              porValidar
                                ? "btn-auth btn-pequeno"
                                : "btn-secundario"
                            }
                            onClick={() =>
                              navigate(
                                `/funcionario/Ocorrencia/${p.id_problema}`,
                              )
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
