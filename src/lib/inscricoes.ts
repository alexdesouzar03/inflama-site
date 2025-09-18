// src/lib/inscricoes.ts
export interface InscricaoPayload {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  sexo: string;
  nascimento: string; // yyyy-mm-dd
  resp1: string;
  resp2: string;
  alergias?: string;
  restricoes?: string;
}

export async function salvarInscricao(dados: InscricaoPayload) {
  const url =
    "https://script.google.com/macros/s/AKfycbz4hwFzJkCs3awGY7EAU1RoVAdhkL8TZumPHPXFmQ1R1dbyxDfWilE0Ir_UjXiCJX8TwA/exec";

  const form = new FormData();
  (Object.entries(dados) as [keyof InscricaoPayload, InscricaoPayload[keyof InscricaoPayload]][])
    .forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      form.append(String(k), String(v));
    });

  await fetch(url, { method: "POST", mode: "no-cors", body: form });
  return true;
}
