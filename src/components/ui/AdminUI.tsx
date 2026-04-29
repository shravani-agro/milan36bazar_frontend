import { ReactNode } from "react";
import { Activity, CalendarDays, Pencil, Trash2, Wallet } from "lucide-react";

export const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const shortDate = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const formatDate = (value: string) => (value ? shortDate.format(new Date(value)) : "—");

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="dashboard-panel overflow-hidden">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        {action && <div className="text-sm text-muted-foreground">{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function RowActions({ onEdit, onBalance, onDelete }: { onEdit: () => void; onBalance?: () => void; onDelete: () => void }) {
  return (
    <div className="row-actions">
      <button className="icon-button" onClick={onEdit} aria-label="Edit"><Pencil /></button>
      {onBalance && <button className="icon-button" onClick={onBalance} aria-label="Balance"><Wallet /></button>}
      <button className="icon-button danger-action" onClick={onDelete} aria-label="Delete"><Trash2 /></button>
    </div>
  );
}

export function Badge({ children, tone }: { children: ReactNode; tone: "success" | "danger" | "neutral" }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function Field(props: { name: string; label: string; type?: string; defaultValue?: string | number | null; required?: boolean; min?: string; max?: string }) {
  return (
    <label className="field-label">
      {props.label}
      <input 
        className="field-input" 
        name={props.name} 
        type={props.type ?? "text"} 
        defaultValue={props.defaultValue ?? ""} 
        required={props.required} 
        min={props.min} 
        max={props.max} 
        step={props.type === "number" ? "0.01" : undefined} 
      />
    </label>
  );
}

export function EmptyState() {
  return <div className="empty-state"><CalendarDays className="h-6 w-6" /> No records found</div>;
}

export function SimpleList({ items }: { items: { title: string; meta: string }[] }) {
  if (!items.length) return <EmptyState />;
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="list-row">
          <Activity className="h-4 w-4 text-primary" />
          <div>
            <p>{item.title}</p>
            <span>{item.meta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
