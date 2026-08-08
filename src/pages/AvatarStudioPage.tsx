import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAvatar } from "@/hooks/useAvatar";
import AvatarStage from "@/components/avatar/AvatarStage";
import PhotoUploadPanel from "@/components/avatar/PhotoUploadPanel";
import ValidationReport from "@/components/avatar/ValidationReport";
import GenerationProgress from "@/components/avatar/GenerationProgress";
import { validatePhoto, type PhotoValidationResult } from "@/lib/photoValidation";
import { getAvatarGenerationService, type GeneratedAvatar, type StageId } from "@/lib/avatarGeneration";
import { BODY_SIZES, type BodySize, type FaceAnalysis, type Gender } from "@/lib/avatar";
import {
  ArrowRight, Boxes, Camera, Check, Fingerprint, Lock, RefreshCcw, ScanFace,
  ShieldCheck, Sparkles, Trash2, Upload, User,
} from "lucide-react";

type Stage = "landing" | "upload" | "validate" | "processing" | "result";

const GARMENTS = [
  { id: "saree", label: "Saree", color: "#a3123f" },
  { id: "kurti", label: "Kurti", color: "#1f6f5c" },
  { id: "lehenga", label: "Lehenga", color: "#b4531c" },
  { id: "dress", label: "Dress", color: "#2a2a35" },
  { id: "ethnic", label: "Ethnic set", color: "#4a3b8c" },
  { id: "western", label: "Western", color: "#3f6ea3" },
];

