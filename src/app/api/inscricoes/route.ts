// src/app/api/inscricoes/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// URL do seu Apps Script (Web App) – use a MAIS RECENTE
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwpCviSlF9yF1ni_ObpnEo6VhcH-MMy5nq_FJ5aEYIu0FQL2ea6ZzxRpNtRUWf1fE8O/exec";

// Campos obrigatórios no fluxo atual
const CAMPOS_OBRIGATORIOS = ["nome", "email", "whatsapp", "cidade", "nascimento"] as const;

export async function POST(req: NextRequest) {
  // 1) Lê JSON com segurança
  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  // 2) Normaliza para strings (remove undefined/null)
  const dados: Record<string, string> = {};
  for (const [k, v] of Object.entries(corpo)) {
    if (v == null) continue;
    dados[k] = typeof v === "string" ? v.trim() : String(v);
  }

  // 3) Compatibilidade: se vier "telefone" e não "whatsapp", mapeia
  if (dados.telefone && !dados.whatsapp) {
    dados.whatsapp = dados.telefone;
    delete dados.telefone;
  }

  // 4) Checa obrigatórios
  const faltando = CAMPOS_OBRIGATORIOS.filter((k) => !dados[k]);
  if (faltando.length) {
    return NextResponse.json(
      { ok: false, erro: `Campos obrigatórios ausentes: ${faltando.join(", ")}` },
      { status: 400 }
    );
  }

  // 5) Normaliza data 1990-01-31 -> 31/01/1990
  const nasc = dados.nascimento?.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(nasc)) {
    const [y, m, d] = nasc.split("-");
    dados.nascimento = `${d}/${m}/${y}`;
  }

  // 6) Anexa timestamp informativo
  const inscricao = {
    ...dados,
    criadoEm: new Date().toISOString(),
  };

  try {
    // 7) Chama o GAS a partir do servidor (sem CORS)
    const r = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inscricao),
    });

    const text = await r.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!r.ok) {
      console.error("[/api/inscricoes] GAS not OK", r.status, text);
      return NextResponse.json(
        { ok: false, error: `GAS HTTP ${r.status}`, gasText: text },
        { status: 502 }
      );
    }

    if (data?.ok !== true) {
      console.error("[/api/inscricoes] GAS payload not ok", data);
      return NextResponse.json(
        { ok: false, error: "Resposta inesperada do GAS", gasText: text },
        { status: 502 }
      );
    }

    // Sucesso
    return NextResponse.json({ ok: true, encaminhado: true });
  } catch (err: any) {
    console.error("[/api/inscricoes] error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Falha de rede ao contatar GAS" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: true, hint: "Use POST para enviar a inscrição" });
}