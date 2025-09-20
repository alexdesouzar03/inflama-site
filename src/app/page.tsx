"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// 👇 ajuste o caminho conforme a sua estrutura: src/lib/inscricoes.ts
import { salvarInscricao } from "../lib/inscricoes"; 
import { PIX_COPIA_E_COLA } from "../lib/pix";
// se você não usa alias "@", use caminho relativo:
// import { salvarInscricao } from "../lib/inscricoes";

import Image from "next/image";
import { createPortal } from "react-dom";
import {
  QrCode,
  Menu,
  X,
  Flame,
  Music2,
  UsersRound,
  ChevronRight,
  ChevronLeft,
  Gamepad2,
  BookOpenText,
  Shirt,
  Bath,
  BedDouble,
  Sun,
  Wand2,
  Sparkles,
  Heart,
  Zap,
  Globe,
  Instagram,
} from "lucide-react";

/* =================== CONFIG =================== */
const COLORS = {
  bg: "bg-neutral-950",
  text: "text-white",
  grad: "from-orange-500 via-red-500 to-yellow-400",
};

const EVENTO = {
  nome: "Retiro InFLAMA 2025",
  slogan: "Seja luz, seja fogo, seja d’Ele!",
  data: "08–09 de novembro de 2025",
  local: "Chácara Provérbios • Apucarana/PR",
  preco: 150,
  vagasTotal: 80,
  faixaEtaria: "12–19 anos",
  inicioISO: "2025-11-08T08:00:00-03:00",
};

const CONTATO = {
  whatsappExibicao: "+55 43 99139-7163",
  whatsappLink: "5543991397163",
  email: "juventudefogosanto@gmail.com",
  instagram: "https://www.instagram.com/juventudefogosanto",
  instagramHandle: "@juventudefogosanto",
};

const PIX = {
  copiaCola:
    "00020126760014br.gov.bcb.pix0136410d84bb-07aa-4001-8890-e96f658ef9d30214Doacao Retiro 5204000053039865802BR5925Alexsandro de Souza Rocha6009Sao Paulo610901227-20062230519daqr239052001348688630437C0",
  chave: "410d84bb-07aa-4001-8890-e96f658ef9d3",
  recebedor: "Alexsandro de Souza Rocha",
  qrImage: "/doacao-qr.png", // coloque esse arquivo em /public
};

/* =================== UTILS =================== */
function copyToClipboard(text: string, okMessage = "Copiado!") {
  try {
    navigator.clipboard?.writeText(text);
    alert(okMessage);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    alert(okMessage);
  }
}
function fmtBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
function calcCountdown(targetISO: string, nowMs: number) {
  const target = new Date(targetISO).getTime();
  const diff = Math.max(0, target - nowMs);
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}
function useCountdown(targetISO: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return calcCountdown(targetISO, now);
}
function useFakeSpots(total: number) {
  const MIN = 5;
  const [left, setLeft] = useState<number>(() => total);
  useEffect(() => {
    const id = setInterval(() => setLeft((p) => (p > MIN ? p - 1 : p)), 120000);
    return () => clearInterval(id);
  }, []);
  return left;
}

/* =================== BASE SECTION =================== */
function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-8">
        <h2 className="text-left text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-red-500 to-yellow-400 text-transparent bg-clip-text">
          {title}
        </h2>
        {subtitle && (
          <div className="mt-3 max-w-3xl text-left text-lg text-neutral-300">
            {subtitle}
          </div>
        )}
      </header>

      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}

