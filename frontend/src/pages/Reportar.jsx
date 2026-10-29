import { useEffect, useState } from "react";
import { api } from "../api.js";
import BarraLateral from "../components/BarraLateralCidadao.jsx";
import BarraTopo from "../components/BarraTopo.jsx";

export default function Reportar() {
  const [categorias, setCategorias] = useState([]);
  const [idCategoria, setIdCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [urgente, setUrgente] = useState(false); // gravidade = true no backend
  const [erro, setErro] = useState("");

  useEffect(() => {
    api("/api/categorias")
      .then(setCategorias)
      .catch((e) => setErro(e.message));
  }, []);

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
        </main>
      </div>
    </div>
  );
}