import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiImage } from "react-icons/fi";
import { api } from "../api.js";
import BarraLateralAdmin from "../components/BarraLateralAdmin.jsx";
import BarraTopo from "../components/BarraTopo.jsx";
import { lerUtilizador } from "../utils/sessao.js";
import MapaEscolha from "../components/MapaEscolha.jsx";

const TIPO_VALIDACAO = "VALIDACAO";
const TIPO_RESOLUCAO = "RESOLUCAO";

const CLASSE_CHIP = {
  PENDENTE: "chip-aviso",
  VALIDADA: "chip-ok",
  REJEITADA: "chip-erro",
  "NAO INICIADA": "chip-neutro",
  "EM ANALISE": "chip-info",
  "EM RESOLUCAO": "chip-info",
  RESOLVIDA: "chip-ok",
};

const CLASSE_CHIP_NAME = {
  PENDENTE: "Pendente",
  VALIDADA: "Validada",
  REJEITADA: "Rejeitada",
  "NAO INICIADA": "Não iniciada",
  "EM ANALISE": "Em análise",
  "EM RESOLUCAO": "Em resolução",
  RESOLVIDA: "Resolvida",
};

const name = (texto) => CLASSE_CHIP_NAME[texto] ?? texto;

const TITULO_EVENTO = {
  PENDENTE: "Ocorrência submetida",
  VALIDADA: "Ocorrência validada",
  REJEITADA: "Ocorrência rejeitada",
};

const estadoAtual = (historico = [], tipo) =>
  historico.find((h) => h.estado.tipo.nome_tipo === tipo)?.estado.nome_estado ??
  null;

const formatarDataHora = (valor) => {
  const d = new Date(valor);
  const data = d.toLocaleDateString("pt-PT");
  return `${data}`;
};

const capitalizar = (t = "") =>
  t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();

function Chip({ texto }) {
  const classe = CLASSE_CHIP[texto] ?? "chip-neutro";
  return <span className={`chip ${classe}`}>{name(texto)}</span>;
}

function Mapa({ latitude, longitude }) {
  const delta = 0.004;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <iframe
      className="detalhe-mapa"
      title="Localização da ocorrência"
      src={src}
      loading="lazy"
    />
  );
}

