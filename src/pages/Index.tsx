import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Coins,
  Crown,
  Database,
  DoorOpen,
  Gauge,
  History,
  Landmark,
  Lock,
  LogOut,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppUser = {
  id: string;
  name: string;
  phone: string;
  balance: number;
  total_game_amount: number;
  total_won: number;
  total_withdraw: number;
  total_bonus: number;
  status: "blocked" | "unblocked";
  created_at: string;
  updated_at?: string;
};

type Market = {
  id: string;
  market_name: string;
  status: "open" | "closed";
  open_time: string;
  created_at: string;
};

type WithdrawDetail = {
  id: string;
  app_user_id: string | null;
  user_name: string;
  account_holder_name: string;
  upi_name: string | null;
  account_number: string;
  ifsc_code: string;
  upi_id: string | null;
  created_at: string;
};

type ResultRecord = {
  id: string;
  result_date: string;
  market_id: string;
  open_pana: string;
  open_digit: number;
  created_at: string;
};

type Bid = {
  id: string;
  app_user_id: string;
  market_id: string;
  bid_date: string;
  bid_type: "single_digit" | "single_pana" | "double_pana" | "triple_pana";
  number_played: string;
  amount: number;
  status: "pending" | "won" | "lost" | "cancelled";
  created_at: string;
};

type WinHistory = {
  id: string;
  market_id: string | null;
  app_user_id: string | null;
  market_name: string;
  winner_name: string;
  winner_phone: string;
  amount: number;
  number_played: string;
  win_amount: number;
  created_at: string;
};

type MarketRecord = {
  date: string;
  market_id: string;
  market_name: string;
  total_bids: number;
  total_bid_amount: number;
  single_digit_0: number;
  single_digit_1: number;
  single_digit_2: number;
  single_digit_3: number;
  single_digit_4: number;
  single_digit_5: number;
  single_digit_6: number;
  single_digit_7: number;
  single_digit_8: number;
  single_digit_9: number;
  single_pana: number;
  double_pana: number;
  triple_pana: number;
};

type BalanceTransaction = {
  id: string;
  app_user_id: string;
  transaction_type: "add" | "deduct" | "deposit" | "withdraw" | "bonus" | "win" | "bid";
  amount: number;
  reason: string | null;
  balance_before: number;
  balance_after: number;
  created_at: string;
};

type Section = "dashboard" | "users" | "withdraw" | "markets" | "results" | "bids" | "wins" | "records" | "reports";
type ModalState =
  | { kind: "user"; mode: "create" | "edit"; item?: AppUser }
  | { kind: "balance"; item: AppUser }
  | { kind: "withdraw"; mode: "create" | "edit"; item?: WithdrawDetail }
  | { kind: "market"; mode: "create" | "edit"; item?: Market }
  | { kind: "result"; mode: "create" | "edit"; item?: ResultRecord }
  | { kind: "bid"; mode: "create" | "edit"; item?: Bid }
  | { kind: "win"; mode: "create"; item?: WinHistory }
  | null;

type Filters = {
  search: string;
  status: string;
  marketId: string;
  date: string;
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const today = new Date().toISOString().slice(0, 10);

const emptyFilters: Filters = { search: "", status: "all", marketId: "all", date: "" };

const navItems: Array<{ id: Section; label: string; icon: typeof Gauge }> = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "users", label: "Users", icon: Users },
  { id: "withdraw", label: "Withdraw Details", icon: Landmark },
  { id: "markets", label: "Markets", icon: DoorOpen },
  { id: "results", label: "Results", icon: Trophy },
  { id: "bids", label: "Bids", icon: ClipboardList },
  { id: "wins", label: "Win History", icon: History },
  { id: "records", label: "Market Records", icon: Database },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const bidTypeLabels: Record<Bid["bid_type"], string> = {
  single_digit: "Single Digit",
  single_pana: "Single Pana",
  double_pana: "Double Pana",
  triple_pana: "Triple Pana",
};

