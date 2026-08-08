import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAvatar } from "@/hooks/useAvatar";
import AvatarPortrait from "@/components/avatar/AvatarPortrait";
import AvatarBuilder from "@/components/avatar/AvatarBuilder";
import { useToast } from "@/hooks/use-toast";
import type { BodySize, FaceAnalysis, Gender } from "@/lib/avatar";
import { Pencil, Trash2, Sparkles, AlertTriangle, ShieldCheck, Settings } from "lucide-react";

export default function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { avatar, avatarImageUrl, loading, deleteAvatar, reload } = useAvatar();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const skinTone = (avatar?.face_data as FaceAnalysis)?.skinTone || avatar?.skin_tone || "#d8b094";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAvatar();
      setConfirmDelete(false);
      toast({ title: "Avatar deleted", description: "Your avatar and photo were permanently removed." });
    } catch (err) {
      toast({
        title: "Couldn't delete avatar",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-1">My Account</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">
            Your saved Tryvior avatar is reused for every try-on.
          </p>

          {!user ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="font-body text-sm text-muted-foreground mb-4">Sign in to create and save your avatar.</p>
              <Button onClick={() => navigate("/auth")} className="rounded-xl bg-primary text-primary-foreground font-body">
                Sign in
              </Button>
            </div>
          ) : loading ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center font-body text-sm text-muted-foreground">
              Loading your avatar…
            </div>
          ) : editing || !avatar ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <AvatarBuilder
                initialGender={avatar?.gender as Gender | undefined}
                onSaved={() => { reload(); setEditing(false); }}
                onCancel={avatar ? () => setEditing(false) : undefined}
                compact
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <AvatarPortrait
                imageUrl={avatarImageUrl}
                gender={avatar.gender as Gender}
                bodySize={avatar.body_size as BodySize}
                heightCm={avatar.height_cm}
              />

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="font-display text-lg font-semibold text-foreground">Your avatar</h2>
                </div>

                <dl className="space-y-3 mb-6">
                  {[
                    ["Body template", avatar.gender === "female" ? "Female" : "Male"],
                    ["Body size", avatar.body_size],
                    ["Height", avatar.height_cm ? `${avatar.height_cm} cm` : "Not set"],
                    ["Skin tone", skinTone],
                    ["Last updated", new Date(avatar.updated_at).toLocaleDateString()],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex items-center justify-between">
                      <dt className="font-body text-sm text-muted-foreground">{k}</dt>
                      <dd className="font-body text-sm font-medium text-foreground flex items-center gap-2">
                        {k === "Skin tone" && (
                          <span className="w-4 h-4 rounded-full border border-border" style={{ background: skinTone }} />
                        )}
                        {v as string}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 mb-5">
                  <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="font-body text-xs text-muted-foreground">
                    Deleting removes your avatar and face photo permanently — nothing regenerates until you create a new one.
                  </p>
                </div>

                <div className="mt-auto space-y-2">
                  <Button
                    onClick={() => setEditing(true)}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-body font-semibold"
                  >
                    <Pencil className="w-4 h-4 mr-2" /> Edit avatar
                  </Button>

                  {!confirmDelete ? (
                    <Button
                      variant="outline"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full h-11 rounded-xl border-destructive/30 text-destructive font-body"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete avatar
                    </Button>
                  ) : (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-3">
                      <p className="font-body text-xs text-foreground flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                        Permanently delete your avatar and stored photo? This can't be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex-1 h-9 rounded-lg bg-destructive text-destructive-foreground font-body text-sm"
                        >
                          {deleting ? "Deleting…" : "Yes, delete"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 h-9 rounded-lg font-body text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => navigate("/profile")}
                    className="w-full h-10 rounded-xl font-body text-sm text-muted-foreground"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Profile & security settings
                  </Button>
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
