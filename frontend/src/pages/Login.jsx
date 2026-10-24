import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Por agora só mostra na consola. Mais tarde ligamos à API.
    console.log("Login:", { email, password });
  }

  return (
    <div className="auth">
      <aside className="auth-painel">
        <div className="auth-painel-topo">
          <p className="auth-painel-marca">A sua voz na sua localidade</p>
          <h1>Uma localidade melhor começa consigo.</h1>
          <p className="auth-painel-texto">
            Reporte o que precisa de atenção. Acompanhe cada passo até à
            resolução.
          </p>
        </div>
        <p className="auth-painel-rodape">
          📍 Mais perto da sua localidade. Todos os dias.
        </p>
      </aside>

      <section className="auth-form-lado">
        <div className="auth-form">
          <p className="auth-etiqueta">Bem-vindo ao Olho na Localidade</p>
          <h2>Bem-vindo de volta</h2>
          <p className="auth-sub">Inicie sessão para consultar as suas ocorrências.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />

            <label htmlFor="password">Palavra-passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <button type="submit" className="btn-auth">
              <span aria-hidden="true">→</span> Iniciar sessão
            </button>
          </form>

          <p className="auth-troca">
            Ainda não tem conta? <Link to="/registo">Criar conta</Link>
          </p>
        </div>
      </section>
    </div>
  );
}