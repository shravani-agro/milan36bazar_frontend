import { ReactNode, useState, useMemo } from "react";
import { Users, ClipboardList, Coins, CircleDollarSign, Wallet, Landmark, UserPlus, Plus, ListFilter } from "lucide-react";
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

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Market Pulse"><MarketStats stats={analytics.marketStats} /></Panel>
        <Panel title="Recent Winners" action={`${wins.length} wins`}><SimpleList items={wins.slice(0, 5).map((win) => ({ title: win.winner_name, meta: `${win.market_name} • ${money.format(win.win_amount)}` }))} /></Panel>
      </div>
    </div>
  );
}

export function UsersModule({ users, onCreate, onEdit, onDelete }: { users: AppUser[]; onCreate: () => void; onEdit: (item: AppUser) => void; onDelete: (id: string) => void }) {
  return (
    <Panel title="Users" action={<button className="btn-primary" onClick={onCreate}><UserPlus className="h-4 w-4" /> Create User</button>}>
      <DataTable headers={["ID", "Name", "Phone", "Password", "Commission%", "Action"]}>
        {users.map((user, idx) => (
          <tr key={user.id}>
            <td>{idx + 1}</td>
            <td className="font-medium text-primary cursor-pointer" onClick={() => onEdit(user)}>{user.name}</td>
            <td className="text-primary">{user.phone}</td>
            <td>{user.password || "—"}</td>
            <td>{user.commission || 0}%</td>
            <td>
              <div className="flex flex-wrap gap-1">
                <button className="btn-compact border border-primary text-primary" onClick={() => onEdit(user)}>Edit</button>
                <button className="btn-compact border border-red-500 text-red-500" onClick={() => onDelete(user.id)}>Delete</button>
              </div>
            </td>
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
      <DataTable headers={["ID", "Name", "Open Time", "Created At", "Action"]}>
        {items.map((item, idx) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td className="font-medium">{item.market_name}</td>

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
  const [showData, setShowData] = useState(false);
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

    const categories = [
      { label: "Single Pana", key: "single_pana_display" },
      { label: "Double Pana", key: "double_pana_display" },
      { label: "Triple Pana", key: "triple_pana_display" },
    ];

    categories.forEach(cat => {
      text += "---------------------------------\n";
      text += `${cat.label}\n`;
      const display = (record as any)[cat.key];
      if (display) {
        text += display.split("\n").map((line: string) => line.replace(" = ", " - ")).join("\n") + "\n";
      } else {
        text += "0\n";
      }
    });

    text += "---------------------------------\n";
    text += `Total  ${record?.total_bid_amount || 0}`;

    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Panel title="Bids Data">
      <div className="mb-6 flex flex-wrap items-end gap-6">
        <label className="field-label flex-1 min-w-[150px]">
          Date
          <input
            className="field-input w-full"
            type="date"
            value={filters.date || today}
            onChange={(e) => { updateFilter("date", e.target.value); setShowData(false); }}
          />
        </label>
        <label className="field-label flex-1 min-w-[150px]">
          Market Name
          <select
            className="field-input w-full"
            value={filters.marketId}
            onChange={(e) => { updateFilter("marketId", e.target.value); setShowData(false); }}
          >
            <option value="all">All Markets</option>
            {markets.map((m) => <option key={m.id} value={m.id}>{m.market_name}</option>)}
          </select>
        </label>
        <button className="btn-primary px-8 h-10 mb-[2px]" onClick={() => setShowData(true)}>
          GET
        </button>
      </div>

      {showData && (
        <>
          <div className="table-scroll mb-6">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Market</th>
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
                      <td className="font-medium text-primary">{item.market_name}</td>
                      <td>
                        {(() => {
                          const digits = Array.from({ length: 10 }, (_, i) => {
                            const val = item[`single_digit_${i}` as keyof MarketRecord] as number;
                            return val > 0 ? <div key={i} className="text-xs">{i} = {val}</div> : null;
                          }).filter(Boolean);
                          return digits.length > 0 ? <div className="space-y-1">{digits}</div> : "0";
                        })()}
                      </td>
                      <td>
                        {item.single_pana_display ? (
                          <div className="space-y-1">
                            {item.single_pana_display.split("\n").map((line, i) => (
                              <div key={i} className="text-xs">{line}</div>
                            ))}
                          </div>
                        ) : "0"}
                      </td>
                      <td>
                        {item.double_pana_display ? (
                          <div className="space-y-1">
                            {item.double_pana_display.split("\n").map((line, i) => (
                              <div key={i} className="text-xs">{line}</div>
                            ))}
                          </div>
                        ) : "0"}
                      </td>
                      <td>
                        {item.triple_pana_display ? (
                          <div className="space-y-1">
                            {item.triple_pana_display.split("\n").map((line, i) => (
                              <div key={i} className="text-xs">{line}</div>
                            ))}
                          </div>
                        ) : "0"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>1</td>
                    <td>—</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                )}
                <tr className="font-bold bg-muted/20">
                  <td colSpan={2}>Total.</td>
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
        </>
      )}
    </Panel>
  );
}


export function CommissionModule({
  users,
  bids,
  wins,
  filters,
  updateFilter
}: {
  users: AppUser[];
  bids: Bid[];
  wins: WinHistory[];
  filters: any;
  updateFilter: (k: string, v: string) => void
}) {
  const selectedDate = filters.date || today;

  const userStats = useMemo(() => {
    return users.map(user => {
      const dailyBids = bids.filter(b => b.app_user_id === user.id && b.bid_date === selectedDate);
      const dailyWins = wins.filter(w => w.app_user_id === user.id && w.created_at.startsWith(selectedDate));

      const bidAmount = dailyBids.reduce((sum, b) => sum + b.amount, 0);
      const winAmount = dailyWins.reduce((sum, w) => sum + w.win_amount, 0);
      const commissionAmount = (bidAmount * (user.commission || 0)) / 100;

      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        bidAmount,
        commissionAmount,
        winAmount
      };
    }).filter(u => u.bidAmount > 0 || u.winAmount > 0);
  }, [users, bids, wins, selectedDate]);

  return (
    <Panel title="Commission Report">

      <DataTable headers={["User Name", "Mobile No.", "Bid Amount", "Commission Amount", "Win Amount"]}>
        {userStats.length > 0 ? (
          userStats.map((stat) => (
            <tr key={stat.id}>
              <td className="font-medium">{stat.name}</td>
              <td className="text-primary">{stat.phone}</td>
              <td>{money.format(stat.bidAmount)}</td>
              <td className="text-green-600 font-medium">+{money.format(stat.commissionAmount)}</td>
              <td className="text-blue-600 font-medium">{money.format(stat.winAmount)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="text-center py-8 text-muted-foreground">
              No transactions found for this date.
            </td>
          </tr>
        )}
        {userStats.length > 0 && (
          <tr className="font-bold bg-muted/20">
            <td colSpan={2}>Grand Total</td>
            <td>{money.format(userStats.reduce((s, u) => s + u.bidAmount, 0))}</td>
            <td className="text-green-600">{money.format(userStats.reduce((s, u) => s + u.commissionAmount, 0))}</td>
            <td className="text-blue-600">{money.format(userStats.reduce((s, u) => s + u.winAmount, 0))}</td>
          </tr>
        )}
      </DataTable>
    </Panel>
  );
}

export function BidsModule({ items, filters, updateFilter }: { items: any[]; filters: any; updateFilter: (k: string, v: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const bidTypeLabels: Record<string, string> = {
    single_digit: "Single Digit",
    single_pana: "Single Pana",
    double_pana: "Double Pana",
    triple_pana: "Triple Pana",
  };
  const marketGroups = useMemo(() => {
    let filtered = filters.date
      ? items.filter((item) => item.bid_date === filters.date)
      : items;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(bid => 
        bid.user_name.toLowerCase().includes(lowerSearch) || 
        bid.user_phone.includes(searchTerm)
      );
    }

    const groups = new Map<string, any>();

    filtered.forEach((bid) => {
      const marketKey = `${bid.market_name}-${bid.open_time}`;
      if (!groups.has(marketKey)) {
        groups.set(marketKey, {
          marketName: bid.market_name,
          openTime: bid.open_time,
          types: {
            single_digit: new Map<string, { total: number; users: Map<string, number> }>(),
            single_pana: new Map<string, { total: number; users: Map<string, number> }>(),
            double_pana: new Map<string, { total: number; users: Map<string, number> }>(),
            triple_pana: new Map<string, { total: number; users: Map<string, number> }>(),
          },
        });
      }

      const group = groups.get(marketKey);
      const typeMap = group.types[bid.bid_type];
      
      if (typeMap) {
        if (!typeMap.has(bid.number_played)) {
          typeMap.set(bid.number_played, { total: 0, users: new Map() });
        }
        const record = typeMap.get(bid.number_played)!;
        record.total += bid.amount;
        record.users.set(bid.user_name, (record.users.get(bid.user_name) || 0) + bid.amount);
      }
    });

    return Array.from(groups.values()).sort((a, b) => a.openTime.localeCompare(b.openTime));
  }, [items, filters.date, searchTerm]);

  return (
    <div className="space-y-6">
      <Panel title="Bids Explorer">
        <div className="flex flex-wrap items-end gap-4">
          <label className="field-label flex-1 min-w-[200px]">
            Filter by Date
            <input
              type="date"
              className="field-input"
              value={filters.date || today}
              onChange={(e) => updateFilter("date", e.target.value)}
            />
          </label>
          <label className="field-label flex-1 min-w-[200px]">
            Search User (Name/Phone)
            <input
              type="text"
              placeholder="e.g. Rahul..."
              className="field-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <button className="btn-compact border border-primary text-primary h-10 px-4 rounded-md" onClick={() => setSearchTerm("")}>Clear</button>
        </div>
      </Panel>

      {marketGroups.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-card rounded-lg border border-border">
          No bids found matching your criteria.
        </div>
      ) : (
        marketGroups.map((group) => (
          <Panel
            key={`${group.marketName}-${group.openTime}`}
            title={`${group.marketName} (${group.openTime})`}
            action={
              <div className="flex gap-2">
                 <Badge tone="neutral">
                   Market Total: {money.format(
                     Object.values(group.types as Record<string, Map<string, any>>).reduce((sum, map) => {
                       let total = 0;
                       map.forEach(v => total += (v.total || 0));
                       return sum + total;
                     }, 0)
                   )}
                 </Badge>
              </div>
            }
          >
            <div className="space-y-6">
              {Object.entries(group.types).map(([type, numberMap]: [string, any]) => {
                if (numberMap.size === 0) return null;
                
                const sortedNumbers = Array.from(numberMap.entries()).sort((a: any, b: any) => a[0].localeCompare(b[0], undefined, { numeric: true }));

                return (
                  <div key={type} className="rounded-xl border border-border overflow-hidden">
                    <div className="bg-muted/50 px-4 py-2 border-b border-border flex justify-between items-center">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{bidTypeLabels[type] || type}</h3>
                      <span className="text-xs font-bold text-primary">
                        {numberMap.size} Numbers Played
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-background border-b border-border text-left">
                            <th className="px-4 py-2 font-semibold">Number</th>
                            <th className="px-4 py-2 font-semibold">Total Amount</th>
                            <th className="px-4 py-2 font-semibold">User Breakdown</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sortedNumbers.map(([num, data]: any) => (
                            <tr key={num} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-2 font-bold text-lg">{num}</td>
                              <td className="px-4 py-2 font-bold text-primary">{money.format(data.total)}</td>
                              <td className="px-4 py-2">
                                <div className="flex flex-wrap gap-1">
                                  {Array.from(data.users.entries()).map(([user, amt]: any) => (
                                    <span key={user} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                      {user}: <span className="font-bold">₹{amt}</span>
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        ))
      )}
    </div>
  );
}
