import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileCode2,
  PenTool,
  Download,
  Play,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Glass, Label, Meter, Tag, cn } from "../components/ui";
import { resources, resourceFilters, type Resource } from "../data/mockData";
import vid01 from "../assets/vid-01.jpg";
import vid02 from "../assets/vid-02.jpg";
import vid03 from "../assets/vid-03.jpg";

const thumbs: Record<string, string> = {
  "vid-01": vid01,
  "vid-02": vid02,
  "vid-03": vid03,
};

const fileIcons = {
  PDF: FileText,
  ZIP: FileArchive,
  CSV: FileSpreadsheet,
  MD: FileCode2,
  FIG: PenTool,
} as const;

const kindLabel: Record<Resource["kind"], string> = {
  skill: "Skill",
  file: "Archivo",
  video: "Vídeo / Link",
};

export function ResourcesView() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof resourceFilters)[number]["id"]>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      const matchKind = filter === "all" || r.kind === filter;
      const haystack = `${r.title} ${r.description} ${
        r.kind === "skill" ? r.category : r.kind === "file" ? r.ext : r.platform
      }`.toLowerCase();
      return matchKind && (q === "" || haystack.includes(q));
    });
  }, [query, filter]);

  const counts = {
    skill: resources.filter((r) => r.kind === "skill").length,
    file: resources.filter((r) => r.kind === "file").length,
    video: resources.filter((r) => r.kind === "video").length,
  };

  return (
    <div className="px-5 pt-7 pb-16 sm:px-7 lg:px-8">
      {/* Cabecera */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <Label>Vista 03 · Biblioteca</Label>
          <h2 className="mt-2 font-display text-[38px] leading-[0.95] tracking-[-0.01em] text-chalk sm:text-[46px]">
            Base de <span className="italic text-aqua-light">recursos</span>
          </h2>
          <p className="mt-2.5 max-w-[52ch] text-[13.5px] leading-relaxed text-mist">
            {counts.skill} skills · {counts.file} archivos · {counts.video} vídeos y enlaces,
            indexados en una sola cuadrícula densa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="tnum flex items-center gap-2 rounded-[9px] border border-[rgba(56,224,200,0.24)] bg-[rgba(56,224,200,0.08)] px-3 py-2 font-mono text-[10px] tracking-[0.14em] text-aqua uppercase">
            <Sparkles size={12} strokeWidth={1.8} /> {visible.length} resultados
          </span>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mt-7 flex flex-col gap-3 rounded-[12px] border border-[rgba(138,163,171,0.12)] bg-[rgba(10,18,23,0.5)] p-3.5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            strokeWidth={1.8}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mist"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, categoría, formato o plataforma…"
            className="w-full rounded-[9px] border border-[rgba(138,163,171,0.18)] bg-[rgba(138,163,171,0.06)] py-2.5 pr-4 pl-10 text-[13px] text-chalk placeholder:text-mist/70 transition-colors focus:border-[rgba(56,224,200,0.55)] focus:bg-[rgba(56,224,200,0.05)] focus:outline-none"
            aria-label="Búsqueda global de recursos"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-[10px] border border-[rgba(138,163,171,0.14)] bg-[rgba(10,18,23,0.55)] p-1">
          {resourceFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-[7px] px-3.5 py-2 font-mono text-[9.5px] tracking-[0.14em] uppercase transition-colors duration-200",
                filter === f.id
                  ? "bg-[rgba(56,224,200,0.16)] text-aqua-light"
                  : "text-mist hover:text-chalk",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cuadrícula */}
      {visible.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.34,
                delay: Math.min(i * 0.035, 0.3),
                ease: [0.22, 0.61, 0.36, 1],
              }}
              className="flex"
            >
              {r.kind === "skill" ? (
                <SkillCard r={r} />
              ) : r.kind === "file" ? (
                <FileCard r={r} />
              ) : (
                <VideoCard r={r} />
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[14px] border border-dashed border-[rgba(138,163,171,0.2)] px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(138,163,171,0.25)]">
            <Search size={18} strokeWidth={1.6} className="text-mist" />
          </div>
          <p className="mt-4 text-[15px] text-chalk">
            Sin resultados para «<span className="text-aqua">{query || "…"}</span>»
          </p>
          <p className="mt-2 text-[12px] text-mist">
            Prueba con otra palabra o vuelve al filtro «Todas».
          </p>
          <button
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-5 rounded-[8px] border border-[rgba(56,224,200,0.35)] px-4 py-2 font-mono text-[9.5px] tracking-[0.16em] text-aqua uppercase transition-colors hover:bg-[rgba(56,224,200,0.12)]"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}
    </div>
  );
}

