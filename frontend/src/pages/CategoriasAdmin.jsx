import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import BarraLateralAdmin from "../components/BarraLateralAdmin.jsx";
import BarraTopo from "../components/BarraTopo.jsx";

const FORM_VAZIO = { tipo_categoria: "", id_departamento: "" };

const MODO_CRIAR = "criar";
const MODO_EDITAR = "editar";

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [pesquisa, setPesquisa] = useState("");

  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  const [modo, setModo] = useState(null);
  const [selecionada, setSelecionada] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [aGuardar, setAGuardar] = useState(false);
  const [erroForm, setErroForm] = useState("");

  useEffect(() => {
    api("/gestaoCategoria/categorias")
      .then(setCategorias)
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, []);

  const departamentos = useMemo(() => {
    const mapa = new Map();
    categorias.forEach((c) => {
      if (c.departamento)
        mapa.set(c.departamento.id_departamento, c.departamento);
    });
    return [...mapa.values()];
  }, [categorias]);

  const visiveis = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return categorias;
    return categorias.filter(
      (c) =>
        c.tipo_categoria.toLowerCase().includes(termo) ||
        c.departamento?.nome_departamento?.toLowerCase().includes(termo),
    );
  }, [categorias, pesquisa]);

  const abrirCriar = () => {
    setModo(MODO_CRIAR);
    setSelecionada(null);
    setForm(FORM_VAZIO);
    setErroForm("");
  };

  const abrirEditar = (categoria) => {
    setModo(MODO_EDITAR);
    setSelecionada(categoria);
    setForm({
      tipo_categoria: categoria.tipo_categoria,
      id_departamento: String(categoria.id_departamento),
    });
    setErroForm("");
  };

  const fechar = () => {
    setModo(null);
    setSelecionada(null);
    setForm("");
    setErroForm("");
  };

  const guardar = async (e) => {
    e.preventDefault();
    setErroForm("");

    if (!form.tipo_categoria.trim() || !form.id_departamento) {
      setErroForm("Indica o nome e o departamento.");
      return;
    }

    const corpo = {
      tipo_categoria: form.tipo_categoria.trim(),
      id_departamento: Number(form.id_departamento),
    };

    setAGuardar(true);
    try {
      if (modo === MODO_CRIAR) {
        const nova = await api("/gestaoCategoria/categoria", {
          method: "POST",
          body: corpo,
        });
        setCategorias((atual) => [...atual, nova]);
      } else {
        const atualizada = await api(
          `/gestaoCategoria/categoria/${selecionada.id_categoria}`,
          { method: "PATCH", body: corpo },
        );
        setCategorias((atual) =>
          atual.map((c) =>
            c.id_categoria === atualizada.id_categoria ? atualizada : c,
          ),
        );
      }
      fechar();
    } catch (err) {
      setErroForm(err.message);
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <div className="painel">
      <BarraLateralAdmin />

      <div className="painel-principal">
        <BarraTopo area="Área de administração" />

        <main className="painel-conteudo">
          <div className="painel-topo">
            <h2>Categorias</h2>
            <button
              type="button"
              className="btn-auth btn-pequeno"
              onClick={abrirCriar}
            >
              + Nova categoria
            </button>
          </div>

          <div className="layout-duas-colunas">
            <div className="cartao">
              <div className="campo">
                <label htmlFor="f-pesquisa">Pesquisar categoria</label>
                <input
                  id="f-pesquisa"
                  type="text"
                  placeholder="Categoria ou departamento"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                />
              </div>
              {erro && <p className="auth-erro">{erro}</p>}
              {aCarregar && <p className="painel-sub">A carregar…</p>}
              {!aCarregar && !erro && visiveis.length === 0 && (
                <p className="painel-sub">Sem categorias para mostrar.</p>
              )}

              {visiveis.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Departamento</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiveis.map((c) => (
                      <tr key={c.id_categoria}>
                        <td>
                          <strong>{c.tipo_categoria}</strong>
                        </td>
                        <td>{c.departamento?.nome_departamento ?? "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-secundario"
                            onClick={() => abrirEditar(c)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <aside className="painel-lateral-form">
              {modo === null ? (
                <div className="cartao">
                  <h3 className="cartao-titulo">Categoria</h3>
                  <p className="painel-sub">
                    Seleciona “Editar” numa categoria ou clica em “Nova
                    categoria” para começar.
                  </p>
                </div>
              ) : (
                <form className="cartao" onSubmit={guardar}>
                  <h3 className="cartao-titulo">
                    {modo === MODO_CRIAR
                      ? "Nova categoria"
                      : "Editar categoria"}
                  </h3>
                  <div>
                    <div className="campo">
                      <label htmlFor="c-nome">Nome da categoria</label>
                      <input
                        id="c-nome"
                        type="text"
                        value={form.tipo_categoria}
                        onChange={(e) =>
                          setForm({ ...form, tipo_categoria: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="c-dep">Departamento associado</label>
                    <div className="campo">
                      <select
                        id="c-dep"
                        value={form.id_departamento}
                        onChange={(e) =>
                          setForm({ ...form, id_departamento: e.target.value })
                        }
                      >
                        <option value="">Seleciona um departamento</option>
                        {departamentos.map((d) => (
                          <option
                            key={d.id_departamento}
                            value={d.id_departamento}
                          >
                            {d.nome_departamento}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {erroForm && <p className="auth-erro">{erroForm}</p>}

                  <div className="acoes-form">
                    <button
                      type="submit"
                      className="btn-auth btn-pequeno"
                      disabled={aGuardar}
                    >
                      {aGuardar ? "A guardar…" : "Guardar categoria"}
                    </button>
                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={fechar}
                      disabled={aGuardar}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
