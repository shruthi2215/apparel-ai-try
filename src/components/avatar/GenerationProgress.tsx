import { GENERATION_STAGES, type StageId } from "@/lib/avatarGeneration";
import { Check, Loader2 } from "lucide-react";

export default function GenerationProgress({ stage }: { stage: StageId }) {
  const index = GENERATION_STAGES.findIndex((s) => s.id === stage);
  return (
    <div className="max-w-lg mx-auto py-10 text-center" role="status" aria-live="polite">
      <div className="relative w-28 h-28 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
        <div className="absolute inset-2 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-[2px]" />
      </div>

      <h2 className="font-display text-xl font-semibold text-foreground mb-1">
        Crafting your Tryvior avatar
      </h2>
      <p className="font-body text-sm text-muted-foreground mb-8">
        This usually takes a few moments — keep this tab open.
      </p>

      <ol className="text-left space-y-3">
        {GENERATION_STAGES.map((s, i) => {
          const done = i < index;
          const active = i === index;
          return (
            <li
              key={s.id}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                active ? "border-primary/40 bg-primary/5" : done ? "border-border bg-card" : "border-border/60 bg-muted/20"
              }`}
            >
              <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-background border border-border">
                {done ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : active ? (
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span className={`font-body text-sm ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
