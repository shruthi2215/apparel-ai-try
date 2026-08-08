import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AvatarRecord, BodySize, FaceAnalysis, Gender } from "@/lib/avatar";

const BUCKET = "avatar-photos";

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(meta)?.[1] || "image/png";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function useAvatar() {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState<AvatarRecord | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveImage = useCallback(async (row: AvatarRecord | null) => {
    const ref = row?.avatar_asset_url;
    if (!ref) { setAvatarImageUrl(null); return; }
    if (ref.startsWith("http") || ref.startsWith("data:")) { setAvatarImageUrl(ref); return; }
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(ref, 60 * 60 * 8);
    setAvatarImageUrl(data?.signedUrl ?? null);
  }, []);

  const load = useCallback(async () => {
    if (!user) { setAvatar(null); setAvatarImageUrl(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("user_avatars")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    const row = (data as unknown as AvatarRecord) ?? null;
    setAvatar(row);
    await resolveImage(row);
    setLoading(false);
  }, [user, resolveImage]);

  useEffect(() => { load(); }, [load]);

  /** Create or overwrite the single saved avatar for this user. */
  const saveAvatar = useCallback(
    async (input: {
      gender: Gender;
      bodySize: BodySize;
      heightCm?: number | null;
      face: FaceAnalysis;
      photoFile?: File | null;
      /** Generated avatar image as a data URL — uploaded to private storage. */
      avatarImageDataUrl?: string | null;
      assetUrl?: string | null;
      consent: boolean;
    }) => {
      if (!user) throw new Error("Please sign in to save your avatar.");

      let facePhotoPath = avatar?.face_photo_path ?? null;
      if (input.photoFile) {
        const ext = input.photoFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/face.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, input.photoFile, { upsert: true, contentType: input.photoFile.type });
        if (upErr) throw upErr;
        facePhotoPath = path;
      }

      let assetRef = input.assetUrl ?? avatar?.avatar_asset_url ?? null;
      if (input.avatarImageDataUrl) {
        const blob = dataUrlToBlob(input.avatarImageDataUrl);
        const path = `${user.id}/avatar.png`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, { upsert: true, contentType: blob.type });
        if (upErr) throw upErr;
        assetRef = path;
      }

      const row = {
        user_id: user.id,
        gender: input.gender,
        body_size: input.bodySize,
        height_cm: input.heightCm ?? avatar?.height_cm ?? null,
        skin_tone: input.face.skinTone,
        face_data: input.face as unknown as Record<string, unknown>,
        face_photo_path: facePhotoPath,
        avatar_asset_url: assetRef,
        consent_given: input.consent,
      };

      const { data, error } = await supabase
        .from("user_avatars")
        .upsert(row as never, { onConflict: "user_id" })
        .select("*")
        .single();
      if (error) throw error;
      const saved = data as unknown as AvatarRecord;
      setAvatar(saved);
      if (input.avatarImageDataUrl) setAvatarImageUrl(input.avatarImageDataUrl);
      else await resolveImage(saved);
      return saved;
    },
    [user, avatar, resolveImage],
  );

  /** Hard-delete the avatar row and its stored images. */
  const deleteAvatar = useCallback(async () => {
    if (!user) return;
    const paths = [avatar?.face_photo_path, avatar?.avatar_asset_url]
      .filter((p): p is string => !!p && !p.startsWith("http") && !p.startsWith("data:"));
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    const { error } = await supabase.from("user_avatars").delete().eq("user_id", user.id);
    if (error) throw error;
    setAvatar(null);
    setAvatarImageUrl(null);
  }, [user, avatar]);

  return { avatar, avatarImageUrl, loading, reload: load, saveAvatar, deleteAvatar };
}
