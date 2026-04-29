import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Crown,
  Database,
  DoorOpen,
  Gauge,
  History,
  Landmark,
  Lock,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { mockApi } from "@/lib/mockApi";
import type { AppUser, Market, WithdrawDetail, ResultRecord, Bid, WinHistory, BalanceTransaction, MarketRecord, Session } from "@/lib/mockApi";

import { money, formatDate } from "@/components/ui/AdminUI";
import { AdminModal, ModalState } from "@/components/modals/AdminModal";
import { Dashboard, UsersModule, WithdrawModule, MarketsModule, ResultsModule, WinsModule, RecordsModule, ReportsModule } from "@/components/modules/AdminModules";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

type Section = "dashboard" | "users" | "withdraw" | "markets" | "results" | "wins" | "records" | "reports";

type Filters = {
  search: string;
  status: string;
  marketId: string;
  date: string;
};

const today = new Date().toISOString().slice(0, 10);
const emptyFilters: Filters = { search: "", status: "all", marketId: "all", date: "" };

const navItems: Array<{ id: Section; label: string; icon: any }> = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "users", label: "Users", icon: Users },
  { id: "withdraw", label: "Withdraw Details", icon: Landmark },
  { id: "markets", label: "Markets", icon: DoorOpen },
  { id: "results", label: "Results", icon: Trophy },
  { id: "wins", label: "Win History", icon: History },
  { id: "records", label: "Bids Data", icon: Database },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const numberOrZero = (value: unknown) => Number(value ?? 0);