/* =================== NAVBAR =================== */
/* =================== NAVBAR =================== */
function NavbarDrawer({ onOpenForm }: { onOpenForm: () => void }) {
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  const LINKS = [
    { href: "#sobre", label: "Sobre" },
    { href: "#destaques", label: "Destaques" },
    { href: "#times", label: "Times" },
    { href: "#lineup", label: "Line-up" },
    { href: "#o-que-levar", label: "O que levar" },
    { href: "#apoio", label: "Apoio" },
    { href: "#faq", label: "FAQ" },
    { href: "#contato", label: "Contato" },
  ];

  // bloqueia o scroll do body quando o menu está aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // foca no primeiro link
    const t = setTimeout(() => firstLinkRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const closeAnd = (fn?: () => void) => () => {
    setOpen(false);
    fn?.();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-zinc-950/75 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="text-xl md:text-2xl font-extrabold">
          <span className="text-zinc-200">JFS • </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-amber-400">
            InFLAMA 2025
          </span>
        </a>

        {/* desktop */}
        <nav className="hidden md:flex items-center gap-7 text-zinc-200">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-orange-500 transition">
              {l.label}
            </a>
          ))}
          <a
            href={CONTATO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-orange-500 transition"
          >
            <Instagram className="h-5 w-5" />
            <span className="hidden lg:inline">{CONTATO.instagramHandle}</span>
          </a>
          <button
            onClick={onOpenForm}
            className="rounded-full bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 px-4 py-2 font-semibold text-white shadow hover:opacity-95"
          >
            Inscreva-se
          </button>
        </nav>

        {/* botão mobile */}
        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-zinc-200 hover:text-orange-500"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* drawer mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-[60]"
          aria-hidden={!open}
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          {/* painel */}
          <aside
            className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-zinc-950 border-l border-neutral-800 shadow-2xl translate-x-0 animate-[slideIn_.2s_ease-out] p-6 flex flex-col gap-4"
            // proteção pra não fechar ao clicar dentro
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Menu</span>
              <button
                className="p-2 rounded-lg hover:bg-neutral-900"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-2 grid gap-3 text-zinc-200">
              {LINKS.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  ref={i === 0 ? firstLinkRef : undefined}
                  className="rounded-lg px-3 py-2 hover:bg-neutral-900 hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  onClick={closeAnd()}
                >
                  {l.label}
                </a>
              ))}

              <a
                href={CONTATO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-neutral-900 hover:text-orange-400"
                onClick={closeAnd()}
              >
                <Instagram className="h-5 w-5" />
                {CONTATO.instagramHandle}
              </a>

              <button
                onClick={closeAnd(onOpenForm)}
                className="mt-2 rounded-xl bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 px-4 py-2 font-semibold text-white shadow hover:opacity-95"
              >
                Inscreva-se
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* animação simples */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0%);
          }
        }
      `}</style>
    </header>
  );
}

/* =================== MODAL =================== */
function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const [mounted, setMounted] = useState(false);

  // Evita SSR warnings (renderiza só no client)
  useEffect(() => setMounted(true), []);

  // ESC para fechar + trava scroll do body
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center"
      onMouseDown={(e) => {
        // clique fora fecha
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/80" />
      <div
        className="relative z-[101] mx-auto mt-20 w-[92%] max-w-2xl rounded-2xl bg-neutral-950 border border-neutral-800 shadow-xl overflow-hidden pointer-events-auto"
        role="document"
        // evita que eventos do conteúdo borbulhem para o backdrop
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <strong>{title}</strong>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-900" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ======= PIX estático (copia-e-cola) ======= */
// use a constante PIX_COPIA_E_COLA definida no topo do arquivo

function PixPagamentoModal({
  open,
  onClose,
  copiaCola,        // passe PIX_COPIA_E_COLA aqui
  mostrarQr = true, // só mostra o <img> se houver imagem em /public
}: {
  open: boolean;
  onClose: () => void;
  copiaCola: string;
  mostrarQr?: boolean;
}) {
  async function copiar() {
    try {
      await navigator.clipboard.writeText(copiaCola);
      alert("Código PIX copiado!");
    } catch {
      alert("Não foi possível copiar. Copie manualmente.");
    }
  }

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Pagamento via PIX (R$ 150,00)">
      <div className="space-y-4">
        {/* QR estático (opcional) */}
        {mostrarQr && (
          <div className="flex justify-center">
            <img
              src="/pix-mp.png"  // precisa existir em /public
              alt="QR Code do PIX"
              className="w-64 h-64 rounded-lg border border-neutral-800"
            />
          </div>
        )}

        {/* Copia-e-cola */}
        <div className="space-y-2">
          <div className="text-sm text-neutral-300">PIX copia-e-cola</div>
          <textarea
            readOnly
            value={copiaCola}
            className="w-full h-32 resize-none rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copiar}
              className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800"
            >
              Copiar código
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="text-xs text-neutral-400">
          Beneficiário: <b className="text-neutral-200">Alexsandro de Souza Rocha</b> —{" "}
          Instituição: <b className="text-neutral-200">Mercado Pago</b>
        </div>
      </div>
    </Modal>
  );
}

/* =================== HERO =================== */
function HeroInflama({
  eventStart,
  totalSeats,
  remainingSeats,
  onInscrever,
}: {
  eventStart: string;
  totalSeats: number;
  remainingSeats: number;
  onInscrever: () => void;
}) {
  const { dias, horas, minutos, segundos } = useCountdown(eventStart);

  const used = Math.max(0, totalSeats - remainingSeats);
  const pct  = Math.min(100, Math.round((used / totalSeats) * 100));

  return (
    <header className="relative overflow-hidden pt-28 md:pt-32">
      {/* glow de fundo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
      >
        <div className="absolute -top-32 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-500 via-red-600 to-amber-400 blur-[140px] animate-pulse [animation-duration:6s]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-orange-400 via-red-500 to-yellow-300 text-transparent bg-clip-text">
          Retiro InFLAMA 2025
        </h1>

        {/* badges resumidas */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm md:text-base text-neutral-300">
          <span className="px-3 py-1 rounded-full bg-neutral-900/70 ring-1 ring-neutral-800">
            Seja luz, seja fogo, seja d’Ele!
          </span>
          <span className="px-3 py-1 rounded-full bg-neutral-900/70 ring-1 ring-neutral-800">
            08–09 nov · Chácara Provérbios · Apucarana/PR
          </span>
          <span className="px-3 py-1 rounded-full bg-neutral-900/70 ring-1 ring-neutral-800">
            Faixa etária: <b className="text-white">12–19</b> anos
          </span>
        </div>

        {/* countdown acessível */}
        <div
          className="mt-6 text-neutral-300"
          aria-live="polite"
          aria-atomic="true"
        >
          {([dias, horas, minutos, segundos] as number[]).map((n, i) => (
            <span
              key={i}
              className="inline-block px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 mr-2"
            >
              {String(n).padStart(2, "0")} {["d", "h", "m", "s"][i]}
            </span>
          ))}
        </div>

        {/* vagas + barra de progresso */}
        <div className="mt-5 mx-auto w-full max-w-md">
          <div className="text-sm text-neutral-300">
          Preenchidas <b className="text-white">{used}</b> de{" "}
          <b className="text-white">{totalSeats}</b> vagas
        </div>
          <div className="mt-2 h-2 w-full rounded-full bg-neutral-800 overflow-hidden ring-1 ring-neutral-700">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-400"
              style={{ width: `${pct}%` }}
              aria-label={`Inscrições: ${pct}% preenchidas`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <button
            onClick={onInscrever}
            className={`px-8 py-4 rounded-full bg-gradient-to-r ${COLORS.grad} font-bold text-lg shadow-lg hover:scale-[1.03] active:scale-100 transition`}
          >
            INSCREVA-SE
          </button>
          <a
            href="#apoio"
            className="px-8 py-4 rounded-full bg-neutral-900/70 ring-1 ring-neutral-700 font-semibold hover:bg-neutral-800 transition"
          >
            Apoiar o Retiro
          </a>
        </div>

        {/* cue para rolar */}
        <a
          href="#versiculo"
          className="mt-10 inline-flex flex-col items-center text-neutral-500 hover:text-neutral-300 transition"
        >
          <span className="text-xs">role para saber mais</span>
          <svg
            className="mt-1 h-5 w-5 animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </header>
  );
}

/* =================== TEMA BÍBLICO =================== */
function TemaBiblico() {
  return (
    <Section id="versiculo" title="Tema bíblico">
      {/* Cartão 1: versículo */}
      <div className="rounded-2xl bg-neutral-900/70 ring-1 ring-neutral-800 p-6 md:p-8">
        <p className="text-xl md:text-2xl italic text-neutral-200 leading-relaxed">
          “Mas descerá sobre vós o Espírito Santo e vos dará força; e sereis minhas testemunhas em
          Jerusalém, em toda a Judéia e Samaria e até os confins do mundo.”
        </p>
        <div className="mt-4 text-neutral-400">— Atos dos Apóstolos 1,8</div>
      </div>

      {/* Cartão 2: tema */}
      <div className="mt-6 rounded-2xl bg-neutral-900/70 ring-1 ring-neutral-800 p-6 md:p-8">
        <div className="flex items-center gap-3 text-orange-500">
          <Flame className="h-6 w-6" />
          <span className="text-lg font-semibold">Tema 2025</span>
        </div>

        <h3 className="mt-3 text-2xl md:text-3xl font-bold text-white">
          Inflamados pelo Espírito, enviados ao mundo!
        </h3>

        <div className="mt-4 text-neutral-300 flex flex-wrap gap-x-3 gap-y-1">
          <span>Jerusalém</span>
          <span>•</span>
          <span>Judeia</span>
          <span>•</span>
          <span>Samaria</span>
          <span>•</span>
          <span>Confins da Terra</span>
        </div>
      </div>
    </Section>
  );
}

/* =================== SOBRE =================== */
function SobreRetiro() {
  const CARDS = [
    {
      icon: <Flame className="h-6 w-6 text-orange-500" aria-hidden />,
      title: "Pregações que transformam",
      text: "Palavras vivas que tocam fundo e despertam a fé de um jeito jovem e autêntico.",
    },
    {
      icon: <Music2 className="h-6 w-6 text-orange-500" aria-hidden />,
      title: "Louvor que mexe com a alma",
      text: "Do agito à adoração profunda, o louvor vai te levar a sentir a presença de Deus de forma marcante.",
    },
    {
      icon: <Gamepad2 className="h-6 w-6 text-orange-500" aria-hidden />,
      title: "Diversão garantida",
      text: "Dinâmicas, jogos e risadas que aproximam, criam amizade e memórias pra vida toda.",
    },
    {
      icon: <UsersRound className="h-6 w-6 text-orange-500" aria-hidden />,
      title: "Convívio e amizade",
      text: "Dois dias intensos de partilha e novas conexões que viram família.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-orange-500" aria-hidden />,
      title: "Momentos de oração",
      text: "Missa, adoração e oração pessoal que fortalecem sua caminhada espiritual.",
    },
  ];

  return (
    <section id="sobre" className="relative mx-auto max-w-7xl px-6 py-16">
      <header className="mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-orange-500">
          Sobre o Retiro
        </h2>
        <p className="mt-3 text-lg text-zinc-300">
          Intensidade, fé e amizade em cada detalhe.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c, i) => (
          <article
            key={i}
            className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 hover:ring-orange-500/60 transition"
          >
            <div className="flex items-center gap-3">
              {c.icon}
              <h3 className="text-xl font-bold text-orange-500">{c.title}</h3>
            </div>
            <p className="mt-4 text-zinc-300 leading-relaxed">{c.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* =================== DESTAQUES (Carrossel) =================== */
function DestaquesCarousel() {
  const items = [
    {
      icon: <Flame className="h-6 w-6 text-orange-500" aria-hidden />,
      title: "Pregações que queimam por dentro",
      text: "Mensagens vivas que tocam, despertam e transformam sua vida.",
    },
    {
      icon: <Heart className="h-6 w-6 text-orange-500" aria-hidden />,
      title: "Amizades que ficam pra vida",
      text: "Conexões verdadeiras com jovens que buscam o mesmo propósito.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-orange-500" aria-hidden />,
      title: "Momentos de oração profunda",
      text: "Missas, adoração e oração comunitária que marcam a alma.",
    },
    {
      icon: <Music2 className="h-6 w-6 text-orange-500" aria-hidden />,
      title: "Louvor que explode em energia",
      text: "Cantos pra vibrar e adorar com intensidade.",
    },
  ];

  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollToIndex(i: number) {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>("[data-card]")[i];
    if (!card) return;
    const paddLeft = parseInt(getComputedStyle(el).paddingLeft || "0", 10) || 0;
    const left = card.offsetLeft - paddLeft;
    el.scrollTo({ left, behavior: "smooth" });
  }

  const step = useCallback(
    (dir: 1 | -1) => {
      setActive((prev) => {
        const next = (prev + dir + items.length) % items.length;
        setTimeout(() => scrollToIndex(next), 0);
        return next;
      });
    },
    [items.length]
  );

  useEffect(() => {
    const id = setInterval(() => step(1), 5000);
    return () => clearInterval(id);
  }, [step]);

  return (
    <Section id="destaques" title="Destaques" subtitle="O que te espera no InFLAMA 2025">
      <div className="relative">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => step(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-zinc-900/80 ring-1 ring-zinc-800 p-2 hover:ring-orange-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="Próximo"
          onClick={() => step(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-zinc-900/80 ring-1 ring-zinc-800 p-2 hover:ring-orange-500"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={railRef}
          className="scrollbar-hide flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-10"
          role="region"
          aria-roledescription="carrossel"
          aria-label="Destaques do retiro"
        >
          {items.map((item, i) => (
            <article
              key={i}
              data-card
              className="snap-start shrink-0 w-[86%] sm:w-[70%] md:w-[48%] lg:w-[32%] rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 hover:ring-orange-500/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-zinc-800/70 ring-1 ring-zinc-700">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{item.title}</h3>
              </div>
              <p className="mt-4 text-zinc-300 text-lg leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir para slide ${i + 1}`}
              onClick={() => {
                setActive(i);
                scrollToIndex(i);
              }}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                active === i ? "bg-orange-500" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* =================== TIMES =================== */
