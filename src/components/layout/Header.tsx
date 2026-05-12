import { Menu, RefreshCw, LogOut } from "lucide-react";
import { GlobalFilters } from "./GlobalFilters";
import { Market } from "@/lib/mockApi";
import { realApi } from "@/lib/api";

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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 lg:px-6 lg:min-h-[4rem]">
        <div className="flex flex-1 items-center gap-2 lg:flex-none lg:mr-4">
          <button 
            className="icon-button lg:hidden" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Menu"
          >
            <Menu />
          </button>
          
          <div className="min-w-0">
            <p className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
              Dashboard
            </p>
            <h1 className="truncate text-lg font-bold md:text-xl">
              {navItems.find((item: any) => item.id === section)?.label}
            </h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 order-3 w-full lg:order-none lg:w-auto">
          <GlobalFilters 
            filters={filters} 
            markets={markets} 
            section={section} 
            updateFilter={updateFilter} 
            reset={resetFilters} 
          />
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 order-2 lg:order-none ml-auto">
          <div className="h-6 w-[1px] bg-border mx-1 hidden lg:block" />

          <button 
            className="btn-secondary h-9 px-3 sm:px-4 text-primary border-primary/20 hover:bg-primary/5" 
            onClick={async () => {
              const token = prompt("Enter FCM Token for direct test (leave empty for Topic test):");
              const { data, error } = await realApi.db.testNotification(token || undefined);
              if (error) {
                // Check if it's the specific serviceAccountKey error
                const msg = error.message || "Failed to send test notification";
                if (msg.includes("serviceAccountKey.json")) {
                  alert("ERROR: Notification failed because 'serviceAccountKey.json' is missing in the backend folder.");
                } else {
                  alert(msg);
                }
              } else if (data?.status === "error") {
                alert(data.message);
              } else {
                alert("Test notification sent successfully!");
              }
            }} 
            title="Test Push Notification"
          >
            <span className="hidden sm:inline">Test Push</span>
            <span className="sm:hidden">Test</span>
          </button>

          <button className="icon-button" onClick={loadAll} title="Refresh Data">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          
          <button className="btn-secondary h-9 px-3 sm:px-4" onClick={handleLogout} title="Logout">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
