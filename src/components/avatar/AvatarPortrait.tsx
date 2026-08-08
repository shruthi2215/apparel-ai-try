import { cmToFeet, type BodySize, type Gender } from "@/lib/avatar";

interface Props {
  imageUrl: string | null;
  gender?: Gender;
  bodySize?: BodySize;
  heightCm?: number | null;
  garmentBadge?: string;
  className?: string;
}

/** Front-view avatar render presented on a studio platform. No rotation. */
export default function AvatarPortrait({ imageUrl, gender, bodySize, heightCm, garmentBadge, className = "" }: Props) {
  return (
    <div className={`relative rounded-3xl border border-border overflow-hidden bg-gradient-to-b from-muted/60 via-background to-muted ${className}`}>
      <div className="relative aspect-[3/4] flex items-end justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Your Tryvior avatar, front view"
            className="h-full w-full object-contain object-bottom relative z-10"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-body text-sm text-muted-foreground">No avatar yet</p>
          </div>
        )}
        {/* Studio platform */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-6 rounded-[50%] bg-foreground/10 blur-[2px]" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-[50%] border border-border/60 bg-card/70" />
      </div>

      {(gender || bodySize || heightCm || garmentBadge) && (
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {gender && (
            <span className="rounded-full bg-card/90 border border-border px-2.5 py-1 font-body text-[11px] text-foreground capitalize">
              {gender}
            </span>
          )}
          {bodySize && (
            <span className="rounded-full bg-card/90 border border-border px-2.5 py-1 font-body text-[11px] text-foreground">
              Size {bodySize}
            </span>
          )}
          {heightCm ? (
            <span className="rounded-full bg-card/90 border border-border px-2.5 py-1 font-body text-[11px] text-foreground">
              {heightCm} cm · {cmToFeet(heightCm)}
            </span>
          ) : null}
          {garmentBadge && (
            <span className="rounded-full bg-primary/10 border border-primary/30 px-2.5 py-1 font-body text-[11px] text-primary">
              {garmentBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
