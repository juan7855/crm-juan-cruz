import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Bot, User, ChevronDown } from "lucide-react";
import { Glass, Label, Meter, cn } from "../components/ui";
import { profile, tasks, timeline, routes } from "../data/mockData";

interface ChatMessage {
  id: string;
  role: "assistant" | "user" | "system";
  text: string;
}

interface ModelMeta {
  label: string;
  hint: string;
  // USD por cada 1M tokens de salida, tarifa de hora pico publicada por DeepSeek.
  // Se usa solo para estimar "disponibles" a partir del saldo real de la cuenta.
  outputPerMillionUsd?: number;
}

const MODEL_META: Record<string, ModelMeta> = {
  "deepseek-flash": { label: "DeepSeek Flash", hint: "Rápido · conversación general", outputPerMillionUsd: 1.2 },
  "deepseek-v4-pro": {
    label: "DeepSeek V4 Pro",
    hint: "Modelo avanzado · más lento y más caro",
    outputPerMillionUsd: 3.96,
  },
};

const FALLBACK_MODEL_IDS = ["deepseek-flash", "deepseek-v4-pro"];

function metaFor(id: string): ModelMeta {
  return MODEL_META[id] ?? { label: id, hint: "Modelo de DeepSeek" };
}

const USAGE_STORAGE_KEY = "nucleo:token-usage-v2";

function loadUsage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function formatTokens(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString("es-ES");
}

const firstName = profile.name.split(" ")[0];

const initialMessages: ChatMessage[] = [
  {
    id: "m-0",
    role: "assistant",
    text: `Hola, ${firstName}. Soy el asistente de Núcleo. Puedo hablarte de tus tareas, tu agenda o tus rutas, o de lo que necesites — elige el modelo arriba a la derecha.`,
  },
];

const suggestions = [
  "¿Qué tareas tengo pendientes?",
  "¿Qué tengo en la agenda de hoy?",
  "¿Cuál es mi próxima ruta?",
];

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "");
}

