import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, MotionConfig } from "framer-motion";
import { Menu, Bell, Search } from "lucide-react";
import { Sidebar, type ViewId } from "./components/Sidebar";
import { StatusBand } from "./components/StatusBand";
import { TaskBoard } from "./views/TaskBoard";
import { ScheduleView } from "./views/ScheduleView";
import { ResourcesView } from "./views/ResourcesView";
import { Label, cn } from "./components/ui";
import { profile } from "./data/mockData";

const surface = "/images/surface.jpg";

function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Materia: acrílico ahumado sobre aluminio anodizado */}
      <img
        src={surface}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-[0.3]"
      />
      <div className="aurora absolute inset-[-15%]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,transparent_20%,rgba(4,7,10,0.72)_75%,rgba(3,6,9,0.94)_100%)]" />
      <div className="grain absolute inset-0" />
    </div>
  );
}

function TopBar({
  onMenu,
  query,
}: {
  onMenu: () => void;
  query: string;
}) {
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const time = clock.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <header className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-3 px-5 pt-5 pb-4 sm:px-7 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-[9px] border border-[rgba(138,163,171,0.18)] p-2 text-mist transition-colors hover:text-aqua lg:hidden"
        aria-label="Abrir navegación"
      >
        <Menu size={17} strokeWidth={1.8} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-[27px] leading-none text-chalk sm:text-[31px]">
            {profile.greeting.split(",")[0]},
            <span className="italic text-aqua-light"> {profile.greeting.split(",")[1]?.trim()}</span>
          </h1>
          <span className="live-dot h-[6px] w-[6px] shrink-0 rounded-full bg-aqua" />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="screenprint">{profile.dateLabel}</span>
          <span className="h-[3px] w-[3px] rounded-full bg-[rgba(138,163,171,0.45)]" />
          <span className="screenprint text-aqua">Modo {profile.mode} activo</span>
        </div>
      </div>

      {/* Búsqueda simulada (la funcional vive en Base de recursos) */}
      <div className="hidden items-center gap-2.5 rounded-[10px] border border-[rgba(138,163,171,0.16)] bg-[rgba(10,18,23,0.55)] px-3.5 py-2.5 xl:flex">
        <Search size={14} strokeWidth={1.8} className="text-mist" />
        <span className="text-[12px] text-mist">{query}</span>
        <span className="ml-2 rounded-[4px] border border-[rgba(138,163,171,0.22)] px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] text-mist uppercase">
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <Label>Hora local</Label>
          <div className="tnum mt-1 font-mono text-[19px] leading-none font-medium text-chalk">
            {time}
          </div>
        </div>
        <button
          className="relative rounded-[10px] border border-[rgba(138,163,171,0.18)] p-2.5 text-mist transition-colors hover:border-[rgba(240,163,94,0.45)] hover:text-amber"
          aria-label="Avisos"
        >
          <Bell size={16} strokeWidth={1.8} />
          <span className="absolute top-2 right-2 h-[6px] w-[6px] rounded-full bg-amber" />
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const [view, setView] = useState<ViewId>("tasks");
  const [navOpen, setNavOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-screen bg-ink text-chalk">
      <Backdrop />

      <Sidebar
        view={view}
        onChange={setView}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <main className="relative z-10 min-h-screen lg:pl-[276px]">
        <TopBar onMenu={() => setNavOpen(true)} query="Buscar en todo el hub…" />

        <StatusBand />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {view === "tasks" && <TaskBoard />}
            {view === "schedule" && <ScheduleView />}
            {view === "resources" && <ResourcesView />}
          </motion.div>
        </AnimatePresence>

        {/* Pie de consola */}
        <footer className="relative border-t border-[rgba(138,163,171,0.12)] px-5 py-6 sm:px-7 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="screenprint">Núcleo · consola personal</span>
              <span className="hidden h-[3px] w-[3px] rounded-full bg-[rgba(138,163,171,0.4)] sm:block" />
              <span className="screenprint">Datos de prueba · mockData</span>
            </div>
            <div className={cn("flex items-center gap-5")}>
              <span className="screenprint">Sincronizado hace 2 min</span>
              <span className="screenprint text-aqua">Sesión 04:12:38</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </MotionConfig>
  );
}