function TimesInflama() {
  const TIMES = [
    { nome: "Jerusalém", cor: "#0a0a0a", descricao: "Força e coragem para liderar pelo exemplo.", imagem: "/leao.png" },
    { nome: "Judeia", cor: "#ea580c", descricao: "Docilidade e ousadia para anunciar com amor.", imagem: "/cervo.png" },
    { nome: "Samaria", cor: "#f59e0b", descricao: "Olhar de águia: visão do alto e fidelidade.", imagem: "/aguia.png" },
    { nome: "Confins", cor: "#ef4444", descricao: "Unidade de matilha: juntos até os confins da terra.", imagem: "/lobo.png" },
  ];
  return (
    <Section id="times" title="Times do InFLAMA" subtitle="Quatro cores, quatro símbolos — um só coração (At 1,8)">
      <div className="grid gap-8 md:grid-cols-4">
        {TIMES.map((time) => (
          <article key={time.nome} className="flex flex-col items-center rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6" style={{ boxShadow: `0 0 24px ${time.cor}22` }}>
            <div className="h-32 w-32 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/10">
              <Image src={time.imagem} alt={time.nome} width={128} height={128} className="object-contain" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">{time.nome}</h3>
            <p className="mt-2 text-center text-zinc-400">{time.descricao}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* =================== LINE-UP =================== */
function Lineup() {
  const TEMAS = [
    { titulo: "Chamados pelo Nome", descricao: "Deus nos escolhe e chama pessoalmente.", Icon: Sparkles },
    { titulo: "Corações Livres", descricao: "Cura interior e libertação.", Icon: Heart },
    { titulo: "Fogo que Transforma", descricao: "O Espírito Santo renova e acende a fé.", Icon: Flame },
    { titulo: "Vida em Chamas", descricao: "Efusão do Espírito e vida conduzida por Ele.", Icon: Zap },
    { titulo: "Luz no Mundo", descricao: "Ser testemunha até os confins da terra.", Icon: Globe },
  ];
  return (
    <section id="lineup" className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-orange-500">Line-up</h2>
        <p className="mt-2 text-xl text-zinc-300">Quem conduz essa experiência</p>
      </header>
      <h3 className="mb-4 text-lg font-semibold text-zinc-400">Louvor</h3>
      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 text-center">
          <h4 className="text-2xl font-bold text-white">Ministério da Colo de Deus</h4>
          <p className="mt-3 text-zinc-300">Conduzindo momentos intensos de louvor e adoração durante o retiro.</p>
        </article>
      </div>
      <h3 className="mt-12 mb-4 text-lg font-semibold text-zinc-400">Temas das Pregações</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TEMAS.map(({ titulo, descricao, Icon }) => (
          <article key={titulo} className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800 p-6 hover:ring-orange-500/50 transition">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600/20">
              <Icon className="h-6 w-6 text-orange-500" />
            </div>
            <h4 className="text-xl font-bold text-white">{titulo}</h4>
            <p className="mt-2 text-zinc-300">{descricao}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* =================== CHECKLIST =================== */
function ChecklistSection() {
  type CatColor = "orange" | "sky" | "emerald" | "violet" | "amber" | "pink";
  const CATS = [
    {
      id: "espiritual",
      title: "Espiritual",
      color: "orange",
      Icon: BookOpenText,
      items: ["Bíblia", "Caderno e caneta", "Terço"],
    },
    {
      id: "roupas",
      title: "Roupas",
      color: "sky",
      Icon: Shirt,
      items: [
        "3 trocas confortáveis",
        "Agasalho",
        "Tênis + chinelo",
        "Tênis confortável para caminhada",
      ],
    },
    {
      id: "higiene",
      title: "Higiene",
      color: "emerald",
      Icon: Bath,
      items: [
        "Escova e pasta",
        "Sabonete / shampoo",
        "Desodorante",
        "Toalha",
      ],
    },
    {
      id: "dormir",
      title: "Dormir",
      color: "violet",
      Icon: BedDouble,
      items: [
        "Mulheres: lençol de cama",
        "Homens: saco de dormir ou colchão (além da barraca)",
        "Travesseiro (opcional)",
        "Manta/edredom",
      ],
    },
    {
      id: "saude",
      title: "Saúde & Sol",
      color: "amber",
      Icon: Sun,
      items: ["Remédios de uso contínuo", "Protetor solar", "Repelente"],
    },
    {
      id: "extras",
      title: "Extras",
      color: "pink",
      Icon: Wand2,
      items: [
        "Lanterna",
        "Dinheiro/cartão para lojinha",
        "Animação e alegria 🙌",
      ],
    },
  ];

  const colorRing: Record<CatColor, string> = {
    orange: "ring-orange-500/30",
    sky: "ring-sky-500/30",
    emerald: "ring-emerald-500/30",
    violet: "ring-violet-500/30",
    amber: "ring-amber-500/30",
    pink: "ring-pink-500/30",
  };
  const colorText: Record<CatColor, string> = {
    orange: "text-orange-400",
    sky: "text-sky-400",
    emerald: "text-emerald-400",
    violet: "text-violet-400",
    amber: "text-amber-400",
    pink: "text-pink-400",
  };

  return (
    <Section
      id="o-que-levar"
      title="O que levar"
      subtitle="Checklist prático para você curtir o retiro sem perrengue."
    >
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {CATS.map((c) => (
          <div
            key={c.id}
            className={`p-5 rounded-2xl bg-neutral-900 border border-neutral-800 ring-1 ${colorRing[c.color as CatColor]}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`grid h-8 w-8 place-items-center ${colorText[c.color as CatColor]}`}
              >
                <c.Icon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-white text-lg">{c.title}</h4>
            </div>
            <ul className="text-sm text-neutral-300 list-disc list-inside space-y-1">
              {c.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500 mt-6">
        Dica: identifique seus itens com nome.  
        👉 Itens pessoais de higiene são de responsabilidade de cada participante.
      </p>
    </Section>
  );
}

/* =================== APOIO / DOAÇÃO =================== */
function Apoio() {
  // Helper local pra copiar e dar feedback simples
  const copy = async (text: string, okMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(okMsg);
    } catch {
      alert("Não foi possível copiar. Tente manualmente.");
    }
  };

  return (
    <Section
      id="apoio"
      title="Apoiar o Retiro"
      subtitle={
        <>
          Sua contribuição ajuda a cobrir alimentação, materiais e infraestrutura,
          para que mais jovens vivam essa experiência com Deus.{" "}
          <span className="text-emerald-400">Qualquer valor faz diferença 🙌</span>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* QR CODE */}
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6">
          <div className="text-sm text-neutral-400">Escaneie o QR Code pelo app do seu banco</div>
          <div className="mt-4 flex items-center justify-center">
            <Image
              src={PIX.qrImage}
              alt="QR Code PIX - Apoiar o Retiro"
              width={280}
              height={280}
              className="rounded-xl border border-neutral-800 w-full max-w-[280px] h-auto shadow-lg"
            />
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            Dica: abra o app do seu banco, escolha <b>PIX &gt; QR Code</b> e aponte para a imagem.
          </p>
        </div>

        {/* DADOS DO PIX */}
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6">
          <h3 className="text-lg font-semibold">Dados do PIX</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-300">
            <li>
              <b>Recebedor:</b> {PIX.recebedor}
            </li>
            <li className="break-all">
              <b>Chave (aleatória):</b> <span className="text-neutral-200">{PIX.chave}</span>
            </li>
          </ul>

          {/* valores sugeridos */}
          <div className="mt-5">
            <div className="text-sm text-neutral-400 mb-2">Valores sugeridos</div>
            <div className="flex flex-wrap gap-2">
              {["R$ 30", "R$ 50", "R$ 100", "Outro valor"].map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-5 text-xs text-neutral-500">
            Sua doação é destinada integralmente ao retiro (alimentos, materiais e estrutura).
          </p>
        </div>

        {/* CTAs */}
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6">
          <h3 className="text-lg font-semibold">Como prefere contribuir?</h3>

          <div className="mt-4 grid gap-3">
            <button
              onClick={() => copy(PIX.chave, "Chave PIX copiada!")}
              className="w-full rounded-xl px-4 py-3 font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95"
            >
              Copiar chave PIX
            </button>
            <button
              onClick={() => copy(PIX.copiaCola, "Código PIX (copia e cola) copiado!")}
              className="w-full rounded-xl px-4 py-3 font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-95"
            >
              Copiar código “copia e cola”
            </button>

            {/* Enviar comprovante (opcional) */}
            <a
              href={`https://wa.me/${CONTATO.whatsappLink}?text=Olá!%20Enviei%20um%20PIX%20para%20apoiar%20o%20retiro.`}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center rounded-xl px-4 py-3 font-semibold border border-neutral-700 hover:bg-neutral-800"
            >
              Enviar comprovante pelo WhatsApp
            </a>
          </div>

          <div className="mt-4 text-xs leading-relaxed text-neutral-500">
            Se preferir, use o botão acima para nos avisar. Assim conseguimos confirmar mais rápido. Deus abençoe! ✨
          </div>
        </div>
      </div>
    </Section>
  );
}

/* =================== FAQ =================== */
function FAQ() {
  return (
    <Section id="faq" title="Perguntas Frequentes" subtitle="Dúvidas rápidas sobre o InFLAMA 2025">
      <div className="max-w-3xl mx-auto rounded-2xl border border-neutral-800 overflow-hidden divide-y divide-neutral-800">

        {/* Geral */}
        <div className="bg-neutral-950">
          <div className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-400">
            Geral
          </div>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Quem pode participar?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              Jovens de 12 a 19 anos. As vagas são limitadas (80 participantes).
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Onde será o retiro?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              Na Chácara Provérbios, em Apucarana/PR.
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">O que está incluso no valor da inscrição?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              Alimentação, materiais, infraestrutura e toda a programação espiritual e recreativa.
              <br />
              <span className="text-amber-400">⚠️ Transporte até o local não está incluso.</span>
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Vai ter missa ou momentos de adoração?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              Sim! Teremos missas, adoração ao Santíssimo, pregações, louvor e muita oração.
            </div>
          </details>
        </div>

        {/* Inscrição & Pagamento */}
        <div className="bg-neutral-950">
          <div className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-400">
            Inscrição &amp; Pagamento
          </div>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Qual é o valor? Posso parcelar?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              O valor é R$ 150,00. O pagamento é apenas via PIX.
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Como confirmo minha inscrição?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              Sua vaga é confirmada automaticamente após o pagamento aprovado. Se quiser, pode enviar o comprovante no WhatsApp para agilizar.
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">E se eu desistir?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              O valor não é reembolsável, mas você pode indicar outro jovem para usar sua vaga.
            </div>
          </details>
        </div>

        {/* Infraestrutura */}
        <div className="bg-neutral-950">
          <div className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-400">
            Infraestrutura
          </div>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Onde vamos dormir?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              • <b>Meninas:</b> em quartos da chácara.<br />
              • <b>Meninos:</b> em barracas (cada um leva a sua).
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Preciso levar colchão ou roupa de cama?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              • <b>Meninas:</b> levar lençol para cama.<br />
              • <b>Meninos:</b> levar saco de dormir ou colchão, além da barraca.<br />
              • <b>Todos:</b> manta/edredom (opcional) e travesseiro se quiser.
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Como é a alimentação?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              Todas as refeições estão incluídas.
            </div>
          </details>
        </div>

        {/* O que levar */}
        <div className="bg-neutral-950">
          <div className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-400">
            O que levar
          </div>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">O que devo levar?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300 space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Bíblia, caderno, caneta, terço.</li>
                <li>Roupas confortáveis (pelo menos 3 trocas) e agasalho.</li>
                <li>Tênis e chinelo.</li>
                <li>Itens de higiene (escova, pasta, sabonete, shampoo, toalha).</li>
                <li>Remédios de uso contínuo, protetor solar e repelente.</li>
                <li>Lanterna e muita alegria 🙌</li>
              </ul>
              <div className="text-sm text-neutral-400">
                👉 Veja a lista completa em “O que levar” no site.
              </div>
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Posso levar celular?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              Sim, mas no retiro não será permitido 😉. O foco é a experiência com Deus e a convivência em grupo.
            </div>
          </details>
        </div>

        {/* Saúde & Autorização */}
        <div className="bg-neutral-950">
          <div className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-400">
            Saúde &amp; Autorização
          </div>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">Tenho alergia/restrição alimentar, o que faço?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              No formulário de inscrição você pode informar todas as suas necessidades. A equipe de cozinha estará preparada para acolher.
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none p-5 hover:bg-neutral-900/50">
              <span className="font-semibold">E os menores de 16 anos?</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-5 pt-0 text-neutral-300">
              Precisam trazer o termo de autorização assinado pelos responsáveis (o próprio site gera isso automaticamente no formulário).
            </div>
          </details>
        </div>
      </div>
    </Section>
  );
}

/* =================== CONTATO =================== */
function Contato() {
  // se você já tem essa função global (usada no PIX), pode remover esse helper local
  const copy = (text: string, okMsg = "Copiado!") => {
    navigator.clipboard.writeText(text).then(() => {
      try { alert(okMsg); } catch {}
    });
  };

  return (
    <Section
      id="contato"
      title="Contato"
      subtitle="Dúvidas? Fala com a gente pelos canais abaixo."
    >
      <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3">
        {/* WhatsApp */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
          <div className="text-sm text-neutral-400">WhatsApp</div>
          <div className="text-xl font-semibold mt-1">{CONTATO.whatsappExibicao}</div>
          <div className="mt-4 flex gap-2">
            <a
              href={`https://wa.me/${CONTATO.whatsappLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm"
              aria-label="Abrir conversa no WhatsApp"
            >
              Abrir conversa
            </a>
            <button
              onClick={() => copy(CONTATO.whatsappExibicao, "Número copiado!")}
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm"
            >
              Copiar número
            </button>
          </div>
        </div>

        {/* E-mail */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
          <div className="text-sm text-neutral-400">E-mail</div>
          <div className="text-xl font-semibold mt-1 break-all">{CONTATO.email}</div>
          <div className="mt-4 flex gap-2">
            <a
              href={`mailto:${CONTATO.email}`}
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm"
            >
              Escrever e-mail
            </a>
            <button
              onClick={() => copy(CONTATO.email, "E-mail copiado!")}
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm"
            >
              Copiar e-mail
            </button>
          </div>
        </div>

        {/* Instagram */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
          <div className="text-sm text-neutral-400">Instagram</div>
          <div className="text-xl font-semibold mt-1">{CONTATO.instagramHandle}</div>
          <div className="mt-4 flex gap-2">
            <a
              href={CONTATO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm inline-flex items-center gap-2"
              aria-label="Abrir perfil no Instagram"
            >
              Abrir perfil
            </a>
            <button
              onClick={() => copy(CONTATO.instagram, "Link do Instagram copiado!")}
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm"
            >
              Copiar link
            </button>
          </div>
        </div>
      </div>

      {/* microcopy opcional */}
      <p className="max-w-5xl mx-auto mt-6 text-sm text-neutral-500">
        Respondemos mais rápido pelo WhatsApp. Mensagens fora do horário podem ser respondidas no próximo dia útil. 😊
      </p>
    </Section>
  );
}

// --- Field fora do componente para não ser recriado a cada render ---
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-neutral-300 mb-1">
        {label}
      </label>
      {children}
      {error && <div className="mt-1 text-xs text-red-400">{error}</div>}
    </div>
  );
}

/* =================== INSCRIÇÃO (Form) =================== */
function InscricaoForm({ onClose }: { onClose: () => void }) {
  type Sexo = "M" | "F";

  // WhatsApp de recebimento dos comprovantes
  const WHATSAPP = { phone: "5543991397163", display: "+55 43 99139-7163" };

  // ---- TIPOS SEGUROS (sem any) ----
  type FormState = {
    nome: string;
    email: string;
    nascimento: string; // yyyy-mm-dd
    cidade: string;
    sexo: Sexo | "";
    alergias: string;
    restricoes: string;
    resp1Nome: string;
    resp1Tel: string;
    resp2Nome: string;
    resp2Tel: string;
    termoMenor: boolean;
  };

  type PixData = { copiaCola: string };

  const [form, setForm] = useState<FormState>({
    nome: "",
    email: "",
    nascimento: "",
    cidade: "",
    sexo: "",
    alergias: "",
    restricoes: "",
    resp1Nome: "",
    resp1Tel: "",
    resp2Nome: "",
    resp2Tel: "",
    termoMenor: false,
  });

  const [openPixModal, setOpenPixModal] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);

  // prazo (30 minutos) + contador
  const [deadline, setDeadline] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  // evita cliques múltiplos no botão Enviar
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!deadline) return;
    const iv = setInterval(() => {
      const diff = Math.max(0, deadline - Date.now());
      const mm = String(Math.floor(diff / 60000)).padStart(2, "0");
      const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${mm}:${ss}`);
      if (diff <= 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [deadline]);

  // idade (para exibir mensagens e validar mínimo)
  const idade = useMemo(() => {
    if (!form.nascimento) return 0;
    const d = new Date(form.nascimento);
    const diff = Date.now() - d.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }, [form.nascimento]);

  // data máxima de nascimento = hoje - 12 anos (mínimo 12 anos)
  const maxBirth = useMemo(() => {
    const t = new Date();
    t.setFullYear(t.getFullYear() - 12);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
      t.getDate()
    ).padStart(2, "0")}`;
  }, []);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Informe o nome";
    if (!form.email.trim()) e.email = "Informe o e-mail";
    if (!form.nascimento) e.nascimento = "Informe a data";
    if (!form.cidade.trim()) e.cidade = "Informe a cidade";
    if (!form.sexo) e.sexo = "Selecione";
    // ✅ só idade mínima
    if (form.nascimento && idade < 12) e.nascimento = "Idade mínima: 12 anos";
    if (!form.resp1Nome.trim() || !form.resp1Tel.trim())
      e.resp1 = "Responsável 1 obrigatório";
    if (!form.resp2Nome.trim() || !form.resp2Tel.trim())
      e.resp2 = "Responsável 2 obrigatório";
    if (idade < 16 && !form.termoMenor)
      e.termo = "Obrigatório para menores de 16";
    return e;
  }, [form, idade]);

  // ---- SETTERS ESTÁVEIS E TIPADOS ----
  const setField = useCallback(
    (key: keyof FormState, val: FormState[keyof FormState]) => {
      setForm((f) => (Object.is(f[key], val) ? f : ({ ...f, [key]: val } as FormState)));
    },
    []
  );

  const handleText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setField(name as keyof FormState, value);
    },
    [setField]
  );

  // monta a mensagem personalizada do WhatsApp
  const buildWhatsAppLink = useCallback(
    (copiaCola: string) => {
      const msg =
        `Olá! Sou ${form.nome}. Acabei de me inscrever no InFLAMA 2025.\n\n` +
        `• Cidade: ${form.cidade}\n` +
        `• Nascimento: ${form.nascimento}\n` +
        `• Sexo: ${form.sexo}\n` +
        (form.alergias ? `• Alergias/Condições: ${form.alergias}\n` : "") +
        (form.restricoes ? `• Restrições alimentares: ${form.restricoes}\n` : "") +
        `• Responsável 1: ${form.resp1Nome} – ${form.resp1Tel}\n` +
        `• Responsável 2: ${form.resp2Nome} – ${form.resp2Tel}\n\n` +
        `Valor: R$ 150,00\n` +
        `Segue o código PIX copia-e-cola:\n${copiaCola}\n\n` +
        `Anexo o comprovante do pagamento. Obrigado!`;
      return `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(msg)}`;
    },
    [form]
  );

  // SUBMIT — salva e abre modal com copia-e-cola
  const submit = useCallback(
    async (ev: React.FormEvent) => {
      ev.preventDefault();

      // já está enviando? evita múltiplos cliques
      if (isSubmitting) return;

      if (Object.keys(errors).length) {
        alert("Corrija os campos destacados.");
        return;
      }

      setIsSubmitting(true);
      try {
        await salvarInscricao({
          nome: form.nome,
          email: form.email,
          telefone: form.resp1Tel,
          cidade: form.cidade,
          sexo: form.sexo || "",
          nascimento: form.nascimento,
          resp1: `${form.resp1Nome} - ${form.resp1Tel}`,
          resp2: `${form.resp2Nome} - ${form.resp2Tel}`,
          alergias: form.alergias,
          restricoes: form.restricoes,
        });

        setPixData({ copiaCola: PIX_COPIA_E_COLA });
        setOpenPixModal(true);
        setDeadline(Date.now() + 30 * 60 * 1000);
      } catch (e) {
        console.error(e);
        alert("Não foi possível enviar. Tente novamente.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [errors, form, isSubmitting]
  );

  // util copiar
  const copiarCodigo = useCallback(async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo);
      alert("Código PIX copiado!");
    } catch {
      /* noop */
    }
  }, []);

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={isSubmitting} className={isSubmitting ? "opacity-75" : ""}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="nome" label="Nome completo" error={errors.nome}>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.nome}
            onChange={handleText}
          />
        </Field>

        <Field id="email" label="E-mail" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.email}
            onChange={handleText}
          />
        </Field>

        <Field id="nascimento" label="Nascimento" error={errors.nascimento}>
          <input
            id="nascimento"
            name="nascimento"
            type="date"
            // ✅ permite digitar e ainda mostra o datepicker
            inputMode="numeric"
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.nascimento}
            onChange={handleText}
            // ✅ apenas idade mínima (12 anos)
            max={maxBirth}
          />
          <div className="text-xs text-neutral-400 mt-1">Idade mínima: 12 anos</div>
        </Field>

        <Field id="cidade" label="Cidade" error={errors.cidade}>
          <input
            id="cidade"
            name="cidade"
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.cidade}
            onChange={handleText}
          />
        </Field>

        <Field id="sexo" label="Sexo" error={errors.sexo}>
          <div
            id="sexo"
            className="flex items-center gap-4 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
          >
            <label className="inline-flex items-center gap-2 text-sm" htmlFor="sexoM">
              <input
                id="sexoM"
                type="radio"
                name="sexo"
                checked={form.sexo === "M"}
                onChange={() => setField("sexo", "M")}
              />
              Masculino
            </label>
            <label className="inline-flex items-center gap-2 text-sm" htmlFor="sexoF">
              <input
                id="sexoF"
                type="radio"
                name="sexo"
                checked={form.sexo === "F"}
                onChange={() => setField("sexo", "F")}
              />
              Feminino
            </label>
          </div>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="alergias" label="Alergias / condições (opcional)">
          <input
            id="alergias"
            name="alergias"
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.alergias}
            onChange={handleText}
          />
        </Field>

        <Field id="restricoes" label="Restrições alimentares (opcional)">
          <input
            id="restricoes"
            name="restricoes"
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.restricoes}
            onChange={handleText}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="resp1Nome" label="Responsável 1 – Nome" error={errors.resp1}>
          <input
            id="resp1Nome"
            name="resp1Nome"
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.resp1Nome}
            onChange={handleText}
          />
        </Field>
        <Field id="resp1Tel" label="Responsável 1 – Telefone/WhatsApp" error={errors.resp1}>
          <input
            id="resp1Tel"
            name="resp1Tel"
            type="text"
            inputMode="tel"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.resp1Tel}
            onChange={handleText}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="resp2Nome" label="Responsável 2 – Nome" error={errors.resp2}>
          <input
            id="resp2Nome"
            name="resp2Nome"
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.resp2Nome}
            onChange={handleText}
          />
        </Field>
        <Field id="resp2Tel" label="Responsável 2 – Telefone/WhatsApp" error={errors.resp2}>
          <input
            id="resp2Tel"
            name="resp2Tel"
            type="text"
            inputMode="tel"
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800"
            value={form.resp2Tel}
            onChange={handleText}
          />
        </Field>
      </div>

      {idade < 16 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <label className="inline-flex items-center gap-2 text-sm" htmlFor="termoMenor">
            <input
              id="termoMenor"
              type="checkbox"
              checked={form.termoMenor}
              onChange={(e) => setField("termoMenor", e.target.checked)}
            />
            Confirmo que apresentarei o termo de autorização assinado pelo responsável.
          </label>
          {/* mostra erro somente se existir */}
          {"termo" in errors && (
            <div className="mt-1 text-xs text-red-400">{errors.termo}</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-neutral-400">
          Valor: <b className="text-white">{fmtBRL(EVENTO.preco)}</b>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r ${COLORS.grad} font-semibold transition ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <QrCode className="h-5 w-5" />
            {isSubmitting ? "Enviando..." : "Enviar inscrição"}
          </button>
        </div>
      </div>

      {/* Modal simples: copia-e-cola + ações */}
      {openPixModal && pixData && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4">
          <div className="max-w-md w-full rounded-2xl bg-neutral-950 border border-neutral-800 p-6">
            <h3 className="font-bold text-white text-lg">Pagamento via PIX</h3>

            <p className="mt-2 text-sm text-neutral-300">
              Use o código abaixo para pagar. Para garantir sua vaga, finalize o pagamento em
              <b className="text-white"> até {timeLeft || "30:00"} </b>.
            </p>

            <div className="mt-3 rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-xs text-neutral-200 break-all">
              {pixData.copiaCola}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => copiarCodigo(pixData.copiaCola)}
                className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800"
                type="button"
              >
                Copiar código PIX
              </button>

              <a
                href={buildWhatsAppLink(pixData.copiaCola)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white"
              >
                Enviar comprovante no WhatsApp
              </a>
            </div>

            <p className="mt-3 text-xs text-neutral-400">
              Dica: após pagar no app do banco, volte aqui e toque em “Enviar comprovante no WhatsApp”.
              A mensagem já vai preenchida com seus dados — é só anexar o comprovante.
              (WhatsApp: {WHATSAPP.display})
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setOpenPixModal(false)}
                className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      </fieldset>
    </form>
  );
}

/* =================== PÁGINA =================== */
export default function Page() {
  const [openForm, setOpenForm] = useState(false);

  return (
    <div className={`${COLORS.bg} ${COLORS.text}`} id="top">
      <NavbarDrawer onOpenForm={() => setOpenForm(true)} />

      <main className="pt-24">
        <HeroInflama
          eventStart={EVENTO.inicioISO}
          totalSeats={80}
          remainingSeats={68}
          onInscrever={() => setOpenForm(true)}
        />
        <TemaBiblico />
        <SobreRetiro />
        <DestaquesCarousel />
        <TimesInflama />
        <Lineup />
        <ChecklistSection />
        <Apoio />
        <FAQ />
        <Contato />
      </main>

      <footer className="border-t border-neutral-900/60 py-10 text-center text-sm text-neutral-400 space-y-2">
        <div>© {new Date().getFullYear()} Juventude Fogo Santo — InFLAMA 2025</div>
        <div className="flex items-center justify-center gap-4">
          <a
            href={CONTATO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-orange-400"
          >
            <Instagram className="h-4 w-4" />
            {CONTATO.instagramHandle}
          </a>
        </div>
      </footer>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Inscrição – InFLAMA 2025">
        <InscricaoForm onClose={() => setOpenForm(false)} />
      </Modal>
    </div>
  );
}

