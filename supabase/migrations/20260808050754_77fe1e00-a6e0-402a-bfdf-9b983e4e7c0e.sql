CREATE TABLE public.user_avatars (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  gender text NOT NULL CHECK (gender IN ('male','female')),
  body_size text NOT NULL DEFAULT 'M' CHECK (body_size IN ('XS','S','M','L','XL','2XL','3XL','4XL','5XL')),
  skin_tone text,
  face_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  face_photo_path text,
  avatar_asset_url text,
  consent_given boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_avatars TO authenticated;
GRANT ALL ON public.user_avatars TO service_role;

ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own avatar" ON public.user_avatars
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own avatar" ON public.user_avatars
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own avatar" ON public.user_avatars
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own avatar" ON public.user_avatars
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_avatars_updated
  BEFORE UPDATE ON public.user_avatars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();