function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Chip({ texto }) {
  const t = normalizar(texto);
  let tipo = "neutro";

  if (t.includes("pendente")) tipo = "aviso";
  else if (t.includes("rejeit")) tipo = "erro";
  else if (t.includes("valid") || t.includes("conclu") || t.includes("resolvid")) tipo = "ok";
  else if (t.includes("analise") || t.includes("curso")) tipo = "info";

  return <span className={`chip chip-${tipo}`}>{texto}</span>;
}