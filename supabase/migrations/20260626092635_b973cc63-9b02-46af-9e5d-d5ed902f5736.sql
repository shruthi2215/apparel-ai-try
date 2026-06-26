-- Recreate the ownership helper in the private (non-API) schema
CREATE OR REPLACE FUNCTION private.owns_merchant(_merchant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchants
    WHERE id = _merchant_id AND owner_user_id = auth.uid()
  ) OR private.has_role(auth.uid(), 'super_admin')
$$;

REVOKE ALL ON FUNCTION private.owns_merchant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.owns_merchant(uuid) TO authenticated;

-- Repoint policies to the private helper
DROP POLICY "Owners can view own api keys" ON public.api_keys;
DROP POLICY "Owners can create api keys" ON public.api_keys;
DROP POLICY "Owners can update own api keys" ON public.api_keys;
DROP POLICY "Owners can delete own api keys" ON public.api_keys;
DROP POLICY "Owners can view own request logs" ON public.tryon_requests;

CREATE POLICY "Owners can view own api keys"
  ON public.api_keys FOR SELECT TO authenticated
  USING (private.owns_merchant(merchant_id));
CREATE POLICY "Owners can create api keys"
  ON public.api_keys FOR INSERT TO authenticated
  WITH CHECK (private.owns_merchant(merchant_id));
CREATE POLICY "Owners can update own api keys"
  ON public.api_keys FOR UPDATE TO authenticated
  USING (private.owns_merchant(merchant_id))
  WITH CHECK (private.owns_merchant(merchant_id));
CREATE POLICY "Owners can delete own api keys"
  ON public.api_keys FOR DELETE TO authenticated
  USING (private.owns_merchant(merchant_id));
CREATE POLICY "Owners can view own request logs"
  ON public.tryon_requests FOR SELECT TO authenticated
  USING (private.owns_merchant(merchant_id));

-- Drop the public-schema helper that triggered the linter
DROP FUNCTION IF EXISTS public.owns_merchant(uuid);