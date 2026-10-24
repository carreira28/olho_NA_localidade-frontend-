import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="hero">
      <h1>Viu um problema no seu concelho?</h1>
      <p>
        Reporte buracos, iluminação avariada, lixo acumulado e outras situações
        diretamente à câmara municipal.
      </p>
      <Link to="/registo" className="btn">Começar agora</Link>
    </section>
  );
}