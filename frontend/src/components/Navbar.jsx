import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
         Olho no Concelho
      </Link>

      <nav className="navbar-links">
        <NavLink to="/" end>Início</NavLink>
        <NavLink to="/cidadao/ocorrencias">As minhas ocorrências</NavLink>
        <NavLink to="/login" className="btn-nav">Entrar</NavLink>
      </nav>
    </header>
  );
}