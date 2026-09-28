import type { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------- Contenedor de vidrio ahumado ---------- */
export function Glass({
  children,
  className,
  flat = false,
  sheen = false,
}: {
  children: ReactNode;
  className?: string;
  flat?: boolean;
  sheen?: boolean;
}) {
  return (
    <div
      className={cn(
        flat ? "glass-flat" : "glass",
        sheen && "sheen transition-colors duration-300",
        "rounded-[14px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------- Etiqueta serigrafiada ---------- */
export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("screenprint", className)}>{children}</div>;
}

/* ---------- Regla hairline ---------- */
export function Rule({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[rgba(138,163,171,0.13)]", className)} />;
}

/* ---------- Etiqueta de categoría ---------- */
export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "aqua" | "amber";
}) {
  const tones = {
    neutral:
      "border-[rgba(138,163,171,0.22)] text-mist bg-[rgba(138,163,171,0.07)]",
    aqua: "border-[rgba(56,224,200,0.32)] text-aqua bg-[rgba(56,224,200,0.1)]",
    amber: "border-[rgba(240,163,94,0.32)] text-amber bg-[rgba(240,163,94,0.1)]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[3px] border px-1.5 py-[3px] font-mono text-[9.5px] leading-none tracking-[0.14em] uppercase",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Barra de progreso (medición de consola) ---------- */
export function Meter({
  value,
  tone = "aqua",
  height = 3,
  className,
}: {
  value: number;
  tone?: "aqua" | "amber" | "mist";
  height?: number;
  className?: string;
}) {
  const fills = {
    aqua: "linear-gradient(90deg, #0f3b3a 0%, #38e0c8 58%, #8ff4e6 100%)",
    amber: "linear-gradient(90deg, #4a2d13 0%, #f0a35e 58%, #ffd0a1 100%)",
    mist: "linear-gradient(90deg, rgba(138,163,171,0.25) 0%, rgba(199,216,220,0.78) 100%)",
  } as const;
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-[rgba(138,163,171,0.13)]",
        className,
      )}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(2, Math.min(100, value))}%`,
          backgroundImage: fills[tone],
          transition: "width 700ms cubic-bezier(0.22,0.61,0.36,1)",
        }}
      />
    </div>
  );
}

/* ---------- Medidor de arco (sesión de enfoque) ---------- */
export function ArcGauge({
  value,
  label,
  caption,
  size = 86,
}: {
  value: number;
  label: string;
  caption: string;
  size?: number;
}) {
  const stroke = 5;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const sweep = 0.72; // 260°
  const dash = c * sweep;
  const filled = (dash * Math.min(100, value)) / 100;

  return (
    <div className="flex items-center gap-3.5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <g transform={`rotate(140 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="rgba(138,163,171,0.16)"
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c}`}
              strokeLinecap="round"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="url(#arc-grad)"
              strokeWidth={stroke}
              strokeDasharray={`${filled} ${c}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.22,0.61,0.36,1)" }}
            />
          </g>
          <defs>
            <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f3b3a" />
              <stop offset="55%" stopColor="#38e0c8" />
              <stop offset="100%" stopColor="#8ff4e6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tnum font-mono text-[19px] leading-none font-medium text-aqua-light">
            {value}
            <span className="text-[10px] text-mist">%</span>
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <Label>{label}</Label>
        <div className="mt-1 text-[13px] leading-tight text-chalk">{caption}</div>
      </div>
    </div>
  );
}

/* ---------- Botón / control ---------- */
export function Button({
  children,
  onClick,
  variant = "ghost",
  className,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "solid";
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-[8px] px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase transition-all duration-200",
        variant === "solid"
          ? "bg-aqua text-[#04211f] hover:bg-aqua-light"
          : "border border-[rgba(138,163,171,0.18)] text-mist hover:border-[rgba(56,224,200,0.42)] hover:text-aqua",
        className,
      )}
    >
      {children}
    </button>
  );
}
