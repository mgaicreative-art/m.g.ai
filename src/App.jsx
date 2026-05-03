import { useState, useEffect, useRef, useCallback } from "react";

const theme = {
  bg: "#0D1B2A", surface: "#1A2B3C", card: "#1E3148", accent: "#00C896",
  gold: "#F5C842", red: "#FF5252", orange: "#FF9800", blue: "#4FC3F7",
  text: "#FFFFFF", textMuted: "#8BA4BC", textDim: "#5A7A90", border: "#2A3F55",
};

const s = {
  app: { fontFamily: "'Assistant','Heebo','Arial Hebrew',sans-serif", direction: "rtl", background: theme.bg, color: theme.text, minHeight: "100vh", maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column" },
  header: { background: theme.surface, borderBottom: `1px solid ${theme.border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
  scroll: { flex: 1, overflowY: "auto", paddingBottom: 80 },
  navBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: theme.surface, borderTop: `1px solid ${theme.border}`, display: "flex", zIndex: 20 },
  navItem: (a) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 2px 7px", gap: 2, cursor: "pointer", color: a ? theme.accent : theme.textDim, fontSize: 9, fontWeight: a ? 700 : 400, borderTop: a ? `2px solid ${theme.accent}` : "2px solid transparent" }),
  card: { background: theme.card, borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: `1px solid ${theme.border}` },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 },
  stat: { background: theme.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${theme.border}` },
  statLabel: { fontSize: 11, color: theme.textMuted, marginBottom: 3 },
  badge: (c) => ({ display: "inline-flex", alignItems: "center", background: c + "22", color: c, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }),
  btn: (v = "primary") => ({ background: v === "primary" ? theme.accent : v === "outline" ? "transparent" : theme.surface, color: v === "primary" ? "#fff" : v === "outline" ? theme.accent : theme.text, border: v === "outline" ? `1px solid ${theme.accent}` : "none", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }),
  input: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 14, width: "100%", outline: "none" },
  sectionTitle: { fontSize: 12, color: theme.textMuted, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" },
  chip: (a) => ({ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", background: a ? theme.accent : theme.surface, color: a ? "#fff" : theme.textMuted, border: a ? "none" : `1px solid ${theme.border}`, flexShrink: 0, whiteSpace: "nowrap" }),
};

const PRODUCTS = [
  { id: 1, name: "חלב תנובה 3%", cat: "חלב", price: 6.30, cost: 4.20, stock: 24, min: 10, emoji: "🥛", barcode: "7290001234567", supplier: "תנובה" },
  { id: 2, name: "קוטג' תנובה 5%", cat: "חלב", price: 7.20, cost: 4.80, stock: 18, min: 8, emoji: "🧀", barcode: "7290001234568", supplier: "תנובה" },
  { id: 3, name: "יוגורט דנונה", cat: "חלב", price: 4.50, cost: 3.00, stock: 12, min: 6, emoji: "🍶", barcode: "7290001234569", supplier: "דנונה" },
  { id: 4, name: "לחם אחיד", cat: "לחם", price: 6.80, cost: 4.50, stock: 8, min: 10, emoji: "🍞", barcode: "7290001234570", supplier: "אנגל" },
  { id: 5, name: "גבינה לבנה", cat: "חלב", price: 9.90, cost: 5.60, stock: 15, min: 5, emoji: "🧀", barcode: "7290001234571", supplier: "תנובה" },
  { id: 6, name: "ביצים L", cat: "ביצים", price: 16.90, cost: 11.00, stock: 30, min: 12, emoji: "🥚", barcode: "7290001234572", supplier: "גל" },
  { id: 7, name: "שמן זית", cat: "שמנים", price: 28.90, cost: 18.00, stock: 3, min: 6, emoji: "🫒", barcode: "7290001234573", supplier: "יד מרדכי" },
  { id: 8, name: "פסטה ברילה", cat: "יבש", price: 9.50, cost: 5.80, stock: 22, min: 8, emoji: "🍝", barcode: "7290001234574", supplier: "דיפלומט" },
  { id: 9, name: "אורז בסמטי", cat: "יבש", price: 14.90, cost: 9.00, stock: 11, min: 6, emoji: "🍚", barcode: "7290001234575", supplier: "מחסני השוק" },
  { id: 10, name: "עגבניות שרי", cat: "ירקות", price: 12.90, cost: 7.50, stock: 5, min: 8, emoji: "🍅", barcode: "7290001234576", supplier: "שוק הכרמל" },
];

function buildTodaySales() {
  const now = new Date();
  const hour = now.getHours();
  const vol = [0,0,0,0,0,0,0,3,12,22,28,32,30,26,20,24,30,38,42,28,18,10,4,1];
  const sales = [];
  for (let h = 7; h <= Math.min(hour, 22); h++) {
    const txns = Math.round(vol[h] * (0.6 + Math.random() * 0.8));
    for (let t = 0; t < txns; t++) {
      const p = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      sales.push({ time: `${String(h).padStart(2,"0")}:${String(Math.floor(Math.random()*60)).padStart(2,"0")}`, product: p, qty, revenue: p.price * qty, profit: (p.price - p.cost) * qty });
    }
  }
  return sales;
}

function buildHistory() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const rev = 2800 + Math.random() * 3200;
    const cost = rev * (0.61 + Math.random() * 0.07);
    return { date: d, revenue: rev, cost, profit: rev - cost, txns: Math.round(75 + Math.random() * 90), day: ["א","ב","ג","ד","ה","ו","ש"][d.getDay()] };
  });
}

