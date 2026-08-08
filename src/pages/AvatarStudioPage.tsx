import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAvatar } from "@/hooks/useAvatar";
import AvatarPortrait from "@/components/avatar/AvatarPortrait";
import AvatarBuilder from "@/components/avatar/AvatarBuilder";
import { ArrowRight, Boxes, Camera, Check, Fingerprint, Sparkles, Trash2, Upload, UserRound } from "lucide-react";

export default function AvatarStudioPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { avatar, avatarImageUrl, loading, deleteAvatar, reload } = useAvatar();
  const [building, setBuilding] = useState(false);

  const showAvatar = !building && !!avatar && !loading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <header className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-body text-xs text-muted-foreground mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Tryvior Avatar Studio
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
              A realistic avatar of you — created once, used for every try-on
            </h1>
            <p className="font-body text-base text-muted-foreground">
              Upload one clear photo, set your height and size, and Tryvior renders a photorealistic
              full-body avatar of you standing front-on, ready for garments. Your face, hair and skin
              tone are preserved — never beautified or replaced.
            </p>
          </header>

          {showAvatar ? (
            <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-start">
              <AvatarPortrait
                imageUrl={avatarImageUrl}
                gender={avatar.gender}
                bodySize={avatar.body_size}
                heightCm={avatar.height_cm}
              />
              <div className="space-y-4">
                <div className="rounded-3xl border border-border bg-card p-5">
                  <h2 className="font-display text-base font-semibold text-foreground mb-4">Your avatar</h2>
                  <dl className="space-y-3">
                    {[
                      ["Body template", avatar.gender === "male" ? "Male" : "Female"],
                      ["Body size", String(avatar.body_size)],
                      ["Height", avatar.height_cm ? `${avatar.height_cm} cm` : "Not set"],
                      ["Skin tone", avatar.skin_tone || "—"],
                      ["Pose", "Front view · neutral standing"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-4">
                        <dt className="font-body text-sm text-muted-foreground">{k}</dt>
                        <dd className="font-body text-sm font-medium text-foreground flex items-center gap-2 truncate">
                          {k === "Skin tone" && avatar.skin_tone && (
                            <span className="w-4 h-4 rounded-full border border-border" style={{ background: avatar.skin_tone }} />
                          )}
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setBuilding(true)} className="h-11 rounded-xl font-body text-sm">
                    <Camera className="w-4 h-4 mr-2" /> Rebuild avatar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await deleteAvatar();
                        toast({ title: "Avatar deleted", description: "Your avatar and stored photo were permanently removed." });
                      } catch (err) {
                        toast({ title: "Couldn't delete avatar", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
                      }
                    }}
                    className="h-11 rounded-xl border-destructive/30 text-destructive font-body text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete avatar
                  </Button>
                </div>

                <Button
                  onClick={() => navigate("/products")}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
                >
                  Continue to virtual try-on <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-start">
              <div className="rounded-3xl border border-border bg-card p-6">
                <AvatarBuilder
                  onSaved={() => { reload(); setBuilding(false); }}
                  onCancel={avatar ? () => setBuilding(false) : undefined}
                  compact
                />
                {!user && (
                  <p className="font-body text-xs text-muted-foreground mt-4">
                    Sign in to save your avatar so it loads automatically on every try-on.
                  </p>
                )}
              </div>

              <div className="space-y-5">
                {[
                  { icon: Upload, title: "1 · Upload one photo", copy: "Front-facing, well-lit, face clearly visible. Gallery or camera." },
                  { icon: UserRound, title: "2 · Set height & size", copy: "Your height in cm and body size (XS–5XL) shape the avatar's real proportions." },
                  { icon: Boxes, title: "3 · Ready for try-on", copy: "A front-view avatar standing on a studio platform, reused for every garment." },
                ].map((s) => (
                  <div key={s.title} className="rounded-3xl border border-border bg-card p-6">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display text-base font-semibold text-foreground mb-1.5">{s.title}</h2>
                    <p className="font-body text-sm text-muted-foreground">{s.copy}</p>
                  </div>
                ))}
                <div className="rounded-3xl border border-border bg-gradient-to-br from-muted/50 to-card p-6">
                  <Fingerprint className="w-6 h-6 text-primary mb-3" />
                  <h2 className="font-display text-lg font-semibold text-foreground mb-2">Identity preservation first</h2>
                  <ul className="space-y-2">
                    {["Your real face, hair and skin tone", "Never beautified, slimmed or reshaped", "Neutral front-facing pose for accurate draping"].map((t) => (
                      <li key={t} className="font-body text-sm text-foreground flex gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
