// src/lib/inscricoes.ts

export type DadosInscricao = {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  sexo: string;
  nascimento: string;
  resp1: string;
  resp2: string;
  alergias?: string;
  restricoes?: string;
};

export async function salvarInscricao(dados: DadosInscricao): Promise<boolean> {
  const url =
    "https://script.google.com/macros/s/AKfycbz4hwFzJkCs3awGY7EAU1RoVAdhkL8TZumPHPXFmQ1R1dbyxDfWilE0Ir_UjXiCJX8TwA/exec";

  const form = new FormData();
  Object.entries(dados).forEach(([k, v]) => {
    if (v) form.append(k, v);
  });

  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    body: form,
  });

  return true; // se não deu erro de rede, considera sucesso
}
