import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAvatar } from "@/hooks/useAvatar";
import AvatarPortrait from "@/components/avatar/AvatarPortrait";
import GenerationProgress from "@/components/avatar/GenerationProgress";
import { validatePhoto } from "@/lib/photoValidation";
import { getAvatarGenerationService, type StageId } from "@/lib/avatarGeneration";
import {
  BODY_SIZES, DEFAULT_HEIGHT_CM, HEIGHT_MAX_CM, HEIGHT_MIN_CM, cmToFeet,
  type BodySize, type FaceAnalysis, type Gender,
} from "@/lib/avatar";
import { ArrowLeft, Camera, Check, ShieldCheck, Sparkles, Upload, User } from "lucide-react";

type Step = "gender" | "photo" | "body" | "generating" | "done";

interface Props {
  initialGender?: Gender;
  onSaved?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export default function AvatarBuilder({ initialGender, onSaved, onCancel, compact = false }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { avatar, saveAvatar } = useAvatar();

  const [step, setStep] = useState<Step>("gender");
  const [gender, setGender] = useState<Gender | null>(initialGender ?? null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [heightCm, setHeightCm] = useState<number>(avatar?.height_cm ?? DEFAULT_HEIGHT_CM);
  const [size, setSize] = useState<BodySize>((avatar?.body_size as BodySize) ?? "M");
  const [consent, setConsent] = useState(false);
  const [autoDelete, setAutoDelete] = useState(true);
  const [stage, setStage] = useState<StageId>("analyze");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [face, setFace] = useState<FaceAnalysis | null>(null);
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const fail = (title: string, description?: string) =>
    toast({ title, description, variant: "destructive" });

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) return fail("Photo too large", "Please use an image under 12MB.");
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => { setPhoto(ev.target?.result as string); setStep("body"); };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!photo || !gender) return;
    if (!consent) return fail("Consent required", "Please allow us to use your photo to build your avatar.");
    setStep("generating");
    setStage("analyze");
    try {
      const check = await validatePhoto(photo);
      if (!check.ok) {
        setStep("body");
        return fail("Photo needs improving", check.issues?.[0]?.message || "Use a clear, well-lit front-facing photo.");
      }
      const generated = await getAvatarGenerationService().generate({
        photoDataUrl: photo, gender, bodySize: size, heightCm, consent, onStage: setStage,
      });
      setResultImage(generated.assetUrl);
      setFace(generated.face);
      setStep("done");

      if (user) {
        setSaving(true);
        try {
          await saveAvatar({
            gender, bodySize: size, heightCm, face: generated.face,
            photoFile: autoDelete ? null : photoFile,
            avatarImageDataUrl: generated.assetUrl,
            consent,
          });
          toast({ title: "Avatar saved", description: "It loads automatically on every future try-on." });
          onSaved?.();
        } catch (err) {
          fail("Avatar created but not saved", err instanceof Error ? err.message : undefined);
        } finally {
          setSaving(false);
        }
      }
      if (autoDelete) { setPhoto(null); setPhotoFile(null); }
    } catch (err) {
      fail("Avatar generation failed", err instanceof Error ? err.message : "Please try again.");
      setStep("body");
    }
  };

  const back = (to: Step) => () => setStep(to);

  return (
    <div className="space-y-4">
      {step === "gender" && (
        <div className="space-y-3">
          <p className="font-body text-sm font-medium text-foreground">Choose your body template</p>
          <div className="grid grid-cols-2 gap-3">
            {(["female", "male"] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => { setGender(g); setStep("photo"); }}
                className={`rounded-2xl border p-4 text-left transition-all ${gender === g ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <User className="w-5 h-5 text-primary mb-2" />
                <p className="font-body text-sm font-semibold text-foreground capitalize">{g}</p>
              </button>
            ))}
          </div>
          {onCancel && (
            <button onClick={onCancel} className="font-body text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          )}
        </div>
      )}

      {step === "photo" && (
        <div className="space-y-3">
          <button onClick={back("gender")} className="font-body text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <p className="font-body text-sm font-medium text-foreground">Upload a clear face photo</p>
          <p className="font-body text-xs text-muted-foreground">
            Front-facing, good lighting, no sunglasses or masks. Your avatar's face and skin tone are built from it.
          </p>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-2xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all"
          >
            <Upload className="w-7 h-7 text-primary mb-2" />
            <p className="font-body text-sm text-foreground font-medium">Tap to upload</p>
            <p className="font-body text-xs text-muted-foreground">JPG / PNG · Max 12MB</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => fileRef.current?.click()} className="h-10 rounded-xl bg-primary text-primary-foreground font-body text-sm">
              <Upload className="w-4 h-4 mr-2" /> Gallery
            </Button>
            <Button onClick={() => camRef.current?.click()} variant="outline" className="h-10 rounded-xl font-body text-sm">
              <Camera className="w-4 h-4 mr-2" /> Camera
            </Button>
          </div>
        </div>
      )}

      {step === "body" && (
        <div className="space-y-4">
          <button onClick={back("photo")} className="font-body text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Change photo
          </button>

          {photo && (
            <div className="flex items-center gap-3">
              <img src={photo} alt="Your uploaded photo" className="w-16 h-20 rounded-xl object-cover border border-border" />
              <p className="font-body text-xs text-muted-foreground">
                Your face, hair and skin tone are preserved exactly — no beautifying.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-sm font-medium text-foreground">Height</span>
              <span className="font-display text-base font-semibold text-primary">
                {heightCm} cm · {cmToFeet(heightCm)}
              </span>
            </div>
            <input
              type="range" min={HEIGHT_MIN_CM} max={HEIGHT_MAX_CM} step={1}
              aria-label="Height in centimetres"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-sm font-medium text-foreground">Body size</span>
              <span className="font-display text-base font-semibold text-primary">{size}</span>
            </div>
            <input
              type="range" min={0} max={BODY_SIZES.length - 1} step={1}
              aria-label="Body size"
              value={BODY_SIZES.indexOf(size)}
              onChange={(e) => setSize(BODY_SIZES[Number(e.target.value)])}
              className="w-full accent-primary"
            />
            <div className="flex justify-between mt-1">
              {BODY_SIZES.map((s) => <span key={s} className="font-body text-[10px] text-muted-foreground">{s}</span>)}
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl bg-muted/50 p-3">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
            <span className="font-body text-xs text-muted-foreground">
              I allow Tryvior to use this photo to generate my avatar.
            </span>
          </label>
          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl bg-muted/50 p-3">
            <input type="checkbox" checked={autoDelete} onChange={(e) => setAutoDelete(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
            <span className="font-body text-xs text-muted-foreground">
              Delete my uploaded photo after the avatar is created (recommended).
            </span>
          </label>

          <Button
            onClick={generate}
            disabled={!consent}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Generate my avatar
          </Button>
        </div>
      )}

      {step === "generating" && <GenerationProgress stage={stage} />}

      {step === "done" && (
        <div className="space-y-3">
          <AvatarPortrait
            imageUrl={resultImage}
            gender={gender ?? undefined}
            bodySize={size}
            heightCm={heightCm}
            className={compact ? "" : "max-w-md mx-auto"}
          />
          <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="font-body text-xs text-muted-foreground">
              {user
                ? "Saved to your account — you never have to create it again. You can update height, size or photo any time."
                : "Sign in to save this avatar permanently."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setStep("photo")} className="h-10 rounded-xl font-body text-sm">
              <Camera className="w-4 h-4 mr-2" /> New photo
            </Button>
            <Button onClick={() => onSaved?.()} disabled={saving} className="h-10 rounded-xl bg-primary text-primary-foreground font-body text-sm">
              <Check className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Use this avatar"}
            </Button>
          </div>
          {face && (
            <p className="font-body text-[11px] text-muted-foreground">
              Skin tone matched from your photo ({face.skinTone}).
            </p>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
      <input ref={camRef} type="file" accept="image/*" capture="user" className="hidden" onChange={pickFile} />
    </div>
  );
}