const numberOrZero = (value: unknown) => Number(value ?? 0);
const formatDate = (value: string) => (value ? shortDate.format(new Date(value)) : "—");

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [withdrawDetails, setWithdrawDetails] = useState<WithdrawDetail[]>([]);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [wins, setWins] = useState<WinHistory[]>([]);
  const [records, setRecords] = useState<MarketRecord[]>([]);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setIsAdmin(false);
      setAdminChecked(true);
      return;
    }
    void ensureAdminRole(session.user.id);
  }, [session?.user?.id]);

  useEffect(() => {
    if (session && isAdmin) {
      void loadAll();
      const interval = window.setInterval(() => void loadAll(false), 15000);
      return () => window.clearInterval(interval);
    }
  }, [session, isAdmin]);

  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const marketById = useMemo(() => new Map(markets.map((market) => [market.id, market])), [markets]);

  const filteredUsers = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !needle || user.name.toLowerCase().includes(needle) || user.phone.toLowerCase().includes(needle);
      const matchesStatus = filters.status === "all" || user.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [users, filters.search, filters.status]);

  const filteredWithdraw = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    return withdrawDetails.filter((item) => !needle || item.user_name.toLowerCase().includes(needle) || item.account_holder_name.toLowerCase().includes(needle));
  }, [withdrawDetails, filters.search]);

  const filteredMarkets = useMemo(() => markets.filter((market) => filters.status === "all" || market.status === filters.status), [markets, filters.status]);

  const filteredResults = useMemo(() => results.filter((item) => {
    const matchesDate = !filters.date || item.result_date === filters.date;
    const matchesMarket = filters.marketId === "all" || item.market_id === filters.marketId;
    return matchesDate && matchesMarket;
  }), [results, filters.date, filters.marketId]);

  const filteredBids = useMemo(() => bids.filter((bid) => {
    const user = userById.get(bid.app_user_id);
    const market = marketById.get(bid.market_id);
    const needle = filters.search.trim().toLowerCase();
    const matchesSearch = !needle || user?.name.toLowerCase().includes(needle) || user?.phone.toLowerCase().includes(needle) || bid.number_played.includes(needle) || market?.market_name.toLowerCase().includes(needle);
    const matchesDate = !filters.date || bid.bid_date === filters.date;
    const matchesMarket = filters.marketId === "all" || bid.market_id === filters.marketId;
    const matchesStatus = filters.status === "all" || bid.status === filters.status;
    return matchesSearch && matchesDate && matchesMarket && matchesStatus;
  }), [bids, filters, userById, marketById]);

  const filteredWins = useMemo(() => wins.filter((win) => {
    const needle = filters.search.trim().toLowerCase();
    const matchesSearch = !needle || win.winner_name.toLowerCase().includes(needle) || win.winner_phone.toLowerCase().includes(needle) || win.number_played.includes(needle);
    const matchesDate = !filters.date || win.created_at.slice(0, 10) === filters.date;
    const matchesMarket = filters.marketId === "all" || win.market_id === filters.marketId;
    return matchesSearch && matchesDate && matchesMarket;
  }), [wins, filters]);

  const filteredRecords = useMemo(() => records.filter((record) => {
    const matchesDate = !filters.date || record.date === filters.date;
    const matchesMarket = filters.marketId === "all" || record.market_id === filters.marketId;
    return matchesDate && matchesMarket;
  }), [records, filters.date, filters.marketId]);

  const analytics = useMemo(() => {
    const totalBidAmount = bids.reduce((sum, bid) => sum + numberOrZero(bid.amount), 0);
    const totalWithdraw = users.reduce((sum, user) => sum + numberOrZero(user.total_withdraw), 0);
    const totalDeposit = transactions.filter((trx) => ["add", "deposit"].includes(trx.transaction_type)).reduce((sum, trx) => sum + numberOrZero(trx.amount), 0);
    const totalCommission = Math.round(totalBidAmount * 0.05);
    const digits = Array.from({ length: 10 }, (_, digit) => bids.filter((bid) => bid.bid_type === "single_digit" && bid.number_played === String(digit)).length);
    const typeCounts = Object.keys(bidTypeLabels).map((type) => ({ label: bidTypeLabels[type as Bid["bid_type"]], count: bids.filter((bid) => bid.bid_type === type).length }));
    const marketStats = markets.map((market) => {
      const marketBids = bids.filter((bid) => bid.market_id === market.id);
      return { name: market.market_name, bids: marketBids.length, amount: marketBids.reduce((sum, bid) => sum + numberOrZero(bid.amount), 0) };
    }).sort((a, b) => b.amount - a.amount);
    return { totalBidAmount, totalWithdraw, totalDeposit, totalCommission, digits, typeCounts, marketStats };
  }, [bids, markets, transactions, users]);

  async function ensureAdminRole(userId: string) {
    setAdminChecked(false);
    const { data: existing, error } = await (supabase.from("user_roles" as never).select("role").eq("user_id", userId).eq("role", "admin").maybeSingle() as never as Promise<{ data: { role: string } | null; error: { code?: string; message: string } | null }>);
    if (existing?.role === "admin") {
      setIsAdmin(true);
      setAdminChecked(true);
      return;
    }
    if (error && error.code !== "PGRST116") {
      setIsAdmin(false);
      setAdminChecked(true);
      return;
    }
    const { error: insertError } = await (supabase.from("user_roles" as never).insert({ user_id: userId, role: "admin" } as never) as never as Promise<{ error: { message: string } | null }>);
    if (!insertError) {
      setIsAdmin(true);
      toast.success("Admin access activated for this account.");
    } else {
      setIsAdmin(false);
      toast.error("This account does not have admin access.");
    }
    setAdminChecked(true);
  }

  async function loadAll(showSpinner = true) {
    if (showSpinner) setLoading(true);
    const [usersRes, marketsRes, withdrawRes, resultsRes, bidsRes, winsRes, recordsRes, transactionsRes] = await Promise.all([
      supabase.from("app_users" as never).select("*").order("created_at", { ascending: false }),
      supabase.from("markets" as never).select("*").order("open_time", { ascending: true }),
      supabase.from("withdraw_details" as never).select("*").order("created_at", { ascending: false }),
      supabase.from("results" as never).select("*").order("result_date", { ascending: false }),
      supabase.from("bids" as never).select("*").order("created_at", { ascending: false }),
      supabase.from("win_history" as never).select("*").order("created_at", { ascending: false }),
      supabase.from("market_bid_records" as never).select("*").order("date", { ascending: false }),
      supabase.from("balance_transactions" as never).select("*").order("created_at", { ascending: false }).limit(100),
    ] as const);

    const firstError = [usersRes, marketsRes, withdrawRes, resultsRes, bidsRes, winsRes, recordsRes, transactionsRes].find((res) => res.error)?.error;
    if (firstError) {
      toast.error(firstError.message);
    } else {
      setUsers((usersRes.data ?? []) as unknown as AppUser[]);
      setMarkets((marketsRes.data ?? []) as unknown as Market[]);
      setWithdrawDetails((withdrawRes.data ?? []) as unknown as WithdrawDetail[]);
      setResults((resultsRes.data ?? []) as unknown as ResultRecord[]);
      setBids((bidsRes.data ?? []) as unknown as Bid[]);
      setWins((winsRes.data ?? []) as unknown as WinHistory[]);
      setRecords((recordsRes.data ?? []) as unknown as MarketRecord[]);
      setTransactions((transactionsRes.data ?? []) as unknown as BalanceTransaction[]);
    }
    if (showSpinner) setLoading(false);
  }

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function remove(table: string, id: string, label: string) {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    const { error } = await supabase.from(table as never).delete().eq("id", id as never);
    if (error) toast.error(error.message);
    else {
      toast.success(`${label} deleted.`);
      await loadAll(false);
    }
  }

  async function toggleMarket(market: Market) {
    const next = market.status === "open" ? "closed" : "open";
    const { error } = await (supabase.from("markets" as never).update({ status: next } as never).eq("id", market.id as never) as never as Promise<{ error: { message: string } | null }>);
    if (error) toast.error(error.message);
    else {
      toast.success(`Market ${next}.`);
      await loadAll(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSection("dashboard");
  }

  if (authLoading || !adminChecked) {
    return <Splash message="Securing admin console" />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background text-foreground grid place-items-center p-6">
        <div className="dashboard-panel max-w-md space-y-5 p-6 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="text-2xl font-semibold">Admin access required</h1>
          <p className="text-sm text-muted-foreground">Your login is valid, but this account is not assigned as an admin.</p>
          <button className="btn-primary w-full" onClick={handleLogout}>Sign out</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className={`dashboard-sidebar ${sidebarOpen ? "fixed inset-y-0 z-40 block w-72 lg:sticky lg:w-72" : "hidden w-20 lg:sticky lg:block"}`}>
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Crown className="h-5 w-5" /></div>
              {sidebarOpen && <div><p className="font-semibold">BetCore Admin</p><p className="text-xs text-muted-foreground">Gaming control room</p></div>}
            </div>
            <button className="icon-button hidden lg:grid" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>
          <nav className="space-y-1 p-3">
            {navItems.map((item) => (
              <button key={item.id} className={`nav-item ${section === item.id ? "nav-item-active" : ""}`} onClick={() => setSection(item.id)}>
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
              <button className="icon-button lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open navigation"><Menu /></button>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin Dashboard</p>
                <h1 className="truncate text-xl font-semibold md:text-2xl">{navItems.find((item) => item.id === section)?.label}</h1>
              </div>
              <GlobalFilters filters={filters} markets={markets} section={section} updateFilter={updateFilter} reset={() => setFilters(emptyFilters)} />
              <button className="icon-button" onClick={() => void loadAll()} aria-label="Refresh data"><RefreshCw className={loading ? "animate-spin" : ""} /></button>
              <button className="btn-secondary" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</button>
            </div>
          </header>

          <div className="p-4 lg:p-6">
            {section === "dashboard" && <Dashboard users={users} bids={bids} wins={wins} markets={markets} analytics={analytics} setSection={setSection} />}
            {section === "users" && <UsersModule users={filteredUsers} onCreate={() => setModal({ kind: "user", mode: "create" })} onEdit={(item) => setModal({ kind: "user", mode: "edit", item })} onBalance={(item) => setModal({ kind: "balance", item })} onDelete={(id) => remove("app_users", id, "user")} />}
            {section === "withdraw" && <WithdrawModule items={filteredWithdraw} onCreate={() => setModal({ kind: "withdraw", mode: "create" })} onEdit={(item) => setModal({ kind: "withdraw", mode: "edit", item })} onDelete={(id) => remove("withdraw_details", id, "withdraw record")} />}
            {section === "markets" && <MarketsModule items={filteredMarkets} onCreate={() => setModal({ kind: "market", mode: "create" })} onEdit={(item) => setModal({ kind: "market", mode: "edit", item })} onToggle={toggleMarket} onDelete={(id) => remove("markets", id, "market")} />}
            {section === "results" && <ResultsModule items={filteredResults} marketById={marketById} onCreate={() => setModal({ kind: "result", mode: "create" })} onEdit={(item) => setModal({ kind: "result", mode: "edit", item })} onDelete={(id) => remove("results", id, "result")} />}
            {section === "bids" && <BidsModule items={filteredBids} userById={userById} marketById={marketById} onCreate={() => setModal({ kind: "bid", mode: "create" })} onEdit={(item) => setModal({ kind: "bid", mode: "edit", item })} onDelete={(id) => remove("bids", id, "bid")} />}
            {section === "wins" && <WinsModule items={filteredWins} />}
            {section === "records" && <RecordsModule items={filteredRecords} />}
            {section === "reports" && <ReportsModule analytics={analytics} records={filteredRecords} transactions={transactions} />}
          </div>
        </section>
      </div>
      {modal && <AdminModal modal={modal} users={users} markets={markets} userById={userById} onClose={() => setModal(null)} onSaved={() => { setModal(null); void loadAll(false); }} />}
    </main>
  );
}

function Splash({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center">
      <div className="flex items-center gap-3 text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin" /> {message}</div>
    </main>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const action = mode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    const { error } = await action;
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(mode === "login" ? "Signed in." : "Account created. Check your email if verification is required.");
  }

  return (
    <main className="auth-screen min-h-screen bg-background text-foreground">
      <section className="dashboard-panel w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground"><Lock className="h-6 w-6" /></div>
          <div><h1 className="text-2xl font-semibold">BetCore Admin</h1><p className="text-sm text-muted-foreground">Secure gaming operations console</p></div>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
          <button className={`tab-button ${mode === "login" ? "tab-button-active" : ""}`} onClick={() => setMode("login")}>Login</button>
          <button className={`tab-button ${mode === "signup" ? "tab-button-active" : ""}`} onClick={() => setMode("signup")}>Create admin</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="field-label">Email<input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="field-label">Password<input className="field-input" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Login" : "Create admin account"}</button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">The first verified account becomes admin automatically. Later accounts need an existing admin role.</p>
      </section>
    </main>
  );
}

function GlobalFilters({ filters, markets, section, updateFilter, reset }: { filters: Filters; markets: Market[]; section: Section; updateFilter: (key: keyof Filters, value: string) => void; reset: () => void }) {
  const showSearch = ["users", "withdraw", "bids", "wins"].includes(section);
  const showDate = ["results", "bids", "wins", "records", "reports"].includes(section);
  const showMarket = ["results", "bids", "wins", "records", "reports"].includes(section);
  const showStatus = ["users", "markets", "bids"].includes(section);
  if (!showSearch && !showDate && !showMarket && !showStatus) return null;
  return (
    <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
      {showSearch && <div className="search-shell"><Search className="h-4 w-4 text-muted-foreground" /><input value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="Search name / phone" /></div>}
      {showDate && <input className="filter-control" type="date" value={filters.date} onChange={(e) => updateFilter("date", e.target.value)} />}
      {showMarket && <select className="filter-control" value={filters.marketId} onChange={(e) => updateFilter("marketId", e.target.value)}><option value="all">All markets</option>{markets.map((market) => <option key={market.id} value={market.id}>{market.market_name}</option>)}</select>}
      {showStatus && <select className="filter-control" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}><option value="all">All status</option>{section === "users" && <><option value="unblocked">Unblocked</option><option value="blocked">Blocked</option></>}{section === "markets" && <><option value="open">Open</option><option value="closed">Closed</option></>}{section === "bids" && <><option value="pending">Pending</option><option value="won">Won</option><option value="lost">Lost</option><option value="cancelled">Cancelled</option></>}</select>}
      <button className="icon-button" onClick={reset} aria-label="Clear filters"><X /></button>
    </div>
  );
}

function Dashboard({ users, bids, wins, markets, analytics, setSection }: { users: AppUser[]; bids: Bid[]; wins: WinHistory[]; markets: Market[]; analytics: Analytics; setSection: (section: Section) => void }) {
  const cards = [
    { label: "Total Users", value: users.length, icon: Users, section: "users" as Section },
    { label: "Total Bids", value: bids.length, icon: ClipboardList, section: "bids" as Section },
    { label: "Bid Amount", value: money.format(analytics.totalBidAmount), icon: Coins, section: "reports" as Section },
    { label: "Commission", value: money.format(analytics.totalCommission), icon: CircleDollarSign, section: "reports" as Section },
    { label: "Deposits", value: money.format(analytics.totalDeposit), icon: Wallet, section: "reports" as Section },
    { label: "Withdraw", value: money.format(analytics.totalWithdraw), icon: Landmark, section: "withdraw" as Section },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => <button key={card.label} className="metric-card text-left" onClick={() => setSection(card.section)}><card.icon className="h-5 w-5 text-primary" /><span>{card.label}</span><strong>{card.value}</strong></button>)}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Single Ank Analysis" action="Live counts"><DigitBars digits={analytics.digits} /></Panel>
        <Panel title="Market Pulse" action={`${markets.filter((m) => m.status === "open").length} open`}><MarketStats stats={analytics.marketStats} /></Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recent Winners" action={`${wins.length} wins`}><SimpleList items={wins.slice(0, 5).map((win) => ({ title: win.winner_name, meta: `${win.market_name} • ${money.format(win.win_amount)}` }))} /></Panel>
        <Panel title="Recent Bids" action={`${bids.length} bids`}><SimpleList items={bids.slice(0, 5).map((bid) => ({ title: bid.number_played, meta: `${bidTypeLabels[bid.bid_type]} • ${money.format(bid.amount)}` }))} /></Panel>
      </div>
    </div>
  );
}

type Analytics = { totalBidAmount: number; totalWithdraw: number; totalDeposit: number; totalCommission: number; digits: number[]; typeCounts: { label: string; count: number }[]; marketStats: { name: string; bids: number; amount: number }[] };

function UsersModule({ users, onCreate, onEdit, onBalance, onDelete }: { users: AppUser[]; onCreate: () => void; onEdit: (item: AppUser) => void; onBalance: (item: AppUser) => void; onDelete: (id: string) => void }) {
  return <Panel title="Users" action={<button className="btn-primary" onClick={onCreate}><UserPlus className="h-4 w-4" /> Create User</button>}><DataTable headers={["Name", "Phone", "Balance", "Game", "Won", "Withdraw", "Bonus", "Status", "Created", "Actions"]}>{users.map((user) => <tr key={user.id}><td className="font-medium">{user.name}</td><td>{user.phone}</td><td>{money.format(user.balance)}</td><td>{money.format(user.total_game_amount)}</td><td>{money.format(user.total_won)}</td><td>{money.format(user.total_withdraw)}</td><td>{money.format(user.total_bonus)}</td><td><Badge tone={user.status === "blocked" ? "danger" : "success"}>{user.status}</Badge></td><td>{formatDate(user.created_at)}</td><td><RowActions onEdit={() => onEdit(user)} onBalance={() => onBalance(user)} onDelete={() => onDelete(user.id)} /></td></tr>)}</DataTable></Panel>;
}

function WithdrawModule({ items, onCreate, onEdit, onDelete }: { items: WithdrawDetail[]; onCreate: () => void; onEdit: (item: WithdrawDetail) => void; onDelete: (id: string) => void }) {
  return <Panel title="Withdraw Details" action={<button className="btn-primary" onClick={onCreate}><Plus className="h-4 w-4" /> Add Details</button>}><DataTable headers={["User", "Holder", "UPI Name", "Account", "IFSC", "UPI ID", "Created", "Actions"]}>{items.map((item) => <tr key={item.id}><td className="font-medium">{item.user_name}</td><td>{item.account_holder_name}</td><td>{item.upi_name || "—"}</td><td>{item.account_number}</td><td>{item.ifsc_code}</td><td>{item.upi_id || "—"}</td><td>{formatDate(item.created_at)}</td><td><RowActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} /></td></tr>)}</DataTable></Panel>;
}