export default function AvatarStudioPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { avatar, saveAvatar, deleteAvatar } = useAvatar();

  const [stage, setStage] = useState<Stage>("landing");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [autoDelete, setAutoDelete] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<PhotoValidationResult | null>(null);
  const [genStage, setGenStage] = useState<StageId>("analyze");
  const [result, setResult] = useState<GeneratedAvatar | null>(null);
  const [size, setSize] = useState<BodySize>("M");
  const [gender, setGender] = useState<Gender>("female");
  const [garment, setGarment] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const savedFace = avatar?.face_data as FaceAnalysis | undefined;
  const skinTone = result?.face.skinTone || savedFace?.skinTone || avatar?.skin_tone || "#d8b094";

  const fail = (title: string, description?: string) =>
    toast({ title, description, variant: "destructive" });

  const runValidation = useCallback(async () => {
    if (!photo) return;
    setValidating(true);
    try {
      const res = await validatePhoto(photo);
      setValidation(res);
      setStage("validate");
    } catch (err) {
      fail("We couldn't read that photo", err instanceof Error ? err.message : "Try another image.");
    } finally {
      setValidating(false);
    }
  }, [photo]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = useCallback(async () => {
    if (!photo || !validation?.ok) return;
    setStage("processing");
    setGenStage("analyze");
    try {
      const generated = await getAvatarGenerationService().generate({
        photoDataUrl: photo,
        gender,
        bodySize: size,
        consent,
        onStage: setGenStage,
      });
      setResult(generated);
      setStage("result");
      if (autoDelete) { setPhoto(null); setPhotoFile(null); }
      if (user) {
        try {
          await saveAvatar({
            gender: generated.gender,
            bodySize: generated.bodySize,
            face: generated.face,
            photoFile: autoDelete ? null : photoFile,
            assetUrl: generated.assetUrl,
            consent,
          });
        } catch (err) {
          fail("Avatar generated but not saved", err instanceof Error ? err.message : undefined);
        }
      }
    } catch (err) {
      fail("Avatar generation failed", err instanceof Error ? err.message : "Please try again.");
      setStage("validate");
    }
  }, [photo, validation, gender, size, consent, autoDelete, photoFile, user, saveAvatar]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = async (nextGender: Gender, nextSize: BodySize) => {
    if (!user || !result) return;
    setSaving(true);
    try {
      await saveAvatar({
        gender: nextGender, bodySize: nextSize, face: result.face,
        photoFile: null, assetUrl: result.assetUrl, consent,
      });
      toast({ title: "Avatar updated", description: "It loads automatically on your next visit." });
    } catch (err) {
      fail("Couldn't save changes", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const restart = () => {
    setStage("upload"); setPhoto(null); setPhotoFile(null);
    setValidation(null); setResult(null); setGarment(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* ---------- Landing ---------- */}
          {stage === "landing" && (
            <div className="space-y-14">
              <header className="text-center max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-body text-xs text-muted-foreground mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Tryvior Avatar Studio
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
                  Your own 3D avatar — not a model that looks like you
                </h1>
                <p className="font-body text-base text-muted-foreground mb-8">
                  Upload one clear photo and Tryvior builds an interactive 3D avatar that keeps your face
                  shape, skin tone, hair and proportions intact. No beautifying, no redesigning.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setStage(avatar ? "result" : "upload")}
                    className="h-12 px-7 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
                  >
                    {avatar ? "Open my avatar" : "Create my avatar"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/products")} className="h-12 px-7 rounded-xl font-body">
                    Browse the collection
                  </Button>
                </div>
              </header>

              <section className="grid md:grid-cols-3 gap-5">
                {[
                  { icon: Upload, title: "1 · Upload one photo", copy: "Front-facing, well-lit, head and torso in frame. Drag and drop or use your camera." },
                  { icon: ScanFace, title: "2 · We check it", copy: "Sharpness, lighting, occlusion and single-subject checks run before anything is generated." },
                  { icon: Boxes, title: "3 · Your 3D avatar", copy: "Rotate, zoom and inspect a try-on-ready body rig built from your own proportions." },
                ].map((s) => (
                  <div key={s.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display text-base font-semibold text-foreground mb-1.5">{s.title}</h2>
                    <p className="font-body text-sm text-muted-foreground">{s.copy}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-3xl border border-border bg-gradient-to-br from-muted/50 to-card p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Fingerprint className="w-6 h-6 text-primary mb-4" />
                    <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
                      Identity preservation comes first
                    </h2>
                    <p className="font-body text-sm text-muted-foreground mb-4">
                      Facial structure, skin tone, hair, eyes, nose and mouth characteristics and body
                      proportions are carried over from your photo. Your avatar is you — dressed differently.
                    </p>
                    <ul className="space-y-2">
                      {["Never beautified or reshaped", "Neutral standing pose for accurate draping", "Ready for sarees, kurtis, lehengas, dresses and western wear"].map((t) => (
                        <li key={t} className="font-body text-sm text-foreground flex gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <AvatarStage gender="female" bodySize="M" skinTone={skinTone} showControls={false} className="" />
                </div>
              </section>
            </div>
          )}

          {/* ---------- Header for working stages ---------- */}
          {stage !== "landing" && (
            <div className="mb-8">
              <button onClick={() => setStage("landing")} className="font-body text-xs text-muted-foreground hover:text-foreground mb-3">
                ← Avatar Studio
              </button>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                {stage === "upload" && "Upload your photo"}
                {stage === "validate" && "Photo validation"}
                {stage === "processing" && "Generating your avatar"}
                {stage === "result" && "Your 3D avatar"}
              </h1>
            </div>
          )}

          {stage === "upload" && (
            <PhotoUploadPanel
              photo={photo}
              onPhoto={(dataUrl, file) => { setPhoto(dataUrl); setPhotoFile(file); setValidation(null); }}
              onClear={() => { setPhoto(null); setPhotoFile(null); setValidation(null); }}
              onError={(m) => fail("Photo not accepted", m)}
              consent={consent}
              onConsent={setConsent}
              autoDelete={autoDelete}
              onAutoDelete={setAutoDelete}
              onContinue={runValidation}
              busy={validating}
            />
          )}

          {stage === "validate" && photo && validation && (
            <ValidationReport photo={photo} result={validation} onRetry={restart} onProceed={generate} />
          )}

          {stage === "processing" && <GenerationProgress stage={genStage} />}

          {/* ---------- Result ---------- */}
          {stage === "result" && (result || avatar) && (
            <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
              <div>
                <AvatarStage
                  gender={result?.gender ?? (avatar?.gender as Gender) ?? gender}
                  bodySize={result?.bodySize ?? size}
                  skinTone={skinTone}
                  garmentColor={GARMENTS.find((g) => g.id === garment)?.color}
                />
                {(result?.isDemo ?? true) && (
                  <p className="font-body text-xs text-muted-foreground mt-3">
                    Preview render: identity signals (skin tone, proportions) come from your photo. The
                    photorealistic mesh provider plugs into the same service interface — no results are faked.
                  </p>
                )}
              </div>

              <Tabs defaultValue="avatar">
                <TabsList className="rounded-xl">
                  <TabsTrigger value="avatar" className="font-body text-xs">Avatar</TabsTrigger>
                  <TabsTrigger value="fit" className="font-body text-xs">Customise</TabsTrigger>
                  <TabsTrigger value="privacy" className="font-body text-xs">Privacy</TabsTrigger>
                  <TabsTrigger value="tryon" className="font-body text-xs">Try-on</TabsTrigger>
                </TabsList>

                <TabsContent value="avatar" className="mt-5 space-y-4">
                  <div className="rounded-3xl border border-border bg-card p-5">
                    <h2 className="font-display text-base font-semibold text-foreground mb-4">Identity profile</h2>
                    <dl className="space-y-3">
                      {[
                        ["Body template", (result?.gender ?? avatar?.gender) === "male" ? "Male" : "Female"],
                        ["Body size", String(result?.bodySize ?? size)],
                        ["Skin tone", skinTone],
                        ["Pose", "Neutral standing"],
                        ["Provider", result?.provider ?? "tryvior-parametric-preview"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-4">
                          <dt className="font-body text-sm text-muted-foreground">{k}</dt>
                          <dd className="font-body text-sm font-medium text-foreground flex items-center gap-2 truncate">
                            {k === "Skin tone" && <span className="w-4 h-4 rounded-full border border-border" style={{ background: skinTone }} />}
                            {v}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button variant="outline" onClick={generate} disabled={!photo || !validation?.ok} className="h-11 rounded-xl font-body text-sm">
                      <RefreshCcw className="w-4 h-4 mr-2" /> Regenerate
                    </Button>
                    <Button variant="outline" onClick={restart} className="h-11 rounded-xl font-body text-sm">
                      <Camera className="w-4 h-4 mr-2" /> Upload new photo
                    </Button>
                  </div>

                  {!user && (
                    <div className="rounded-2xl border border-border bg-muted/40 p-4">
                      <p className="font-body text-sm text-muted-foreground mb-3">
                        Sign in to save this avatar so you never have to create it again.
                      </p>
                      <Button onClick={() => navigate("/auth")} className="h-10 rounded-xl bg-primary text-primary-foreground font-body text-sm">
                        Sign in to save
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="fit" className="mt-5 space-y-5">
                  <div className="rounded-3xl border border-border bg-card p-5">
                    <h2 className="font-display text-base font-semibold text-foreground mb-4">Body template</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {(["female", "male"] as Gender[]).map((g) => {
                        const active = (result?.gender ?? gender) === g;
                        return (
                          <button
                            key={g}
                            onClick={() => { setGender(g); setResult((r) => (r ? { ...r, gender: g } : r)); }}
                            aria-pressed={active}
                            className={`rounded-2xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                          >
                            <User className="w-5 h-5 text-primary mb-2" />
                            <p className="font-body text-sm font-semibold text-foreground capitalize">{g}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-display text-base font-semibold text-foreground">Body size</h2>
                      <span className="font-display text-lg font-semibold text-primary">{result?.bodySize ?? size}</span>
                    </div>
                    <input
                      type="range" min={0} max={BODY_SIZES.length - 1} step={1}
                      aria-label="Body size"
                      value={BODY_SIZES.indexOf(result?.bodySize ?? size)}
                      onChange={(e) => {
                        const next = BODY_SIZES[Number(e.target.value)];
                        setSize(next);
                        setResult((r) => (r ? { ...r, bodySize: next } : r));
                      }}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between mt-1">
                      {BODY_SIZES.map((s) => <span key={s} className="font-body text-[10px] text-muted-foreground">{s}</span>)}
                    </div>
                  </div>

                  {user && result && (
                    <Button
                      onClick={() => persist(result.gender, result.bodySize)}
                      disabled={saving}
                      className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
                    >
                      <Check className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Save changes"}
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="privacy" className="mt-5 space-y-4">
                  <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <h2 className="font-display text-base font-semibold text-foreground">Privacy controls</h2>
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      Your photo is used to generate your avatar. You control whether your uploaded image is
                      retained or deleted. Nothing is shared publicly by default.
                    </p>
                    <label className="flex items-start gap-2.5 cursor-pointer rounded-xl bg-muted/50 p-3">
                      <input type="checkbox" checked={autoDelete} onChange={(e) => setAutoDelete(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
                      <span className="font-body text-xs text-muted-foreground">
                        Auto-delete uploaded photos after processing (recommended)
                      </span>
                    </label>

                    <Button
                      variant="outline"
                      disabled={!photo}
                      onClick={() => { setPhoto(null); setPhotoFile(null); toast({ title: "Photo deleted", description: "Your uploaded image was removed from this session." }); }}
                      className="w-full h-11 rounded-xl font-body text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete uploaded photo
                    </Button>

                    <Button
                      variant="outline"
                      disabled={!avatar}
                      onClick={async () => {
                        try {
                          await deleteAvatar();
                          setResult(null);
                          restart();
                          toast({ title: "Avatar deleted", description: "Your avatar and stored photo were permanently removed." });
                        } catch (err) {
                          fail("Couldn't delete avatar", err instanceof Error ? err.message : undefined);
                        }
                      }}
                      className="w-full h-11 rounded-xl border-destructive/30 text-destructive font-body text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete generated avatar
                    </Button>

                    <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
                      <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="font-body text-xs text-muted-foreground">
                        Stored photos live in a private bucket only you can read. Deleting is permanent —
                        nothing regenerates until you create a new avatar.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tryon" className="mt-5 space-y-4">
                  <div className="rounded-3xl border border-border bg-card p-5">
                    <h2 className="font-display text-base font-semibold text-foreground mb-1">Preview a category</h2>
                    <p className="font-body text-sm text-muted-foreground mb-4">
                      Your avatar rig supports garment placement per category. Tap one to see draping on the 3D body.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {GARMENTS.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setGarment(garment === g.id ? null : g.id)}
                          aria-pressed={garment === g.id}
                          className={`rounded-xl border p-3 transition-all ${garment === g.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                        >
                          <span className="block w-5 h-5 rounded-full mb-2" style={{ background: g.color }} />
                          <span className="font-body text-xs text-foreground">{g.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate("/products")}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
                  >
                    Continue to virtual try-on <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {stage === "result" && !result && !avatar && (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <p className="font-body text-sm text-muted-foreground mb-4">You don't have an avatar yet.</p>
              <Button onClick={restart} className="h-11 rounded-xl bg-primary text-primary-foreground font-body">
                Create my avatar
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
