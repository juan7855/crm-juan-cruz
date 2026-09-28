import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ArrowRight, Route, CalendarDays, ListTree } from "lucide-react";
import { Glass, Label, Meter, Tag, Button, cn } from "../components/ui";
import {
  calendar,
  events,
  routes,
  timeline,
  type CalendarEvent,
} from "../data/mockData";

const kindTone: Record<CalendarEvent["kind"], { bar: string; text: string; label: string }> = {
  bloque: { bar: "bg-aqua", text: "text-aqua", label: "Bloque de foco" },
  evento: { bar: "bg-[rgba(199,216,220,0.75)]", text: "text-chalk", label: "Evento" },
  ruta: { bar: "bg-amber", text: "text-amber", label: "Ruta" },
};

function buildGrid() {
  const first = new Date(calendar.year, calendar.monthIndex, 1);
  const daysInMonth = new Date(calendar.year, calendar.monthIndex + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // lunes = 0
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function ScheduleView() {
  const [mode, setMode] = useState<"month" | "agenda">("month");
  const cells = buildGrid();

  return (
    <div className="px-5 pt-7 pb-16 sm:px-7 lg:px-8">
      {/* Cabecera */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <Label>Vista 02 · Tiempo y agenda</Label>
          <h2 className="mt-2 font-display text-[38px] leading-[0.95] tracking-[-0.01em] text-chalk sm:text-[46px]">
            Calendario <span className="italic text-aqua-light">y rutas</span>
          </h2>
          <p className="mt-2.5 max-w-[52ch] text-[13.5px] leading-relaxed text-mist">
            Bloques temporales, eventos y desplazamientos planificados sobre la misma retícula.
            {calendar.monthLabel} · 13 eventos · 3 rutas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-[10px] border border-[rgba(138,163,171,0.14)] bg-[rgba(10,18,23,0.55)] p-1">
            {([
              { id: "month", label: "Mes", icon: CalendarDays },
              { id: "agenda", label: "Agenda", icon: ListTree },
            ] as const).map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex items-center gap-2 rounded-[7px] px-3.5 py-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase transition-colors duration-200",
                  mode === m.id
                    ? "bg-[rgba(56,224,200,0.16)] text-aqua-light"
                    : "text-mist hover:text-chalk",
                )}
              >
                <m.icon size={12} strokeWidth={1.8} /> {m.label}
              </button>
            ))}
          </div>
          <Button>Ir a hoy</Button>
        </div>
      </div>

      {/* Cuerpo: contenido + raíl de rutas */}
      <div className="mt-7 grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {mode === "month" ? (
              <motion.div
                key="month"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <Glass className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[rgba(138,163,171,0.13)] px-5 py-4">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-[25px] leading-none text-chalk">
                        {calendar.monthLabel}
                      </h3>
                      <span className="screenprint">Cuadrícula mensual</span>
                    </div>
                    <div className="hidden items-center gap-4 sm:flex">
                      {Object.entries(kindTone).map(([k, v]) => (
                        <span key={k} className="flex items-center gap-1.5">
                          <span className={cn("h-[6px] w-[6px] rounded-full", v.bar)} />
                          <span className="screenprint text-[9px]">{v.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 border-b border-[rgba(138,163,171,0.13)]">
                    {calendar.weekdayLabels.map((w, i) => (
                      <div
                        key={w + i}
                        className="px-2 py-2.5 text-center font-mono text-[9.5px] tracking-[0.18em] text-mist uppercase"
                      >
                        {w}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {cells.map((day, i) => {
                      const dayEvents = day
                        ? events.filter((e) => e.day === day)
                        : [];
                      const isToday = day === calendar.today;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "min-h-[92px] border-b border-r border-[rgba(138,163,171,0.09)] p-1.5 transition-colors duration-200 sm:min-h-[112px]",
                            (i + 1) % 7 === 0 && "border-r-0",
                            day ? "hover:bg-[rgba(56,224,200,0.05)]" : "bg-[rgba(6,11,15,0.35)]",
                            isToday && "bg-[rgba(56,224,200,0.08)]",
                          )}
                        >
                          {day && (
                            <>
                              <div className="flex items-center justify-between">
                                <span
                                  className={cn(
                                    "tnum flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-1 font-mono text-[10.5px]",
                                    isToday
                                      ? "bg-aqua text-[#04211f]"
                                      : "text-mist",
                                  )}
                                >
                                  {day}
                                </span>
                                {dayEvents.length > 2 && (
                                  <span className="font-mono text-[8.5px] tracking-[0.12em] text-mist/80 uppercase">
                                    +{dayEvents.length - 2}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1.5 space-y-1">
                                {dayEvents.slice(0, 2).map((ev) => (
                                  <div
                                    key={ev.id}
                                    title={`${ev.start}–${ev.end} · ${ev.title}`}
                                    className={cn(
                                      "flex items-center gap-1 rounded-[3px] border-l-2 bg-[rgba(138,163,171,0.08)] px-1.5 py-[3px]",
                                      ev.kind === "ruta"
                                        ? "border-l-amber"
                                        : ev.kind === "bloque"
                                          ? "border-l-aqua"
                                          : "border-l-[rgba(199,216,220,0.6)]",
                                    )}
                                  >
                                    <span className="tnum hidden font-mono text-[8.5px] text-mist sm:inline">
                                      {ev.start}
                                    </span>
                                    <span className="truncate text-[9.5px] leading-tight text-chalk">
                                      {ev.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Glass>
              </motion.div>
            ) : (
              <motion.div
                key="agenda"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <Glass className="p-5 sm:p-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-[25px] leading-none text-chalk">
                      Jueves 14 de mayo
                    </h3>
                    <span className="screenprint">Timeline · 06:50 → 18:45</span>
                  </div>

                  <ol className="mt-6 space-y-0">
                    {timeline.map((item, i) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="group grid grid-cols-[62px_18px_minmax(0,1fr)] gap-3"
                      >
                        <div className="tnum pt-1 text-right font-mono text-[11px] text-mist">
                          {item.time}
                        </div>
                        <div className="relative flex justify-center">
                          <span
                            className={cn(
                              "absolute top-2 h-[9px] w-[9px] rounded-full border",
                              item.kind === "ruta"
                                ? "border-amber bg-amber"
                                : item.kind === "bloque"
                                  ? "border-aqua bg-aqua"
                                  : item.kind === "pausa"
                                    ? "border-[rgba(138,163,171,0.4)] bg-ink"
                                    : "border-[rgba(199,216,220,0.65)] bg-[rgba(199,216,220,0.65)]",
                            )}
                          />
                          {i < timeline.length - 1 && (
                            <span className="absolute top-[18px] bottom-0 w-px bg-[rgba(138,163,171,0.16)]" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "mb-3 rounded-[10px] border border-[rgba(138,163,171,0.12)] bg-[rgba(138,163,171,0.05)] px-4 py-3 transition-colors duration-200",
                            item.kind === "pausa"
                              ? "opacity-70"
                              : "hover:border-[rgba(56,224,200,0.3)] hover:bg-[rgba(56,224,200,0.06)]",
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13.5px] font-medium text-chalk">
                              {item.title}
                            </span>
                            <Tag
                              tone={
                                item.kind === "ruta"
                                  ? "amber"
                                  : item.kind === "bloque"
                                    ? "aqua"
                                    : "neutral"
                              }
                            >
                              {item.kind}
                            </Tag>
                          </div>
                          <div className="mt-1.5 text-[11.5px] text-mist">{item.meta}</div>
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                </Glass>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Raíl de rutas */}
        <aside className="min-w-0 space-y-4">
          <div className="flex items-center gap-2">
            <Route size={15} strokeWidth={1.8} className="text-amber" />
            <h3 className="text-[14px] font-medium tracking-[-0.01em] text-chalk">
              Rutas programadas
            </h3>
            <span className="tnum ml-auto font-mono text-[11px] text-mist">03</span>
          </div>

          {routes.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 + i * 0.08 }}
            >
              <Glass sheen className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-[13px] leading-snug font-medium text-chalk">{r.title}</h4>
                  <span className="tnum shrink-0 rounded-[5px] border border-[rgba(240,163,94,0.3)] bg-[rgba(240,163,94,0.1)] px-1.5 py-0.5 font-mono text-[9.5px] text-amber">
                    {r.day} may
                  </span>
                </div>

                <div className="mt-3.5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full border border-aqua" />
                    <div className="min-w-0">
                      <div className="font-mono text-[9.5px] tracking-[0.12em] text-mist uppercase">
                        Salida {r.departure}
                      </div>
                      <div className="truncate text-[12px] text-chalk">{r.from}</div>
                    </div>
                  </div>
                  <div className="ml-[3px] h-3 w-px border-l border-dashed border-[rgba(138,163,171,0.35)]" />
                  <div className="flex items-start gap-2.5">
                    <span className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-amber" />
                    <div className="min-w-0">
                      <div className="font-mono text-[9.5px] tracking-[0.12em] text-mist uppercase">
                        Llegada {r.arrival}
                      </div>
                      <div className="truncate text-[12px] text-chalk">{r.to}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center gap-4 border-t border-[rgba(138,163,171,0.12)] pt-3">
                  <span className="tnum flex items-center gap-1.5 font-mono text-[10px] text-mist">
                    <MapPin size={11} strokeWidth={1.8} /> {r.distance}
                  </span>
                  <span className="tnum flex items-center gap-1.5 font-mono text-[10px] text-mist">
                    <Clock size={11} strokeWidth={1.8} /> {r.duration}
                  </span>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-mist/90">{r.note}</p>
                <button className="mt-3 flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.16em] text-aqua uppercase transition-colors hover:text-aqua-light">
                  Abrir detalle <ArrowRight size={11} strokeWidth={2} />
                </button>
              </Glass>
            </motion.div>
          ))}

          <Glass flat className="p-4">
            <Label>Resumen del mes</Label>
            <div className="mt-3 space-y-3">
              {[
                { k: "Horas de foco", v: 42, unit: "h" },
                { k: "Kilómetros previstos", v: 105, unit: "km" },
                { k: "Reuniones", v: 9, unit: "" },
              ].map((row) => (
                <div key={row.k}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11.5px] text-mist">{row.k}</span>
                    <span className="tnum font-mono text-[13px] text-chalk">
                      {row.v}
                      <span className="text-[9px] text-mist"> {row.unit}</span>
                    </span>
                  </div>
                  <Meter value={Math.min(100, row.v)} tone="mist" height={2} className="mt-1.5" />
                </div>
              ))}
            </div>
          </Glass>
        </aside>
      </div>
    </div>
  );
}
