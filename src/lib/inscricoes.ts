// src/lib/inscricoes.ts

export type InscricaoPayload = Record<string, string>;

/**
 * Envia a inscrição via API interna (evita CORS) e retorna true em caso de sucesso.
 */
export async function salvarInscricao(dados: InscricaoPayload): Promise<true> {
  const res = await fetch("/api/inscricoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
    cache: "no-store",
  });

  // tenta ler a resposta com segurança
  const text = await res.text();
  let data: any = {};
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok || data?.ok !== true) {
    console.error("Falha ao salvar inscrição:", res.status, data);
    throw new Error(data?.error || `Falha ao enviar inscrição (HTTP ${res.status})`);
  }

  return true;
}
