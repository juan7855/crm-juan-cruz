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
    text: `Hola, ${firstName}. Soy el asistente de Núcleo, conectado a DeepSeek. Puedo hablarte de tus tareas, tu agenda o tus rutas, o de lo que necesites.`,
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
          messages: [
            { role: "system", content: buildSystemPrompt() },
            ...history.map((m) => ({ role: m.role, content: m.text })),
          ],
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        res.ok && data.reply
          ? stripMarkdown(data.reply)
          : (data.error ?? "El asistente no respondió. Inténtalo de nuevo.");
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: reply }]);
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