export default function DetalheOcorrencia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const utilizador = lerUtilizador();

  const [problema, setProblema] = useState(null);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [idCategoria, setIdCategoria] = useState("");
  const [idPrioridade, setIdPrioridade] = useState("");
  const [aEditarLocal, setAEditarLocal] = useState(false);
  const [novaPosicao, setNovaPosicao] = useState(null);
  const [aGuardar, setAGuardar] = useState(false);
  const [aSubmeter, setASubmeter] = useState(false);
  const [erroDecisao, setErroDecisao] = useState("");

  const carregar = () =>
    api(`/api/gestao/problemas/${id}`)
      .then((p) => {
        setProblema(p);
        setIdCategoria(String(p.id_categoria));
        setIdPrioridade(p.id_prioridade ? String(p.id_prioridade) : "");
      })
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));

  useEffect(() => {
    carregar();
    api("/api/categorias")
      .then(setCategorias)
      .catch(() => {});
    api("/api/prioridades")
      .then(setPrioridades)
      .catch(() => {});
  }, [id]);

  const decidir = async (acao) => {
    setErroDecisao("");
    setASubmeter(true);
    try {
      if (acao === "validar") {
        await api(`/api/problemas/${id}/validar`, {
          method: "PATCH",
          body: {
            id_categoria: Number(idCategoria),
            id_prioridade: Number(idPrioridade),
          },
        });
      } else {
        await api(`/api/problemas/${id}/rejeitar`, { method: "PATCH" });
      }
      await carregar();
    } catch (e) {
      setErroDecisao(e.message);
    } finally {
      setASubmeter(false);
    }
  };
  async function guardarLocalizacao() {
    if (!novaPosicao) return setErroDecisao("Assinala o local no mapa.");

    setAGuardar(true);
    setErroDecisao("");
    try {
      const atualizado = await api(`/api/problemas/${id}/localizacao`, {
        method: "PATCH",
        body: { latitude: novaPosicao.lat, longitude: novaPosicao.lng },
      });
      setProblema({
        ...problema,
        latitude: atualizado.latitude,
        longitude: atualizado.longitude,
      });
      setAEditarLocal(false);
      setNovaPosicao(null);
    } catch (e) {
      setErroDecisao(e.message);
    } finally {
      setAGuardar(false);
    }
  }
  function cancelarEdicao() {
    setAEditarLocal(false);
    setNovaPosicao(null);
    setErroDecisao("");
  }

  const validacao = problema
    ? (estadoAtual(problema.historicoEstados, TIPO_VALIDACAO) ?? "Pendente")
    : null;
  const resolucao = problema
    ? (estadoAtual(problema.historicoEstados, TIPO_RESOLUCAO) ?? "Não iniciada")
    : null;

  const porValidar = validacao?.toUpperCase() === "PENDENTE";

  const eventos = problema ? [...problema.historicoEstados].reverse() : [];

  const temLocalizacao =
    problema?.latitude != null && problema?.longitude != null;

  return (
    <div className="painel">
      <BarraLateralAdmin />

      <div className="painel-principal">
        <BarraTopo />

        <main className="painel-conteudo">
          <div className="painel-topo">
            <div>
              <h2>Detalhe da ocorrência</h2>
              <p className="painel-sub">As minhas ocorrências</p>
            </div>
          </div>

          {aCarregar && <p className="painel-sub">A carregar…</p>}

          {erro && (
            <>
              <p className="auth-erro">{erro}</p>
              <button
                className="btn-secundario"
                onClick={() => navigate("/admin/Ocorrencias")}
              >
                Voltar às minhas ocorrências
              </button>
            </>
          )}

          {problema && (
            <div className="detalhe-grid">
              <div className="detalhe-coluna">
                <div className="cartao">
                  <p className="detalhe-data">
                    Submetida em {formatarDataHora(problema.data_criacao)}
                  </p>
                  <h3 className="detalhe-titulo">{problema.descricao}</h3>

                  <div className="detalhe-estados">
                    <div>
                      <span className="rotulo-estado">Validação</span>
                      <Chip texto={validacao} />
                    </div>
                    <div>
                      <span className="rotulo-estado">Resolução</span>
                      <Chip texto={resolucao} />
                    </div>
                  </div>

                  <p className="detalhe-gravidade">
                    Gravidade: {problema.gravidade ? "Urgente" : "Não Urgente"}
                  </p>

                  <p className="rotulo-estado">Fotografia anexada:</p>
                  {problema.fotos.length > 0 ? (
                    <div className="detalhe-fotos">
                      {problema.fotos.map((f) => (
                        <a
                          key={f.id_foto}
                          href={f.foto}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img src={f.foto} alt="Fotografia da ocorrência" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="detalhe-sem-foto">
                      <FiImage size={24} />
                    </div>
                  )}

                  <p className="detalhe-categoria">
                    {problema.categoria.tipo_categoria}
                  </p>
                </div>

                <div className="cartao">
                  <h3 className="cartao-titulo">Localização</h3>

                  {aEditarLocal ? (
                    <>
                      <p className="painel-sub">
                        Assinala com um ponto no mapa.
                      </p>
                      <MapaEscolha
                        posicao={novaPosicao}
                        onEscolher={setNovaPosicao}
                        centro={
                          temLocalizacao
                            ? [problema.latitude, problema.longitude]
                            : undefined
                        }
                      />
                      {novaPosicao && (
                        <p className="detalhe-coords">
                          {novaPosicao.lat.toFixed(6)},{" "}
                          {novaPosicao.lng.toFixed(6)}
                        </p>
                      )}
                      {erroDecisao && (
                        <p className="auth-erro">{erroDecisao}</p>
                      )}
                      <div className="acoes-form">
                        <button
                          className="btn-secundario"
                          onClick={cancelarEdicao}
                        >
                          Cancelar
                        </button>
                        <button
                          className="btn-auth btn-pequeno"
                          onClick={guardarLocalizacao}
                          disabled={aGuardar || !novaPosicao}
                        >
                          {aGuardar ? "A guardar…" : "Guardar localização"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {temLocalizacao ? (
                        <>
                          <Mapa
                            latitude={problema.latitude}
                            longitude={problema.longitude}
                          />
                          <p className="detalhe-coords">
                            {problema.latitude}, {problema.longitude}
                          </p>
                        </>
                      ) : (
                        <p className="painel-sub">Sem localização registada.</p>
                      )}

                      {porValidar && !temLocalizacao && (
                        <button
                          className="btn-auth btn-pequeno"
                          onClick={() => setAEditarLocal(true)}
                        >
                          Adicionar localização
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="detalhe-coluna">
                {porValidar && (
                  <div className="cartao">
                    <h3 className="cartao-titulo">Decisão de validação</h3>

                    <div className="campo">
                      <label htmlFor="categoria-validacao">
                        Confirmar / corrigir categoria
                      </label>
                      <select
                        id="categoria-validacao"
                        value={idCategoria}
                        onChange={(e) => setIdCategoria(e.target.value)}
                      >
                        {categorias.map((c) => (
                          <option key={c.id_categoria} value={c.id_categoria}>
                            {c.tipo_categoria}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="campo">
                      <label>Prioridade</label>
                      <div className="opcoes-gravidade">
                        {prioridades.map((p) => (
                          <button
                            key={p.id_prioridade}
                            type="button"
                            className={`opcao ${
                              idPrioridade === String(p.id_prioridade)
                                ? "opcao-ativa"
                                : ""
                            }`}
                            onClick={() =>
                              setIdPrioridade(String(p.id_prioridade))
                            }
                          >
                            {capitalizar(p.tipo_prioridade)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {erroDecisao && <p className="auth-erro">{erroDecisao}</p>}

                    <div className="acoes-form">
                      <button
                        type="button"
                        className="btn-auth btn-pequeno"
                        disabled={aSubmeter || !idCategoria || !idPrioridade}
                        onClick={() => decidir("validar")}
                      >
                        <FiCheck />
                        Validar e encaminhar
                      </button>
                      <button
                        type="button"
                        className="btn-cancelar"
                        disabled={aSubmeter}
                        onClick={() => decidir("rejeitar")}
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                )}

                <div className="cartao">
                  <h3 className="cartao-titulo">Histórico da ocorrência</h3>

                  <ul className="timeline">
                    {eventos.map((h, i) => {
                      const nome = h.estado.nome_estado;
                      return (
                        <li
                          key={h.id_historicoEstados}
                          className="timeline-item"
                        >
                          <span className="timeline-ponto" />
                          <small>{formatarDataHora(h.data_hora)}</small>
                          <strong>
                            {TITULO_EVENTO[nome] ?? name(h.estado.nome_estado)}
                          </strong>
                          {i === 0 && <small>{utilizador?.nome}</small>}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <button
                  className="btn-auth detalhe-voltar"
                  onClick={() => navigate("/admin/Ocorrencias")}
                >
                  <FiArrowLeft />
                  Voltar às minhas ocorrências
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
