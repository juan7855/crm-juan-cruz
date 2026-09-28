import { ArcGauge, Label, Rule, cn } from "./ui";
import { profile } from "../data/mockData";

export function StatusBand() {
  const tones = ["text-chalk", "text-aqua", "text-amber", "text-chalk"];
  return (
    <section
      aria-label="Estado del hub"
      className="border-y border-[rgba(138,163,171,0.12)] bg-[rgba(9,15,20,0.5)] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:gap-8 lg:px-8">
        {/* Medidor de enfoque */}
        <div className="flex items-center gap-4 lg:w-[330px] lg:shrink-0">
          <ArcGauge
            value={profile.focus.value}
            label={profile.focus.label}
            caption={`${profile.focus.elapsed} de ${profile.focus.goal}`}
          />
        </div>

        <div className="hidden h-14 w-px shrink-0 bg-[rgba(138,163,171,0.13)] lg:block" />

        {/* Métricas */}
        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {profile.metrics.map((m, i) => (
            <div key={m.label} className={cn("min-w-0", i > 0 && "sm:border-l sm:border-[rgba(138,163,171,0.13)] sm:pl-6")}>
              <Label className="truncate">{m.label}</Label>
              <div
                className={cn(
                  "tnum mt-1.5 font-mono text-[27px] leading-none font-medium tracking-[-0.02em]",
                  tones[i % tones.length],
                )}
              >
                {m.value}
              </div>
              <div className="mt-1.5 truncate text-[11.5px] text-mist">{m.hint}</div>
            </div>
          ))}
        </div>
      </div>
      <Rule />
    </section>
  );
}
