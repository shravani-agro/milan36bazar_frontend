GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_any_admin() TO authenticated;
REVOKE USAGE ON SCHEMA private FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM anon, public;