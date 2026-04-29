ALTER VIEW public.market_bid_records SET (security_invoker = true);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_any_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.adjust_app_user_balance(uuid, public.balance_transaction_type, numeric, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_app_user_balance(uuid, public.balance_transaction_type, numeric, text) TO authenticated;