-- 1. Private schema for security-definer helpers (not exposed to the API)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin'::public.app_role, 'super_admin'::public.app_role)
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated;

-- 2. Recreate user_roles policies to use private.has_role, then drop public.has_role
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;

CREATE POLICY "Super admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));
CREATE POLICY "Super admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));
CREATE POLICY "Super admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));
CREATE POLICY "Super admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 3. Products admin policies -> role-based, scoped to authenticated
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
CREATE POLICY "Only admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Only admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Only admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (private.is_admin(auth.uid()));

-- 4. Orders admin policies -> role-based
DROP POLICY IF EXISTS "Admins update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
CREATE POLICY "Admins update all orders" ON public.orders
  FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

-- 5. Storage object policies
DROP POLICY IF EXISTS "Admins upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Product images public read" ON storage.objects;
CREATE POLICY "Admins upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND private.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'product-images' AND private.is_admin(auth.uid()));
CREATE POLICY "Admins delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND private.is_admin(auth.uid()));
CREATE POLICY "Users update own photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'user-photos' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'user-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 6. Remove the self-grantable is_admin column (admin status now lives in user_roles)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;

-- 7. Lock down trigger-only SECURITY DEFINER function from direct API execution
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;