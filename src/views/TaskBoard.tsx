import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, CalendarClock, Timer, AlertTriangle } from "lucide-react";
import { Glass, Label, Meter, Tag, Button, cn } from "../components/ui";
import { columns, tasks as seedTasks, type Task, type TaskStatus } from "../data/mockData";

const filters = [
  { id: "all", label: "Todas" },
  { id: "high", label: "Prioridad alta" },
  { id: "week", label: "Vencen esta semana" },
] as const;

const priorityTone = {
  alta: "amber",
  media: "aqua",
  baja: "neutral",
} as const;

function isThisWeek(due: string) {
  return due >= "2026-05-13" && due <= "2026-05-19";
}

export function TaskBoard() {
  const [items, setItems] = useState<Task[]>(seedTasks);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const visible = useMemo(() => {
    if (filter === "high") return items.filter((t) => t.priority === "alta");
    if (filter === "week") return items.filter((t) => isThisWeek(t.due));
    return items;
  }, [items, filter]);

  const done = items.filter((t) => t.status === "done").length;
  const globalProgress = Math.round((done / items.length) * 100);

  const move = (id: string, status: TaskStatus) =>
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

  return (
    <div className="px-5 pt-7 pb-16 sm:px-7 lg:px-8">
      {/* Cabecera de vista */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <Label>Vista 01 · Tablero</Label>
          <h2 className="mt-2 font-display text-[38px] leading-[0.95] tracking-[-0.01em] text-chalk sm:text-[46px]">
            Gestor de tareas
          </h2>
          <p className="mt-2.5 max-w-[52ch] text-[13.5px] leading-relaxed text-mist">
            Tres columnas fijas, movimiento de estado en un clic y control de vencimientos.
            Los datos de esta vista provienen de <span className="text-chalk">mockData</span> y
            son sustituibles por una API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex max-w-full flex-wrap items-center gap-1 rounded-[10px] border border-[rgba(138,163,171,0.14)] bg-[rgba(10,18,23,0.55)] p-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-[7px] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200 sm:px-3",
                  filter === f.id
                    ? "bg-[rgba(56,224,200,0.16)] text-aqua-light"
                    : "text-mist hover:text-chalk",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button variant="solid">
            <Plus size={13} strokeWidth={2.2} /> Nueva tarea
          </Button>
        </div>
      </div>

      {/* Progreso global */}
      <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[12px] border border-[rgba(138,163,171,0.12)] bg-[rgba(10,18,23,0.5)] px-5 py-4">
        <div className="flex items-baseline gap-2.5">
          <span className="tnum font-mono text-[26px] leading-none font-medium text-aqua-light">
            {globalProgress}%
          </span>
          <span className="screenprint">Progreso global</span>
        </div>
        <div className="min-w-[180px] flex-1">
          <Meter value={globalProgress} height={5} />
        </div>
        <div className="flex items-center gap-6">
          {columns.map((c) => {
            const n = items.filter((t) => t.status === c.id).length;
            return (
              <div key={c.id} className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full bg-[rgba(138,163,171,0.35)]" />
                <span className="screenprint">{c.title}</span>
                <span className="tnum font-mono text-[12px] text-chalk">{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tablero colgado de una regla continua */}
      <div className="mt-8 border-t border-[rgba(138,163,171,0.16)]">
        <div className="grid grid-cols-1 gap-x-7 lg:grid-cols-3">
          {columns.map((col, colIndex) => {
            const colItems = visible.filter((t) => t.status === col.id);
            const total = items.filter((t) => t.status === col.id).length;
            const share = Math.round((total / items.length) * 100);
            return (
              <section
                key={col.id}
                className={cn(
                  "min-w-0 pt-5 pb-2",
                  colIndex > 0 && "lg:border-l lg:border-[rgba(138,163,171,0.13)] lg:pl-7",
                  colIndex < columns.length - 1 && "lg:pr-1",
                )}
              >
                {/* Encabezado de columna */}
                <header>
                  <div className="flex items-baseline gap-3">
                    <span className="tnum font-mono text-[10px] tracking-[0.18em] text-mist">
                      0{colIndex + 1}
                    </span>
                    <h3 className="text-[15px] font-medium tracking-[-0.01em] text-chalk">
                      {col.title}
                    </h3>
                    <span className="tnum ml-auto rounded-[5px] border border-[rgba(138,163,171,0.18)] px-2 py-0.5 font-mono text-[11px] text-mist">
                      {total}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="font-mono text-[9.5px] tracking-[0.12em] text-mist/80 uppercase">
                      {col.hint}
                    </span>
                    <div className="flex-1">
                      <Meter value={share} tone={col.id === "done" ? "aqua" : "mist"} height={2} />
                    </div>
                    <span className="tnum font-mono text-[9.5px] text-mist">{share}%</span>
                  </div>
                </header>

                {/* Tarjetas */}
                <div className="mt-5 space-y-3.5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {colItems.map((task, i) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{
                          duration: 0.32,
                          delay: Math.min(i * 0.045, 0.25),
                          ease: [0.22, 0.61, 0.36, 1],
                        }}
                      >
                        <TaskCard task={task} onMove={move} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {colItems.length === 0 && (
                    <div className="rounded-[12px] border border-dashed border-[rgba(138,163,171,0.18)] px-4 py-9 text-center">
                      <div className="mx-auto h-[26px] w-[26px] rounded-full border border-[rgba(138,163,171,0.25)]" />
                      <p className="mt-3 text-[12px] text-mist">
                        {filter === "all"
                          ? "Columna despejada. Sin tareas aquí."
                          : "Ninguna tarea coincide con el filtro."}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onMove }: { task: Task; onMove: (id: string, s: TaskStatus) => void }) {
  const urgent = task.due <= "2026-05-16" && task.status !== "done";
  return (
    <Glass sheen className="group p-4">
      <div className="flex items-start gap-3">
        <h4 className="flex-1 text-[14px] leading-[1.35] font-medium text-chalk">{task.title}</h4>
        {task.priority === "alta" && task.status !== "done" && (
          <AlertTriangle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-amber" />
        )}
      </div>
      <p className="mt-2 text-[12px] leading-[1.6] text-mist">{task.description}</p>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {task.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        <Tag tone={priorityTone[task.priority]}>{task.priority}</Tag>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-[rgba(138,163,171,0.12)] pt-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em]",
              urgent ? "text-amber" : "text-mist",
            )}
          >
            <CalendarClock size={12} strokeWidth={1.8} />
            {formatDate(task.due)}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-mist">
            <Timer size={12} strokeWidth={1.8} />
            {task.estimate}
          </span>
        </div>
      </div>

      {/* Selector rápido de estado */}
      <div className="mt-3">
        <label className="screenprint text-[9px]" htmlFor={`sel-${task.id}`}>
          Mover a
        </label>
        <select
          id={`sel-${task.id}`}
          value={task.status}
          onChange={(e) => onMove(task.id, e.target.value as TaskStatus)}
          className="mt-1.5 w-full appearance-none rounded-[8px] border border-[rgba(138,163,171,0.18)] bg-[rgba(138,163,171,0.07)] px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-chalk uppercase transition-colors hover:border-[rgba(56,224,200,0.4)] focus:border-aqua focus:outline-none"
        >
          <option value="todo">Sin empezar</option>
          <option value="doing">En proceso</option>
          <option value="done">Terminado</option>
        </select>
      </div>
    </Glass>
  );
}

const months = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${months[Number(m) - 1]}`;
}
