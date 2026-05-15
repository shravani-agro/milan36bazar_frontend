import { useState, useEffect, ReactNode } from "react";
import { AppUser, Market, ResultRecord } from "@/lib/mockApi";
import { Field, getToday } from "../ui/AdminUI";

const pannaList = ["000", "100", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "122", "123", "124", "125", "126", "127", "128", "129", "130", "133", "134", "135", "136", "137", "138", "139", "140", "144", "145", "146", "147", "148", "149", "150", "155", "156", "157", "158", "159", "160", "166", "167", "168", "169", "170", "177", "178", "179", "180", "188", "189", "190", "199", "200", "220", "222", "223", "224", "225", "226", "227", "228", "229", "230", "233", "234", "235", "236", "237", "238", "239", "240", "244", "245", "246", "247", "248", "249", "250", "255", "256", "257", "258", "259", "260", "266", "267", "268", "269", "270", "277", "278", "279", "280", "288", "289", "290", "299", "300", "330", "333", "334", "335", "336", "337", "338", "339", "340", "344", "345", "346", "347", "348", "349", "350", "355", "356", "357", "358", "359", "360", "366", "367", "368", "369", "370", "377", "378", "379", "380", "388", "389", "390", "399", "400", "440", "444", "445", "446", "447", "448", "449", "450", "455", "456", "457", "458", "459", "460", "466", "467", "468", "469", "470", "477", "478", "479", "480", "488", "489", "490", "499", "500", "550", "555", "556", "557", "558", "559", "560", "566", "567", "568", "569", "570", "577", "578", "579", "580", "588", "589", "590", "599", "600", "660", "666", "667", "668", "669", "670", "677", "678", "679", "680", "688", "689", "690", "699", "700", "770", "777", "778", "779", "780", "788", "789", "790", "799", "800", "880", "888", "889", "890", "899", "900", "990", "999"];

export function UserSelect({ users, defaultValue }: { users: AppUser[]; defaultValue?: string }) {
  return (
    <label className="field-label">
      User
      <select className="field-input" name="app_user_id" defaultValue={defaultValue ?? ""} required>
        <option value="" disabled>Select user</option>
        {users.map((user) => <option key={user.id} value={user.id}>{user.name} • {user.phone}</option>)}
      </select>
    </label>
  );
}

export function UserMultiSelect({ users, selectedIds = [] }: { users: AppUser[]; selectedIds?: string[] }) {
  const [selected, setSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    setSelected(selectedIds);
  }, [selectedIds]);
  
  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === users.length) {
      setSelected([]);
    } else {
      setSelected(users.map(u => String(u.id)));
    }
  };

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="field-label mb-0">Assign Users (these will show in sub-admin's commission report)</label>
        <button 
          type="button" 
          onClick={toggleAll}
          className="text-xs font-medium text-primary hover:underline px-2 py-1 rounded hover:bg-primary/10 transition-colors"
        >
          {selected.length === users.length ? "Deselect All" : "Select All"}
        </button>
      </div>
      <input type="hidden" name="assigned_user_ids" value={selected.join(",")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-3 border border-border rounded-md bg-muted/20">
        {users.map((user) => (
          <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={selected.includes(String(user.id))} 
              onChange={() => toggle(String(user.id))}
              className="w-4 h-4 accent-primary"
            />
            <div className="text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.phone}</p>
            </div>
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{selected.length} users selected</p>
    </div>
  );
}

export function MarketSelect({ markets, defaultValue }: { markets: Market[]; defaultValue?: string }) {
  return (
    <label className="field-label">
      Market
      <select className="field-input" name="market_id" defaultValue={defaultValue ?? ""} required>
        <option value="" disabled>Select market</option>
        {markets.map((market) => <option key={market.id} value={market.id}>{market.market_name}</option>)}
      </select>
    </label>
  );
}

export function ResultFormFields({ markets, item }: { markets: Market[]; item?: ResultRecord }) {
  const [pana, setPana] = useState(item?.open_pana || "100");
  const calculateDigit = (p: string) => {
    const sum = p.split("").reduce((acc, digit) => acc + Number(digit), 0);
    return sum % 10;
  };
  const [digit, setDigit] = useState(item?.open_digit ?? calculateDigit(pana));

  const handlePanaChange = (newPana: string) => {
    setPana(newPana);
    setDigit(calculateDigit(newPana));
  };

  return (
    <>
      <MarketSelect markets={markets} defaultValue={item?.market_id} />
      <Field name="result_date" label="Date" type="date" defaultValue={item?.result_date ?? getToday()} required />
      <label className="field-label">
        Open Pana
        <select className="field-input" name="open_pana" value={pana} onChange={(e) => handlePanaChange(e.target.value)} required>
          {pannaList.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <label className="field-label">
        Open Digit
        <input className="field-input bg-muted/30 font-bold" name="open_digit" type="number" value={digit} readOnly required />
      </label>
    </>
  );
}

export function PermissionSelect({ item }: { item?: any }) {
  const [perms, setPerms] = useState({
    can_add_result: item?.can_add_result ?? true,
    can_update_result: item?.can_update_result ?? true,
    can_delete_result: item?.can_delete_result ?? true,
    show_commission: item?.show_commission ?? true,
    show_bid_data: item?.show_bid_data ?? true,
    show_result: item?.show_result ?? true,
  });

  const toggle = (key: string) => {
    setPerms((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const labels: Record<string, string> = {
    can_add_result: "Add Result",
    can_update_result: "Update Result",
    can_delete_result: "Delete Result",
    show_commission: "Show Commission",
    show_bid_data: "Show Bid Data",
    show_result: "Show Results Section",
  };

  return (
    <div className="md:col-span-2 border-t border-border pt-4 mt-2">
      <label className="field-label mb-3 text-primary font-bold">Sub-Admin Permissions</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(labels).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors border border-border/50 bg-muted/10">
            <input 
              type="checkbox" 
              name={key}
              checked={!!perms[key as keyof typeof perms]} 
              onChange={() => toggle(key)}
              className="w-4 h-4 accent-primary"
              value="true"
            />
            <span className="text-sm font-medium">{label}</span>
            <input type="hidden" name={`${key}_hidden`} value={perms[key as keyof typeof perms] ? "true" : "false"} />
          </label>
        ))}
      </div>
    </div>
  );
}

export function EntityForm({ fields, busy, onSubmit }: { fields: ReactNode; busy: boolean; onSubmit: (form: FormData) => void | Promise<void> }) {
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void onSubmit(new FormData(event.currentTarget)); }}>
      {fields}
      <div className="flex justify-end md:col-span-2">
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
