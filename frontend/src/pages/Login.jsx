import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* TEMPORÁRIO: simula a base de dados.
   Quando houver API, apaga isto e usa o fetch em baixo. */
const UTILIZADORES_TESTE = [
  { email: "cidadao@teste.pt", password: "123456", perfil: "cidadao" },
  { email: "admin@teste.pt", password: "123456", perfil: "administrador" },
  { email: "funcionario@teste.pt", password: "123456", perfil: "funcionario" },
];

async function iniciarSessao(email, password) {
  // --- Versão simulada ---
  const utilizador = UTILIZADORES_TESTE.find(
    (u) => u.email === email && u.password === password
  );
  if (!utilizador) {
    throw new Error("E-mail ou palavra-passe incorretos.");
  }
  return { perfil: utilizador.perfil };

  // --- Versão com API (para usar mais tarde) ---
  // const resposta = await fetch("http://localhost:3000/api/auth/login", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (!resposta.ok) throw new Error("E-mail ou palavra-passe incorretos.");
  // return await resposta.json(); // tem de devolver { perfil: "cidadao" | "administrador" | "funcionario" }
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
      const { perfil } = await iniciarSessao(email, password);
      localStorage.setItem("perfil", perfil);
      navigate("/home");
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
<<<<<<< HEAD
              placeholder="••••••••••••"
=======
              placeholder="******"
>>>>>>> cd7881cf5006ff091b9f58636076572a660c5e20
              required
            />

            {erro && <p className="auth-erro" role="alert">{erro}</p>}

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
