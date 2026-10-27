import { Navigate, useNavigate } from "react-router-dom";

const MENUS = {
  cidadao: ["As minhas ocorrências", "Reportar ocorrência"],
  administrador: ["Todas as ocorrências", "Categorias", "Utilizadores", "Departamentos"],
  funcionario: ["Ocorrências do departamento"],
};

const NOMES = {
  cidadao: "Área do cidadão",
  administrador: "Área de administração",
  funcionario: "Área do funcionário",
};

/* Estrutura comum: barra lateral + conteúdo */
function Painel({ perfil, children }) {
  const navigate = useNavigate();

  function terminarSessao() {
    localStorage.removeItem("perfil");
    navigate("/login");
  }

  return (
    <div className="painel">
      <aside className="painel-lateral">
        <div>
          <p className="painel-marca">Olho na Localidade</p>
          <p className="painel-area">{NOMES[perfil]}</p>
          <nav>
            {MENUS[perfil].map((item, i) => (
              <button
                key={item}
                className={i === 0 ? "menu-item ativo" : "menu-item"}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <button className="menu-item" onClick={terminarSessao}>
          Terminar sessão
        </button>
      </aside>

      <main className="painel-conteudo">{children}</main>
    </div>
  );
}

function Chip({ texto }) {
  const tipo =
    {
      Pendente: "aviso",
      Validada: "ok",
      Rejeitada: "erro",
      "Em curso": "info",
      Concluída: "ok",
      "Não iniciada": "neutro",
    }[texto] || "neutro";
  return <span className={`chip chip-${tipo}`}>{texto}</span>;
}

/* ---------- CIDADÃO ---------- */
function HomeCidadao() {
  const ocorrencias = [
    { titulo: "Pavimento degradado", data: "12 abr. 2026", validacao: "Pendente", resolucao: "Não iniciada" },
    { titulo: "Candeeiro sem iluminação", data: "11 abr. 2026", validacao: "Validada", resolucao: "Em curso" },
    { titulo: "Resíduos junto aos contentores", data: "08 abr. 2026", validacao: "Rejeitada", resolucao: "Não iniciada" },
  ];

  return (
    <>
      <div className="painel-topo">
        <div>
          <h2>As minhas ocorrências</h2>
          <p className="painel-sub">Acompanhe os seus reportes e o estado de cada um.</p>
        </div>
        <button className="btn-auth btn-pequeno">+ Reportar ocorrência</button>
      </div>

      <div className="cartao">
        <table>
          <thead>
            <tr>
              <th>Ocorrência</th>
              <th>Validação</th>
              <th>Resolução</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ocorrencias.map((o) => (
              <tr key={o.titulo}>
                <td>
                  <strong>{o.titulo}</strong>
                  <br />
                  <small>{o.data}</small>
                </td>
                <td><Chip texto={o.validacao} /></td>
                <td><Chip texto={o.resolucao} /></td>
                <td><a href="#" className="link-acao">Ver detalhes</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- ADMINISTRADOR ---------- */
function HomeAdmin() {
  const ocorrencias = [
    { titulo: "Pavimento degradado", categoria: "Pavimentos", data: "12 abr. 2026", validacao: "Pendente" },
    { titulo: "Buraco na faixa de rodagem", categoria: "Pavimentos", data: "11 abr. 2026", validacao: "Validada" },
    { titulo: "Candeeiro sem iluminação", categoria: "Iluminação", data: "09 abr. 2026", validacao: "Validada" },
    { titulo: "Resíduos junto aos contentores", categoria: "Resíduos", data: "08 abr. 2026", validacao: "Rejeitada" },
  ];

  return (
    <>
      <div className="painel-topo">
        <div>
          <h2>Todas as ocorrências</h2>
          <p className="painel-sub">Gestão e validação das ocorrências submetidas.</p>
        </div>
      </div>

      <div className="estatisticas">
        <div className="cartao"><p>Total de ocorrências</p><strong>4</strong></div>
        <div className="cartao"><p>Pendentes de validação</p><strong>1</strong></div>
        <div className="cartao"><p>Rejeitadas</p><strong>1</strong></div>
      </div>

      <div className="cartao">
        <table>
          <thead>
            <tr>
              <th>Ocorrência</th>
              <th>Categoria</th>
              <th>Submissão</th>
              <th>Validação</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ocorrencias.map((o) => (
              <tr key={o.titulo}>
                <td><strong>{o.titulo}</strong></td>
                <td>{o.categoria}</td>
                <td>{o.data}</td>
                <td><Chip texto={o.validacao} /></td>
                <td><a href="#" className="link-acao">Ver detalhes</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- FUNCIONÁRIO ---------- */
function HomeFuncionario() {
  const ocorrencias = [
    { titulo: "Candeeiro sem iluminação", categoria: "Iluminação", data: "11 abr. 2026", resolucao: "Em curso" },
    { titulo: "Buraco na faixa de rodagem", categoria: "Pavimentos", data: "10 abr. 2026", resolucao: "Não iniciada" },
  ];

  return (
    <>
      <div className="painel-topo">
        <div>
          <h2>Ocorrências do departamento</h2>
          <p className="painel-sub">
            Atualize o estado das ocorrências que lhe foram encaminhadas.
          </p>
        </div>
      </div>

      <div className="cartao">
        <table>
          <thead>
            <tr>
              <th>Ocorrência</th>
              <th>Categoria</th>
              <th>Encaminhada</th>
              <th>Resolução</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ocorrencias.map((o) => (
              <tr key={o.titulo}>
                <td><strong>{o.titulo}</strong></td>
                <td>{o.categoria}</td>
                <td>{o.data}</td>
                <td><Chip texto={o.resolucao} /></td>
                <td><a href="#" className="link-acao">Atualizar estado</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- Escolhe o conteúdo consoante o perfil ---------- */
export default function Home() {
  const perfil = localStorage.getItem("perfil");

  if (!MENUS[perfil]) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Painel perfil={perfil}>
      {perfil === "cidadao" && <HomeCidadao />}
      {perfil === "administrador" && <HomeAdmin />}
      {perfil === "funcionario" && <HomeFuncionario />}
    </Painel>
  );
}