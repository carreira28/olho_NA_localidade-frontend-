import { useEffect, useState } from "react";
import { api } from "../api.js";
import BarraLateral from "../components/BarraLateralCidadao.jsx";
import BarraTopo from "../components/BarraTopo.jsx";

export default function Reportar() {
  const [categorias, setCategorias] = useState([]);
  const [problem, setProblem] = useState({
    descricao: "",
    urgente: false,
    foto: null,
    fotoPreview: "",
    idCategoria: "",
    latitude: "",
    longitude: "",
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    api("/api/categorias")
      .then(setCategorias)
      .catch((e) => setErro(e.message));
  }, []);

  const handleChange = (e) => {
    setProblem({ ...setProblem, [e.target.name]: e.target.value });
  };

  try {
    const formData = new FormData();
    formData.append("descricao", problem.descricao);
    formData.append("urgente", problem.urgente);
    formData.append("idCategoria", problem.idCategoria);
    formData.append("latitude", problem.latitude);
    if (problem.foto) formData.append("foto", problem.foto);
    api("/api/problema", {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    setErro(err.message);
  }

  return (
    <div className="painel">
      <BarraLateral />

      <div className="painel-principal">
        <BarraTopo />

        <main className="painel-conteudo">
          <div className="painel-topo">
            <div>
              <h2>Reportar ocorrência</h2>
            </div>
          </div>

          {erro && <p className="auth-erro">{erro}</p>}

          <div className="cartao">
            <h3 className="cartao-titulo">1. O que aconteceu?</h3>

            <div className="campo">
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                value={problem.idCategoria}
                onChange={(e) => setProblem.idCategoria(e.target.value)}
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
              <input
                id="descricao"
                type="text"
                placeholder="Passeio danificado."
                value={problem.descricao}
                onChange={handleChange}
              />
            </div>

            <div className="campo">
              <label>Gravidade</label>
              <div className="opcoes-gravidade">
                <button
                  type="button"
                  className={`opcao ${!problem.urgente ? "opcao-ativa" : ""}`}
                  onClick={() => setProblem.urgente(false)}
                >
                  Não Urgente
                </button>
                <button
                  type="button"
                  className={`opcao ${problem.urgente ? "opcao-ativa" : ""}`}
                  onClick={() => setProblem.urgente(true)}
                >
                  Urgente
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