function MarketsModule({ items, onCreate, onEdit, onToggle, onDelete }: { items: Market[]; onCreate: () => void; onEdit: (item: Market) => void; onToggle: (item: Market) => void; onDelete: (id: string) => void }) {
  return <Panel title="Markets" action={<button className="btn-primary" onClick={onCreate}><Plus className="h-4 w-4" /> Create Market</button>}><DataTable headers={["Market", "Status", "Open Time", "Created", "Actions"]}>{items.map((item) => <tr key={item.id}><td className="font-medium">{item.market_name}</td><td><Badge tone={item.status === "open" ? "success" : "neutral"}>{item.status}</Badge></td><td>{item.open_time}</td><td>{formatDate(item.created_at)}</td><td><div className="row-actions"><button className="btn-compact" onClick={() => onToggle(item)}>{item.status === "open" ? "Stop" : "Start"}</button><RowActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} /></div></td></tr>)}</DataTable></Panel>;
}

function ResultsModule({ items, marketById, onCreate, onEdit, onDelete }: { items: ResultRecord[]; marketById: Map<string, Market>; onCreate: () => void; onEdit: (item: ResultRecord) => void; onDelete: (id: string) => void }) {
  return <Panel title="Results" action={<button className="btn-primary" onClick={onCreate}><Plus className="h-4 w-4" /> Create Result</button>}><DataTable headers={["Date", "Market", "Open Pana", "Open Digit", "Created", "Actions"]}>{items.map((item) => <tr key={item.id}><td>{formatDate(item.result_date)}</td><td className="font-medium">{marketById.get(item.market_id)?.market_name || "—"}</td><td>{item.open_pana}</td><td>{item.open_digit}</td><td>{formatDate(item.created_at)}</td><td><RowActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} /></td></tr>)}</DataTable></Panel>;
}

