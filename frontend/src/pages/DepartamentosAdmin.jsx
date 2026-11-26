import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import BarraLateralAdmin from "../components/BarraLateralAdmin.jsx";
import BarraTopo from "../components/BarraTopo.jsx";

const MODO_CRIAR = "criar";
const MODO_EDITAR = "editar";

export default function DepartamentosAdmin() {
  const [departamentos, setDepartamentos] = useState([]);
  const [pesquisa, setPesquisa] = useState("");

  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  const [modo, setModo] = useState(MODO_CRIAR);
  const [selecionado, setSelecionado] = useState(null);
  const [nome, setNome] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const carregar = () =>
    api("/gestaoDepartamento/departamentos").then((deps) =>
      setDepartamentos(
        [...deps].sort((a, b) =>
          a.nome_departamento.localeCompare(b.nome_departamento),
        ),
      ),
    );

  useEffect(() => {
    carregar()
      .catch((e) => setErro(e.message))
      .finally(() => setACarregar(false));
  }, []);

  const visiveis = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return departamentos;
    return departamentos.filter((d) =>
      d.nome_departamento.toLowerCase().includes(termo),
    );
  }, [departamentos, pesquisa]);

  const abrirEditar = (departamento) => {
    setModo(MODO_EDITAR);
    setSelecionado(departamento);
    setNome(departamento.nome_departamento);
    setErroForm("");
  };

  const cancelar = () => {
    setModo(MODO_CRIAR);
    setSelecionado(null);
    setNome("");
    setErroForm("");
  };

  const guardar = async (e) => {
    e.preventDefault();
    setErroForm("");

    if (!nome.trim()) {
      setErroForm("Indica o nome do departamento.");
      return;
    }

    const corpo = { nome_departamento: nome.trim() };

    setAGuardar(true);
    try {
      if (modo === MODO_CRIAR) {
        await api("/gestaoDepartamento/departamento", {
          method: "POST",
          body: corpo,
        });
      } else {
        await api(
          `/gestaoDepartamento/departamento/${selecionado.id_departamento}`,
          { method: "PATCH", body: corpo },
        );
      }
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
                  placeholder="Departamento"
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
                      <th>Departamento</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiveis.map((d) => (
                      <tr key={d.id_departamento}>
                        <td>
                          <strong>{d.nome_departamento}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-secundario"
                            onClick={() => abrirEditar(d)}
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
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
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