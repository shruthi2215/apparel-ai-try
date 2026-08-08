import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAvatar } from "@/hooks/useAvatar";
import Avatar3DViewer from "@/components/avatar/Avatar3DViewer";
import {
  BODY_SIZES, analyzeFacePhoto, generateAvatarAsset,
  type BodySize, type FaceAnalysis, type Gender,
} from "@/lib/avatar";
import { Camera, Upload, Sparkles, ShieldCheck, ArrowLeft, Check, User } from "lucide-react";

type Step = "gender" | "photo" | "generating" | "size";

interface Props {
  initialGender?: Gender;
  initialSize?: BodySize;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function AvatarCreationFlow({ initialGender, initialSize, onSaved, onCancel }: Props) {
  const { saveAvatar } = useAvatar();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("gender");
  const [gender, setGender] = useState<Gender | null>(initialGender ?? null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [face, setFace] = useState<FaceAnalysis | null>(null);
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [size, setSize] = useState<BodySize>(initialSize ?? "M");
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      toast({ title: "Photo too large", description: "Please use an image under 12MB.", variant: "destructive" });
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const runGeneration = async () => {
    if (!photo || !gender) return;
    setStep("generating");
    try {
      const analysis = await analyzeFacePhoto(photo);
      setFace(analysis);
      const { assetUrl: url } = await generateAvatarAsset({
        gender, bodySize: size, face: analysis, photoDataUrl: photo,
      });
      setAssetUrl(url);
      setStep("size");
    } catch (err) {
      toast({
        title: "Couldn't analyze that photo",
        description: err instanceof Error ? err.message : "Try a clear, front-facing photo.",
        variant: "destructive",
      });
      setStep("photo");
    }
  };

  const save = async () => {
    if (!gender || !face) return;
    setSaving(true);
    try {
      await saveAvatar({ gender, bodySize: size, face, photoFile, assetUrl, consent });
      toast({ title: "Avatar saved", description: "It'll load automatically next time you visit." });
      onSaved?.();
    } catch (err) {
      toast({
        title: "Couldn't save avatar",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Step: gender */}
      {step === "gender" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Choose your body template</h3>
            <p className="font-body text-sm text-muted-foreground">
              Male and female avatars use different proportions and clothing draping.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["female", "male"] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => { setGender(g); setStep("photo"); }}
                className={`rounded-2xl border p-5 text-left transition-all hover:shadow-md ${
                  gender === g ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <User className="w-6 h-6 text-primary mb-2" />
                <p className="font-body text-sm font-semibold text-foreground capitalize">{g}</p>
                <p className="font-body text-xs text-muted-foreground">
                  {g === "female" ? "Softer shoulders, wider hips" : "Broader shoulders, straight hips"}
                </p>
              </button>
            ))}
          </div>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} className="font-body text-sm text-muted-foreground">
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Step: photo */}
      {step === "photo" && (
        <div className="space-y-4">
          <button
            onClick={() => setStep("gender")}
            className="font-body text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Add a face photo</h3>
            <p className="font-body text-sm text-muted-foreground">
              Front-facing, good lighting, no sunglasses. We read facial features and skin tone from it.
            </p>
          </div>

          {photo ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-border">
              <img src={photo} alt="Your face photo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-2xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all"
            >
              <Upload className="w-7 h-7 text-primary mb-2" />
              <p className="font-body text-sm font-medium text-foreground">Upload a photo</p>
              <p className="font-body text-xs text-muted-foreground">JPG / PNG · Max 12MB</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="h-10 rounded-xl font-body text-sm">
              <Upload className="w-4 h-4 mr-2" /> Gallery
            </Button>
            <Button onClick={() => camRef.current?.click()} variant="outline" className="h-10 rounded-xl font-body text-sm">
              <Camera className="w-4 h-4 mr-2" /> Live selfie
            </Button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
          <input ref={camRef} type="file" accept="image/*" capture="user" className="hidden" onChange={pickFile} />

          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl bg-muted/50 p-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-primary"
            />
            <span className="font-body text-xs text-muted-foreground">
              I consent to my photo being used to generate a 3D avatar. You can delete your avatar and photo
              at any time from My Account.
            </span>
          </label>

          <Button
            onClick={runGeneration}
            disabled={!photo || !consent}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Generate my 3D avatar
          </Button>
        </div>
      )}

      {/* Step: generating */}
      {step === "generating" && (
        <div className="py-12 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-full border-[3px] border-primary/15 border-t-primary animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="font-display text-base font-medium text-foreground">Building your avatar…</p>
          <p className="font-body text-sm text-muted-foreground">Reading facial features and matching skin tone.</p>
        </div>
      )}

      {/* Step: size */}
      {step === "size" && gender && face && (
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Adjust your body size</h3>
            <p className="font-body text-sm text-muted-foreground">Drag the slider — rotate and zoom the avatar to check the fit.</p>
          </div>

          <Avatar3DViewer gender={gender} bodySize={size} skinTone={face.skinTone} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs uppercase tracking-wide text-muted-foreground">Body size</span>
              <span className="font-display text-base font-semibold text-primary">{size}</span>
            </div>
            <input
              type="range"
              min={0}
              max={BODY_SIZES.length - 1}
              step={1}
              value={BODY_SIZES.indexOf(size)}
              onChange={(e) => setSize(BODY_SIZES[Number(e.target.value)])}
              className="w-full accent-primary"
            />
            <div className="flex justify-between mt-1">
              {BODY_SIZES.map((s) => (
                <span key={s} className="font-body text-[10px] text-muted-foreground">{s}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="font-body text-xs text-muted-foreground">
              Saved once — your avatar loads automatically on every future visit.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("photo")} className="h-11 rounded-xl font-body text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Photo
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
            >
              <Check className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Save my avatar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}