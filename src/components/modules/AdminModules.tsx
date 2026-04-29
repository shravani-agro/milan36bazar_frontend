import { ReactNode } from "react";
import { Users, ClipboardList, Coins, CircleDollarSign, Wallet, Landmark, UserPlus, Plus } from "lucide-react";
import { AppUser, Bid, WinHistory, Market, MarketRecord, BalanceTransaction } from "@/lib/mockApi";
import { toast } from "sonner";
import { money, Panel, DataTable, RowActions, Badge, formatDate, SimpleList } from "../ui/AdminUI";

const today = new Date().toISOString().slice(0, 10);

export function DigitGrid({ digits, amounts }: { digits: number[]; amounts: number[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {digits.map((count, digit) => (
        <div key={digit} className="flex flex-col items-center justify-center border-2 border-primary/40 bg-card p-4 text-center transition-colors hover:border-primary">
          <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Total Bids {count}</p>
          <span className="my-2 text-4xl font-bold">{amounts[digit]}</span>
          <p className="text-xs font-semibold uppercase tracking-tight text-muted-foreground">Total Bid Amount</p>
          <span className="mt-1 text-sm font-bold text-primary underline underline-offset-4">Ank {digit}</span>
        </div>
      ))}
    </div>
  );
}

export function MarketStats({ stats }: { stats: { name: string; bids: number; amount: number }[] }) {
  if (!stats.length) return null;
  return (
    <div className="space-y-3">
      {stats.slice(0, 8).map((stat) => (
        <div key={stat.name} className="stat-row">
          <span>{stat.name}</span>
          <strong>{stat.bids} bids</strong>
          <small>{money.format(stat.amount)}</small>
        </div>
      ))}
    </div>
  );
}

export function Distribution({ counts }: { counts: { label: string; count: number }[] }) {
  const max = Math.max(1, ...counts.map((item) => item.count));
  return (
    <div className="space-y-3">
      {counts.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{item.label}</span>
            <span className="text-muted-foreground">{item.count}</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Dashboard({
  users, bids, wins, markets, analytics, setSection, filters, updateFilter
}: {
  users: AppUser[]; bids: Bid[]; wins: WinHistory[]; markets: Market[];
  analytics: any; setSection: (s: any) => void; filters: any; updateFilter: (k: any, v: any) => void
}) {
  const cards = [
    { label: "Total Users", value: users.length, icon: Users, section: "users" },
    { label: "Total Bids", value: bids.length, icon: ClipboardList, section: "records" },
    { label: "Bid Amount", value: money.format(analytics.totalBidAmount), icon: Coins, section: "reports" },
    { label: "Commission", value: money.format(analytics.totalCommission), icon: CircleDollarSign, section: "reports" },
    { label: "Deposits", value: money.format(analytics.totalDeposit), icon: Wallet, section: "reports" },
    { label: "Withdraw", value: money.format(analytics.totalWithdraw), icon: Landmark, section: "withdraw" },
  ];

  const displayDate = filters.date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(filters.date)) : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button key={card.label} className="metric-card text-left" onClick={() => setSection(card.section as any)}>
            <card.icon className="h-5 w-5 text-primary" />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold">Bids on Single Ank of Date {displayDate}</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Market:</span>
              <select className="filter-control" value={filters.marketId} onChange={(e) => updateFilter("marketId", e.target.value)}>
                <option value="all">All Markets</option>
                {markets.map((m) => <option key={m.id} value={m.id}>{m.market_name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Date:</span>
              <input className="filter-control" type="date" value={filters.date || today} onChange={(e) => updateFilter("date", e.target.value)} />
            </div>
          </div>
        </div>
        <DigitGrid digits={analytics.digits} amounts={analytics.digitAmounts} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Market Pulse" action={`${markets.filter((m) => m.status === "open").length} open`}><MarketStats stats={analytics.marketStats} /></Panel>
        <Panel title="Recent Winners" action={`${wins.length} wins`}><SimpleList items={wins.slice(0, 5).map((win) => ({ title: win.winner_name, meta: `${win.market_name} • ${money.format(win.win_amount)}` }))} /></Panel>
      </div>
    </div>
  );
}

export function UsersModule({ users, onCreate, onEdit, onBalance, onDelete }: { users: AppUser[]; onCreate: () => void; onEdit: (item: AppUser) => void; onBalance: (item: AppUser) => void; onDelete: (id: string) => void }) {
  return (
    <Panel title="Users" action={<button className="btn-primary" onClick={onCreate}><UserPlus className="h-4 w-4" /> Create User</button>}>
      <DataTable headers={["ID", "Name", "Phone", "Password", "Balance", "Total Game", "Total Won", "Total Withdraw", "Total Bonus", "Status", "Add/Deduct", "Action", "Created At"]}>
        {users.map((user, idx) => (
          <tr key={user.id}>
            <td>{idx + 1}</td>
            <td className="font-medium text-primary cursor-pointer" onClick={() => onEdit(user)}>{user.name}</td>
            <td className="text-primary">{user.phone}</td>
            <td>{user.password || "—"}</td>
            <td>{user.balance}</td>
            <td>{user.total_game_amount}</td>
            <td>{user.total_won}</td>
            <td>{user.total_withdraw}</td>
            <td>{user.total_bonus}</td>
            <td>
              <div className="flex gap-1">
                <button className={`btn-compact ${user.status === "blocked" ? "bg-muted" : ""}`} disabled={user.status === "blocked"}>Blocked</button>
                <button className={`btn-compact ${user.status === "unblocked" ? "bg-primary text-white" : ""}`} disabled={user.status === "unblocked"}>Unblock</button>
              </div>
            </td>
            <td><button className="btn-compact border border-primary text-primary text-[10px]" onClick={() => onBalance(user)}>Add | Deduct | Password</button></td>
            <td>
              <div className="flex flex-col gap-1">
                <button className="btn-compact border border-primary text-primary text-[10px]">Open WhatsApp</button>
                <button className="btn-compact border border-red-500 text-red-500 text-[10px]" onClick={() => onDelete(user.id)}>Delete</button>
              </div>
            </td>
            <td className="text-xs">{user.created_at.replace("T", " ").split(".")[0]}</td>
          </tr>
        ))}
      </DataTable>
    </Panel>
  );
}

export function WithdrawModule({ items, onEdit, onDelete }: { items: any[]; onEdit: (item: any) => void; onDelete: (id: string) => void }) {
  return <Panel title="Withdraw Details"><DataTable headers={["User", "Holder", "UPI Name", "Account", "IFSC", "UPI ID", "Created", "Actions"]}>{items.map((item) => <tr key={item.id}><td className="font-medium">{item.user_name}</td><td>{item.account_holder_name}</td><td>{item.upi_name || "—"}</td><td>{item.account_number}</td><td>{item.ifsc_code}</td><td>{item.upi_id || "—"}</td><td>{formatDate(item.created_at)}</td><td><RowActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} /></td></tr>)}</DataTable></Panel>;
}

export function MarketsModule({ items, onCreate, onEdit, onDelete }: { items: Market[]; onCreate: () => void; onEdit: (item: Market) => void; onDelete: (id: string) => void }) {
  return (
    <Panel title="Markets" action={<button className="btn-primary" onClick={onCreate}><Plus className="h-4 w-4" /> Create Market</button>}>
      <DataTable headers={["ID", "Name", "Current Status", "Open Time", "Created At", "Action"]}>
        {items.map((item, idx) => (
          <tr key={item.id}>
            <td>{idx + 9}</td>
            <td className="font-medium">{item.market_name}</td>
            <td><span className={`font-bold ${item.status === "open" ? "text-green-500" : "text-red-400"}`}>{item.status === "open" ? "OPEN NOW" : "CLOSED NOW"}</span></td>
            <td>{item.open_time}</td>
            <td className="text-xs">{item.created_at.replace("T", " ").split(".")[0]}</td>
            <td>
              <div className="flex items-center gap-1">
                <button className="btn-compact border border-primary text-primary px-3 rounded-md" onClick={() => onEdit(item)}>Edit</button>
                <span className="text-muted-foreground text-sm">|</span>
                <button className="btn-compact border border-primary text-primary px-3 rounded-md" onClick={() => onDelete(item.id)}>Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </Panel>
  );
}

export function ResultsModule({ items, marketById, onCreate, onEdit, onDelete }: { items: any[]; marketById: Map<string, Market>; onCreate: () => void; onEdit: (item: any) => void; onDelete: (id: string) => void }) {
  return <Panel title="Results" action={<button className="btn-primary" onClick={onCreate}><Plus className="h-4 w-4" /> Create Result</button>}><DataTable headers={["Date", "Market", "Open Pana", "Open Digit", "Created", "Actions"]}>{items.map((item) => <tr key={item.id}><td>{formatDate(item.result_date)}</td><td className="font-medium">{marketById.get(item.market_id)?.market_name || "—"}</td><td>{item.open_pana}</td><td>{item.open_digit}</td><td>{formatDate(item.created_at)}</td><td><RowActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} /></td></tr>)}</DataTable></Panel>;
}

export function WinsModule({ items }: { items: WinHistory[] }) {
  return <Panel title="Win History" action={`${items.length} records`}><DataTable headers={["Market", "Winner", "Phone", "Amount", "Number", "Win Amount", "Created"]}>{items.map((item) => <tr key={item.id}><td>{item.market_name}</td><td className="font-medium">{item.winner_name}</td><td>{item.winner_phone}</td><td>{money.format(item.amount)}</td><td>{item.number_played}</td><td>{money.format(item.win_amount)}</td><td>{formatDate(item.created_at)}</td></tr>)}</DataTable></Panel>;
}

export function RecordsModule({ 
  items, 
  markets, 
  filters, 
  updateFilter 
}: { 
  items: MarketRecord[]; 
  markets: Market[]; 
  filters: any; 
  updateFilter: (k: string, v: string) => void 
}) {
  const selectedRecord = items[0]; // Assuming filtered to one market/date

  const copyToClipboard = () => {
    const record = items[0];
    const marketName = record?.market_name || markets.find(m => m.id === filters.marketId)?.market_name || "Market";
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "-");

    let text = `${marketName} ₹ :\n`;
    text += `Date and Time   ${timeStr.toLowerCase()} ${dateStr}\n`;
    text += "---------------------------------\n";
    
    text += "Single Digit\n";
    let hasDigits = false;
    if (record) {
      for (let i = 0; i <= 9; i++) {
        const val = record[`single_digit_${i}` as keyof MarketRecord] as number;
        if (val > 0) {
          text += `${i} - ${val}\n`;
          hasDigits = true;
        }
      }
    }
    if (!hasDigits) text += "0\n";
    
    text += "---------------------------------\n";
    text += "Single Pana\n";
    text += `${record?.single_pana || 0}\n`;
    
    text += "---------------------------------\n";
    text += "Double Pana\n";
    text += `${record?.double_pana || 0}\n`;
    
    text += "---------------------------------\n";
    text += "Triple Pana\n";
    text += `${record?.triple_pana || 0}\n`;
    
    text += "---------------------------------\n";
    text += `Total  ${record?.total_bid_amount || 0}`;

    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Panel title="Bids Data">
      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <label className="field-label">
          Date
          <input 
            className="field-input" 
            type="date" 
            value={filters.date || today} 
            onChange={(e) => updateFilter("date", e.target.value)} 
          />
        </label>
        <label className="field-label">
          Market Name
          <select 
            className="field-input" 
            value={filters.marketId} 
            onChange={(e) => updateFilter("marketId", e.target.value)}
          >
            <option value="all">All Markets</option>
            {markets.map((m) => <option key={m.id} value={m.id}>{m.market_name}</option>)}
          </select>
        </label>
      </div>

      <div className="table-scroll mb-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Single Digit</th>
              <th>Single Pana</th>
              <th>Double Pana</th>
              <th>Triple Pana</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, idx) => (
                <tr key={`${item.date}-${item.market_id}`}>
                  <td>{idx + 1}</td>
                  <td>
                    {(() => {
                      const digits = Array.from({ length: 10 }, (_, i) => {
                        const val = item[`single_digit_${i}` as keyof MarketRecord] as number;
                        return val > 0 ? <div key={i}>{i} = {val}</div> : null;
                      }).filter(Boolean);
                      return digits.length > 0 ? digits : "0";
                    })()}
                  </td>
                  <td>{item.single_pana || 0}</td>
                  <td>{item.double_pana || 0}</td>
                  <td>{item.triple_pana || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td>1</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
              </tr>
            )}
            <tr className="font-bold bg-muted/20">
              <td>Total.</td>
              <td>{items.reduce((sum, item) => sum + Array.from({ length: 10 }, (_, i) => item[`single_digit_${i}` as keyof MarketRecord] as number).reduce((a, b) => a + b, 0), 0)}</td>
              <td>{items.reduce((sum, item) => sum + item.single_pana, 0)}</td>
              <td>{items.reduce((sum, item) => sum + item.double_pana, 0)}</td>
              <td>{items.reduce((sum, item) => sum + item.triple_pana, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button className="btn-primary" onClick={copyToClipboard}>
        Copy to Clipboard
      </button>
    </Panel>
  );
}

export function ReportsModule({ analytics, records, transactions }: { analytics: any; records: MarketRecord[]; transactions: BalanceTransaction[] }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Patti / Ank Distribution"><Distribution counts={analytics.typeCounts} /></Panel>
        <Panel title="Date-wise Bid Reports"><SimpleList items={records.slice(0, 8).map((record) => ({ title: `${formatDate(record.date)} • ${record.market_name}`, meta: `${record.total_bids} bids • ${money.format(record.total_bid_amount)}` }))} /></Panel>
        <Panel title="Balance Ledger"><SimpleList items={transactions.slice(0, 8).map((trx) => ({ title: `${trx.transaction_type} • ${money.format(trx.amount)}`, meta: `${money.format(trx.balance_before)} → ${money.format(trx.balance_after)}` }))} /></Panel>
      </div>
      <Panel title="Market-wise Stats"><MarketStats stats={analytics.marketStats} /></Panel>
    </div>
  );
}
