"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

type Props = { open?: boolean }; // passe open={true} quando abrir o modal

export default function WalletCheckout({ open = true }: Props) {
  const [prefId, setPrefId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletReady, setWalletReady] = useState(false);
  const [fallbackInitPoint, setFallbackInitPoint] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSafari = useMemo(
    () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    []
  );

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: "pt-BR" });
  }, []);

  async function createPreference() {
    setLoading(true);
    setError(null);
    setPrefId(null);
    setWalletReady(false);
    setFallbackInitPoint(null);

    try {
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Inscrição – InFLAMA 2025" }), // preço é definido no backend
        cache: "no-store",
      });

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (!res.ok || !data?.id) {
        console.error("Create pref response:", res.status, data);
        const errText =
          typeof data?.error === "string"
            ? data.error
            : data?.error
              ? JSON.stringify(data.error)
              : `Erro ao criar preferência (HTTP ${res.status})`;
        setError(errText);
        return;
      }

      setPrefId(data.id);
      // guarda init_point para fallback
      if (data?.init_point) setFallbackInitPoint(data.init_point);
      setError(""); // exibe o fallback imediatamente
    } catch (e: any) {
      console.error("Checkout preference error:", e);
      setError(e?.message || "Não foi possível iniciar o pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function openCheckout(method: "pix" | "credit") {
    try {
      const res = await fetch(`/api/mp/create-preference?method=${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Inscrição – InFLAMA 2025" }),
      });
      const data = await res.json();
      if (res.ok && data?.init_point) {
        window.open(data.init_point, "_blank");
      } else {
        console.error("Checkout redirect error:", res.status, data);
        alert("Não foi possível abrir o checkout. Tente novamente.");
      }
    } catch (e) {
      console.error(e);
      alert("Falha na requisição. Tente novamente.");
    }
  }

  // busca a preferência toda vez que o modal abrir
  useEffect(() => {
    if (!open) return;
    createPreference();
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  if (loading) {
    return <div className="text-neutral-400 text-sm">Carregando formas de pagamento…</div>;
  }

  // fallback UI: erro + botão “Pagar agora” via init_point
  if (error !== null) {
    return (
      <div className="text-sm space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openCheckout("pix")}
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-green-600 text-white"
          >
            Pagar com Pix (R$ 150)
          </button>
          <button
            type="button"
            onClick={() => openCheckout("credit")}
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-blue-600 text-white"
          >
            Pagar com Cartão (R$ 158)
          </button>
        </div>
      </div>
    );
  }

  if (!prefId) return null;

  return (
    <div className="min-h-[64px]"> {/* garante altura mínima visível */}
      <Wallet
        key={prefId}
        initialization={{ preferenceId: prefId }}
        customization={{
          paymentMethods: {
            ticket: "none",
            atm: "none",
            bankTransfer: "all",  // Pix
            creditCard: "all",
            debitCard: "none",
            maxInstallments: 1,
          },
        }}
        onReady={() => {
          setWalletReady(true);
          if (timer.current) clearTimeout(timer.current);
          console.log("Wallet pronto");
        }}
        onError={(e) => {
          console.error("Wallet SDK error:", e);
          setError("Ocorreu um problema ao carregar o botão de pagamento. Tente novamente.");
        }}
      />
    </div>
  );
}