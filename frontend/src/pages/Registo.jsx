import { useState } from "react";
import { Link } from "react-router-dom";

export default function Registo() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 6) {
      setErro("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    setErro("");
    console.log("Registo:", { nome, email, password });
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
          Mais perto da sua localidade. Todos os dias.
        </p>
      </aside>

      <section className="auth-form-lado">
        <div className="auth-form">
          <p className="auth-etiqueta">Criar conta</p>
          <h2>Junte-se à comunidade</h2>
          <p className="auth-sub">Preencha os seus dados para começar.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />

            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Palavra-passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
=======
              placeholder="******"
>>>>>>> cd7881cf5006ff091b9f58636076572a660c5e20
              required
            />

            {erro && (
              <p className="auth-erro" role="alert">
                {erro}
              </p>
            )}

            <button type="submit" className="btn-auth">
              <span aria-hidden="true">+</span> Criar conta
            </button>
          </form>

          <p className="auth-troca">
            Já tem conta? <Link to="/login">Iniciar sessão</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
