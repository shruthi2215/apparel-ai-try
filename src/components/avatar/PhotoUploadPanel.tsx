import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { checkFile } from "@/lib/photoValidation";
import { Camera, ImageUp, Info, ShieldCheck, Upload, X } from "lucide-react";

interface Props {
  photo: string | null;
  onPhoto: (dataUrl: string, file: File) => void;
  onClear: () => void;
  onError: (message: string) => void;
  consent: boolean;
  onConsent: (v: boolean) => void;
  autoDelete: boolean;
  onAutoDelete: (v: boolean) => void;
  onContinue: () => void;
  busy?: boolean;
}

const REQUIREMENTS = [
  "One clear, front-facing photo of you alone",
  "Head and torso in frame, eyes looking at the camera",
  "Even daylight — no harsh flash or backlight",
  "No sunglasses, masks, hats or hands covering the face",
  "JPG, JPEG, PNG or WEBP · up to 12MB",
];

export default function PhotoUploadPanel({
  photo, onPhoto, onClear, onError, consent, onConsent, autoDelete, onAutoDelete, onContinue, busy,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (file?: File | null) => {
    if (!file) return;
    const err = checkFile(file);
    if (err) return onError(err);
    const reader = new FileReader();
    reader.onload = (ev) => onPhoto(ev.target?.result as string, file);
    reader.onerror = () => onError("We couldn't read that file. Please try another photo.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
      <div>
        {photo ? (
          <div className="relative rounded-3xl overflow-hidden border border-border bg-muted/40 aspect-[3/4]">
            <img src={photo} alt="Preview of your uploaded photo" className="w-full h-full object-cover" />
            <button
              onClick={onClear}
              aria-label="Remove photo"
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/85 backdrop-blur border border-border flex items-center justify-center hover:bg-background"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a photo"
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files?.[0]); }}
            className={`aspect-[3/4] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center px-6 cursor-pointer transition-all ${
              dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/25 hover:border-primary/50"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <ImageUp className="w-6 h-6 text-primary" />
            </div>
            <p className="font-display text-base font-semibold text-foreground">Drop your photo here</p>
            <p className="font-body text-sm text-muted-foreground mt-1">or browse from your device</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="h-11 rounded-xl font-body text-sm">
            <Upload className="w-4 h-4 mr-2" /> Choose photo
          </Button>
          <Button variant="outline" onClick={() => camRef.current?.click()} className="h-11 rounded-xl font-body text-sm">
            <Camera className="w-4 h-4 mr-2" /> Use camera
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { accept(e.target.files?.[0]); e.target.value = ""; }} />
        <input ref={camRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => { accept(e.target.files?.[0]); e.target.value = ""; }} />
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">Photo requirements</h3>
          </div>
          <ul className="space-y-2">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="font-body text-sm text-muted-foreground flex gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">Your privacy</h3>
          </div>
          <p className="font-body text-sm text-muted-foreground">
            Your photo is used to generate your avatar. You control whether your uploaded image is
            retained or deleted. Avatars are never shared publicly.
          </p>
          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl bg-muted/50 p-3">
            <input type="checkbox" checked={consent} onChange={(e) => onConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
            <span className="font-body text-xs text-muted-foreground">
              I consent to my photo being used to generate my 3D avatar.
            </span>
          </label>
          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl bg-muted/50 p-3">
            <input type="checkbox" checked={autoDelete} onChange={(e) => onAutoDelete(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
            <span className="font-body text-xs text-muted-foreground">
              Auto-delete my uploaded photo as soon as the avatar is generated.
            </span>
          </label>
        </div>

        <Button
          onClick={onContinue}
          disabled={!photo || !consent || busy}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
        >
          {busy ? "Checking your photo…" : "Check photo quality"}
        </Button>
      </div>
    </div>
  );
}
