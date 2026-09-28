import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { Glass, Label, cn } from "../components/ui";
import { profile, tasks, timeline, routes } from "../data/mockData";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const firstName = profile.name.split(" ")[0];

const initialMessages: ChatMessage[] = [
  {
    id: "m-0",
    role: "assistant",
    text: `Hola, ${firstName}. Todavía no hay un modelo de IA conectado a Núcleo — cuando integres uno, sus respuestas aparecerán aquí. Mientras tanto puedo darte lecturas rápidas de tus tareas, tu agenda o tus rutas.`,
  },
];

const suggestions = [
  "¿Qué tareas tengo pendientes?",
  "¿Qué tengo en la agenda de hoy?",
  "¿Cuál es mi próxima ruta?",
];

function localAnswer(raw: string): string {
  const q = raw.toLowerCase();

  if (q.includes("tarea") || q.includes("pendiente")) {
    const active = tasks.filter((t) => t.status !== "done");
    const alta = active.filter((t) => t.priority === "alta").length;
    const next = [...active].sort((a, b) => a.due.localeCompare(b.due))[0];
    return `Tienes ${active.length} tareas activas (${alta} de prioridad alta). La más próxima a vencer es «${next?.title}».`;
  }

  if (q.includes("agenda") || q.includes("hoy") || q.includes("calendario")) {
    const next = timeline.slice(0, 3).map((t) => `${t.time} · ${t.title}`).join(" — ");
    return `Para hoy: ${next}.`;
  }

  if (q.includes("ruta")) {
    const r = routes[0];
    return `Tu próxima ruta es «${r.title}»: sale a las ${r.departure} desde ${r.from} hacia ${r.to} (${r.distance}, ${r.duration}).`;
  }

  return "Aún no tengo un modelo de IA conectado para responder eso con libertad. Puedo darte datos de tus tareas, tu agenda o tus rutas — o cuéntame qué integración quieres conectar primero.";
}

export function HomeView() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text: localAnswer(trimmed) },
      ]);
      setThinking(false);
    }, 420);
  };

  return (
    <div className="px-5 pt-7 pb-16 sm:px-7 lg:px-8">
      <div className="mx-auto max-w-[760px]">
        <Label>Vista 00 · Asistente</Label>
        <h2 className="mt-2 font-display text-[38px] leading-[0.95] tracking-[-0.01em] text-chalk sm:text-[46px]">
          Habla con tu <span className="italic text-aqua-light">asistente</span>
        </h2>
        <p className="mt-2.5 max-w-[52ch] text-[13.5px] leading-relaxed text-mist">
          Este es el punto de entrada al hub: aquí es donde llamarás a los modelos de IA que
          integremos. Por ahora responde con datos locales; cuando conectemos un modelo, sus
          respuestas llegarán por este mismo canal.
        </p>

        <Glass className="mt-7 flex h-[520px] flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((m) => (
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
            ))}
            {thinking && (
              <div className="flex items-center gap-2.5 pl-9 text-[11.5px] text-mist">
                <span className="live-dot h-[6px] w-[6px] rounded-full bg-aqua" />
                Pensando…
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-[rgba(138,163,171,0.12)] px-5 py-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="flex items-center gap-1.5 rounded-[7px] border border-[rgba(138,163,171,0.18)] px-2.5 py-1.5 text-[11.5px] text-mist transition-colors hover:border-[rgba(56,224,200,0.4)] hover:text-aqua"
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
              placeholder="Escribe un mensaje…"
              aria-label="Mensaje para el asistente"
              className="flex-1 rounded-[9px] border border-[rgba(138,163,171,0.18)] bg-[rgba(138,163,171,0.06)] px-3.5 py-2.5 text-[13px] text-chalk placeholder:text-mist/70 transition-colors focus:border-[rgba(56,224,200,0.55)] focus:bg-[rgba(56,224,200,0.05)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
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