function Icon({ name, size = 20 }) {
  const P = {
    home: "M3,12 L12,3 L21,12 L21,21 L15,21 L15,15 L9,15 L9,21 L3,21 Z",
    package: "M21,8L12,3L3,8L3,17L12,22L21,17Z M3,8L12,13L21,8 M12,13L12,22",
    live: "M12,12m-3,0a3,3 0 1,0 6,0a3,3 0 1,0-6,0 M5,12a7,7 0 1,0 14,0a7,7 0 1,0-14,0 M1.5,12a10.5,10.5 0 1,0 21,0a10.5,10.5 0 1,0-21,0",
    chart: "M3,20L3,4 M3,20L21,20 M7,14L7,20 M11,10L11,20 M15,6L15,20 M19,12L19,20",
    scan: "M3,7L3,4L6,4 M17,4L20,4L20,7 M20,17L20,20L17,20 M6,20L3,20L3,17 M7,9L7,15 M10,7L10,17 M13,9L13,15 M16,8L16,16",
    barcode: "M4,3L4,21 M8,3L8,21 M12,3L12,21 M15,3L15,21 M18,3L18,21",
    receipt: "M4,2L20,2L20,22L16,20L12,22L8,20L4,22Z M8,10L16,10 M8,14L13,14",
    camera: "M23,19C23,20.1 22.1,21 21,21L3,21C1.9,21 1,20.1 1,19L1,8C1,6.9 1.9,6 3,6L7,6L9,3L15,3L17,6L21,6C22.1,6 23,6.9 23,8Z M12,17C14.2,17 16,15.2 16,13C16,10.8 14.2,9 12,9C9.8,9 8,10.8 8,13C8,15.2 9.8,17 12,17",
    download: "M21,15L21,19C21,20.1 20.1,21 19,21L5,21C3.9,21 3,20.1 3,19L3,15 M7,10L12,15L17,10 M12,15L12,3",
    send: "M22,2L11,13 M22,2L15,22L11,13L2,9L22,2",
    ai: "M12,2C13.1,2 14,2.9 14,4L14,5C16.76,5.9 18.74,8.46 18.74,11.5C18.74,15.09 15.84,18 12.25,18L12,18C8.41,18 5.5,15.09 5.5,11.5C5.5,8.46 7.48,5.9 10,5L10,4C10,2.9 10.9,2 12,2Z M12,18L12,22 M8,22L16,22",
    search: "M10,10m-7,0a7,7 0 1,0 14,0a7,7 0 1,0-14,0 M21,21L15,15",
    back: "M19,12L5,12 M12,19L5,12L12,5",
    plus: "M12,5L12,19 M5,12L19,12",
    refresh: "M23,4L23,10L17,10 M1,14L7,14L1,20 M20.49,9C19.1,5.9 16,3.9 12.4,3.9C7.7,3.9 3.9,7.7 3.9,12.4C3.9,14.6 4.8,16.7 6.2,18.2 M3.51,15C4.91,18.1 8,20.1 11.6,20.1C16.3,20.1 20.1,16.3 20.1,11.6",
    users: "M17,21C17,19 14.76,17 12,17C9.24,17 7,19 7,21 M12,14C13.66,14 15,12.66 15,11C15,9.34 13.66,8 12,8C10.34,8 9,9.34 9,11C9,12.66 10.34,14 12,14",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={P[name]||P.home} /></svg>;
}

function PulsingDot({ color = theme.accent, size = 10 }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "pdot 2s infinite" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
      <style>{`@keyframes pdot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(2.4);opacity:0}}`}</style>
    </div>
  );
}

function BarChart({ data, color = theme.accent, height = 80 }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", background: d.highlight ? color : color + "40", borderRadius: "3px 3px 0 0", height: `${Math.max((d.v / max) * 100, 2)}%`, transition: "height 0.8s ease" }} />
          </div>
          {d.label && <span style={{ fontSize: 9, color: theme.textMuted }}>{d.label}</span>}
        </div>
      ))}
    </div>
  );
}