function SkillCard({ r }: { r: Extract<Resource, { kind: "skill" }> }) {
  return (
    <Glass sheen className="flex w-full flex-col p-4">
      <div className="flex items-center justify-between">
        <Tag tone="aqua">{kindLabel.skill}</Tag>
        <span className="tnum font-mono text-[12px] text-aqua-light">{r.level}%</span>
      </div>
      <h4 className="mt-3 text-[14px] leading-snug font-medium text-chalk">{r.title}</h4>
      <div className="mt-1.5">
        <span className="font-mono text-[9.5px] tracking-[0.14em] text-mist uppercase">
          {r.category}
        </span>
      </div>
      <p className="mt-2.5 flex-1 text-[11.5px] leading-[1.65] text-mist">{r.description}</p>
      <div className="mt-3.5">
        <Meter value={r.level} height={3} />
        <div className="mt-2 font-mono text-[9px] tracking-[0.12em] text-mist/80 uppercase">
          {r.updated}
        </div>
      </div>
    </Glass>
  );
}

function FileCard({ r }: { r: Extract<Resource, { kind: "file" }> }) {
  const Icon = fileIcons[r.ext];
  return (
    <Glass sheen className="flex w-full flex-col p-4">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[rgba(138,163,171,0.18)] bg-[rgba(138,163,171,0.08)]">
          <Icon size={19} strokeWidth={1.6} className="text-aqua" />
        </div>
        <span className="tnum rounded-[5px] border border-[rgba(138,163,171,0.2)] px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-mist">
          {r.ext}
        </span>
      </div>
      <h4 className="mt-3.5 text-[14px] leading-snug font-medium text-chalk">{r.title}</h4>
      <p className="mt-2 flex-1 text-[11.5px] leading-[1.65] text-mist">{r.description}</p>
      <div className="mt-3.5 flex items-center justify-between border-t border-[rgba(138,163,171,0.12)] pt-3">
        <div>
          <div className="tnum font-mono text-[10px] text-chalk">{r.size}</div>
          <div className="mt-0.5 font-mono text-[9px] tracking-[0.12em] text-mist/80 uppercase">
            {r.created}
          </div>
        </div>
        <button
          title="Descargar"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[rgba(138,163,171,0.18)] text-mist transition-colors hover:border-[rgba(56,224,200,0.45)] hover:text-aqua"
        >
          <Download size={14} strokeWidth={1.8} />
        </button>
      </div>
    </Glass>
  );
}

function VideoCard({ r }: { r: Extract<Resource, { kind: "video" }> }) {
  return (
    <Glass sheen className="flex w-full flex-col overflow-hidden">
      <div className="relative h-[124px] w-full overflow-hidden">
        <img
          src={thumbs[r.thumb]}
          alt=""
          loading="lazy"
          className="h-full w-full scale-105 object-cover opacity-85 transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,12,16,0.96)_0%,rgba(7,12,16,0.32)_48%,rgba(7,12,16,0)_100%)]" />
        <div className="absolute top-2.5 left-2.5">
          <Tag tone="neutral">{r.platform}</Tag>
        </div>
        <div className="absolute right-2.5 bottom-2.5 tnum rounded-[4px] bg-[rgba(6,10,13,0.78)] px-1.5 py-0.5 font-mono text-[9.5px] text-chalk">
          {r.duration}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(143,244,230,0.5)] bg-[rgba(6,10,13,0.55)] backdrop-blur-sm transition-colors hover:border-aqua hover:bg-[rgba(56,224,200,0.22)]">
            <Play size={15} strokeWidth={1.8} className="ml-0.5 text-aqua-light" />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-[14px] leading-snug font-medium text-chalk">{r.title}</h4>
        <p className="mt-2 flex-1 text-[11.5px] leading-[1.65] text-mist">{r.description}</p>
        <a
          href={r.url}
          className="mt-3.5 flex items-center gap-1.5 border-t border-[rgba(138,163,171,0.12)] pt-3 font-mono text-[9.5px] tracking-[0.16em] text-aqua uppercase transition-colors hover:text-aqua-light"
        >
          Abrir enlace <ExternalLink size={11} strokeWidth={2} />
        </a>
      </div>
    </Glass>
  );
}
