import {
  ListChecks,
  CalendarRange,
  Library,
  StickyNote,
  Inbox,
  Command,
  Settings,
  X,
  Flame,
} from "lucide-react";
import { Glass, Label, Meter, Rule, cn } from "./ui";
import { profile } from "../data/mockData";

export type ViewId = "tasks" | "schedule" | "resources";

const navItems: { id: ViewId; label: string; hint: string; icon: typeof ListChecks; count: string }[] = [
  { id: "tasks", label: "Gestor de tareas", hint: "Kanban", icon: ListChecks, count: "12" },
  { id: "schedule", label: "Calendario y rutas", hint: "Mayo 2026", icon: CalendarRange, count: "13" },
  { id: "resources", label: "Base de recursos", hint: "Skills · archivos · vídeo", icon: Library, count: "15" },
];

const quickIcons: Record<string, typeof StickyNote> = {
  note: StickyNote,
  inbox: Inbox,
  command: Command,
  settings: Settings,
};

export function Sidebar({
  view,
  onChange,
  open,
  onClose,
}: {
  view: ViewId;
  onChange: (v: ViewId) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Velador móvil */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(3,6,9,0.72)] backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-[rgba(138,163,171,0.12)] bg-[rgba(7,12,16,0.86)] backdrop-blur-2xl transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Marca */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className="shrink-0">
            <rect x="0.5" y="0.5" width="33" height="33" rx="9" fill="rgba(56,224,200,0.07)" stroke="rgba(56,224,200,0.32)" />
            <path d="M8 24.5V13.2c0-.6.75-.9 1.17-.46L16 19.1c.4.42 1.1.42 1.5 0l4.2-4.4c.36-.38 1.02-.14 1.08.4l1.1 9.3" fill="none" stroke="#38e0c8" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="8.6" cy="10" r="2.1" fill="#8ff4e6" />
            <circle cx="24.4" cy="24" r="2.1" fill="#f0a35e" />
          </svg>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[21px] leading-none tracking-[0.02em] text-chalk">
              Núcleo
            </div>
            <div className="mt-1 screenprint text-[9px]">Consola personal · v2.4</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-mist transition-colors hover:text-aqua lg:hidden"
            aria-label="Cerrar navegación"
          >
            <X size={16} />
          </button>
        </div>

        <Rule />

        {/* Navegación */}
        <nav className="px-3 pt-4">
          <Label className="px-2 pb-2">Vistas</Label>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onChange(item.id);
                      onClose();
                    }}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-left transition-all duration-200",
                      active
                        ? "bg-[rgba(56,224,200,0.1)] text-aqua-light"
                        : "text-mist hover:bg-[rgba(138,163,171,0.07)] hover:text-chalk",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 h-6 w-[2px] rounded-full transition-all duration-200",
                        active ? "bg-aqua" : "bg-transparent group-hover:bg-[rgba(138,163,171,0.3)]",
                      )}
                    />
                    <Icon size={17} strokeWidth={1.6} className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] leading-tight font-medium">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[9.5px] tracking-[0.12em] text-mist/80 uppercase">
                        {item.hint}
                      </span>
                    </span>
                    <span className="tnum font-mono text-[11px] text-mist">{item.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Estado personal */}
        <div className="mt-6 px-5">
          <Label>Estado personal</Label>
          <Glass flat className="mt-2.5 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-chalk">Energía</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-[7px] w-[7px] rounded-full",
                      n <= profile.energy
                        ? "bg-aqua shadow-[0_0_10px_rgba(56,224,200,0.55)]"
                        : "bg-[rgba(138,163,171,0.22)]",
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12px] text-chalk">Racha</span>
              <span className="flex items-center gap-1.5 text-[12px] text-amber">
                <Flame size={13} strokeWidth={1.8} />
                <span className="tnum font-mono">18 días</span>
              </span>
            </div>
            <div className="mt-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-chalk">Progreso semanal</span>
                <span className="tnum font-mono text-[11px] text-aqua">72%</span>
              </div>
              <Meter value={72} className="mt-2" />
            </div>
            <div className="mt-3.5 flex items-center gap-2 rounded-[8px] border border-[rgba(56,224,200,0.24)] bg-[rgba(56,224,200,0.08)] px-2.5 py-2">
              <span className="live-dot h-[6px] w-[6px] rounded-full bg-aqua" />
              <span className="font-mono text-[9.5px] tracking-[0.16em] text-aqua uppercase">
                Modo {profile.mode}
              </span>
            </div>
          </Glass>
        </div>

        {/* Acceso rápido */}
        <div className="mt-6 px-3">
          <Label className="px-2 pb-2">Acceso rápido</Label>
          <ul className="space-y-0.5">
            {profile.quickLinks.map((link) => {
              const Icon = quickIcons[link.icon] ?? StickyNote;
              return (
                <li key={link.label}>
                  <button className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[12.5px] text-mist transition-colors hover:bg-[rgba(138,163,171,0.07)] hover:text-chalk">
                    <Icon size={15} strokeWidth={1.6} />
                    <span className="flex-1 truncate text-left">{link.label}</span>
                    {link.count > 0 && (
                      <span className="tnum rounded-[4px] border border-[rgba(138,163,171,0.18)] px-1.5 py-0.5 font-mono text-[9.5px]">
                        {link.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-auto">
          <Rule />
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(56,224,200,0.35)] bg-[rgba(56,224,200,0.12)] font-mono text-[11px] tracking-[0.08em] text-aqua-light">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-medium text-chalk">{profile.name}</div>
              <div className="truncate font-mono text-[9.5px] tracking-[0.12em] text-mist uppercase">
                {profile.role}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