function DonutChart({ pct, color = theme.accent, size = 80, label, sublabel }) {
  const r = 34, cx = 45, cy = 45, circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox="0 0 90 90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.border} strokeWidth="8" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x={cx} y={cy - 3} textAnchor="middle" fill={color} fontSize="13" fontWeight="700">{Math.round(pct)}%</text>
        {sublabel && <text x={cx} y={cy + 11} textAnchor="middle" fill={theme.textMuted} fontSize="8">{sublabel}</text>}
      </svg>
      {label && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{label}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// LIVE POS DASHBOARD
// ══════════════════════════════════════════════════════════════════
function LivePOS() {
  const [sales, setSales] = useState(() => buildTodaySales());
  const [liveLog, setLiveLog] = useState([]);
  const [lastSec, setLastSec] = useState(new Date());
  const [connected, setConnected] = useState(true);
  const [showEOD, setShowEOD] = useState(false);
  const TARGET = 6000;

  // Simulate incoming sales every 10–20 seconds
  useEffect(() => {
    if (!connected) return;
    const t = setTimeout(() => {
      const p = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const sale = { time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }), product: p, qty, revenue: p.price * qty, profit: (p.price - p.cost) * qty };
      setSales(prev => [...prev, sale]);
      setLiveLog(prev => [sale, ...prev].slice(0, 10));
      setLastSec(new Date());
    }, 10000 + Math.random() * 10000);
    return () => clearTimeout(t);
  }, [sales, connected]);

  const rev = sales.reduce((s, t) => s + t.revenue, 0);
  const profit = sales.reduce((s, t) => s + t.profit, 0);
  const txns = Math.round(sales.length * 0.65);
  const margin = rev > 0 ? (profit / rev) * 100 : 0;
  const avgBasket = txns > 0 ? rev / txns : 0;

  // Hourly chart (7–22)
  const chartHours = Array.from({ length: 16 }, (_, i) => {
    const h = i + 7;
    const v = sales.filter(s => parseInt(s.time) === h).reduce((sum, s) => sum + s.revenue, 0);
    return { v, label: h % 3 === 0 ? `${h}` : "", highlight: h === new Date().getHours() };
  });

  // Top products today
  const prodMap = {};
  sales.forEach(s => {
    if (!prodMap[s.product.id]) prodMap[s.product.id] = { ...s.product, units: 0, rev: 0, profit: 0 };
    prodMap[s.product.id].units += s.qty;
    prodMap[s.product.id].rev += s.revenue;
    prodMap[s.product.id].profit += s.profit;
  });
  const topProds = Object.values(prodMap).sort((a, b) => b.rev - a.rev).slice(0, 5);

  const todayStr = new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });

  if (showEOD) return <EODReport sales={sales} onClose={() => setShowEOD(false)} />;

  return (
    <div style={{ padding: 14 }}>
      {/* Status bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PulsingDot color={connected ? theme.accent : theme.red} />
          <span style={{ fontSize: 12, fontWeight: 700, color: connected ? theme.accent : theme.red }}>{connected ? "קופה מחוברת" : "מנותק"}</span>
          <span style={{ fontSize: 11, color: theme.textMuted }}>• {lastSec.toLocaleTimeString("he-IL")}</span>
        </div>
        <button onClick={() => setConnected(c => !c)} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textMuted, cursor: "pointer", fontSize: 11, padding: "3px 10px" }}>
          {connected ? "נתק" : "חבר"}
        </button>
      </div>

      {/* Hero */}
      <div style={{ ...s.card, background: "linear-gradient(135deg,#0F6E56 0%,#1A2B3C 100%)", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#9FE1CB", marginBottom: 2 }}>{todayStr}</div>
        <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>₪{rev.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        <div style={{ fontSize: 13, color: "#9FE1CB", marginBottom: 12 }}>מכירות עד עכשיו</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: "#9FE1CB", marginBottom: 4 }}>יעד יומי ₪{TARGET.toLocaleString()}</div>
            <div style={{ height: 8, width: 160, background: "rgba(255,255,255,0.15)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((rev / TARGET) * 100, 100)}%`, background: theme.accent, borderRadius: 4, transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "#9FE1CB", marginTop: 3 }}>{Math.round((rev / TARGET) * 100)}% הושג</div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: theme.gold }}>{txns}</div>
            <div style={{ fontSize: 11, color: "#9FE1CB" }}>עסקאות</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={s.grid3}>
        {[["רווח גולמי", `₪${profit.toFixed(0)}`, theme.accent], ["מרג'ין", `${margin.toFixed(1)}%`, margin > 28 ? theme.accent : theme.orange], ["סל ממוצע", `₪${avgBasket.toFixed(0)}`, theme.text]].map(([l, v, c]) => (
          <div key={l} style={s.stat}>
            <div style={s.statLabel}>{l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Donuts */}
      <div style={s.card}>
        <div style={{ ...s.sectionTitle, marginBottom: 12 }}>יעדים יומיים</div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <DonutChart pct={(rev / TARGET) * 100} color={theme.accent} size={85} label="הכנסות" sublabel="יעד" />
          <DonutChart pct={(profit / (TARGET * 0.33)) * 100} color={theme.gold} size={85} label="רווח" sublabel="יעד" />
          <DonutChart pct={(txns / 160) * 100} color={theme.blue} size={85} label="עסקאות" sublabel="יעד" />
        </div>
      </div>

      {/* Hourly chart */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={s.sectionTitle}>מכירות לפי שעה</div>
          <span style={s.badge(theme.accent)}>היום</span>
        </div>
        <BarChart data={chartHours} height={80} />
      </div>

      {/* Live feed */}
      <div style={s.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <PulsingDot />
          <div style={s.sectionTitle}>מכירות בזמן אמת</div>
        </div>
        {liveLog.length === 0 ? (
          <div style={{ textAlign: "center", color: theme.textDim, fontSize: 13, padding: "16px 0" }}>ממתין לעסקאות חדשות...</div>
        ) : liveLog.map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${theme.border}`, opacity: Math.max(1 - i * 0.09, 0.3) }}>
            <span style={{ fontSize: 20 }}>{e.product.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{e.product.name}</div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>×{e.qty} • {e.time}</div>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? theme.accent : theme.text }}>₪{e.revenue.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: theme.accent }}>+₪{e.profit.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Top products */}
      <div style={s.card}>
        <div style={{ ...s.sectionTitle, marginBottom: 10 }}>מוצרים מובילים היום</div>
        {topProds.map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: [theme.gold, theme.textDim, "#CD7F32"][Math.min(i, 2)] + "33", border: `1px solid ${[theme.gold, theme.textDim, "#CD7F32"][Math.min(i, 2)]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: [theme.gold, theme.textDim, "#CD7F32"][Math.min(i, 2)], flexShrink: 0 }}>{i + 1}</div>
            <span style={{ fontSize: 18 }}>{p.emoji}</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: theme.textMuted }}>{p.units} יח'</div></div>
            <div style={{ textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 700 }}>₪{p.rev.toFixed(0)}</div><div style={{ fontSize: 11, color: theme.accent }}>+₪{p.profit.toFixed(0)}</div></div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowEOD(true)} style={{ ...s.btn("outline"), width: "100%", marginTop: 4 }}>
        <Icon name="download" size={16} /> הפק דוח סוף יום
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// END OF DAY REPORT
// ══════════════════════════════════════════════════════════════════
function EODReport({ sales, onClose }) {
  const rev = sales.reduce((s, t) => s + t.revenue, 0);
  const profit = sales.reduce((s, t) => s + t.profit, 0);
  const txns = Math.round(sales.length * 0.65);
  const margin = rev > 0 ? (profit / rev) * 100 : 0;

  const prodMap = {};
  sales.forEach(s => {
    if (!prodMap[s.product.id]) prodMap[s.product.id] = { ...s.product, units: 0, rev: 0, profit: 0 };
    prodMap[s.product.id].units += s.qty;
    prodMap[s.product.id].rev += s.revenue;
    prodMap[s.product.id].profit += s.profit;
  });
  const prods = Object.values(prodMap).sort((a, b) => b.rev - a.rev);
  const today = new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ padding: 14 }}>
      <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 16 }}>
        <Icon name="back" size={16} /> חזרה לקופה חיה
      </button>

      <div style={{ ...s.card, background: "#0A1F30", textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>דוח סוף יום</div>
        <div style={{ fontSize: 13, color: theme.textMuted }}>{today}</div>
        <div style={{ ...s.badge(theme.accent), margin: "10px auto 0", display: "inline-flex" }}>מתאפס אוטומטית ב-00:00</div>
      </div>

      <div style={{ ...s.card, background: "#0F2A1E" }}>
        <div style={{ ...s.sectionTitle, marginBottom: 12 }}>סיכום יומי</div>
        {[
          ["סה\"כ הכנסות", `₪${rev.toFixed(2)}`, theme.accent],
          ["עלות סחורה", `₪${(rev - profit).toFixed(2)}`, theme.red],
          ["רווח גולמי", `₪${profit.toFixed(2)}`, theme.accent],
          ["מרג'ין", `${margin.toFixed(1)}%`, margin > 30 ? theme.accent : theme.orange],
          ["עסקאות", txns.toString(), theme.text],
          ["ממוצע לעסקה", `₪${txns > 0 ? (rev / txns).toFixed(2) : "0"}`, theme.text],
        ].map(([l, v, c]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: 13, color: theme.textMuted }}>{l}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={{ ...s.sectionTitle, marginBottom: 10 }}>מוצרים — פירוט</div>
        {prods.map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: 12, color: theme.textDim, width: 18, fontWeight: 700 }}>#{i + 1}</span>
            <span style={{ fontSize: 17 }}>{p.emoji}</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: theme.textMuted }}>{p.units} יח'</div></div>
            <div style={{ textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 700 }}>₪{p.rev.toFixed(0)}</div><div style={{ fontSize: 11, color: theme.accent }}>+₪{p.profit.toFixed(0)}</div></div>
          </div>
        ))}
      </div>

      <div style={{ ...s.card, background: "#1A1A2E", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: theme.textMuted }}>✓ הדוח נשמר אוטומטית</div>
        <div style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>מחר ב-00:00 הנתונים יתאפסו</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// REPORTS SCREEN