function buildSystemPrompt(): string {
  const active = tasks.filter((t) => t.status !== "done");
  const alta = active.filter((t) => t.priority === "alta").length;
  const nextTask = [...active].sort((a, b) => a.due.localeCompare(b.due))[0];
  const agenda = timeline.slice(0, 4).map((t) => `${t.time} ${t.title}`).join("; ");
  const nextRoute = routes[0];

  return [
    `Eres el asistente de Núcleo, el hub personal de ${profile.name} (${profile.role}).`,
    "Responde en español, de forma breve, cálida y directa. Usa el contexto solo si es relevante para la pregunta.",
    "No uses formato markdown (sin **, #, listas con guiones, etc.) — el chat solo muestra texto plano.",
    "Contexto actual del usuario:",
    `- Tareas activas: ${active.length} (${alta} de prioridad alta). Próxima a vencer: "${nextTask?.title}".`,
    `- Agenda de hoy: ${agenda}.`,
    nextRoute
      ? `- Próxima ruta: "${nextRoute.title}", sale a las ${nextRoute.departure} desde ${nextRoute.from} hacia ${nextRoute.to}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function HomeView() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [modelIds, setModelIds] = useState<string[]>(FALLBACK_MODEL_IDS);
  const [model, setModel] = useState(FALLBACK_MODEL_IDS[0]);
  const [usage, setUsage] = useState<Record<string, number>>(() => loadUsage());
  const [balance, setBalance] = useState<{ amount: number; currency: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeMeta = metaFor(model);

  useEffect(() => {
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
    } catch {
      // almacenamiento no disponible (modo privado, cuota llena); se pierde solo la persistencia.
    }
  }, [usage]);

  // Modelos reales disponibles para esta cuenta, en vez de una lista fija que puede quedar desactualizada.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data.models) || data.models.length === 0) return;
        setModelIds(data.models);
        setModel((current) => (data.models.includes(current) ? current : data.models[0]));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshBalance = useCallback(() => {
    fetch("/api/balance")
      .then((r) => r.json())
      .then((data) => {
        const info = data.balance_infos?.[0];
        if (info) setBalance({ amount: Number(info.total_balance), currency: info.currency });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const handleModelChange = (nextId: string) => {
    if (nextId === model) return;
    setModel(nextId);
    setMessages((prev) => [
      ...prev,
      { id: `sys-${Date.now()}`, role: "system", text: `Modelo activo: ${metaFor(nextId).label}` },
    ]);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setDraft("");
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: buildSystemPrompt() },
            ...history
              .filter((m) => m.role !== "system")
              .map((m) => ({ role: m.role, content: m.text })),
          ],
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        res.ok && data.reply
          ? stripMarkdown(data.reply)
          : (data.error ?? "El asistente no respondió. Inténtalo de nuevo.");
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: reply }]);

      const totalTokens = data.usage?.total_tokens;
      if (res.ok && typeof totalTokens === "number") {
        setUsage((prev) => ({ ...prev, [model]: (prev[model] ?? 0) + totalTokens }));
        refreshBalance();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "No se pudo conectar con el asistente. Revisa tu conexión e inténtalo de nuevo.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="px-5 pt-7 pb-16 sm:px-7 lg:px-8">
      <div className="mx-auto max-w-[760px]">
        <Label>Vista 00 · Asistente</Label>
        <h2 className="mt-2 font-display text-[38px] leading-[0.95] tracking-[-0.01em] text-chalk sm:text-[46px]">
          Habla con tu <span className="italic text-aqua-light">asistente</span>
        </h2>
        <p className="mt-2.5 max-w-[52ch] text-[13.5px] leading-relaxed text-mist">
          Este es el punto de entrada al hub, conectado a DeepSeek. Puede leer tus tareas, tu
          agenda y tus rutas para responder con contexto.
        </p>

        <Glass className="mt-7 flex h-[620px] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[rgba(138,163,171,0.12)] px-5 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="live-dot h-[6px] w-[6px] rounded-full bg-aqua" />
                <span className="screenprint">Modelo activo</span>
              </div>
              <div className="mt-1 truncate pl-3.5 text-[11px] text-mist">{activeMeta.hint}</div>
            </div>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={thinking}
                title={activeMeta.hint}
                aria-label="Elegir modelo de IA"
                className="appearance-none rounded-[8px] border border-[rgba(56,224,200,0.28)] bg-[rgba(56,224,200,0.08)] py-1.5 pr-7 pl-3 font-mono text-[10px] tracking-[0.1em] text-aqua-light uppercase transition-colors hover:border-[rgba(56,224,200,0.5)] focus:outline-none disabled:opacity-60"
              >
                {modelIds.map((id) => (
                  <option key={id} value={id} className="bg-[#0e161b] text-chalk normal-case">
                    {metaFor(id).label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                strokeWidth={2}
                className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-aqua-light"
              />
            </div>
          </div>

          <div className="space-y-2.5 border-b border-[rgba(138,163,171,0.12)] px-5 py-3">
            {modelIds.map((id) => {
              const meta = metaFor(id);
              const used = usage[id] ?? 0;
              const remaining =
                balance && meta.outputPerMillionUsd
                  ? (balance.amount * 1_000_000) / meta.outputPerMillionUsd
                  : null;
              const total = remaining !== null ? used + remaining : null;
              const usedPct = total ? (used / total) * 100 : used > 0 ? 100 : 0;
              const remPct = total ? ((remaining as number) / total) * 100 : 0;
              const isActive = id === model;

              return (
                <div key={id}>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-[11px]",
                        isActive ? "font-medium text-aqua-light" : "text-mist",
                      )}
                    >
                      {meta.label}
                    </span>
                    <span className="font-mono text-[9.5px] text-mist">
                      {formatTokens(used)} usados
                      {remaining !== null ? ` · ~${formatTokens(remaining)} disp.` : ""}
                    </span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <div>
                      <Meter value={usedPct} tone="amber" height={3} />
                      <div className="mt-0.5 font-mono text-[8px] tracking-[0.1em] text-mist/70 uppercase">
                        Usados
                      </div>
                    </div>
                    <div>
                      <Meter value={remPct} tone="aqua" height={3} />
                      <div className="mt-0.5 font-mono text-[8px] tracking-[0.1em] text-mist/70 uppercase">
                        Disponibles
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-[9.5px] leading-relaxed text-mist/70">
              {balance
                ? `Disponibles = tu saldo real de DeepSeek (${balance.amount.toFixed(2)} ${balance.currency}) ÷ el precio de salida publicado por DeepSeek (tarifa de hora pico). Usados: acumulado real en este navegador.`
                : "No se pudo leer el saldo real de tu cuenta DeepSeek en este momento — mostrando solo lo usado en este navegador."}
            </p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((m) => {
              if (m.role === "system") {
                return (
                  <div key={m.id} className="flex justify-center">
                    <span className="rounded-full border border-[rgba(138,163,171,0.18)] bg-[rgba(138,163,171,0.06)] px-3 py-1 font-mono text-[9px] tracking-[0.12em] text-mist uppercase">
                      {m.text}
                    </span>
                  </div>
                );
              }
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn("flex items-start gap-2.5", m.role === "user" && "flex-row-reverse")}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                      m.role === "assistant"
                        ? "border-[rgba(56,224,200,0.35)] bg-[rgba(56,224,200,0.1)] text-aqua-light"
                        : "border-[rgba(138,163,171,0.25)] bg-[rgba(138,163,171,0.08)] text-mist",
                    )}
                  >
                    {m.role === "assistant" ? <Bot size={13} strokeWidth={1.8} /> : <User size={13} strokeWidth={1.8} />}
                  </span>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-[12px] border px-3.5 py-2.5 text-[13px] leading-relaxed",
                      m.role === "assistant"
                        ? "border-[rgba(138,163,171,0.14)] bg-[rgba(138,163,171,0.05)] text-chalk"
                        : "border-[rgba(56,224,200,0.28)] bg-[rgba(56,224,200,0.08)] text-chalk",
                    )}
                  >
                    {m.text}
                  </div>
                </motion.div>
              );
            })}
            {thinking && (
              <div className="flex items-center gap-2.5 pl-9 text-[11.5px] text-mist">
                <span className="live-dot h-[6px] w-[6px] rounded-full bg-aqua" />
                Pensando…
              </div>
            )}
          </div>

          {!messages.some((m) => m.role === "user") && (
            <div className="flex flex-wrap gap-1.5 border-t border-[rgba(138,163,171,0.12)] px-5 py-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={thinking}
                  className="flex items-center gap-1.5 rounded-[7px] border border-[rgba(138,163,171,0.18)] px-2.5 py-1.5 text-[11.5px] text-mist transition-colors hover:border-[rgba(56,224,200,0.4)] hover:text-aqua disabled:opacity-50"
                >
                  <Sparkles size={11} strokeWidth={1.8} /> {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex items-center gap-2.5 border-t border-[rgba(138,163,171,0.12)] px-4 py-3.5"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={thinking}
              placeholder="Escribe un mensaje…"
              aria-label="Mensaje para el asistente"
              className="flex-1 rounded-[9px] border border-[rgba(138,163,171,0.18)] bg-[rgba(138,163,171,0.06)] px-3.5 py-2.5 text-[13px] text-chalk placeholder:text-mist/70 transition-colors focus:border-[rgba(56,224,200,0.55)] focus:bg-[rgba(56,224,200,0.05)] focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!draft.trim() || thinking}
              aria-label="Enviar mensaje"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-aqua text-[#04211f] transition-opacity hover:bg-aqua-light disabled:opacity-40"
            >
              <Send size={15} strokeWidth={2} />
            </button>
          </form>
        </Glass>
      </div>
    </div>
  );
}
