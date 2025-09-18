// src/lib/inscricoes.ts

export type InscricaoPayload = Record<string, string>;

export async function salvarInscricao(dados: InscricaoPayload): Promise<true> {
  const url =
    "https://script.google.com/macros/s/AKfycbz4hwFzJkCs3awGY7EAU1RoVAdhkL8TZumPHPXFmQ1R1dbyxDfWilE0Ir_UjXiCJX8TwA/exec";

  const form = new FormData();
  Object.entries(dados).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    form.append(k, v); // já é string
  });

  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    body: form,
  });

  return true;
}
