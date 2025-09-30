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
          body: JSON.stringify({
            title: "Inscrição – InFLAMA 2025",
            quantity: 1,
            unit_price: 150,
          }),
        });

        // Parse robusto (não quebra se vier texto/HTML)
        const text = await res.text();
        let data: any = {};
        try { data = JSON.parse(text); } catch { data = { raw: text }; }

        if (!res.ok || !data?.id) {
          console.error("Create pref response:", res.status, data);
          setError(data?.error || `Erro ao criar preferência (HTTP ${res.status})`);
          return; // não lança erro, só mostra no modal
        }

        setPrefId(data.id);
      } catch (e: any) {
        console.error("Checkout preference error:", e);
        setError("Não foi possível iniciar o pagamento. Tente novamente.");
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

  return (
    <div className="space-y-3">
      {/* Botão de teste: abre o Checkout Pro via init_point */}
      <button
        type="button"
        onClick={async () => {
          try {
            const res = await fetch("/api/mp/create-preference", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: "Teste", quantity: 1, unit_price: 150 }),
            });
            const text = await res.text();
            let data: any = {};
            try { data = JSON.parse(text); } catch { data = { raw: text }; }
            if (res.ok && data?.init_point) {
              window.open(data.init_point, "_blank");
            } else {
              alert("Erro ao criar preferência de teste. Veja o console.");
              console.error("Resposta de teste:", res.status, data);
            }
          } catch (e) {
            console.error(e);
            alert("Falha na requisição de teste.");
          }
        }}
        className="text-sm underline decoration-dotted"
      >
        Testar preferência (abrir Checkout Pro)
      </button>

      <Wallet
        initialization={{ preferenceId: prefId }}
        customization={{
          paymentMethods: {
            ticket: "none",       // sem boleto
            atm: "none",          // sem caixa eletrônico
            bankTransfer: "all",  // Pix
            creditCard: "all",
            debitCard: "all",
            maxInstallments: 1,   // reforça 1x
          },
        }}
      />
    </div>
  );
}