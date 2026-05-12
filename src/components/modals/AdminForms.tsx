import { useState, ReactNode } from "react";
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
