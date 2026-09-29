import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Bot, User, ChevronDown, Pencil } from "lucide-react";
import { Glass, Label, Meter, cn } from "../components/ui";
import { profile, tasks, timeline, routes } from "../data/mockData";

interface ChatMessage {
  id: string;
  role: "assistant" | "user" | "system";
  text: string;
}

interface ModelOption {
  id: string;
  label: string;
  hint: string;
  defaultBudget: number;
}

interface ModelUsage {
  used: number;
  budget: number;
}

type UsageMap = Record<string, ModelUsage>;

const MODELS: ModelOption[] = [
  { id: "deepseek-chat", label: "DeepSeek Chat", hint: "Rápido · conversación general", defaultBudget: 200_000 },
  {
    id: "deepseek-reasoner",
    label: "DeepSeek Reasoner",
    hint: "Razonamiento profundo · más lento",
    defaultBudget: 100_000,
  },
];

const USAGE_STORAGE_KEY = "nucleo:token-usage-v1";

function loadUsage(): UsageMap {
  const fallback: UsageMap = Object.fromEntries(
    MODELS.map((m) => [m.id, { used: 0, budget: m.defaultBudget }]),
  );
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
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
  const [model, setModel] = useState(MODELS[0].id);
  const [usage, setUsage] = useState<UsageMap>(() => loadUsage());
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [budgetDraft, setBudgetDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeModel = MODELS.find((m) => m.id === model) ?? MODELS[0];

  useEffect(() => {
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
    } catch {
      // almacenamiento no disponible (modo privado, cuota llena); se pierde solo la persistencia.
    }
  }, [usage]);

  const startEditingBudget = (id: string, current: number) => {
    setEditingModel(id);
    setBudgetDraft(String(current));
  };

  const commitBudget = (id: string) => {
    const parsed = Number(budgetDraft);
    setUsage((prev) => {
      const current = prev[id] ?? {
        used: 0,
        budget: MODELS.find((m) => m.id === id)?.defaultBudget ?? 100_000,
      };
      const budget = Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : current.budget;
      return { ...prev, [id]: { ...current, budget } };
    });
    setEditingModel(null);
  };

  const handleModelChange = (nextId: string) => {
    if (nextId === model) return;
    setModel(nextId);
    const next = MODELS.find((m) => m.id === nextId);
    setMessages((prev) => [
      ...prev,
      { id: `sys-${Date.now()}`, role: "system", text: `Modelo activo: ${next?.label ?? nextId}` },
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
        setUsage((prev) => {
          const current = prev[model] ?? { used: 0, budget: activeModel.defaultBudget };
          return { ...prev, [model]: { ...current, used: current.used + totalTokens } };
        });
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
              <div className="mt-1 truncate pl-3.5 text-[11px] text-mist">{activeModel.hint}</div>
            </div>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={thinking}
                title={activeModel.hint}
                aria-label="Elegir modelo de IA"
                className="appearance-none rounded-[8px] border border-[rgba(56,224,200,0.28)] bg-[rgba(56,224,200,0.08)] py-1.5 pr-7 pl-3 font-mono text-[10px] tracking-[0.1em] text-aqua-light uppercase transition-colors hover:border-[rgba(56,224,200,0.5)] focus:outline-none disabled:opacity-60"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0e161b] text-chalk normal-case">
                    {m.label}
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
            {MODELS.map((m) => {
              const u = usage[m.id] ?? { used: 0, budget: m.defaultBudget };
              const remaining = Math.max(0, u.budget - u.used);
              const usedPct = u.budget > 0 ? (u.used / u.budget) * 100 : 0;
              const remPct = u.budget > 0 ? (remaining / u.budget) * 100 : 0;
              const isActive = m.id === model;
              const isEditing = editingModel === m.id;

              return (
                <div key={m.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-[11px]",
                        isActive ? "font-medium text-aqua-light" : "text-mist",
                      )}
                    >
                      {m.label}
                    </span>
                    {isEditing ? (
                      <input
                        autoFocus
                        type="number"
                        min={1000}
                        step={1000}
                        value={budgetDraft}
                        onChange={(e) => setBudgetDraft(e.target.value)}
                        onBlur={() => commitBudget(m.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitBudget(m.id);
                          if (e.key === "Escape") setEditingModel(null);
                        }}
                        className="w-24 rounded-[5px] border border-[rgba(56,224,200,0.4)] bg-[rgba(6,10,13,0.6)] px-1.5 py-0.5 text-right font-mono text-[9.5px] text-chalk focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEditingBudget(m.id, u.budget)}
                        title="Editar tu presupuesto de tokens para este modelo"
                        className="flex items-center gap-1 font-mono text-[9.5px] text-mist transition-colors hover:text-aqua"
                      >
                        {formatTokens(u.used)} / {formatTokens(u.budget)} tok
                        <Pencil size={9} strokeWidth={2} />
                      </button>
                    )}
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
              Presupuesto local editable (clic en la cifra) — no es el saldo real de tu cuenta
              DeepSeek, solo un seguimiento guardado en este navegador.
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
                {activeModel.id === "deepseek-reasoner" ? "Razonando…" : "Pensando…"}
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
