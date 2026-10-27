import { NavLink, useNavigate } from "react-router-dom";
import { terminarSessao } from "../utils/sessao.js";
import { TiThListOutline } from "react-icons/ti";
import { FiPlusCircle } from "react-icons/fi";
import { IoIosLogOut } from "react-icons/io";

const classeMenu = ({ isActive }) =>
  isActive ? "menu-item ativo" : "menu-item";

export default function BarraLateral() {
  const navigate = useNavigate();

  return (
    <aside className="painel-lateral">
      <div>
        <p className="painel-marca">Olho na localidade</p>
        <p className="painel-area">Cidadão</p>

        <nav>
          <NavLink to="/OcorrenciasCidadao" end className={classeMenu}>
            <TiThListOutline />
            <span>As minhas ocorrências</span>
          </NavLink>

          <NavLink to="/reportar" className={classeMenu}>
            <FiPlusCircle />
            <span>Reportar ocorrência</span>
          </NavLink>
        </nav>
      </div>

      <button
        className="menu-item menu-sair"
        onClick={() => terminarSessao(navigate)}
      >
        <IoIosLogOut className="meu-icone" />
        <span>Terminar sessão</span>
      </button>
    </aside>
  );
}
