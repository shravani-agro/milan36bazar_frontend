import { Search, X } from "lucide-react";
import { Market } from "@/lib/mockApi";

export function GlobalFilters({ 
  filters, 
  markets, 
  section, 
  updateFilter, 
  reset 
}: { 
  filters: any; 
  markets: Market[]; 
  section: string; 
  updateFilter: (key: string, value: string) => void; 
  reset: () => void 
}) {
  const showSearch = ["users", "withdraw", "wins"].includes(section);
  const showDate = ["results", "wins", "reports"].includes(section);
  const showMarket = ["results", "wins", "reports"].includes(section);
  const showStatus = ["users", "markets"].includes(section);
  
  if (!showSearch && !showDate && !showMarket && !showStatus) return null;

  return (
    <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
      {showSearch && (
        <div className="search-shell">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input 
            value={filters.search} 
            onChange={(e) => updateFilter("search", e.target.value)} 
            placeholder="Search..." 
          />
        </div>
      )}
      {showDate && (
        <input 
          className="filter-control" 
          type="date" 
          value={filters.date} 
          onChange={(e) => updateFilter("date", e.target.value)} 
        />
      )}
      {showMarket && (
        <select 
          className="filter-control" 
          value={filters.marketId} 
          onChange={(e) => updateFilter("marketId", e.target.value)}
        >
          <option value="all">All markets</option>
          {markets.map((market) => <option key={market.id} value={market.id}>{market.market_name}</option>)}
        </select>
      )}
      {showStatus && (
        <select 
          className="filter-control" 
          value={filters.status} 
          onChange={(e) => updateFilter("status", e.target.value)}
        >
          <option value="all">All status</option>
          {section === "users" ? (
            <>
              <option value="unblocked">Unblocked</option>
              <option value="blocked">Blocked</option>
            </>
          ) : (
            <>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </>
          )}
        </select>
      )}
      <button className="icon-button" onClick={reset} aria-label="Clear filters"><X /></button>
    </div>
  );
}
