import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiImage } from "react-icons/fi";
import { api } from "../api.js";
import BarraLateral from "../components/BarraLateralCidadao.jsx";
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
  const [aEditarLocal, setAEditarLocal] = useState(false);
  const [novaPosicao, setNovaPosicao] = useState(null);
  const [aGuardar, setAGuardar] = useState(false);
  const [erroLocal, setErroLocal] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    api(`/api/problema/${id}`)
      .then(setProblema)
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, [id]);

  const validacao = problema
    ? (estadoAtual(problema.historicoEstados, TIPO_VALIDACAO) ?? "PENDENTE")
    : null;
  const resolucao = problema
    ? (estadoAtual(problema.historicoEstados, TIPO_RESOLUCAO) ?? "NAO INICIADA")
    : null;

  const podeEditarLocal = validacao === "PENDENTE";

  const eventos = problema ? [...problema.historicoEstados].reverse() : [];

  const temLocalizacao =
    problema?.latitude != null && problema?.longitude != null;

  async function guardarLocalizacao() {
    if (!novaPosicao) return setErroLocal("Assinala o local no mapa.");

    setAGuardar(true);
    setErroLocal("");
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
      setErroLocal(e.message);
    } finally {
      setAGuardar(false);
    }
  }

  function cancelarEdicao() {
    setAEditarLocal(false);
    setNovaPosicao(null);
    setErroLocal("");
  }

  return (
    <div className="painel">
      <BarraLateral />

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
                onClick={() => navigate("/OcorrenciasCidadao")}
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
                      {erroLocal && <p className="auth-erro">{erroLocal}</p>}
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

                      {podeEditarLocal && !temLocalizacao && (
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
                  onClick={() => navigate("/OcorrenciasCidadao")}
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