const bidTypeLabels: Record<Bid["bid_type"], string> = {
  single_digit: "Single Digit",
  single_pana: "Single Pana",
  double_pana: "Double Pana",
  triple_pana: "Triple Pana",
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
    const { data: listener } = mockApi.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    mockApi.auth.getSession().then(({ data }) => setSession(data.session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const sessionUserId = session?.user?.id;
  useEffect(() => { if (sessionUserId) setIsAdmin(true); }, [sessionUserId]);

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
    return users.filter((user) => (!needle || user.name.toLowerCase().includes(needle) || user.phone.toLowerCase().includes(needle)) && (filters.status === "all" || user.status === filters.status));
  }, [users, filters.search, filters.status]);

  const filteredWithdraw = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    return withdrawDetails.filter((item) => !needle || item.user_name.toLowerCase().includes(needle) || item.account_holder_name.toLowerCase().includes(needle));
  }, [withdrawDetails, filters.search]);

  const filteredMarkets = useMemo(() => markets.filter((market) => filters.status === "all" || market.status === filters.status), [markets, filters.status]);

  const filteredResults = useMemo(() => results.filter((item) => (!filters.date || item.result_date === filters.date) && (filters.marketId === "all" || item.market_id === filters.marketId)), [results, filters.date, filters.marketId]);

  const filteredWins = useMemo(() => wins.filter((win) => {
    const needle = filters.search.trim().toLowerCase();
    return (!needle || win.winner_name.toLowerCase().includes(needle) || win.winner_phone.toLowerCase().includes(needle) || win.number_played.includes(needle)) && (!filters.date || win.created_at.slice(0, 10) === filters.date) && (filters.marketId === "all" || win.market_id === filters.marketId);
  }), [wins, filters]);

  const filteredRecords = useMemo(() => records.filter((record) => (!filters.date || record.date === filters.date) && (filters.marketId === "all" || record.market_id === filters.marketId)), [records, filters.date, filters.marketId]);

  const analytics = useMemo(() => {
    const dailyBids = bids.filter((bid) => (!filters.date || bid.bid_date === filters.date) && (filters.marketId === "all" || bid.market_id === filters.marketId));
    const totalBidAmount = dailyBids.reduce((sum, bid) => sum + numberOrZero(bid.amount), 0);
    const totalWithdraw = users.reduce((sum, user) => sum + numberOrZero(user.total_withdraw), 0);
    const totalDeposit = transactions.filter((trx) => ["add", "deposit"].includes(trx.transaction_type)).reduce((sum, trx) => sum + numberOrZero(trx.amount), 0);
    const totalCommission = Math.round(totalBidAmount * 0.05);
    const digits = Array.from({ length: 10 }, (_, digit) => dailyBids.filter((bid) => bid.bid_type === "single_digit" && bid.number_played === String(digit)).length);
    const digitAmounts = Array.from({ length: 10 }, (_, digit) => dailyBids.filter((bid) => bid.bid_type === "single_digit" && bid.number_played === String(digit)).reduce((sum, bid) => sum + numberOrZero(bid.amount), 0));
    const typeCounts = Object.keys(bidTypeLabels).map((type) => ({ label: bidTypeLabels[type as Bid["bid_type"]], count: dailyBids.filter((bid) => bid.bid_type === type).length }));
    const marketStats = markets.map((market) => ({ name: market.market_name, bids: dailyBids.filter((bid) => bid.market_id === market.id).length, amount: dailyBids.filter((bid) => bid.market_id === market.id).reduce((sum, bid) => sum + numberOrZero(bid.amount), 0) })).sort((a, b) => b.amount - a.amount);
    return { totalBidAmount, totalWithdraw, totalDeposit, totalCommission, digits, digitAmounts, typeCounts, marketStats };
  }, [bids, markets, transactions, users, filters.date, filters.marketId]);

  async function loadAll(showSpinner = true) {
    if (showSpinner) setLoading(true);
    const { data, error } = await mockApi.db.getAll();
    if (!error) {
      setUsers(data.app_users); setMarkets(data.markets); setWithdrawDetails(data.withdraw_details);
      setResults(data.results); setBids(data.bids); setWins(data.win_history);
      setRecords(data.market_bid_records || []); setTransactions(data.balance_transactions);
    }
    if (showSpinner) setLoading(false);
  }

  async function remove(table: string, id: string, label: string) {
    if (!window.confirm(`Delete ${label}?`)) return;
    const { error } = await mockApi.db.delete(table as any, id);
    if (!error) { toast.success(`${label} deleted.`); void loadAll(false); }
  }

  const handleLogout = async () => { await mockApi.auth.signOut(); setSection("dashboard"); };

  if (!session) return <AuthScreen />;

  return (
    <main className="min-h-screen bg-background text-foreground flex">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        section={section} 
        setSection={setSection} 
        navItems={navItems} 
      />

      <section className="min-w-0 flex-1">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          section={section}
          navItems={navItems}
          filters={filters}
          markets={markets}
          loading={loading}
          loadAll={() => void loadAll()}
          handleLogout={handleLogout}
          updateFilter={(k, v) => setFilters(f => ({ ...f, [k]: v }))}
          resetFilters={() => setFilters(emptyFilters)}
        />

        <div className="p-4 lg:p-6">
          {section === "dashboard" && <Dashboard users={users} bids={bids} wins={wins} markets={markets} analytics={analytics} setSection={setSection} filters={filters} updateFilter={(k, v) => setFilters(f => ({ ...f, [k]: v }))} />}
          {section === "users" && <UsersModule users={filteredUsers} onCreate={() => setModal({ kind: "user", mode: "create" })} onEdit={(item) => setModal({ kind: "user", mode: "edit", item })} onBalance={(item) => setModal({ kind: "balance", item })} onDelete={(id) => remove("app_users", id, "user")} />}
          {section === "withdraw" && <WithdrawModule items={filteredWithdraw} onEdit={(item) => setModal({ kind: "withdraw", mode: "edit", item })} onDelete={(id) => remove("withdraw_details", id, "withdraw record")} />}
          {section === "markets" && <MarketsModule items={filteredMarkets} onCreate={() => setModal({ kind: "market", mode: "create" })} onEdit={(item) => setModal({ kind: "market", mode: "edit", item })} onDelete={(id) => remove("markets", id, "market")} />}
          {section === "results" && <ResultsModule items={filteredResults} marketById={marketById} onCreate={() => setModal({ kind: "result", mode: "create" })} onEdit={(item) => setModal({ kind: "result", mode: "edit", item })} onDelete={(id) => remove("results", id, "result")} />}
          {section === "wins" && <WinsModule items={filteredWins} />}
          {section === "records" && <RecordsModule items={filteredRecords} markets={markets} filters={filters} updateFilter={(k, v) => setFilters(f => ({ ...f, [k]: v }))} />}
          {section === "reports" && <ReportsModule analytics={analytics} records={filteredRecords} transactions={transactions} />}
        </div>
      </section>

      {modal && <AdminModal modal={modal} users={users} markets={markets} onClose={() => setModal(null)} onSaved={() => { setModal(null); void loadAll(false); }} />}
    </main>
  );
}

function AuthScreen() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    const { error } = await mockApi.auth.signInWithPassword({ email, password });
    setBusy(false); if (error) toast.error(error.message); else toast.success("Signed in.");
  }
  return (
    <main className="auth-screen min-h-screen bg-background text-foreground grid place-items-center">
      <section className="dashboard-panel w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground"><Lock className="h-6 w-6" /></div><div><h1 className="text-2xl font-semibold">kalyan36bazar Admin</h1><p className="text-sm text-muted-foreground">Secure gaming operations console</p></div></div>
        <form onSubmit={submit} className="space-y-4"><label className="field-label">Username<input className="field-input" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label className="field-label">Password<input className="field-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : "Login"}</button></form>
      </section>
    </main>
  );
}

export default App;