// ══════════════════════════════════════════════════════════════════
function Reports() {
  const [period, setPeriod] = useState("שבוע");
  const [tab, setTab] = useState("מכירות");
  const history = useRef(buildHistory()).current;

  const days = period === "יום" ? 1 : period === "שבוע" ? 7 : 30;
  const slice = history.slice(-days);
  const prev = history.slice(-days * 2, -days);

  const rev = slice.reduce((s, d) => s + d.revenue, 0);
  const profit = slice.reduce((s, d) => s + d.profit, 0);
  const txns = slice.reduce((s, d) => s + d.txns, 0);
  const margin = rev > 0 ? (profit / rev) * 100 : 0;
  const prevRev = prev.reduce((s, d) => s + d.revenue, 0);
  const change = prevRev > 0 ? ((rev - prevRev) / prevRev) * 100 : 0;
  const avgDaily = days > 0 ? rev / days : 0;

  const chartData = slice.map((d, i) => ({
    v: tab === "רווח" ? d.profit : d.revenue,
    label: days <= 7 ? d.day : (i % 7 === 0 ? `${d.date.getDate()}` : ""),
    highlight: i === slice.length - 1,
  }));

  const cats = [
    { name: "חלב ומוצרי חלב", pct: 38, color: theme.blue },
    { name: "לחמים ומאפים", pct: 22, color: theme.accent },
    { name: "ירקות ופירות", pct: 18, color: "#4CAF50" },
    { name: "שמנים ויבש", pct: 14, color: theme.gold },
    { name: "אחר", pct: 8, color: theme.textMuted },
  ];

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["יום", "שבוע", "חודש"].map(p => <div key={p} style={s.chip(p === period)} onClick={() => setPeriod(p)}>{p}</div>)}
      </div>

      <div style={s.grid2}>
        <div style={s.stat}>
          <div style={s.statLabel}>הכנסות</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.accent }}>₪{Math.round(rev).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: change >= 0 ? theme.accent : theme.red, marginTop: 3 }}>{change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}% לעומת קודם</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>רווח גולמי</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.gold }}>₪{Math.round(profit).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 3 }}>מרג'ין {margin.toFixed(1)}%</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>עסקאות</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{txns.toLocaleString()}</div>
        </div>
        <div style={s.stat}>
          <div style={s.statLabel}>ממוצע יומי</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>₪{Math.round(avgDaily).toLocaleString()}</div>
        </div>
      </div>

      {/* Chart */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["מכירות", "רווח"].map(t => <div key={t} style={s.chip(t === tab)} onClick={() => setTab(t)}>{t}</div>)}
          </div>
          <span style={{ fontSize: 12, color: theme.textMuted }}>{period} אחרון</span>
        </div>
        <BarChart data={chartData} height={90} color={tab === "רווח" ? theme.gold : theme.accent} />
      </div>

      {/* Category breakdown */}
      <div style={s.card}>
        <div style={{ ...s.sectionTitle, marginBottom: 12 }}>פילוח לפי קטגוריה</div>
        {cats.map(c => (
          <div key={c.name} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 13 }}>{c.name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.pct}%</span>
            </div>
            <div style={{ height: 6, background: theme.surface, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Daily table */}
      <div style={s.card}>
        <div style={{ ...s.sectionTitle, marginBottom: 10 }}>פירוט יומי</div>
        <div style={{ display: "flex", padding: "4px 0 8px", borderBottom: `1px solid ${theme.border}` }}>
          {["תאריך", "הכנסות", "רווח", "עסקאות"].map((h, i) => <span key={h} style={{ flex: 1, fontSize: 11, color: theme.textDim, fontWeight: 600, textAlign: i > 0 ? "left" : "right" }}>{h}</span>)}
        </div>
        {slice.slice(-10).reverse().map((d, i) => (
          <div key={i} style={{ display: "flex", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
            <span style={{ flex: 1, fontSize: 12 }}>{d.date.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" })} {d.day}'</span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>₪{Math.round(d.revenue).toLocaleString()}</span>
            <span style={{ flex: 1, fontSize: 12, color: (d.profit / d.revenue * 100) > 30 ? theme.accent : theme.orange }}>₪{Math.round(d.profit).toLocaleString()}</span>
            <span style={{ flex: 1, fontSize: 12, color: theme.textMuted }}>{d.txns}</span>
          </div>
        ))}
      </div>

      {/* Saved EOD reports */}
      <div style={s.card}>
        <div style={{ ...s.sectionTitle, marginBottom: 10 }}>דוחות סוף יום שמורים</div>
        {slice.slice(-5).reverse().map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${theme.border}`, cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: theme.surface, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{d.date.getDate()}</div>
              <div style={{ fontSize: 9, color: theme.textMuted }}>{d.date.toLocaleDateString("he-IL", { month: "short" })}</div>
            </div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>דוח {d.date.toLocaleDateString("he-IL", { weekday: "long" })}</div><div style={{ fontSize: 11, color: theme.textMuted }}>{d.txns} עסקאות</div></div>
            <div style={{ textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 700 }}>₪{Math.round(d.revenue).toLocaleString()}</div><div style={{ fontSize: 11, color: theme.accent }}>+₪{Math.round(d.profit).toLocaleString()}</div></div>
            <Icon name="download" size={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// OTHER SCREENS
// ══════════════════════════════════════════════════════════════════
function Dashboard({ navigate }) {
  const history = useRef(buildHistory()).current;
  const last7 = history.slice(-7);
  const weekRev = last7.reduce((s, d) => s + d.revenue, 0);
  const today = history[history.length - 1];
  const yesterday = history[history.length - 2];
  const dayChange = ((today.revenue - yesterday.revenue) / yesterday.revenue) * 100;
  const alerts = PRODUCTS.filter(p => p.stock <= p.min);
  const miniChart = last7.map(d => ({ v: d.revenue, label: d.day, highlight: false }));

  return (
    <div style={{ padding: "14px 14px 0" }}>
      <div style={{ ...s.card, background: "linear-gradient(135deg,#0F6E56 0%,#1A2B3C 100%)", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#9FE1CB", marginBottom: 2 }}>שבוע אחרון</div>
        <div style={{ fontSize: 32, fontWeight: 800 }}>₪{Math.round(weekRev).toLocaleString()}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
          <span style={s.badge(dayChange >= 0 ? theme.accent : theme.red)}>{dayChange >= 0 ? "↑" : "↓"} {Math.abs(dayChange).toFixed(1)}% אתמול</span>
          <div style={{ width: 90, height: 40 }}><BarChart data={miniChart} height={40} /></div>
        </div>
      </div>

      <div style={s.grid2}>
        <button onClick={() => navigate("live")} style={{ ...s.card, border: `1px solid ${theme.accent}44`, background: theme.accent + "11", cursor: "pointer", textAlign: "center", padding: "18px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: theme.text }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: theme.accent }}><PulsingDot size={8} /><Icon name="live" size={22} /></div>
          <div style={{ fontWeight: 700 }}>קופה חיה</div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>נתונים בזמן אמת</div>
        </button>
        <button onClick={() => navigate("reports")} style={{ ...s.card, border: `1px solid ${theme.gold}44`, background: theme.gold + "11", cursor: "pointer", textAlign: "center", padding: "18px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: theme.text }}>
          <Icon name="chart" size={24} />
          <div style={{ fontWeight: 700 }}>דוחות</div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>יום / שבוע / חודש</div>
        </button>
        <button onClick={() => navigate("scan")} style={{ ...s.card, cursor: "pointer", textAlign: "center", padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: theme.text }}>
          <Icon name="barcode" size={22} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>סרוק ברקוד</div>
        </button>
        <button onClick={() => navigate("invoice")} style={{ ...s.card, cursor: "pointer", textAlign: "center", padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: theme.text }}>
          <Icon name="receipt" size={22} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>חשבונית</div>
        </button>
      </div>

      {alerts.length > 0 && (
        <div style={{ ...s.card, borderColor: theme.red + "55" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={s.sectionTitle}>התראות מלאי</span>
            <span style={s.badge(theme.red)}>{alerts.length}</span>
          </div>
          {alerts.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{p.emoji}</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div></div>
              <span style={s.badge(theme.orange)}>נותרו {p.stock}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Products({ navigate }) {
  const [search, setSearch] = useState("");
  const filtered = PRODUCTS.filter(p => !search || p.name.includes(search));
  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => navigate("scan")} style={{ ...s.btn("primary"), flex: 1, padding: "10px 0", fontSize: 13 }}><Icon name="barcode" size={16} /> ברקוד</button>
        <button onClick={() => navigate("invoice")} style={{ ...s.btn("outline"), flex: 1, padding: "10px 0", fontSize: 13 }}><Icon name="receipt" size={16} /> חשבונית</button>
      </div>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input style={{ ...s.input, paddingRight: 38 }} placeholder="חפש מוצר..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", color: theme.textMuted }}><Icon name="search" size={16} /></div>
      </div>
      {filtered.map(p => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: theme.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{p.emoji}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: theme.textMuted }}>{p.barcode}</div></div>
          <div style={{ textAlign: "left" }}><div style={{ fontSize: 14, fontWeight: 700, color: theme.accent }}>₪{p.price.toFixed(2)}</div><div style={{ fontSize: 11, color: p.stock <= p.min ? theme.red : theme.textMuted }}>מלאי: {p.stock}</div></div>
        </div>
      ))}
    </div>
  );
}

function BarcodeScanner() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [phase, setPhase] = useState("init");
  const [found, setFound] = useState(null);
  const [manual, setManual] = useState("");
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!("BarcodeDetector" in window)) { setPhase("unsupported"); return; }
        const det = new window.BarcodeDetector({ formats: ["ean_13","ean_8","upc_a","code_128","qr_code"] });
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        setPhase("scanning");
        const scan = async () => {
          try { const codes = await det.detect(videoRef.current); if (codes.length) { stopCamera(); setPhase("found"); lookup(codes[0].rawValue); return; } } catch {}
          rafRef.current = requestAnimationFrame(scan);
        };
        rafRef.current = requestAnimationFrame(scan);
      } catch { setPhase("error"); }
    })();
    return () => stopCamera();
  }, []);

  const lookup = async (code) => {
    setLoading(true);
    const local = PRODUCTS.find(p => p.barcode === code);
    if (local) { setFound({ ...local, barcodeScanned: code, isNew: false }); setLoading(false); return; }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, system: "ענה רק ב-JSON תקין.", messages: [{ role: "user", content: `ברקוד ישראלי: ${code}. ענה: {"name":"שם בעברית","cat":"קטגוריה","emoji":"אימוג'י","price":0,"cost":0,"supplier":"ספק","found":true}` }] }) });
      const data = await res.json();
      const p = JSON.parse(data.content?.[0]?.text || "{}");
      setFound({ ...p, barcode: code, stock: 0, min: 5, id: Date.now(), isNew: true, barcodeScanned: code });
    } catch { setFound({ name: `מוצר ${code}`, cat: "כללי", emoji: "📦", price: 0, cost: 0, supplier: "", barcode: code, stock: 0, min: 5, id: Date.now(), isNew: true, barcodeScanned: code }); }
    setLoading(false);
  };

  return (
    <div style={{ padding: 14 }}>
      <div style={{ ...s.card, background: "#08131E", padding: 0, overflow: "hidden", marginBottom: 12, position: "relative" }}>
        {phase === "scanning" && (
          <>
            <video ref={videoRef} style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} playsInline muted />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ width: 220, height: 100, border: `2px solid ${theme.accent}`, borderRadius: 8, boxShadow: "0 0 0 2000px rgba(0,0,0,0.45)" }} />
            </div>
            <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>כוון את הברקוד למסגרת</div>
          </>
        )}
        {(phase === "init" || phase === "error" || phase === "unsupported") && (
          <div style={{ height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ fontSize: 40 }}>{phase === "error" ? "📵" : phase === "unsupported" ? "🌐" : "⏳"}</div>
            <div style={{ fontSize: 13, color: theme.textMuted, textAlign: "center", padding: "0 20px" }}>{phase === "error" ? "בדוק הרשאות מצלמה" : phase === "unsupported" ? "השתמש ב-Chrome לסריקה" : "מאתחל..."}</div>
          </div>
        )}
        {phase === "found" && (
          <div style={{ height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <><div style={{ fontSize: 36 }}>🔍</div><div style={{ fontSize: 13, color: theme.textMuted }}>מזהה מוצר...</div></> : found ? <><div style={{ fontSize: 50 }}>{found.emoji}</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.accent }}>{found.name}</div><div style={{ fontSize: 12, color: theme.textMuted }}>{found.barcodeScanned}</div></> : null}
          </div>
        )}
      </div>

      {phase === "found" && !loading && found && (
        <div style={s.card}>
          {[["שם","name"],["קטגוריה","cat"],["ספק","supplier"]].map(([l,k]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: theme.textMuted, width: 56 }}>{l}</span>
              <input style={{ ...s.input, flex: 1, padding: "7px 12px", fontSize: 13 }} value={found[k]||""} onChange={e => setFound(f => ({...f,[k]:e.target.value}))} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 3 }}>מחיר מכירה</div><input style={{ ...s.input, padding: "7px 12px", fontSize: 13 }} type="number" value={found.price||""} onChange={e => setFound(f => ({...f,price:+e.target.value}))} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 3 }}>כמות</div><input style={{ ...s.input, padding: "7px 12px", fontSize: 13 }} type="number" value={qty} onChange={e => setQty(+e.target.value||1)} min="1" /></div>
          </div>
          <button style={{ ...s.btn("primary"), width: "100%" }}><Icon name="plus" size={16} /> {found.isNew ? "הוסף מוצר" : "עדכן מלאי"}</button>
          <button onClick={() => { setPhase("scanning"); setFound(null); }} style={{ ...s.btn("outline"), width: "100%", marginTop: 8 }}>סרוק שוב</button>
        </div>
      )}

      <div style={s.card}>
        <div style={s.sectionTitle}>הזנה ידנית</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ ...s.input, flex: 1 }} placeholder="הכנס ברקוד..." value={manual} onChange={e => setManual(e.target.value)} onKeyDown={e => e.key === "Enter" && (setPhase("found"), lookup(manual.trim()))} />
          <button onClick={() => { setPhase("found"); lookup(manual.trim()); }} style={{ ...s.btn("primary"), padding: "10px 16px" }}><Icon name="search" size={16} /></button>
        </div>
      </div>

      <div style={{ ...s.card, background: "#08131E" }}>
        <div style={s.sectionTitle}>ברקודים לניסיון</div>
        {PRODUCTS.slice(0, 4).map(p => (
          <div key={p.id} onClick={() => { setPhase("found"); lookup(p.barcode); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${theme.border}`, cursor: "pointer" }}>
            <span>{p.emoji}</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13 }}>{p.name}</div><div style={{ fontSize: 11, color: theme.textMuted }}>{p.barcode}</div></div>
            <Icon name="barcode" size={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoiceScanner() {
  const [phase, setPhase] = useState("idle");
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sel, setSel] = useState({});
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file)); setPhase("processing");
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: "ענה רק ב-JSON.", messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: file.type||"image/jpeg", data: e.target.result.split(",")[1] } }, { type: "text", text: 'חלץ: {"supplier":"שם","date":"תאריך","total":0,"items":[{"name":"שם","qty":1,"unit_price":0,"total":0,"emoji":"אימוג\'י"}]}' }] }] }) });
        const data = await res.json();
        const parsed = JSON.parse((data.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim());
        setItems(parsed.items||[]); setSummary(parsed);
        const s = {}; (parsed.items||[]).forEach((_,i)=>{s[i]=true;}); setSel(s);
        setPhase("done");
      } catch { setPhase("error"); }
    };
    reader.readAsDataURL(file);
  };

  const selCount = Object.values(sel).filter(Boolean).length;
  const selTotal = items.filter((_,i) => sel[i]).reduce((s,it)=>s+(it.total||0),0);

  return (
    <div style={{ padding: 14 }}>
      <div onClick={() => fileRef.current?.click()} style={{ ...s.card, background: "#08131E", border: `2px dashed ${theme.border}`, minHeight: 160, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        {preview ? <img src={preview} alt="" style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8, objectFit: "contain" }} /> : <><div style={{ color: theme.accent, marginBottom: 10 }}><Icon name="camera" size={40} /></div><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>צלם חשבונית ספק</div><div style={{ fontSize: 12, color: theme.textMuted }}>לחץ לפתיחת מצלמה / גלריה</div></>}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      </div>
      {phase === "processing" && <div style={{ ...s.card, textAlign: "center", padding: "28px 16px" }}><div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div><div style={{ fontSize: 15, fontWeight: 600 }}>Claude מנתח חשבונית...</div></div>}
      {phase === "error" && <div style={{ ...s.card, textAlign: "center" }}><div style={{ fontSize: 13, color: theme.red }}>לא ניתן לנתח. נסה שנית.</div></div>}
      {phase === "done" && summary && (
        <>
          <div style={{ ...s.card, background: "#0F2A1E" }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 15, fontWeight: 700 }}>{summary.supplier||"ספק"}</div><div style={{ fontSize: 12, color: theme.textMuted }}>{summary.date||""}</div></div><div style={{ textAlign: "left" }}><div style={{ fontSize: 18, fontWeight: 800, color: theme.accent }}>₪{(summary.total||0).toFixed(2)}</div></div></div></div>
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div style={s.sectionTitle}>פריטים ({items.length})</div><div style={{ fontSize: 11, color: theme.textMuted }}>סמן לייבוא</div></div>
            {items.map((item,i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${theme.border}` }}>
                <div onClick={() => setSel(s=>({...s,[i]:!s[i]}))} style={{ width: 20, height: 20, borderRadius: 4, background: sel[i]?theme.accent:"transparent", border: `1.5px solid ${sel[i]?theme.accent:theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>{sel[i]&&<span style={{ color:"#fff",fontSize:12 }}>✓</span>}</div>
                <span style={{ fontSize: 20 }}>{item.emoji||"📦"}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div><div style={{ fontSize: 11, color: theme.textMuted }}>×{item.qty} • ₪{item.unit_price?.toFixed(2)}</div></div>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>₪{item.total?.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div style={{ ...s.card, background: "#0F2A1E" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><span style={{ color: theme.textMuted }}>{selCount} פריטים</span><span style={{ fontWeight: 700, color: theme.accent }}>₪{selTotal.toFixed(2)}</span></div>
            <button onClick={() => { setPhase("idle"); setPreview(null); setItems([]); setSummary(null); }} style={{ ...s.btn("primary"), width: "100%", marginBottom: 8 }}><Icon name="plus" size={16} /> ייבא {selCount} פריטים</button>
            <button onClick={() => fileRef.current?.click()} style={{ ...s.btn("outline"), width: "100%" }}><Icon name="camera" size={16} /> חשבונית נוספת</button>
          </div>
        </>
      )}
    </div>
  );
}

function AIAssistant() {
  const [msgs, setMsgs] = useState([{ role: "assistant", text: "שלום! אני עוזר החכם. שאל על מלאי, מכירות, רווחיות 🛒" }]);
  const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const send = async (text) => {
    const msg = text||input; if (!msg.trim()||loading) return;
    setInput(""); setMsgs(prev=>[...prev,{role:"user",text:msg}]); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`עוזר חכם של מכולת ישראלית. נתונים: מלאי נמוך: ${PRODUCTS.filter(p=>p.stock<=p.min).map(p=>p.name).join(", ")}. ענה בעברית.`,messages:[{role:"user",content:msg}]})});
      const data = await res.json();
      setMsgs(prev=>[...prev,{role:"assistant",text:data.content?.[0]?.text||"מצטער."}]);
    } catch { setMsgs(prev=>[...prev,{role:"assistant",text:"שגיאת חיבור."}]); }
    setLoading(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 8px" }}>
        {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-start":"flex-end",marginBottom:12}}><div style={{maxWidth:"80%",background:m.role==="user"?theme.surface:theme.accent+"22",border:`1px solid ${m.role==="user"?theme.border:theme.accent+"44"}`,borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"10px 14px",fontSize:13,lineHeight:1.6,whiteSpace:"pre-line"}}>{m.text}</div></div>)}
        {loading&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><div style={{background:theme.accent+"22",borderRadius:"12px 12px 12px 4px",padding:"10px 14px"}}><span style={{color:theme.accent}}>●●●</span></div></div>}
        <div ref={bottomRef}/>
      </div>
      {msgs.length<=2&&<div style={{padding:"0 14px 8px",display:"flex",gap:8,flexWrap:"wrap"}}>{["מה כדאי להזמין?","מה הרווח שלי?","אילו מוצרים פגי תוקף?"].map(q=><button key={q} onClick={()=>send(q)} style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,color:theme.accent,cursor:"pointer",fontWeight:600}}>{q}</button>)}</div>}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${theme.border}`,display:"flex",gap:10,background:theme.surface}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="שאל אותי..." style={{...s.input,flex:1}}/>
        <button onClick={()=>send()} style={{...s.btn("primary"),padding:"10px 16px"}}><Icon name="send" size={16}/></button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════════
const NAV = [
  { id: "dashboard", label: "ראשי", icon: "home" },
  { id: "live", label: "קופה", icon: "live" },
  { id: "scan", label: "סריקה", icon: "scan" },
  { id: "reports", label: "דוחות", icon: "chart" },
  { id: "ai", label: "AI", icon: "ai" },
];

const TITLES = { dashboard:"מכולת ראמה", live:"קופה חיה", scan:"סריקת ברקוד", invoice:"סריקת חשבונית", reports:"דוחות", ai:"עוזר AI", products:"מוצרים" };

export default function App() {
  const [screen, setScreen] = useState("dashboard");

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{TITLES[screen]||screen}</div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>מכולת חכמה 🛒</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setScreen("products")} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer" }}><Icon name="package" size={19}/></button>
          <button onClick={() => setScreen("scan")} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer" }}><Icon name="barcode" size={19}/></button>
          <button onClick={() => setScreen("invoice")} style={{ background: "none", border: "none", color: theme.blue, cursor: "pointer" }}><Icon name="receipt" size={19}/></button>
        </div>
      </div>

      <div style={s.scroll}>
        {screen === "dashboard" && <Dashboard navigate={setScreen} />}
        {screen === "live" && <LivePOS />}
        {screen === "scan" && <BarcodeScanner />}
        {screen === "invoice" && <InvoiceScanner />}
        {screen === "reports" && <Reports />}
        {screen === "ai" && <AIAssistant />}
        {screen === "products" && <Products navigate={setScreen} />}
      </div>

      <div style={s.navBar}>
        {NAV.map(n => (
          <div key={n.id} style={s.navItem(screen === n.id)} onClick={() => setScreen(n.id)}>
            <div style={{ position: "relative" }}>
              <Icon name={n.icon} size={22} />
              {n.id === "live" && (
                <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: theme.accent }} />
              )}
            </div>
            <span>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
