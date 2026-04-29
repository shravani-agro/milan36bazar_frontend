CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.user_status AS ENUM ('blocked', 'unblocked');
CREATE TYPE public.market_status AS ENUM ('open', 'closed');
CREATE TYPE public.bid_type AS ENUM ('single_digit', 'single_pana', 'double_pana', 'triple_pana');
CREATE TYPE public.bid_status AS ENUM ('pending', 'won', 'lost', 'cancelled');
CREATE TYPE public.balance_transaction_type AS ENUM ('add', 'deduct', 'deposit', 'withdraw', 'bonus', 'win', 'bid');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
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

CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 100),
  phone text NOT NULL UNIQUE CHECK (phone ~ '^[0-9+() -]{7,20}$'),
  balance numeric(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_game_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (total_game_amount >= 0),
  total_won numeric(14,2) NOT NULL DEFAULT 0 CHECK (total_won >= 0),
  total_withdraw numeric(14,2) NOT NULL DEFAULT 0 CHECK (total_withdraw >= 0),
  total_bonus numeric(14,2) NOT NULL DEFAULT 0 CHECK (total_bonus >= 0),
  status public.user_status NOT NULL DEFAULT 'unblocked',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.balance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  transaction_type public.balance_transaction_type NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  reason text,
  balance_before numeric(14,2) NOT NULL CHECK (balance_before >= 0),
  balance_after numeric(14,2) NOT NULL CHECK (balance_after >= 0),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.withdraw_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid REFERENCES public.app_users(id) ON DELETE CASCADE,
  user_name text NOT NULL CHECK (char_length(trim(user_name)) BETWEEN 2 AND 100),
  account_holder_name text NOT NULL CHECK (char_length(trim(account_holder_name)) BETWEEN 2 AND 100),
  upi_name text,
  account_number text NOT NULL CHECK (char_length(trim(account_number)) BETWEEN 6 AND 32),
  ifsc_code text NOT NULL CHECK (ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
  upi_id text CHECK (upi_id IS NULL OR char_length(trim(upi_id)) BETWEEN 5 AND 80),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_name text NOT NULL UNIQUE CHECK (char_length(trim(market_name)) BETWEEN 1 AND 80),
  status public.market_status NOT NULL DEFAULT 'closed',
  open_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_date date NOT NULL DEFAULT CURRENT_DATE,
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  open_pana text NOT NULL CHECK (open_pana ~ '^[0-9]{1,3}$'),
  open_digit integer NOT NULL CHECK (open_digit BETWEEN 0 AND 9),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (result_date, market_id)
);

CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  bid_date date NOT NULL DEFAULT CURRENT_DATE,
  bid_type public.bid_type NOT NULL,
  number_played text NOT NULL CHECK (char_length(trim(number_played)) BETWEEN 1 AND 10),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  status public.bid_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.win_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL,
  app_user_id uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  market_name text NOT NULL,
  winner_name text NOT NULL,
  winner_phone text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  number_played text NOT NULL,
  win_amount numeric(14,2) NOT NULL CHECK (win_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE VIEW public.market_bid_records AS
SELECT
  b.bid_date AS date,
  m.id AS market_id,
  m.market_name,
  count(*)::integer AS total_bids,
  COALESCE(sum(b.amount), 0)::numeric(14,2) AS total_bid_amount,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '0')::integer AS single_digit_0,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '1')::integer AS single_digit_1,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '2')::integer AS single_digit_2,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '3')::integer AS single_digit_3,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '4')::integer AS single_digit_4,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '5')::integer AS single_digit_5,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '6')::integer AS single_digit_6,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '7')::integer AS single_digit_7,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '8')::integer AS single_digit_8,
  count(*) FILTER (WHERE b.bid_type = 'single_digit' AND b.number_played = '9')::integer AS single_digit_9,
  count(*) FILTER (WHERE b.bid_type = 'single_pana')::integer AS single_pana,
  count(*) FILTER (WHERE b.bid_type = 'double_pana')::integer AS double_pana,
  count(*) FILTER (WHERE b.bid_type = 'triple_pana')::integer AS triple_pana
FROM public.bids b
JOIN public.markets m ON m.id = b.market_id
GROUP BY b.bid_date, m.id, m.market_name;

CREATE OR REPLACE FUNCTION public.adjust_app_user_balance(
  _app_user_id uuid,
  _transaction_type public.balance_transaction_type,
  _amount numeric,
  _reason text DEFAULT NULL
)
RETURNS public.app_users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _before numeric(14,2);
  _after numeric(14,2);
  _user public.app_users;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can adjust balances';
  END IF;

  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  SELECT balance INTO _before FROM public.app_users WHERE id = _app_user_id FOR UPDATE;
  IF _before IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF _transaction_type IN ('deduct', 'withdraw', 'bid') THEN
    _after := _before - _amount;
  ELSE
    _after := _before + _amount;
  END IF;

  IF _after < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.app_users
  SET balance = _after,
      total_withdraw = CASE WHEN _transaction_type = 'withdraw' THEN total_withdraw + _amount ELSE total_withdraw END,
      total_bonus = CASE WHEN _transaction_type = 'bonus' THEN total_bonus + _amount ELSE total_bonus END,
      total_won = CASE WHEN _transaction_type = 'win' THEN total_won + _amount ELSE total_won END,
      total_game_amount = CASE WHEN _transaction_type = 'bid' THEN total_game_amount + _amount ELSE total_game_amount END
  WHERE id = _app_user_id
  RETURNING * INTO _user;

  INSERT INTO public.balance_transactions (app_user_id, transaction_type, amount, reason, balance_before, balance_after, created_by)
  VALUES (_app_user_id, _transaction_type, _amount, _reason, _before, _after, auth.uid());

  RETURN _user;
END;
$$;

CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON public.app_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_withdraw_details_updated_at BEFORE UPDATE ON public.withdraw_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON public.markets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_app_users_name_phone ON public.app_users (name, phone);
CREATE INDEX idx_app_users_status ON public.app_users (status);
CREATE INDEX idx_withdraw_details_app_user_id ON public.withdraw_details (app_user_id);
CREATE INDEX idx_markets_status ON public.markets (status);
CREATE INDEX idx_results_date_market ON public.results (result_date, market_id);
CREATE INDEX idx_bids_date_market ON public.bids (bid_date, market_id);
CREATE INDEX idx_bids_user ON public.bids (app_user_id);
CREATE INDEX idx_win_history_created_market ON public.win_history (created_at, market_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.win_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "First authenticated user can become admin" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role = 'admin' AND NOT public.has_any_admin());
CREATE POLICY "Admins can create roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read app users" ON public.app_users FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create app users" ON public.app_users FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update app users" ON public.app_users FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete app users" ON public.app_users FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read balance transactions" ON public.balance_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create balance transactions" ON public.balance_transactions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read withdraw details" ON public.withdraw_details FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create withdraw details" ON public.withdraw_details FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update withdraw details" ON public.withdraw_details FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete withdraw details" ON public.withdraw_details FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read markets" ON public.markets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create markets" ON public.markets FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update markets" ON public.markets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete markets" ON public.markets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read results" ON public.results FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create results" ON public.results FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update results" ON public.results FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete results" ON public.results FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read bids" ON public.bids FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create bids" ON public.bids FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bids" ON public.bids FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bids" ON public.bids FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read win history" ON public.win_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create win history" ON public.win_history FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update win history" ON public.win_history FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete win history" ON public.win_history FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.market_bid_records TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_app_user_balance(uuid, public.balance_transaction_type, numeric, text) TO authenticated;