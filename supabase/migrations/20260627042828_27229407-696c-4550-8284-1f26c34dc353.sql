CREATE OR REPLACE FUNCTION public.claim_merchant_invites()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  _claimed integer := 0;
BEGIN
  IF _uid IS NULL OR _email = '' THEN
    RETURN 0;
  END IF;

  UPDATE public.merchant_members
     SET user_id = _uid,
         status = 'active',
         joined_at = now(),
         updated_at = now()
   WHERE lower(email) = _email
     AND (user_id IS NULL OR user_id = _uid)
     AND status <> 'active';
  GET DIAGNOSTICS _claimed = ROW_COUNT;

  -- Grant the staff role if the user joined any merchant as a member
  IF EXISTS (SELECT 1 FROM public.merchant_members WHERE user_id = _uid AND status = 'active') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_uid, 'staff')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN _claimed;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_merchant_invites() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_merchant_invites() TO authenticated;