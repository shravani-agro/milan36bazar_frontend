import { X } from "lucide-react";
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
  const showDate = ["results", "wins", "commission"].includes(section);
  const showMarket = ["results", "wins"].includes(section);
  const showStatus = ["markets"].includes(section);

  if (!showDate && !showMarket && !showStatus) return null;

  return (
    <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
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


    </div>
  );
}
