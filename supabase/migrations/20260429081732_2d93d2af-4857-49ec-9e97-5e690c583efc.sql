CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION private.has_any_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;

DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
DROP POLICY IF EXISTS "First authenticated user can become admin" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can create roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

DROP POLICY IF EXISTS "Admins can read app users" ON public.app_users;
DROP POLICY IF EXISTS "Admins can create app users" ON public.app_users;
DROP POLICY IF EXISTS "Admins can update app users" ON public.app_users;
DROP POLICY IF EXISTS "Admins can delete app users" ON public.app_users;
DROP POLICY IF EXISTS "Admins can read balance transactions" ON public.balance_transactions;
DROP POLICY IF EXISTS "Admins can create balance transactions" ON public.balance_transactions;
DROP POLICY IF EXISTS "Admins can read withdraw details" ON public.withdraw_details;
DROP POLICY IF EXISTS "Admins can create withdraw details" ON public.withdraw_details;
DROP POLICY IF EXISTS "Admins can update withdraw details" ON public.withdraw_details;
DROP POLICY IF EXISTS "Admins can delete withdraw details" ON public.withdraw_details;
DROP POLICY IF EXISTS "Admins can read markets" ON public.markets;
DROP POLICY IF EXISTS "Admins can create markets" ON public.markets;
DROP POLICY IF EXISTS "Admins can update markets" ON public.markets;
DROP POLICY IF EXISTS "Admins can delete markets" ON public.markets;
DROP POLICY IF EXISTS "Admins can read results" ON public.results;
DROP POLICY IF EXISTS "Admins can create results" ON public.results;
DROP POLICY IF EXISTS "Admins can update results" ON public.results;
DROP POLICY IF EXISTS "Admins can delete results" ON public.results;
DROP POLICY IF EXISTS "Admins can read bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can create bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can update bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can delete bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can read win history" ON public.win_history;
DROP POLICY IF EXISTS "Admins can create win history" ON public.win_history;
DROP POLICY IF EXISTS "Admins can update win history" ON public.win_history;
DROP POLICY IF EXISTS "Admins can delete win history" ON public.win_history;

CREATE POLICY "Users can read their own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "First authenticated user can become admin" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role = 'admin' AND NOT private.has_any_admin());
CREATE POLICY "Admins can create roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read app users" ON public.app_users FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create app users" ON public.app_users FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update app users" ON public.app_users FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete app users" ON public.app_users FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read balance transactions" ON public.balance_transactions FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create balance transactions" ON public.balance_transactions FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read withdraw details" ON public.withdraw_details FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create withdraw details" ON public.withdraw_details FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update withdraw details" ON public.withdraw_details FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete withdraw details" ON public.withdraw_details FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read markets" ON public.markets FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create markets" ON public.markets FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update markets" ON public.markets FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete markets" ON public.markets FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read results" ON public.results FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create results" ON public.results FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update results" ON public.results FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete results" ON public.results FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read bids" ON public.bids FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create bids" ON public.bids FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bids" ON public.bids FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bids" ON public.bids FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read win history" ON public.win_history FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create win history" ON public.win_history FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update win history" ON public.win_history FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete win history" ON public.win_history FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.adjust_app_user_balance(uuid, public.balance_transaction_type, numeric, text);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.has_any_admin();

REVOKE USAGE ON SCHEMA private FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM anon, authenticated, public;