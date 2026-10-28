//import { useEffect, useMemo, useState } from "react";
//import { useNavigate } from "react-router-dom";
//import { api } from "../api.js";
import BarraLateral from "../components/BarraLateralCidadao.jsx";
import BarraTopo from "../components/BarraTopo.jsx";
//import { lerUtilizador } from "../utils/sessao.js";

export default function Reportar() {
  return (
    <div className="painel">
      <BarraLateral />

      <div className="painel-principal">
        <BarraTopo />

        <main className="painel-conteudo">
          <div className="painel-topo">
            <div>
              <h2>Reportar ocorrência</h2>
            </div>
          </div>

          <div className="cartao">
            <h3 className="cartao-titulo">1. O que aconteceu?</h3>
          </div>
        </main>
      </div>
    </div>
  );
}
