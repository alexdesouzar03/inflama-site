export async function salvarInscricao(dados: Record<string, any>) {
  const url =
    "https://script.google.com/macros/s/AKfycbz4hwFzJkCs3awGY7EAU1RoVAdhkL8TZumPHPXFmQ1R1dbyxDfWilE0Ir_UjXiCJX8TwA/exec";

  const form = new FormData();
  Object.entries(dados).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    form.append(k, String(v));
  });

  // no-cors: não dá pra ler a resposta, mas o Apps Script recebe
  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    body: form,
  });

  // se chegou aqui sem exception de rede, considere sucesso
  return true;
}