function BidsModule({ items, userById, marketById, onCreate, onEdit, onDelete }: { items: Bid[]; userById: Map<string, AppUser>; marketById: Map<string, Market>; onCreate: () => void; onEdit: (item: Bid) => void; onDelete: (id: string) => void }) {
  return <Panel title="Bids" action={<button className="btn-primary" onClick={onCreate}><Plus className="h-4 w-4" /> Create Bid</button>}><DataTable headers={["Date", "User", "Market", "Type", "Number", "Amount", "Status", "Actions"]}>{items.map((item) => <tr key={item.id}><td>{formatDate(item.bid_date)}</td><td className="font-medium">{userById.get(item.app_user_id)?.name || "—"}</td><td>{marketById.get(item.market_id)?.market_name || "—"}</td><td>{bidTypeLabels[item.bid_type]}</td><td>{item.number_played}</td><td>{money.format(item.amount)}</td><td><Badge tone={item.status === "won" ? "success" : item.status === "lost" || item.status === "cancelled" ? "danger" : "neutral"}>{item.status}</Badge></td><td><RowActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} /></td></tr>)}</DataTable></Panel>;
}

function WinsModule({ items }: { items: WinHistory[] }) {
  return <Panel title="Win History" action={`${items.length} records`}><DataTable headers={["Market", "Winner", "Phone", "Amount", "Number", "Win Amount", "Created"]}>{items.map((item) => <tr key={item.id}><td>{item.market_name}</td><td className="font-medium">{item.winner_name}</td><td>{item.winner_phone}</td><td>{money.format(item.amount)}</td><td>{item.number_played}</td><td>{money.format(item.win_amount)}</td><td>{formatDate(item.created_at)}</td></tr>)}</DataTable></Panel>;
}

