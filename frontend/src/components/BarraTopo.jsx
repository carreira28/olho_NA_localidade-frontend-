import { lerUtilizador } from "../utils/sessao.js";

export default function BarraTopo() {
  const utilizador = lerUtilizador();

  return (
    <header className="barra-topo">
      <span>{utilizador.nome}</span>
    </header>
  );
}
