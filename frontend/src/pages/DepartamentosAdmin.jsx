import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import BarraLateralAdmin from "../components/BarraLateralAdmin.jsx";
import BarraTopo from "../components/BarraTopo.jsx";

const FORM_VAZIO = { nome_departamento: "", id_categoria: "" };

const MODO_CRIAR = "criar";
const MODO_EDITAR = "editar";

export default function DepartamentosAdmin() {
  const [departamentos, setDepartamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pesquisa, setPesquisa] = useState("");

  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  const [modo, setModo] = useState(MODO_CRIAR);
  const [selecionado, setSelecionado] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [aGuardar, setAGuardar] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const carregar = () =>
    Promise.all([
      api("/gestaoDepartamento/departamentos"),
      api("/gestaoCategoria/categorias"),
    ]).then(([deps, cats]) => {
      setDepartamentos(deps);
      setCategorias(cats);
    });

  useEffect(() => {
    carregar()
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, []);

  // Uma linha por categoria (como no design); departamentos sem categorias
  // aparecem com "—" para poderem ser editados.
  const linhas = useMemo(
    () =>
      departamentos.flatMap((d) =>
        d.categorias.length > 0
          ? d.categorias.map((c) => ({
              chave: `${d.id_departamento}-${c.id_categoria}`,
              departamento: d,
              categoria: c,
            }))
          : [
              {
                chave: `${d.id_departamento}-sem-categoria`,
                departamento: d,
                categoria: null,
              },
            ],
      ),
    [departamentos],
  );

  const visiveis = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return linhas;
    return linhas.filter(
      (l) =>
        l.departamento.nome_departamento.toLowerCase().includes(termo) ||
        l.categoria?.tipo_categoria.toLowerCase().includes(termo),
    );
  }, [linhas, pesquisa]);

  const abrirEditar = (linha) => {
    setModo(MODO_EDITAR);
    setSelecionado(linha.departamento);
    setForm({
      nome_departamento: linha.departamento.nome_departamento,
      id_categoria: linha.categoria ? String(linha.categoria.id_categoria) : "",
    });
    setErroForm("");
  };

  const cancelar = () => {
    setModo(MODO_CRIAR);
    setSelecionado(null);
    setForm(FORM_VAZIO);
    setErroForm("");
  };

  const guardar = async (e) => {
    e.preventDefault();
    setErroForm("");

    if (!form.nome_departamento.trim()) {
      setErroForm("Indica o nome do departamento.");
      return;
    }

    const corpo = {
      nome_departamento: form.nome_departamento.trim(),
      id_categoria: form.id_categoria ? Number(form.id_categoria) : null,
    };

    setAGuardar(true);
    try {
      if (modo === MODO_CRIAR) {
        await api("/gestaoDepartamento/departamento", {
          method: "POST",
          body: corpo,
        });
      } else {
        await api(`/gestaoDepartamento/departamento/${selecionado.id_departamento}`, {
          method: "PATCH",
          body: corpo,
        });
      }
      // Recarrega tudo: associar uma categoria move-a de outro departamento
      await carregar();
      cancelar();
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
            <h2>Departamentos</h2>
          </div>

          <div className="layout-duas-colunas">
            <div className="cartao">
              <div className="campo">
                <label htmlFor="f-pesquisa">Pesquisar departamento</label>
                <input
                  id="f-pesquisa"
                  type="text"
                  placeholder="Departamento ou categoria"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                />
              </div>

              {erro && <p className="auth-erro">{erro}</p>}
              {aCarregar && <p className="painel-sub">A carregar…</p>}
              {!aCarregar && !erro && visiveis.length === 0 && (
                <p className="painel-sub">Sem departamentos para mostrar.</p>
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
                    {visiveis.map((l) => (
                      <tr key={l.chave}>
                        <td>{l.categoria?.tipo_categoria ?? "—"}</td>
                        <td>
                          <strong>{l.departamento.nome_departamento}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-secundario"
                            onClick={() => abrirEditar(l)}
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
              <form className="cartao" onSubmit={guardar}>
                <h3 className="cartao-titulo">
                  {modo === MODO_CRIAR
                    ? "Novo Departamento"
                    : "Editar Departamento"}
                </h3>

                <div className="campo">
                  <label htmlFor="d-nome">Nome</label>
                  <input
                    id="d-nome"
                    type="text"
                    value={form.nome_departamento}
                    onChange={(e) =>
                      setForm({ ...form, nome_departamento: e.target.value })
                    }
                  />
                </div>

                <div className="campo">
                  <label htmlFor="d-cat">Categoria</label>
                  <select
                    id="d-cat"
                    value={form.id_categoria}
                    onChange={(e) =>
                      setForm({ ...form, id_categoria: e.target.value })
                    }
                  >
                    <option value="">Seleciona uma categoria</option>
                    {categorias.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.tipo_categoria}
                      </option>
                    ))}
                  </select>
                </div>

                {erroForm && <p className="auth-erro">{erroForm}</p>}

                <div className="acoes-form">
                  <button
                    type="submit"
                    className="btn-auth btn-pequeno"
                    disabled={aGuardar}
                  >
                    {aGuardar
                      ? "A guardar…"
                      : modo === MODO_CRIAR
                        ? "+ Novo departamento"
                        : "Guardar departamento"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={cancelar}
                    disabled={aGuardar}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}