function RecordsModule({ items }: { items: MarketRecord[] }) {
  return <Panel title="Market Records / Bids Data" action={`${items.length} groups`}><DataTable headers={["Date", "Market", "Total Bids", "Amount", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Single", "Double", "Triple"]}>{items.map((item) => <tr key={`${item.date}-${item.market_id}`}><td>{formatDate(item.date)}</td><td className="font-medium">{item.market_name}</td><td>{item.total_bids}</td><td>{money.format(item.total_bid_amount)}</td>{Array.from({ length: 10 }, (_, digit) => <td key={digit}>{item[`single_digit_${digit}` as keyof MarketRecord] as number}</td>)}<td>{item.single_pana}</td><td>{item.double_pana}</td><td>{item.triple_pana}</td></tr>)}</DataTable></Panel>;
}

function ReportsModule({ analytics, records, transactions }: { analytics: Analytics; records: MarketRecord[]; transactions: BalanceTransaction[] }) {
  return <div className="space-y-4"><div className="grid gap-4 lg:grid-cols-3"><Panel title="Patti / Ank Distribution"><Distribution counts={analytics.typeCounts} /></Panel><Panel title="Date-wise Bid Reports"><SimpleList items={records.slice(0, 8).map((record) => ({ title: `${formatDate(record.date)} • ${record.market_name}`, meta: `${record.total_bids} bids • ${money.format(record.total_bid_amount)}` }))} /></Panel><Panel title="Balance Ledger"><SimpleList items={transactions.slice(0, 8).map((trx) => ({ title: `${trx.transaction_type} • ${money.format(trx.amount)}`, meta: `${money.format(trx.balance_before)} → ${money.format(trx.balance_after)}` }))} /></Panel></div><Panel title="Market-wise Stats"><MarketStats stats={analytics.marketStats} /></Panel></div>;
}

function AdminModal({ modal, users, markets, userById, onClose, onSaved }: { modal: Exclude<ModalState, null>; users: AppUser[]; markets: Market[]; userById: Map<string, AppUser>; onClose: () => void; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);

  async function submit(table: string, payload: Record<string, unknown>, id?: string) {
    setBusy(true);
    const request = id ? supabase.from(table as never).update(payload as never).eq("id", id as never) : supabase.from(table as never).insert(payload as never);
    const { error } = await request as never as Promise<{ error: { message: string } | null }>;
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved successfully."); onSaved(); }
  }

  async function submitBalance(form: FormData, item: AppUser) {
    const type = String(form.get("transaction_type"));
    const amount = Number(form.get("amount"));
    const reason = String(form.get("reason") || "Admin adjustment");
    if (!amount || amount <= 0) return toast.error("Enter a valid amount.");
    const after = ["deduct", "withdraw", "bid"].includes(type) ? item.balance - amount : item.balance + amount;
    if (after < 0) return toast.error("Insufficient balance.");
    setBusy(true);
    const { error: updateError } = await (supabase.from("app_users" as never).update({ balance: after } as never).eq("id", item.id as never) as never as Promise<{ error: { message: string } | null }>);
    if (updateError) { setBusy(false); return toast.error(updateError.message); }
    const { error: trxError } = await (supabase.from("balance_transactions" as never).insert({ app_user_id: item.id, transaction_type: type, amount, reason, balance_before: item.balance, balance_after: after } as never) as never as Promise<{ error: { message: string } | null }>);
    setBusy(false);
    if (trxError) toast.error(trxError.message);
    else { toast.success("Balance updated."); onSaved(); }
  }

  const title = modal.kind === "balance" ? `Balance: ${modal.item.name}` : `${modal.mode === "create" ? "Create" : "Update"} ${modal.kind}`;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="dashboard-panel modal-card p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold capitalize">{title}</h2><button className="icon-button" onClick={onClose}><X /></button></div>
        {modal.kind === "user" && <EntityForm busy={busy} onSubmit={(form) => submit("app_users", { name: formText(form, "name"), phone: formText(form, "phone"), balance: Number(form.get("balance") || 0), total_game_amount: Number(form.get("total_game_amount") || 0), total_won: Number(form.get("total_won") || 0), total_withdraw: Number(form.get("total_withdraw") || 0), total_bonus: Number(form.get("total_bonus") || 0), status: formText(form, "status") }, modal.item?.id)} fields={<><Field name="name" label="Name" defaultValue={modal.item?.name} required /><Field name="phone" label="Phone" defaultValue={modal.item?.phone} required /><Field name="balance" label="Balance" type="number" defaultValue={modal.item?.balance ?? 0} /><Field name="total_game_amount" label="Total Game Amount" type="number" defaultValue={modal.item?.total_game_amount ?? 0} /><Field name="total_won" label="Total Won" type="number" defaultValue={modal.item?.total_won ?? 0} /><Field name="total_withdraw" label="Total Withdraw" type="number" defaultValue={modal.item?.total_withdraw ?? 0} /><Field name="total_bonus" label="Total Bonus" type="number" defaultValue={modal.item?.total_bonus ?? 0} /><label className="field-label">Status<select name="status" className="field-input" defaultValue={modal.item?.status ?? "unblocked"}><option value="unblocked">Unblocked</option><option value="blocked">Blocked</option></select></label><p className="md:col-span-2 text-xs text-muted-foreground">Player passwords are intentionally not stored here. Use secure authentication for real player login.</p></>} />}
        {modal.kind === "balance" && <EntityForm busy={busy} onSubmit={(form) => submitBalance(form, modal.item)} fields={<><label className="field-label">Action<select className="field-input" name="transaction_type" defaultValue="add"><option value="add">Add Balance</option><option value="deduct">Deduct Balance</option><option value="deposit">Deposit</option><option value="withdraw">Withdraw</option><option value="bonus">Bonus</option><option value="win">Win</option><option value="bid">Bid</option></select></label><Field name="amount" label="Amount" type="number" required /><Field name="reason" label="Reason" defaultValue="Admin adjustment" /></>} />}
        {modal.kind === "withdraw" && <EntityForm busy={busy} onSubmit={(form) => submit("withdraw_details", { app_user_id: optional(formText(form, "app_user_id")), user_name: selectedUserName(form, users), account_holder_name: formText(form, "account_holder_name"), upi_name: optional(formText(form, "upi_name")), account_number: formText(form, "account_number"), ifsc_code: formText(form, "ifsc_code").toUpperCase(), upi_id: optional(formText(form, "upi_id")) }, modal.item?.id)} fields={<><UserSelect users={users} defaultValue={modal.item?.app_user_id || ""} /><Field name="user_name" label="User Name" defaultValue={modal.item?.user_name} required /><Field name="account_holder_name" label="Account Holder Name" defaultValue={modal.item?.account_holder_name} required /><Field name="upi_name" label="UPI Name" defaultValue={modal.item?.upi_name || ""} /><Field name="account_number" label="Account Number" defaultValue={modal.item?.account_number} required /><Field name="ifsc_code" label="IFSC Code" defaultValue={modal.item?.ifsc_code} required /><Field name="upi_id" label="UPI ID" defaultValue={modal.item?.upi_id || ""} /></>} />}
        {modal.kind === "market" && <EntityForm busy={busy} onSubmit={(form) => submit("markets", { market_name: formText(form, "market_name"), status: formText(form, "status"), open_time: formText(form, "open_time") }, modal.item?.id)} fields={<><Field name="market_name" label="Market Name" defaultValue={modal.item?.market_name} required /><Field name="open_time" label="Open Time" type="time" defaultValue={modal.item?.open_time} required /><label className="field-label">Status<select name="status" className="field-input" defaultValue={modal.item?.status ?? "closed"}><option value="open">Open</option><option value="closed">Closed</option></select></label></>} />}
        {modal.kind === "result" && <EntityForm busy={busy} onSubmit={(form) => submit("results", { result_date: formText(form, "result_date"), market_id: formText(form, "market_id"), open_pana: formText(form, "open_pana"), open_digit: Number(form.get("open_digit")) }, modal.item?.id)} fields={<><MarketSelect markets={markets} defaultValue={modal.item?.market_id} /><Field name="result_date" label="Date" type="date" defaultValue={modal.item?.result_date ?? today} required /><Field name="open_pana" label="Open Pana" defaultValue={modal.item?.open_pana} required /><Field name="open_digit" label="Open Digit" type="number" min="0" max="9" defaultValue={modal.item?.open_digit ?? 0} required /></>} />}
        {modal.kind === "bid" && <EntityForm busy={busy} onSubmit={(form) => submit("bids", { app_user_id: formText(form, "app_user_id"), market_id: formText(form, "market_id"), bid_date: formText(form, "bid_date"), bid_type: formText(form, "bid_type"), number_played: formText(form, "number_played"), amount: Number(form.get("amount")), status: formText(form, "status") }, modal.item?.id)} fields={<><UserSelect users={users} defaultValue={modal.item?.app_user_id} /><MarketSelect markets={markets} defaultValue={modal.item?.market_id} /><Field name="bid_date" label="Date" type="date" defaultValue={modal.item?.bid_date ?? today} required /><label className="field-label">Bid Type<select className="field-input" name="bid_type" defaultValue={modal.item?.bid_type ?? "single_digit"}>{Object.entries(bidTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><Field name="number_played" label="Number Played" defaultValue={modal.item?.number_played} required /><Field name="amount" label="Amount" type="number" defaultValue={modal.item?.amount ?? 10} required /><label className="field-label">Status<select className="field-input" name="status" defaultValue={modal.item?.status ?? "pending"}><option value="pending">Pending</option><option value="won">Won</option><option value="lost">Lost</option><option value="cancelled">Cancelled</option></select></label></>} />}
      </div>
    </div>
  );
}

function EntityForm({ fields, busy, onSubmit }: { fields: ReactNode; busy: boolean; onSubmit: (form: FormData) => void | Promise<void> }) {
  return <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void onSubmit(new FormData(event.currentTarget)); }}>{fields}<div className="flex justify-end md:col-span-2"><button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button></div></form>;
}

function Field(props: { name: string; label: string; type?: string; defaultValue?: string | number | null; required?: boolean; min?: string; max?: string }) {
  return <label className="field-label">{props.label}<input className="field-input" name={props.name} type={props.type ?? "text"} defaultValue={props.defaultValue ?? ""} required={props.required} min={props.min} max={props.max} step={props.type === "number" ? "0.01" : undefined} /></label>;
}

function UserSelect({ users, defaultValue }: { users: AppUser[]; defaultValue?: string }) {
  return <label className="field-label">User<select className="field-input" name="app_user_id" defaultValue={defaultValue ?? ""} required><option value="" disabled>Select user</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name} • {user.phone}</option>)}</select></label>;
}

