import React from "react";
import { Market, ResultRecord } from "@/lib/mockApi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import { Download } from "lucide-react";

const getChartDateRange = (baseDateStr: string) => {
  const baseDate = new Date(baseDateStr);
  const day = baseDate.getDay();
  // 0 = Sunday, 1 = Monday, etc.
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const currentWeekMonday = new Date(baseDate);
  currentWeekMonday.setDate(baseDate.getDate() + diffToMonday);

  const lastWeekMonday = new Date(currentWeekMonday);
  lastWeekMonday.setDate(currentWeekMonday.getDate() - 7);

  const dates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(lastWeekMonday);
    d.setDate(lastWeekMonday.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const generateTimeColumns = () => {
  const cols = [];
  let h = 11;
  let m = 0;
  for (let i = 0; i < 36; i++) {
    const hh12 = h > 12 ? h - 12 : h;
    const mmStr = m === 0 ? "00" : m;
    const ampm = h >= 12 && h < 24 ? "PM" : "AM";
    const displayTop = `${hh12}:${mmStr}`;
    const displayBottom = ampm;

    // Open time format in market is typically HH:mm in 24-hour
    const h24Str = String(h).padStart(2, "0");
    const timeStr = `${h24Str}:${mmStr}`;

    cols.push({ timeStr, displayTop, displayBottom });

    m += 15;
    if (m === 60) {
      m = 0;
      h++;
    }
  }
  return cols;
};

const formatDateLocal = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (d: Date) => {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${month}`;
};

function ChartExportTemplate({
  baseDateStr,
  markets,
  results,
}: {
  baseDateStr: string;
  markets: Market[];
  results: ResultRecord[];
}) {
  const dates = getChartDateRange(baseDateStr);
  const timeCols = generateTimeColumns();

  // Create a fast lookup map for results
  // Key: `${dateStr}_${timeStr}`
  const resultMap = new Map<string, ResultRecord>();

  // Map market id to its time
  const marketTimeMap = new Map<string, string>();
  for (const m of markets) {
    marketTimeMap.set(m.id, m.open_time);
  }

  for (const r of results) {
    const time = marketTimeMap.get(r.market_id);
    if (time) {
      resultMap.set(`${r.result_date}_${time}`, r);
    }
  }

  const today = new Date();
  const currentExportDateDisplay = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <div
      id="chart-export-container"
      style={{
        width: "1414px",
        height: "1000px",
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: "white",
        color: "black",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ border: "2px solid #000", padding: "4px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", borderBottom: "2px solid #000", height: "70px", flexShrink: 0 }}>
          <div style={{ width: "35%", borderRight: "2px solid #000", padding: "10px", textAlign: "center", boxSizing: "border-box" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "900", margin: "0", lineHeight: "1" }}>मिलन ३६ बाज़ार</h1>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: "8px 0 0 0", textAlign: "left" }}>दिनांक : {currentExportDateDisplay}</h2>
          </div>
          <div style={{ width: "65%", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
            <h1 style={{ fontSize: "42px", fontWeight: "900", margin: "0", letterSpacing: "2px" }}>MILAN 36 BAZAR</h1>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: "100%", height: "100%", borderCollapse: "collapse", tableLayout: "fixed", flexGrow: 1 }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #888", width: "50px", padding: "4px 0", fontSize: "12px", color: "red", backgroundColor: "#f9f9f9" }}>date</th>
              {timeCols.map((tc, idx) => (
                <th key={idx} style={{ border: "1px solid #888", padding: "4px 0", fontSize: "10px", textAlign: "center", color: "red", backgroundColor: "#f9f9f9", lineHeight: "1.2" }}>
                  <div>{tc.displayTop}</div>
                  <div>{tc.displayBottom}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((d, rowIdx) => {
              const dateStr = formatDateLocal(d);
              const isSunday = d.getDay() === 0;
              const displayColor = isSunday ? "red" : "black";

              return (
                <tr key={rowIdx}>
                  <td style={{ border: "1px solid #888", textAlign: "center", padding: "4px 0", color: displayColor, lineHeight: "1.2", fontSize: "12px", fontWeight: "bold" }}>
                    <div>{formatDisplayDate(d)}</div>
                  </td>
                  {timeCols.map((tc, colIdx) => {
                    const result = resultMap.get(`${dateStr}_${tc.timeStr}`);
                    const openPana = result?.open_pana || "***";
                    const openDigit = result?.open_digit !== undefined && result?.open_digit !== null ? result.open_digit : "*";

                    return (
                      <td key={colIdx} style={{ border: "1px solid #888", textAlign: "center", padding: "2px 0", lineHeight: "1.1" }}>
                        <div style={{ fontSize: "11px", fontWeight: "bold", color: "black", letterSpacing: "1px" }}>{openPana}</div>
                        <div style={{ fontSize: "11px", fontWeight: "bold", color: "black", marginTop: "2px" }}>{openDigit}</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const downloadChartPDF = async (
  baseDateStr: string,
  markets: Market[],
  results: ResultRecord[],
  onComplete?: () => void
) => {
  // Create a hidden container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const root = createRoot(container);

  root.render(<ChartExportTemplate baseDateStr={baseDateStr} markets={markets} results={results} />);

  // Give React time to render
  setTimeout(async () => {
    try {
      const element = document.getElementById("chart-export-container");
      if (!element) throw new Error("Chart container not found");

      const canvas = await html2canvas(element, {
        scale: 2, // higher resolution
        useCORS: true,
        width: 1414,
        height: 1000,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // A4 landscape is 297 x 210 mm
      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
      pdf.save("milan36-panel-chart.pdf");
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      root.unmount();
      document.body.removeChild(container);
      if (onComplete) onComplete();
    }
  }, 500);
};

export function ExportChartButton({
  date,
  markets,
  results,
}: {
  date: string;
  markets: Market[];
  results: ResultRecord[];
}) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = () => {
    setIsExporting(true);
    downloadChartPDF(date, markets, results, () => {
      setIsExporting(false);
    });
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="btn-primary"
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Export Chart PDF"}
    </button>
  );
}
