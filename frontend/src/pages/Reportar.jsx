import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { api } from "../api.js";
import BarraLateral from "../components/BarraLateralCidadao.jsx";
import BarraTopo from "../components/BarraTopo.jsx";

// Com o Vite, os ícones por defeito do Leaflet não carregam sem isto
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MAX_FOTOS = 3;
const MAX_BYTES = 4 * 1024 * 1024; // igual ao limite do backend
const CENTRO_INICIAL = [41.5323, -8.7796];

function EscolherPonto({ onEscolher }) {
  useMapEvents({
    click: (e) => onEscolher({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

export default function Reportar() {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [idCategoria, setIdCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [urgente, setUrgente] = useState(false);
  const [fotos, setFotos] = useState([]);
  const [posicao, setPosicao] = useState(null);
  const [erro, setErro] = useState("");
  const [aEnviar, setAEnviar] = useState(false);

  useEffect(() => {
    api("/api/categorias")
      .then(setCategorias)
      .catch((e) => setErro(e.message));
  }, []);

  // Pré-visualizações das fotos; libertam-se quando a lista muda
  const previews = useMemo(
    () => fotos.map((f) => URL.createObjectURL(f)),
    [fotos],
  );
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  function escolherFotos(e) {
    const novas = Array.from(e.target.files);
    e.target.value = ""; // permite escolher o mesmo ficheiro outra vez

    if (fotos.length + novas.length > MAX_FOTOS) {
      return setErro(`Podes anexar no máximo ${MAX_FOTOS} fotografias.`);
    }
    if (novas.some((f) => !["image/jpeg", "image/png"].includes(f.type))) {
      return setErro("Só são permitidas imagens JPG ou PNG.");
    }
    if (novas.some((f) => f.size > MAX_BYTES)) {
      return setErro("Cada fotografia pode ter no máximo 4 MB.");
    }
    setErro("");
    setFotos([...fotos, ...novas]);
  }

  function removerFoto(indice) {
    setFotos(fotos.filter((_, i) => i !== indice));
  }

  async function aoSubmeter(e) {
    e.preventDefault();
    setErro("");

    if (!idCategoria) return setErro("Escolhe uma categoria.");
    if (!descricao.trim()) return setErro("Escreve uma descrição.");
    if (!posicao) return setErro("Assinala o local da ocorrência no mapa.");

    const formData = new FormData();
    formData.append("descricao", descricao.trim());
    formData.append("gravidade", urgente);
    formData.append("id_categoria", idCategoria);
    formData.append("latitude", posicao.lat);
    formData.append("longitude", posicao.lng);
    fotos.forEach((f) => formData.append("fotos", f)); // o nome tem de ser "fotos"

    setAEnviar(true);
    try {
      await api("/api/problema", { method: "POST", body: formData });
      navigate("/ocorrencias");
    } catch (err) {
      setErro(err.message);
      setAEnviar(false);
    }
  }

  return (
    <div className="painel">
      <BarraLateral />

      <div className="painel-principal">
        <BarraTopo />

        <main className="painel-conteudo">
          <div className="painel-topo">
            <h2>Reportar ocorrência</h2>
          </div>

          {erro && (
            <p className="auth-erro" role="alert">
              {erro}
            </p>
          )}

          <form onSubmit={aoSubmeter}>
            <div className="cartao">
              <h3 className="cartao-titulo">1. O que aconteceu?</h3>

              <div className="campo">
                <label htmlFor="categoria">Categoria</label>
                <select
                  id="categoria"
                  value={idCategoria}
                  onChange={(e) => setIdCategoria(e.target.value)}
                >
                  <option value="">Seleciona uma categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.tipo_categoria}
                    </option>
                  ))}
                </select>
                <small className="campo-ajuda">
                  Escolhe a categoria que melhor descreve o problema.
                </small>
              </div>

              <div className="campo">
                <label htmlFor="descricao">Descrição detalhada</label>
                <textarea
                  id="descricao"
                  rows={4}
                  placeholder="Passeio danificado."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div className="campo">
                <label>Gravidade</label>
                <div className="opcoes-gravidade">
                  <button
                    type="button"
                    className={`opcao ${!urgente ? "opcao-ativa" : ""}`}
                    onClick={() => setUrgente(false)}
                  >
                    Não Urgente
                  </button>
                  <button
                    type="button"
                    className={`opcao ${urgente ? "opcao-ativa" : ""}`}
                    onClick={() => setUrgente(true)}
                  >
                    Urgente
                  </button>
                </div>
              </div>
            </div>

            <div className="cartao">
              <h3 className="cartao-titulo">2. Fotografias</h3>

              <label className="zona-fotos">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  hidden
                  onChange={escolherFotos}
                />
                <span>
                  Clica para adicionar fotografias (máx. {MAX_FOTOS}, 4 MB cada)
                </span>
              </label>

              {previews.length > 0 && (
                <div className="previews">
                  {previews.map((url, i) => (
                    <div key={url} className="preview">
                      <img src={url} alt={`Fotografia ${i + 1}`} />
                      <button type="button" onClick={() => removerFoto(i)}>
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cartao">
              <h3 className="cartao-titulo">3. Onde aconteceu?</h3>
              <p className="painel-sub">Assinala com um ponto no mapa.</p>

              <MapContainer center={CENTRO_INICIAL} zoom={15} className="mapa">
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <EscolherPonto onEscolher={setPosicao} />
                {posicao && <Marker position={[posicao.lat, posicao.lng]} />}
              </MapContainer>

              {posicao && (
                <p className="coordenadas">
                  {posicao.lat.toFixed(6)}, {posicao.lng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="acoes-form">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => navigate("/ocorrencias")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-auth btn-pequeno"
                disabled={aEnviar}
              >
                {aEnviar ? "A enviar…" : "Submeter ocorrência"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
