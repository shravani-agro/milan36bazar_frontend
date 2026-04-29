import { Menu, RefreshCw, LogOut } from "lucide-react";
import { GlobalFilters } from "./GlobalFilters";
import { Market } from "@/lib/mockApi";

export function Header({ 
  sidebarOpen, 
  setSidebarOpen, 
  section, 
  navItems, 
  filters, 
  markets, 
  loading, 
  loadAll, 
  handleLogout, 
  updateFilter, 
  resetFilters 
}: { 
  sidebarOpen: boolean; 
  setSidebarOpen: (v: boolean) => void; 
  section: string; 
  navItems: any[]; 
  filters: any; 
  markets: Market[]; 
  loading: boolean; 
  loadAll: () => void; 
  handleLogout: () => void; 
  updateFilter: (k: string, v: string) => void; 
  resetFilters: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
        <button className="icon-button lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin Dashboard</p>
          <h1 className="truncate text-xl font-semibold md:text-2xl">
            {navItems.find((item: any) => item.id === section)?.label}
          </h1>
        </div>
        <GlobalFilters 
          filters={filters} 
          markets={markets} 
          section={section} 
          updateFilter={updateFilter} 
          reset={resetFilters} 
        />
        <button className="icon-button" onClick={loadAll}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </button>
        <button className="btn-secondary" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </header>
  );
}
