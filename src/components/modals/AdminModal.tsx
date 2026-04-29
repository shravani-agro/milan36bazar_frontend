import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { mockApi, AppUser, Market, WithdrawDetail, ResultRecord, WinHistory } from "@/lib/mockApi";
import { Field } from "../ui/AdminUI";
import { EntityForm, UserSelect, MarketSelect, ResultFormFields } from "./AdminForms";

export type ModalState =
  | { kind: "user"; mode: "create" | "edit"; item?: AppUser }
  | { kind: "balance"; item: AppUser }
  | { kind: "withdraw"; mode: "create" | "edit"; item?: WithdrawDetail }
  | { kind: "market"; mode: "create" | "edit"; item?: Market }
  | { kind: "result"; mode: "create" | "edit"; item?: ResultRecord }
  | { kind: "win"; mode: "create"; item?: WinHistory }
  | null;

const today = new Date().toISOString().slice(0, 10);

function formText(form: FormData, key: string) { return String(form.get(key) ?? "").trim(); }
function optional(value: string) { return value.trim() ? value.trim() : null; }
function selectedUserName(form: FormData, users: AppUser[]) { return formText(form, "user_name") || users.find((user) => user.id === formText(form, "app_user_id"))?.name || "Unknown User"; }

export function AdminModal({ modal, users, markets, onClose, onSaved }: { modal: Exclude<ModalState, null>; users: AppUser[]; markets: Market[]; onClose: () => void; onSaved: () => void }) {
  const [busy, setBusy] = useState(false);

  async function submit(table: string, payload: Record<string, unknown>, id?: string) {
    setBusy(true);
    const { error } = id ? await mockApi.db.update(table as any, id, payload) : await mockApi.db.insert(table as any, payload);
    setBusy(false);
    if (error) toast.error("Save failed");
    else { toast.success("Saved successfully."); onSaved(); }
  }

  async function submitBalance(form: FormData, item: AppUser) {
    const type = String(form.get("transaction_type"));
    const amount = Number(form.get("amount"));
    const reason = String(form.get("reason") || "Admin adjustment");
    if (!amount || amount <= 0) { toast.error("Enter a valid amount."); return; }
    const after = ["deduct", "withdraw", "bid"].includes(type) ? item.balance - amount : item.balance + amount;
    if (after < 0) { toast.error("Insufficient balance."); return; }
    setBusy(true);

    const { error: updateError } = await mockApi.db.update("app_users", item.id, { balance: after });
    if (updateError) { setBusy(false); toast.error("Update failed"); return; }

    const { error: trxError } = await mockApi.db.insert("balance_transactions", {
      app_user_id: item.id, transaction_type: type, amount, reason, balance_before: item.balance, balance_after: after
    });

    setBusy(false);
    if (trxError) toast.error("Transaction log failed");
    else { toast.success("Balance updated."); onSaved(); }
  }

  async function submitUser(form: FormData, id?: string) {
    const password = formText(form, "password");
    const confirmPassword = formText(form, "confirm_password");
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    await submit("app_users", { 
      name: formText(form, "name"), phone: formText(form, "phone"), password: password,
      balance: Number(form.get("balance") || 0), total_game_amount: Number(form.get("total_game_amount") || 0), 
      total_won: Number(form.get("total_won") || 0), total_withdraw: Number(form.get("total_withdraw") || 0), 
      total_bonus: Number(form.get("total_bonus") || 0), status: formText(form, "status") 
    }, id);
  }

  const title = modal.kind === "balance" ? `Balance: ${modal.item.name}` : `${modal.mode === "create" ? "Create" : "Update"} ${modal.kind}`;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="dashboard-panel modal-card p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold capitalize">{title}</h2><button className="icon-button" onClick={onClose}><X /></button></div>
        {modal.kind === "user" && <EntityForm busy={busy} onSubmit={(form) => submitUser(form, modal.item?.id)} fields={<><Field name="name" label="Name" defaultValue={modal.item?.name} required /><Field name="phone" label="Phone" defaultValue={modal.item?.phone} required /><Field name="password" label="Password" type="password" defaultValue={modal.item?.password} required={modal.mode === "create"} /><Field name="confirm_password" label="Confirm Password" type="password" required={modal.mode === "create"} /><label className="field-label">Status<select name="status" className="field-input" defaultValue={modal.item?.status ?? "unblocked"}><option value="unblocked">Unblocked</option><option value="blocked">Blocked</option></select></label></>} />}
        {modal.kind === "balance" && <EntityForm busy={busy} onSubmit={(form) => submitBalance(form, modal.item)} fields={<><label className="field-label">Action<select className="field-input" name="transaction_type" defaultValue="add"><option value="add">Add Balance</option><option value="deduct">Deduct Balance</option><option value="deposit">Deposit</option><option value="withdraw">Withdraw</option><option value="bonus">Bonus</option><option value="win">Win</option><option value="bid">Bid</option></select></label><Field name="amount" label="Amount" type="number" required /><Field name="reason" label="Reason" defaultValue="Admin adjustment" /></>} />}
        {modal.kind === "withdraw" && <EntityForm busy={busy} onSubmit={(form) => submit("withdraw_details", { app_user_id: optional(formText(form, "app_user_id")), user_name: selectedUserName(form, users), account_holder_name: formText(form, "account_holder_name"), upi_name: optional(formText(form, "upi_name")), account_number: formText(form, "account_number"), ifsc_code: formText(form, "ifsc_code").toUpperCase(), upi_id: optional(formText(form, "upi_id")) }, modal.item?.id)} fields={<><UserSelect users={users} defaultValue={modal.item?.app_user_id || ""} /><Field name="user_name" label="User Name" defaultValue={modal.item?.user_name} required /><Field name="account_holder_name" label="Account Holder Name" defaultValue={modal.item?.account_holder_name} required /><Field name="upi_name" label="UPI Name" defaultValue={modal.item?.upi_name || ""} /><Field name="account_number" label="Account Number" defaultValue={modal.item?.account_number} required /><Field name="ifsc_code" label="IFSC Code" defaultValue={modal.item?.ifsc_code} required /><Field name="upi_id" label="UPI ID" defaultValue={modal.item?.upi_id || ""} /></>} />}
        {modal.kind === "market" && <EntityForm busy={busy} onSubmit={(form) => submit("markets", { market_name: formText(form, "market_name"), status: formText(form, "status"), open_time: formText(form, "open_time") }, modal.item?.id)} fields={<><Field name="market_name" label="Name" defaultValue={modal.item?.market_name} required /><Field name="open_time" label="Open Time" type="time" defaultValue={modal.item?.open_time} required /><label className="field-label">Status<select name="status" className="field-input" defaultValue={modal.item?.status ?? "closed"}><option value="open">Open</option><option value="closed">Closed</option></select></label></>} />}
        {modal.kind === "result" && <EntityForm busy={busy} onSubmit={(form) => submit("results", { result_date: formText(form, "result_date"), market_id: formText(form, "market_id"), open_pana: formText(form, "open_pana"), open_digit: Number(form.get("open_digit")) }, modal.item?.id)} fields={<ResultFormFields markets={markets} item={modal.item} />} />}
      </div>
    </div>
  );
}
