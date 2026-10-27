import { useNavigate } from "react-router-dom";
import { terminarSessao } from "../utils/sessao.js";

export default function BarraLateral() {
  const navigate = useNavigate();

  return (
    <aside className="painel-lateral">
      <div>
        <p className="painel-marca">Olho na localidade</p>
        <p className="painel-area">Cidadão</p>

        <nav>
          <button className="menu-item ativo">
            <span>As minhas ocorrências</span>
          </button>
          <button className="menu-item">
            <span>Reportar ocorrência</span>
          </button>
        </nav>
      </div>

      <button className="menu-item menu-sair" onClick={() => terminarSessao(navigate)}>
        <span>Terminar sessão</span>
      </button>
    </aside>
  );
}