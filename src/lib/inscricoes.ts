// src/lib/inscricoes.ts

export type InscricaoPayload = {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  sexo: string;            // "M" | "F" | ...
  nascimento: string;      // "YYYY-MM-DD" ou "DD/MM/YYYY"
  resp1?: string;
  resp2?: string;
  alergias?: string;
  restricoes?: string;
};

/**
 * Envia a inscrição via API interna (evita CORS) e retorna true em caso de sucesso.
 * Lança erro com mensagem amigável se falhar.
 */
export async function salvarInscricao(dados: InscricaoPayload): Promise<true> {
  // Normaliza valores para string e evita undefined no corpo
  const payload: Record<string, string> = {};
  (Object.keys(dados) as (keyof InscricaoPayload)[]).forEach((k) => {
    const v = dados[k];
    if (v === undefined || v === null) return;
    payload[k] = String(v);
  });

  // Timeout de 15s para evitar travar a UI
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch("/api/inscricoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(t);
    console.error("Falha de rede ao enviar inscrição:", e);
    throw new Error("Não foi possível enviar a inscrição. Verifique sua conexão e tente novamente.");
  }

  clearTimeout(t);

  // tenta ler a resposta com segurança
  const text = await res.text();
  let data: any = {};
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok || data?.ok !== true) {
    console.error("Falha ao salvar inscrição:", res.status, data);
    const msg = data?.error || `Falha ao enviar inscrição (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return true;
}
