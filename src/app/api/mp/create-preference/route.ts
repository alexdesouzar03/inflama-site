import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("[MP] MP_ACCESS_TOKEN ausente");
    return NextResponse.json({ error: "MP_ACCESS_TOKEN ausente" }, { status: 500 });
  }

  // lê body sem travar se vier vazio
  let body: any = {};
  try { body = await req.json(); } catch {}

  // também aceita ?method=pix|credit na querystring
  const url = new URL(req.url);
  const methodParam = url.searchParams.get("method") || body?.method;
  type Metodo = "pix" | "credit";
  const metodo: Metodo = (methodParam === "credit" ? "credit" : "pix");

  const titleBase = body?.title ?? "Inscrição – InFLAMA 2025";

  // 🔒 preços definidos no servidor
  const BASE_PRICE = 150;   // Pix
  const CREDIT_PRICE = 158; // Cartão (base 150 + margem p/ taxa ~4,98%)
  const unitPrice = metodo === "credit" ? CREDIT_PRICE : BASE_PRICE;

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    // Restrições de método conforme a escolha
    const excluded_payment_types = [ { id: "ticket" } ]; // sem boleto
    if (metodo === "pix") {
      // Pix: bloqueia crédito e débito; mantém bank_transfer
      excluded_payment_types.push({ id: "credit_card" }, { id: "debit_card" });
    } else {
      // Cartão: bloqueia Pix (bank_transfer) e débito
      excluded_payment_types.push({ id: "bank_transfer" }, { id: "debit_card" });
    }

    const pref = await preference.create({
      body: {
        items: [
          {
            id: `inscricao-${metodo}`,
            title: `${titleBase} – ${metodo === "credit" ? "Cartão" : "Pix"}`,
            quantity: 1,
            unit_price: Number(unitPrice),
          },
        ],
        currency_id: "BRL",
        payment_methods: {
          excluded_payment_types,
          installments: 1,
          default_installments: 1,
        },
        // opcional: facilita conciliação
        external_reference: `inscricao-${metodo}-${Date.now()}`,
      },
    });

    console.log("[MP PREF OK]", {
      id: pref.id,
      metodo,
      value: unitPrice,
      hasInit: Boolean(pref.init_point),
      hasSandbox: Boolean(pref.sandbox_init_point),
    });

    return NextResponse.json({
      id: pref.id,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
    });
  } catch (err: any) {
    const full = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error("[MP PREF ERRO]", full);

    const msg =
      err?.message ||
      err?.cause?.message ||
      err?.response?.data?.message ||
      "Falha ao criar preferência";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}