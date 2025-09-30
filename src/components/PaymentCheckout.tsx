"use client";
import { useEffect, useState } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

export default function WalletCheckout() {
  const [prefId, setPrefId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: "pt-BR" });

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/mp/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // preço é definido no backend; não precisamos enviar aqui
          body: JSON.stringify({ title: "Inscrição – InFLAMA 2025" }),
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
          return; // não lança erro, só mostra no UI
        }

        setPrefId(data.id);
      } catch (e: any) {
        console.error("Checkout preference error:", e);
        setError(e?.message || "Não foi possível iniciar o pagamento. Tente novamente.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-neutral-400 text-sm">Carregando formas de pagamento…</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-red-400">
        {error}{" "}
        <button
          onClick={() => location.reload()}
          className="underline decoration-dotted"
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!prefId) return null;

  // Tipagem do SDK varia por versão; usamos any para manter os filtros de métodos
  const walletCustomization: any = {
    paymentMethods: {
      ticket: "none",
      atm: "none",
      bankTransfer: "all",  // Pix
      creditCard: "all",    // crédito
      debitCard: "none",    // sem débito
      maxInstallments: 1,     // 1x
    },
  };

  return (
    <div className="space-y-3">
      <Wallet
        initialization={{ preferenceId: prefId }}
        customization={walletCustomization as any}
      />
    </div>
  );
}