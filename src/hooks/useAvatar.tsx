import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AvatarRecord, BodySize, FaceAnalysis, Gender } from "@/lib/avatar";

export function useAvatar() {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState<AvatarRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setAvatar(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("user_avatars")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setAvatar((data as unknown as AvatarRecord) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  /** Create or overwrite the single saved avatar for this user. */
  const saveAvatar = useCallback(
    async (input: {
      gender: Gender;
      bodySize: BodySize;
      face: FaceAnalysis;
      photoFile?: File | null;
      assetUrl?: string | null;
      consent: boolean;
    }) => {
      if (!user) throw new Error("Please sign in to save your avatar.");

      let facePhotoPath = avatar?.face_photo_path ?? null;
      if (input.photoFile) {
        const ext = input.photoFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/face.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatar-photos")
          .upload(path, input.photoFile, { upsert: true, contentType: input.photoFile.type });
        if (upErr) throw upErr;
        facePhotoPath = path;
      }

      const row = {
        user_id: user.id,
        gender: input.gender,
        body_size: input.bodySize,
        skin_tone: input.face.skinTone,
        face_data: input.face as unknown as Record<string, unknown>,
        face_photo_path: facePhotoPath,
        avatar_asset_url: input.assetUrl ?? null,
        consent_given: input.consent,
      };

      const { data, error } = await supabase
        .from("user_avatars")
        .upsert(row as never, { onConflict: "user_id" })
        .select("*")
        .single();
      if (error) throw error;
      setAvatar(data as unknown as AvatarRecord);
      return data as unknown as AvatarRecord;
    },
    [user, avatar],
  );

  /** Hard-delete the avatar row and its stored face photo. */
  const deleteAvatar = useCallback(async () => {
    if (!user) return;
    if (avatar?.face_photo_path) {
      await supabase.storage.from("avatar-photos").remove([avatar.face_photo_path]);
    }
    const { error } = await supabase.from("user_avatars").delete().eq("user_id", user.id);
    if (error) throw error;
    setAvatar(null);
  }, [user, avatar]);

  return { avatar, loading, reload: load, saveAvatar, deleteAvatar };
}