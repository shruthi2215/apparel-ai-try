import { Button } from "@/components/ui/button";
import type { PhotoValidationResult } from "@/lib/photoValidation";
import { AlertTriangle, CheckCircle2, Sparkles, Upload, XCircle } from "lucide-react";

interface Props {
  photo: string;
  result: PhotoValidationResult;
  onRetry: () => void;
  onProceed: () => void;
}

export default function ValidationReport({ photo, result, onRetry, onProceed }: Props) {
  const pct = Math.round(result.score * 100);
  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
      <div className="relative rounded-3xl overflow-hidden border border-border aspect-[3/4]">
        <img src={photo} alt="Photo being validated" className="w-full h-full object-cover" />
        {result.faceBox && (
          <div
            aria-hidden
            className="absolute border-2 border-primary/80 rounded-xl shadow-[0_0_0_9999px_hsl(var(--background)/0.35)]"
            style={{
              left: `${result.faceBox.x * 100}%`,
              top: `${result.faceBox.y * 100}%`,
              width: `${result.faceBox.w * 100}%`,
              height: `${result.faceBox.h * 100}%`,
            }}
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="font-display text-base font-semibold text-foreground">Photo quality</h3>
            <span className="font-display text-2xl font-semibold text-primary">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-4" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>

          <ul className="space-y-2.5">
            {result.checks.map((c) => (
              <li key={c.id} className="flex gap-2.5">
                {c.severity === "pass" ? (
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                ) : c.severity === "warn" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{c.label}</p>
                  <p className="font-body text-xs text-muted-foreground">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {!result.ok && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="font-body text-sm text-foreground">
              This photo won't produce a faithful avatar. Retake it facing the camera in even light,
              with your head and torso fully visible, then upload again.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onRetry} className="h-12 rounded-xl font-body">
            <Upload className="w-4 h-4 mr-2" /> Upload a different photo
          </Button>
          <Button
            onClick={onProceed}
            disabled={!result.ok}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Generate my avatar
          </Button>
        </div>
      </div>
    </div>
  );
}
