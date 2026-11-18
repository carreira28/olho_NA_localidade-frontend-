import { NavLink, useNavigate } from "react-router-dom";
import { terminarSessao } from "../utils/sessao.js";
import { SiGoogleforms } from "react-icons/si";
import { IoIosLogOut } from "react-icons/io";

const classeMenu = ({ isActive }) =>
  isActive ? "menu-item ativo" : "menu-item";

export default function BarraLateral() {
  const navigate = useNavigate();

  return (
    <aside className="painel-lateral">
      <div>
        <p className="painel-marca">Olho na localidade</p>
        <p className="painel-area">Funcionario</p>
        <nav>
          <NavLink to="/funcionario/ocorrencias" end className={classeMenu}>
            <SiGoogleforms />
            <span>Ocorrências do departamento</span>
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
