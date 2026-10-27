import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

// Converte a resposta do backend num dos 3 perfis do frontend
function obterPerfil(utilizador) {
  if (utilizador.tipo === "cidadao") return "cidadao";
  if (utilizador.perfil === "ADMINISTRADOR") return "administrador";
  if (utilizador.perfil === "FUNCIONARIO MUNICIPAL") return "funcionario";
  return null;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    try {
      const dados = await api("/auth/signin", {
        method: "POST",
        body: { email, password },
      });

      const perfil = obterPerfil(dados.utilizador);
      if (!perfil) {
        setErro("Tipo de utilizador desconhecido.");
        return;
      }

      localStorage.setItem("token", dados.token);
      localStorage.setItem("perfil", perfil);
      localStorage.setItem("utilizador", JSON.stringify(dados.utilizador));
      navigate("/OcorrenciasCidadao");
    } catch (err) {
      setErro(err.message);
    }
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
          <p className="auth-sub">
            Inicie sessão para consultar as suas ocorrências.
          </p>

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

            {erro && (
              <p className="auth-erro" role="alert">
                {erro}
              </p>
            )}

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
