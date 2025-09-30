import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// URL pública do seu Apps Script (Web App)
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbx2ncaZ8IbYnnf-eQzTUEC85uByEFBnLACbycvx-E2vrCWD9m3ZsmZbXpKuN_oKRo21/exec";

const CAMPOS_OBRIGATORIOS = [
  "nome",
  "email",
  "telefone",
  "cidade",
  "nascimento",
];

export async function POST(req: NextRequest) {
  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch (err) {
    console.error("[INSCRICOES] JSON inválido", err);
    return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  const dados: Record<string, string> = {};
  for (const [campo, valor] of Object.entries(corpo)) {
    if (typeof valor === "string") dados[campo] = valor.trim();
    else if (valor == null) continue;
    else dados[campo] = String(valor);
  }

  const faltando = CAMPOS_OBRIGATORIOS.filter((campo) => !dados[campo]);
  if (faltando.length) {
    return NextResponse.json(
      {
        ok: false,
        erro: `Campos obrigatórios ausentes: ${faltando.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const inscricao = {
    ...dados,
    criadoEm: new Date().toISOString(),
  };

  try {
    const respostaWebhook = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inscricao),
    });

    const texto = await respostaWebhook.text();
    let resposta: any = {};
    try { resposta = JSON.parse(texto); } catch { resposta = { bruto: texto }; }

    if (!respostaWebhook.ok) {
      console.error("[INSCRICOES] GAS falhou", respostaWebhook.status, resposta);
      return NextResponse.json(
        { ok: false, erro: `Falha ao encaminhar inscrição (HTTP ${respostaWebhook.status})` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, encaminhado: true, resposta });
  } catch (err: any) {
    console.error("[INSCRICOES] Erro ao chamar GAS", err);
    return NextResponse.json(
      { ok: false, erro: "Erro interno ao registrar inscrição" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: true, mensagem: "Use POST para enviar inscrições" });
}