function MarketSelect({ markets, defaultValue }: { markets: Market[]; defaultValue?: string }) {
  return <label className="field-label">Market<select className="field-input" name="market_id" defaultValue={defaultValue ?? ""} required><option value="" disabled>Select market</option>{markets.map((market) => <option key={market.id} value={market.id}>{market.market_name}</option>)}</select></label>;
}

function formText(form: FormData, key: string) { return String(form.get(key) ?? "").trim(); }
function optional(value: string) { return value.trim() ? value.trim() : null; }
function selectedUserName(form: FormData, users: AppUser[]) { return formText(form, "user_name") || users.find((user) => user.id === formText(form, "app_user_id"))?.name || "Unknown User"; }

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="dashboard-panel overflow-hidden"><div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3"><h2 className="font-semibold">{title}</h2>{action && <div className="text-sm text-muted-foreground">{action}</div>}</div><div className="p-4">{children}</div></section>;
}

function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="table-scroll"><table className="data-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function RowActions({ onEdit, onBalance, onDelete }: { onEdit: () => void; onBalance?: () => void; onDelete: () => void }) {
  return <div className="row-actions"><button className="icon-button" onClick={onEdit} aria-label="Edit"><Pencil /></button>{onBalance && <button className="icon-button" onClick={onBalance} aria-label="Balance"><Wallet /></button>}<button className="icon-button danger-action" onClick={onDelete} aria-label="Delete"><Trash2 /></button></div>;
}

