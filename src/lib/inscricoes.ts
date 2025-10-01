// src/lib/inscricoes.ts

export type InscricaoPayload = {
  nome: string;
  email: string;
  whatsapp: string; // telefone do retirante
  cidade: string;
  sexo: string; // "M" | "F" | ""
  nascimento: string; // "DD/MM/YYYY" ou "YYYY-MM-DD"
  resp1?: string; // "Nome - Telefone"
  resp2?: string; // "Nome - Telefone"
  alergias?: string;
  restricoes?: string;
};

/**
 * Envia a inscrição para a API interna `/api/inscricoes` (proxy do servidor → GAS).
 * Retorna `true` em caso de sucesso; lança erro caso contrário.
 */
export async function salvarInscricao(dados: InscricaoPayload): Promise<true> {
  // Normaliza para strings e remove undefined/null
  const payload: Record<string, string> = {};
  (Object.keys(dados) as (keyof InscricaoPayload)[]).forEach((k) => {
    const v = dados[k];
    if (v === undefined || v === null) return;
    payload[k] = String(v).trim();
  });

  // Normaliza data 1990-01-31 -> 31/01/1990
  const v = payload.nascimento?.trim();
  if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-");
    payload.nascimento = `${d}/${m}/${y}`;
  }

  const res = await fetch("/api/inscricoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = {};
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok || data?.ok !== true) {
    throw new Error(
      data?.erro || data?.error || data?.raw || `Falha ao enviar inscrição (HTTP ${res.status})`
    );
  }

  return true;
}