import { Link } from "react-router-dom";

export default function SemPermissoes() {
  return (
    <main className="auth-form-lado">
      <div className="auth-form">
        <h2>Sem permissões</h2>
        <p className="auth-sub">
          Esta página não está disponível para a tua conta.
        </p>
        <Link to="/login" className="auth-troca">
          Voltar ao login
        </Link>
      </div>
    </main>
  );
}