function Badge({ children, tone }: { children: ReactNode; tone: "success" | "danger" | "neutral" }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

function DigitBars({ digits }: { digits: number[] }) {
  const max = Math.max(1, ...digits);
  return <div className="grid grid-cols-10 gap-2">{digits.map((count, digit) => <div key={digit} className="digit-bar"><div className="digit-track"><span style={{ height: `${Math.max(8, (count / max) * 100)}%` }} /></div><strong>{digit}</strong><small>{count}</small></div>)}</div>;
}

function Distribution({ counts }: { counts: { label: string; count: number }[] }) {
  const max = Math.max(1, ...counts.map((item) => item.count));
  return <div className="space-y-3">{counts.map((item) => <div key={item.label}><div className="mb-1 flex justify-between text-sm"><span>{item.label}</span><span className="text-muted-foreground">{item.count}</span></div><div className="progress-track"><span style={{ width: `${(item.count / max) * 100}%` }} /></div></div>)}</div>;
}

function MarketStats({ stats }: { stats: { name: string; bids: number; amount: number }[] }) {
  if (!stats.length) return <EmptyState />;
  return <div className="space-y-3">{stats.slice(0, 8).map((stat) => <div key={stat.name} className="stat-row"><span>{stat.name}</span><strong>{stat.bids} bids</strong><small>{money.format(stat.amount)}</small></div>)}</div>;
}

function SimpleList({ items }: { items: { title: string; meta: string }[] }) {
  if (!items.length) return <EmptyState />;
  return <div className="space-y-2">{items.map((item, index) => <div key={`${item.title}-${index}`} className="list-row"><Activity className="h-4 w-4 text-primary" /><div><p>{item.title}</p><span>{item.meta}</span></div></div>)}</div>;
}

function EmptyState() {
  return <div className="empty-state"><CalendarDays className="h-6 w-6" /> No records found</div>;
}

export default App;
