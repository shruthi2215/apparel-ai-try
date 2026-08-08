CREATE POLICY "Users manage own avatar photos - select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatar-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users manage own avatar photos - insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatar-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users manage own avatar photos - update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatar-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users manage own avatar photos - delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatar-photos' AND (storage.foldername(name))[1] = auth.uid()::text);