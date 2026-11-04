import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Menu,
  X,
  Network,
  Boxes,
  Truck,
  ClipboardList,
  Trash2,
  BarChart3,
  CloudSun,
  ArrowLeftRight,
  Store,
  ShieldCheck,
  Bell,
  FileDown,
  Check,
  Smartphone,
  Mail,
  Phone,
  Sparkles,
  ScanSearch,
  PackageCheck,
  Send,
  Building2,
  FileText,
  Target,
  Leaf,
  TrendingDown,
  LogIn,
  Play,
  Download,
  Info,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* =========================
   THEME
========================= */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  color-scheme: dark;
}

.dz {
  --bg: #0B0B0F;
  --surface: #141419;
  --surface-raised: #19191F;
  --line: #2A2A32;
  --muted: #A1A1AA;
  --text: #F8FAFC;
  --or: #FF8A3D;
  --pk: #FF4F81;
}

.dz[data-theme="light"] {
  color-scheme: light;
  --bg: #F5F7FB;
  --surface: #FFFFFF;
  --surface-raised: #FFFFFF;
  --line: #E2E8F0;
  --muted: #64748B;
  --text: #172033;
}

.dz[data-theme="light"] {
  color: var(--text);
  background-image:
    radial-gradient(700px 420px at 16% 10%, rgba(255,138,61,.08), transparent 70%),
    radial-gradient(800px 560px at 90% 36%, rgba(255,79,129,.06), transparent 70%);
}

.dz[data-theme="light"] .dz-card {
  background: var(--surface);
  border-color: var(--line);
  box-shadow: 0 8px 24px -18px rgba(15,23,42,.35);
}

.dz[data-theme="light"] header,
.dz[data-theme="light"] .dz-mobile-menu {
  background: rgba(255,255,255,.94) !important;
  border-color: var(--line) !important;
}

.dz[data-theme="light"] .text-white { color: #172033 !important; }
.dz[data-theme="light"] .text-[#9295A7],
.dz[data-theme="light"] .text-[#A1A1AA],
.dz[data-theme="light"] .text-[#A1A1AA] { color: #64748B !important; }
.dz[data-theme="light"] .border-white\/10,
.dz[data-theme="light"] .border-white\/[0.08] { border-color: #E2E8F0 !important; }
.dz[data-theme="light"] .bg-white\/5 { background-color: #F1F5F9 !important; }
.dz[data-theme="light"] .dz-theme-toggle { color: #334155; border-color: #CBD5E1; background: #FFFFFF; }

/* LIGHT MODE: keep the page airy and consistent */
.dz[data-theme="light"] {
  --bg: #F5F7FA;
  --surface: #FFFFFF;
  --surface-raised: #FFFFFF;
  --line: #E5EAF1;
  --muted: #64748B;
  --text: #172033;
  background-color: #F5F7FA;
  color: #172033;
  background-image:
    radial-gradient(700px 420px at 12% 8%, rgba(255,138,61,.055), transparent 70%),
    radial-gradient(800px 560px at 92% 35%, rgba(255,79,129,.045), transparent 70%);
}

.dz[data-theme="light"] .dz-card {
  background: #FFFFFF;
  border: 1px solid #E5EAF1;
  box-shadow: 0 10px 30px -22px rgba(15,23,42,.28);
}

.dz[data-theme="light"] header,
.dz[data-theme="light"] .dz-mobile-menu {
  background: rgba(255,255,255,.94) !important;
  border-color: #E5EAF1 !important;
  box-shadow: 0 4px 18px rgba(15,23,42,.035);
}

.dz[data-theme="light"] header a,
.dz[data-theme="light"] .dz-mobile-menu a {
  color: #475569;
}

.dz[data-theme="light"] header a:hover,
.dz[data-theme="light"] .dz-mobile-menu a:hover {
  color: #D97706;
}

.dz[data-theme="light"] header .dz-theme-toggle,
.dz[data-theme="light"] header a[href="#contact"],
.dz[data-theme="light"] header a[href="/login-portal"] {
  color: #334155;
  background: #FFFFFF;
  border-color: #DCE3EC;
}

.dz[data-theme="light"] .dz-card h3,
.dz[data-theme="light"] .dz-card h2,
.dz[data-theme="light"] .dz-card .hd {
  color: #172033;
}

.dz[data-theme="light"] .dz-card p,
.dz[data-theme="light"] .dz-card [class*="text-\\[var(--muted)\\]"] {
  color: #64748B;
}

/* Comparison table: white rows instead of dark bars */
.dz[data-theme="light"] table {
  border-collapse: separate;
}

.dz[data-theme="light"] tbody tr {
  background: #FFFFFF !important;
  box-shadow: 0 2px 10px rgba(15,23,42,.035);
}

.dz[data-theme="light"] tbody tr td {
  background: #FFFFFF !important;
  color: #334155;
  border-top: 1px solid #E8EDF3;
  border-bottom: 1px solid #E8EDF3;
}

.dz[data-theme="light"] tbody tr td:first-child {
  border-left: 1px solid #E8EDF3;
}

.dz[data-theme="light"] tbody tr td:last-child {
  border-right: 1px solid #E8EDF3;
}

.dz[data-theme="light"] tbody tr td:nth-child(2) {
  background: #FFF7ED !important;
  color: #9A3412;
}

.dz[data-theme="light"] thead th {
  color: #64748B;
}

/* Supply workflow icon circles */
.dz[data-theme="light"] .dz-flow-icon {
  background: #FFFFFF !important;
}

/* Contact panel: blend into the light page */
.dz[data-theme="light"] .dz-contact-panel {
  background:
    radial-gradient(520px 220px at 50% 0%, rgba(236,72,153,.07), transparent),
    linear-gradient(160deg, #FFFFFF, #FFF9F5) !important;
  border-color: #E5EAF1;
  box-shadow: 0 18px 45px -30px rgba(15,23,42,.3);
}

.dz[data-theme="light"] footer {
  border-color: #E5EAF1 !important;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 90px;
}

.dz {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background-color: var(--bg);
  background-image:
    radial-gradient(700px 420px at 16% 10%, rgba(255,138,61,.07), transparent 70%),
    radial-gradient(800px 560px at 90% 36%, rgba(255,79,129,.06), transparent 70%),
    radial-gradient(900px 520px at 45% 82%, rgba(255,138,61,.04), transparent 70%);
  color: #fff;
  scroll-behavior: smooth;
}

.dz section[id] {
  scroll-margin-top: 90px;
}

.dz h1,
.dz h2 {
  letter-spacing: -.03em;
}

.dz h1,
.dz h2,
.dz h3,
.dz .hd {
  font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
}

@keyframes dzf {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}

.dz-fl {
  animation: dzf 4.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .dz-fl {
    animation: none;
  }
}

@keyframes dzb {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.dz-bx {
  animation: dzb 5s ease-in-out infinite;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .dz-bx {
    animation: none;
  }
}

.dz-hv:hover {
  box-shadow:
    0 0 0 1px rgba(251,146,60,.35),
    0 14px 40px -14px rgba(251,146,60,.3);
}

.dz-g {
  background: linear-gradient(90deg, #fb923c, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.dz-gb {
  background: linear-gradient(90deg, #fb923c, #f43f5e);
}

.dz-card {
  background: linear-gradient(160deg, var(--surface-raised), var(--surface));
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 12px 30px -14px rgba(0,0,0,.7);
}

@keyframes dzm {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.dz-mq {
  animation: dzm 32s linear infinite;
}

.dz-mq:hover {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .dz-mq {
    animation: none;
  }
}
`;

/* =========================
   NAVIGATION
========================= */

const NAV = [
  ["Features", "features"],
  ["Free Demo", "demo"],
  ["Why DineOps", "why"],
  ["Compare", "compare"],
  ["Download", "download"],
];

/* =========================
   FEATURES DATA
========================= */

const TONES = [
  "#3b82f6",
  "#22c55e",
  "#8b5cf6",
  "#fb923c",
  "#06b6d4",
  "#eab308",
  "#ec4899",
  "#22c55e",
  "#3b82f6",
  "#fb923c",
  "#8b5cf6",
  "#06b6d4",
];

const FEATURES = [
  [
    Network,
    "Branch & Franchise Hierarchy",
    "Owner → Branches → Franchise outlets, with configurable supply links.",
    "UNIQUE",
  ],
  [
    Boxes,
    "Location-wise Inventory",
    "Separate stock for every branch kitchen and outlet. Low-stock alerts.",
  ],
  [
    Truck,
    "Supply Requests",
    "Request, approve, dispatch, receive. Partial deliveries supported.",
    "UNIQUE",
  ],
  [
    ClipboardList,
    "Purchases & GRN",
    "Log deliveries. Stock updates only on confirmed receipt.",
  ],
  [
    Trash2,
    "Wastage Tracking",
    "Record every wastage event with reason and cost. Monthly loss reports.",
  ],
  [
    BarChart3,
    "Reports & Analytics",
    "Filter by date, branch, franchise, product. Export to CSV.",
  ],
  [
    CloudSun,
    "Demand Forecasting",
    "Statistical baseline first, ML later. Weather and festival inputs.",
    "NEW",
  ],
  [
    ArrowLeftRight,
    "Stock Transfer",
    "Manager-approved transfers with a full audit log.",
    "NEW",
  ],
  [
    Store,
    "Sales Entry",
    "Each franchise records its own daily sales. POS import ready later.",
  ],
  [
    ShieldCheck,
    "Role-based Access",
    "Owner, Branch Manager, Franchise Manager, Staff. Enforced on server.",
  ],
  [
    Bell,
    "Notifications",
    "Low stock, new requests, approvals, dispatches, mismatches.",
  ],
  [
    FileDown,
    "CSV Export",
    "Take any report into Excel for your accountant.",
  ],
];

const TICK = [
  "Branch Management",
  "Franchise Management",
  "Supply Requests",
  "Dispatch & Receiving",
  "Location Inventory",
  "Wastage Tracking",
  "Demand Forecast",
  "Weather & Festivals",
  "Branch Comparison",
  "Stock Transfer",
  "Reports & CSV",
];

/* =========================
   COMPARISON DATA
   Sample data only
========================= */

const WEEKLY_DATA = [
  { day: "Mon", sales: 42, wastage: 8, stock: 180 },
  { day: "Tue", sales: 58, wastage: 12, stock: 195 },
  { day: "Wed", sales: 48, wastage: 7, stock: 188 },
  { day: "Thu", sales: 75, wastage: 15, stock: 215 },
  { day: "Fri", sales: 65, wastage: 10, stock: 205 },
  { day: "Sat", sales: 92, wastage: 18, stock: 240 },
  { day: "Sun", sales: 82, wastage: 11, stock: 230 },
];

const GRAPH_COLORS = {
  sales: "#FB923C",
  wastage: "#F472B6",
  stock: "#60A5FA",
};

const MET = {
  sales: "Sales (₹ k)",
  wastage: "Wastage (₹ k)",
  stock: "Stock value (₹ k)",
};

const ROWS = [
  ["Branch + franchise hierarchy", "✓ Built-in", "✗", "✗"],
  ["Location-wise inventory", "✓ Built-in", "Partial", "✗"],
  ["Supply request & dispatch", "✓ Built-in", "✗", "✗"],
  ["Partial delivery tracking", "✓ Built-in", "✗", "✗"],
  ["Wastage cost reports", "✓", "Partial", "Manual"],
  ["Branch vs franchise comparison", "✓ Built-in", "✗", "Manual"],
  ["Demand forecast + weather/festival", "✓ Built-in", "✗", "✗"],
  ["Role-based access per outlet", "✓", "Partial", "✗"],
];

const cell = (value) =>
  value.startsWith("✓")
    ? "text-green-400 font-semibold"
    : value === "✗"
      ? "text-rose-400"
      : "text-orange-300 font-semibold";

/* =========================
   SUPPLY WORKFLOW
========================= */

const FLOW = [
  [Send, "Franchise Requests", "raises supply request", "#ef4444"],
  [ClipboardList, "Branch Reviews", "approve / partial / reject", "#fb923c"],
  [Truck, "Dispatch", "branch ships items", "#f59e0b"],
  [PackageCheck, "Receipt Confirmed", "franchise confirms", "#22c55e"],
  [BarChart3, "In Your Reports", "stock + cost updated", "#3b82f6"],
];

/* =========================
   REUSABLE COMPONENTS
========================= */

const Pill = ({ icon: Icon = Sparkles, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-400">
    <Icon size={12} />
    {children}
  </span>
);

const H2 = ({ a, b }) => (
  <h2 className="mt-5 text-4xl font-bold leading-[1.1] md:text-[52px]">
    {a} <span className="dz-g">{b}</span>
  </h2>
);

const Sub = ({ children }) => (
  <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--muted)]">
    {children}
  </p>
);

const Btn = ({
  href,
  children,
  kind = "g",
  sm = false,
  onClick,
}) => (
  <a
    href={href}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 rounded-full ${
      sm ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm"
    } font-bold transition hover:scale-[1.03] ${
      kind === "g"
        ? "dz-gb text-white shadow-lg shadow-orange-500/20"
        : kind === "ghost"
          ? "border border-white/10 bg-white/5 text-white"
          : kind === "blue"
            ? "bg-blue-500 text-white"
            : "bg-green-500 text-white"
    }`}
  >
    {children}
  </a>
);

/* =========================
   HERO DASHBOARD PREVIEW
========================= */

const SIDE = [
  [LayoutDashboard, "Dashboard"],
  [Network, "Branches"],
  [Store, "Franchises"],
  [Boxes, "Inventory"],
  [Truck, "Supply"],
  [Trash2, "Wastage"],
  [CloudSun, "Forecast"],
  [ArrowLeftRight, "Transfers"],
  [BarChart3, "Reports"],
];

const BARS = [24, 34, 22, 42, 30, 48, 58];

const TOP = [
  ["Branch C", "₹5.1L"],
  ["Branch A", "₹4.2L"],
  ["Branch B", "₹3.6L"],
];

function HeroMock() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="relative min-w-0 md:mt-[64px]">
      <div
        className="pointer-events-none absolute -inset-6 -z-10 opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 80% 20%,rgba(251,146,60,.3),transparent 60%),radial-gradient(circle at 10% 90%,rgba(236,72,153,.2),transparent 60%)",
        }}
      />

      <div className={`dz-bx overflow-hidden rounded-2xl border shadow-2xl ${isLight ? "border-slate-200 bg-white shadow-slate-300/50" : "border-[#1e2130] bg-[#141419] shadow-black/60"}`}>
        <div className="flex items-center gap-1.5 px-4 py-3">
          <i className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <i className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <i className="h-2.5 w-2.5 rounded-full bg-green-500" />

          <span className={`mx-auto pr-10 text-[10px] ${isLight ? "text-slate-500" : "text-[#5b6aa8]"}`}>
            dineops.app — Owner Dashboard · demo data
          </span>
        </div>

        <div className="grid sm:grid-cols-[128px_1fr]">
          <ul className="hidden space-y-0.5 px-2.5 pb-4 pt-1 sm:block">
            {SIDE.map(([Icon, label], index) => (
              <li
                key={label}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[11px] font-semibold ${
                  index === 0
                    ? "bg-orange-500/15 text-orange-300"
                    : "text-[#9aa9e0]"
                }`}
              >
                <Icon
                  size={12}
                  className={
                    index === 0 ? "text-orange-400" : "text-[#6f82d8]"
                  }
                />
                {label}
              </li>
            ))}
          </ul>

          <div className={`space-y-3 px-3 pb-4 pt-3 sm:pl-3 ${isLight ? "bg-slate-50" : "bg-[#111525]"}`}>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                ["TOTAL SALES", "₹1.6L", "#4ade80"],
                ["REQUESTS", "48", "#60a5fa"],
                ["PENDING", "5", "#fb923c"],
                ["STOCK VALUE", "₹4.1L", "#4ade80"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className={`rounded-xl border px-3 py-2 ${isLight ? "border-slate-200 bg-white" : "border-[#1e2130] bg-[#141419]"}`}
                >
                  <div className={`text-[8px] font-bold tracking-wider ${isLight ? "text-slate-500" : "text-[#5b6aa8]"}`}>
                    {label}
                  </div>

                  <div
                    className="hd text-lg font-bold leading-tight"
                    style={{ color }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className={`rounded-xl border p-3 ${isLight ? "border-slate-200 bg-white" : "border-[#1e2130] bg-[#141419]"}`}>
              <div className={`text-[10px] font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>Weekly Sales</div>

              <div className="mt-2.5 flex h-16 items-end gap-2">
                {BARS.map((height, index) => (
                  <i
                    key={index}
                    className="flex-1 rounded-t"
                    style={{
                      height,
                      background:
                        index === 6
                          ? "linear-gradient(0deg,#fb923c,#f472b6)"
                          : "#4a2823",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5 px-1">
              {TOP.map(([name, value]) => (
                <div
                  key={name}
                  className="flex justify-between text-[10px]"
                >
                  <span className={isLight ? "text-slate-600" : "text-[#9aa9e0]"}>{name}</span>
                  <span className="font-bold text-green-400">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`dz-fl absolute -top-4 right-3 rounded-lg border px-3 py-1.5 text-[10px] font-bold shadow-lg sm:-right-3 ${isLight ? "border-slate-200 bg-white text-slate-700" : "border-[#1e2130] bg-[#141726] text-white"}`}>
        Daily Report <span className="text-green-400">Sent ✓</span>
      </div>

      <div
        className="dz-fl dz-gb absolute -left-2 bottom-8 rounded-lg px-3 py-1.5 text-[10px] font-bold shadow-lg shadow-orange-500/30 sm:-left-5"
        style={{ animationDelay: "1.2s" }}
      >
        Today Sales ₹12,840 <span className="opacity-70">· demo</span>
      </div>
    </div>
  );
}

/* =========================
   LANDING PAGE
========================= */

export default function Landing() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [m, setM] = useState("sales");

  /*
   * Smooth-scroll handler:
   * - Scrolls to the requested section
   * - Closes mobile navigation
   * - Updates the URL hash
   */
  const handleNavClick = (event, id) => {
    event.preventDefault();
    setOpen(false);

    const target = document.getElementById(id);

    if (!target) {
      console.warn(`Section with id="${id}" was not found.`);
      return;
    }

    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="dz min-h-screen overflow-x-hidden" data-theme={theme}>
      <style>{css}</style>

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#090A10]/95 backdrop-blur-xl">
        <div className="mx-auto grid h-[70px] max-w-[1500px] grid-cols-[1fr_auto] items-center px-5 md:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-10">
          <a
            href="#top"
            onClick={(event) => handleNavClick(event, "top")}
            className="hd flex items-center gap-2 text-[21px] font-bold tracking-tight text-white"
          >
            <span className="h-[9px] w-[9px] rounded-full bg-[#ff5367]" />
            <span>
              DineOps
            </span>
          </a>

          {/* Desktop navigation */}

          <nav className="hidden items-center gap-7 whitespace-nowrap text-[14px] font-medium text-[#9295A7] lg:flex xl:gap-8">
            {NAV.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();

                  document.getElementById(id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });

                  setOpen(false);
                }}
                className="transition-colors duration-200 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}

          <div className="hidden items-center justify-self-end gap-2 lg:flex">
            <button
              type="button"
              className="dz-theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#343442] bg-[#171720] text-[#D4C8FF] transition hover:scale-105"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <a
              href="#contact"
              onClick={(event) => handleNavClick(event, "contact")}
              className="inline-flex items-center gap-2 rounded-full border border-[#343442] bg-[#171720] px-5 py-2.5 text-[13px] font-semibold text-[#D4C8FF] transition hover:border-[#65617B] hover:bg-[#20202B]"
            >
              <Building2 size={14} />
              Contact
            </a>

            <a
              href="/login-portal"
              className="inline-flex items-center gap-2 rounded-full border border-[#343442] bg-[#171720] px-5 py-2.5 text-[13px] font-medium text-[#D1D1DC] transition hover:bg-[#24242E] hover:text-white"
            >
              <LogIn size={14} />
              Login
            </a>

            <a
              href="/get-started"
              className="dz-gb inline-flex items-center rounded-full px-6 py-2.5 text-[13px] font-bold text-white transition duration-200 hover:scale-[1.03]"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
            onClick={() => setOpen((previous) => !previous)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile navigation */}

        {open && (
          <div className="dz-mobile-menu border-t border-white/10 bg-[#090A10] px-5 pb-5 pt-3 lg:hidden">
            <nav className="flex flex-col">
              {NAV.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(event) => handleNavClick(event, id)}
                  className="border-b border-white/[0.06] py-3.5 text-sm text-[#A1A1AA] transition hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>

            <button
              type="button"
              className="dz-theme-toggle mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              Switch to {theme === "dark" ? "Light" : "Dark"} Mode
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <a
                href="#contact"
                onClick={(event) => handleNavClick(event, "contact")}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                <Building2 size={15} />
                Contact
              </a>

              <a
                href="/login-portal"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                <LogIn size={15} />
                Login
              </a>

              <a
                href="/get-started"
                onClick={() => setOpen(false)}
                className="dz-gb col-span-2 rounded-full px-5 py-3 text-center text-sm font-bold text-white"
              >
                Get Started →
              </a>
            </div>
          </div>
        )}
      </header>

      {/* =========================
          HERO
      ========================= */}

      <section
        id="top"
        className="mx-auto grid max-w-7xl items-start gap-12 px-4 pb-14 pt-14 md:grid-cols-[1fr_1.25fr] md:gap-20 md:pb-20 md:pt-20 lg:gap-24"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-400">
            <i className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Restaurant Management System
          </span>

          <h1 className="mt-7 text-5xl font-bold leading-[1.04] lg:text-[58px]">
            Manage Every Outlet
            <br />
            of Your Restaurant
            <br />
            <span className="dz-g">With One System.</span>
          </h1>

          <p className="mt-7 max-w-sm text-sm leading-7 text-[#b4bfe0]">
            Inventory. Supply requests. Sales. Wastage. Forecasting. Branch
            comparison. One platform for owners, branches and franchises.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Btn
              href="#demo"
              onClick={(event) => handleNavClick(event, "demo")}
            >
              <Play size={14} />
              Get a Demo
            </Btn>

            <Btn
              href="#features"
              kind="ghost"
              onClick={(event) => handleNavClick(event, "features")}
            >
              <Sparkles size={14} className="text-blue-400" />
              See Features
            </Btn>

            <a
              href="#download"
              onClick={(event) => handleNavClick(event, "download")}
              className="inline-flex items-center gap-2 rounded-full border border-blue-400/50 bg-blue-500/5 px-6 py-3 text-sm font-bold text-white"
            >
              <Download size={14} className="text-blue-400" />
              Install App
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-10">
            {[
              ["12+", "Built-in Modules"],
              ["4", "User Roles"],
              ["₹0", "Per-bill Fees"],
            ].map(([number, label]) => (
              <div
                key={label}
                className="border-l-2 border-orange-500/80 pl-4"
              >
                <div className="hd text-3xl font-bold">{number}</div>
                <div className="text-[11px] text-[var(--muted)]">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <HeroMock />
      </section>

      {/* =========================
          TICKER
      ========================= */}

      <div className="overflow-hidden border-y border-white/5 py-3 text-xs font-semibold text-[var(--muted)]">
        <div className="dz-mq flex w-max gap-8 whitespace-nowrap">
          {[...TICK, ...TICK].map((item, index) => (
            <span key={`${item}-${index}`}>
              <span className="mr-3 text-orange-500">●</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* =========================
          FEATURES
      ========================= */}

      <section
        id="features"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-8 pt-14 text-center md:pb-12 md:pt-20"
      >
        <Pill icon={Boxes}>Complete Platform</Pill>

        <H2
          a="Everything Included."
          b="Nothing Locked Behind Add-ons."
        />

        <Sub>
          Explore the modules designed to help manage restaurant branches,
          inventory, supply workflows and business performance.
        </Sub>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([Icon, title, description, badge], index) => (
            <article
              key={title}
              className="dz-card dz-hv relative p-5 transition hover:-translate-y-1"
            >
              {badge && (
                <span
                  className={`absolute right-3 top-3 text-[9px] font-bold ${
                    badge === "NEW"
                      ? "text-green-400"
                      : "text-orange-400"
                  }`}
                >
                  {badge}
                </span>
              )}

              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{
                  background: `${TONES[index]}26`,
                  color: TONES[index],
                }}
              >
                <Icon size={16} />
              </span>

              <h3 className="mt-4 text-sm font-bold">{title}</h3>

              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* =========================
          WHY DINEOPS
      ========================= */}

      <section
        id="why"
        className="mx-auto max-w-5xl px-4 py-8 text-center md:py-12"
      >
        <Pill icon={Sparkles}>Only in DineOps</Pill>

        <H2
          a="Four Features"
          b="Built For Franchise Chains"
        />

        <Sub>
          Designed for owners who manage multiple branches and franchises.
        </Sub>

        <div className="mt-12 grid gap-5 text-left md:grid-cols-2">
          {[
            [
              ScanSearch,
              "Owner → Branch → Franchise Control",
              "One owner view across every branch and franchise, with consistent date ranges and clear metrics.",
              "ONE VIEW FOR THE WHOLE CHAIN",
              "#fb923c",
            ],
            [
              Truck,
              "Supply Request Workflow",
              "Franchises request items; branches approve, dispatch and track partial deliveries.",
              "AUDIT TRAIL ON EVERY MOVE",
              "#22c55e",
            ],
            [
              CloudSun,
              "Demand Forecast + Weather",
              "Predictions can use sales history, day of week, festivals and weather when suitable data is available.",
              "DATA-DRIVEN ESTIMATES",
              "#8b5cf6",
            ],
            [
              Trash2,
              "Wastage Tracker",
              "Track wastage cost per outlet and compare results against targets.",
              "COMPARE BRANCH VS FRANCHISE",
              "#3b82f6",
            ],
          ].map(([Icon, title, description, tag, color]) => (
            <div key={title} className="dz-card p-6">
              <span
                className="grid h-9 w-9 place-items-center rounded-lg"
                style={{
                  background: `${color}26`,
                  color,
                }}
              >
                <Icon size={18} />
              </span>

              <h3 className="mt-4 font-bold">{title}</h3>

              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                {description}
              </p>

              <div
                className="mt-4 text-[10px] font-bold tracking-wider"
                style={{ color }}
              >
                {tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================
          SUPPLY FLOW
      ========================= */}

      <section className="mx-auto max-w-5xl px-4 py-8 text-center md:py-12">
        <Pill icon={Truck}>Supply Workflow</Pill>

        <H2
          a="How a Request"
          b="Flows Through DineOps"
        />

        <div className="dz-card mt-10 p-6">
          <div className="relative grid grid-cols-2 gap-6 md:grid-cols-5">
            <div
              className="absolute left-[10%] right-[10%] top-6 hidden h-0.5 md:block"
              style={{
                background:
                  "linear-gradient(90deg,#ef4444,#fb923c,#22c55e,#3b82f6)",
              }}
            />

            {FLOW.map(([Icon, title, description, color]) => (
              <div key={title} className="relative">
                <span
                  className="dz-flow-icon mx-auto grid h-12 w-12 place-items-center rounded-full border-2 bg-[#141419]"
                  style={{
                    borderColor: color,
                    color,
                  }}
                >
                  <Icon size={18} />
                </span>

                <div className="mt-3 text-xs font-bold">{title}</div>

                <div className="text-[10px] text-[var(--muted)]">
                  {description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          SETUP
      ========================= */}

      <section className="mx-auto max-w-5xl px-4 py-8 text-center md:py-12">
        <Pill icon={Target}>Setup</Pill>

        <H2 a="Live on the" b="Same Day" />

        <Sub>
          Access DineOps through a browser on your supported device.
        </Sub>

        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {[
            [
              "Create Owner Account",
              "Create an owner account and configure your business.",
            ],
            [
              "Set Up Your Branch",
              "Add products, branches, franchises and supply links.",
            ],
            [
              "Assign Managers",
              "Configure appropriate access for each manager.",
            ],
            [
              "Watch Your Business",
              "Track sales, stock and wastage from your dashboard.",
            ],
          ].map(([title, description], index) => (
            <div key={title}>
              <span className="hd mx-auto grid h-12 w-12 place-items-center rounded-full border border-orange-500/50 bg-orange-500/10 text-sm font-bold text-orange-400">
                0{index + 1}
              </span>

              <h3 className="mt-4 text-sm font-bold">{title}</h3>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================
          COMPARISON
      ========================= */}

      <section
        id="compare"
        className="mx-auto max-w-5xl px-4 py-8 text-center md:py-12"
      >
        <Pill icon={Sparkles}>Compare</Pill>

        <H2
          a="Branch Performance,"
          b="Side by Side"
        />

        <Sub>
          Explore sample metrics to understand how branch performance can
          be compared.
        </Sub>

        <div className="dz-card mt-10 p-5 text-left">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(MET).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setM(key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                    m === key
                      ? "dz-gb text-white"
                      : "bg-white/5 text-[var(--muted)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-bold text-[var(--muted)]">
              SAMPLE DATA — NOT LIVE BUSINESS DATA
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={WEEKLY_DATA}
                margin={{
                  top: 12,
                  right: 12,
                  left: -18,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="4 6"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#A1A1AA",
                    fontSize: 12,
                  }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#A1A1AA",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  cursor={{
                    stroke: "rgba(255,255,255,0.2)",
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    background: "#19191F",
                    border: "1px solid #343442",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "#A1A1AA",
                    marginBottom: "6px",
                  }}
                  formatter={(value) => [value, MET[m]]}
                />

                <Line
                  type="monotone"
                  dataKey={m}
                  name={MET[m]}
                  stroke={GRAPH_COLORS[m]}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: GRAPH_COLORS[m],
                    stroke: "#141419",
                    strokeWidth: 3,
                  }}
                  connectNulls
                  animationDuration={700}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[620px] border-separate border-spacing-y-1.5 text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="p-3 text-left">Feature</th>
                <th className="p-3 text-orange-400">DineOps</th>
                <th className="p-3">Single-outlet POS</th>
                <th className="p-3">Spreadsheets</th>
              </tr>
            </thead>

            <tbody>
              {ROWS.map(([feature, dineops, pos, spreadsheets]) => (
                <tr key={feature} className="bg-[#141419]">
                  <td className="rounded-l-lg p-3 text-left font-bold">
                    {feature}
                  </td>

                  <td className={`bg-black/25 p-3 ${cell(dineops)}`}>
                    {dineops}
                  </td>

                  <td className={`p-3 ${cell(pos)}`}>
                    {pos}
                  </td>

                  <td className={`rounded-r-lg p-3 ${cell(spreadsheets)}`}>
                    {spreadsheets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================
          PROJECT GOALS
      ========================= */}

      <section className="mx-auto max-w-5xl px-4 py-8 text-center md:py-12">
        <Pill icon={Leaf}>Project Goals</Pill>

        <H2
          a="Why We"
          b="Built DineOps"
        />

        <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
          {[
            [
              TrendingDown,
              "The problem",
              "Manual demand estimation can contribute to food waste across outlets.",
            ],
            [
              Target,
              "The target",
              "Track wastage and use better demand estimates to support reduction goals.",
            ],
            [
              Leaf,
              "The impact",
              "Support more responsible food management and SDG 12.3 objectives.",
            ],
          ].map(([Icon, title, description]) => (
            <div key={title} className="dz-card p-5">
              <div className="text-orange-400">
                <Icon size={18} />
              </div>

              <h3 className="mt-3 text-sm font-bold">{title}</h3>

              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================
          DOWNLOAD
      ========================= */}

      <section
        id="download"
        className="mx-auto max-w-3xl px-4 pb-6 pt-8 text-center md:pb-8 md:pt-12"
      >
        <Pill icon={Smartphone}>Install</Pill>

        <H2
          a="Use DineOps"
          b="Like an App"
        />

        <Sub>
          If your browser and deployment support installation, you can install
          DineOps as a web app.
        </Sub>

        <div className="dz-card mt-10 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/20 text-blue-400">
                <Smartphone />
              </span>

              <div>
                <div className="font-bold">DineOps Web App</div>

                <div className="text-[11px] text-[var(--muted)]">
                  Chrome / Edge · Android · Windows
                </div>
              </div>
            </div>

            <Btn href="/login-portal" kind="blue">
              Open DineOps
            </Btn>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-2">
            <div>
              <div className="mb-3 text-[10px] font-bold tracking-wider text-[var(--muted)]">
                WHAT IT DOES
              </div>

              {[
                "Full-screen app window when installed",
                "Responsive phone, tablet and desktop layout",
                "Access based on your configured account",
              ].map((item) => (
                <div key={item} className="flex gap-2 py-1 text-xs">
                  <Check
                    size={14}
                    className="mt-0.5 shrink-0 text-green-400"
                  />
                  {item}
                </div>
              ))}
            </div>

            <div>
              <div className="mb-3 text-[10px] font-bold tracking-wider text-[var(--muted)]">
                HOW TO USE
              </div>

              {[
                "Open DineOps in a supported browser",
                "Use the browser install option if available",
                "Launch the app from your device",
              ].map((item, index) => (
                <div key={item} className="flex gap-2 py-1 text-xs">
                  <span className="font-bold text-orange-400">
                    {index + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          EXTRA INFORMATION
      ========================= */}

      <section className="mx-auto grid max-w-3xl gap-4 px-4 pb-8 md:grid-cols-2 md:pb-12">
        <div className="dz-card flex gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-500/20 text-indigo-300">
            <FileDown size={16} />
          </span>

          <div>
            <div className="text-xs font-bold">Export to CSV</div>

            <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
              Export sales, stock and wastage reports when the corresponding
              report functionality is connected.
            </p>
          </div>
        </div>

        <div className="dz-card flex gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-500/20 text-orange-400">
            <Info size={16} />
          </span>

          <div>
            <div className="text-xs font-bold">Need Help Setting Up?</div>

            <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
              Contact your DineOps team for assistance with business setup.
            </p>

            <a
              href="#contact"
              onClick={(event) => handleNavClick(event, "contact")}
              className="mt-1 inline-block text-[11px] font-bold text-orange-400"
            >
              Request Setup Help
            </a>
          </div>
        </div>
      </section>

      {/* =========================
          FREE DEMO
      ========================= */}

      <section
        id="demo"
        className="mx-auto max-w-4xl px-4 py-8 text-center md:py-12"
      >
        <Pill icon={FileText}>Free Demo</Pill>

        <h2 className="mt-5 text-4xl font-bold leading-[1.1] md:text-[52px]">
          Try DineOps With{" "}
          <span
            style={{
              background: "linear-gradient(90deg,#22d3ee,#34d399)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Demo Data
          </span>
        </h2>

        <Sub>
          Explore the product using sample data when the demo environment is
          configured. Sample data is not live restaurant data.
        </Sub>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["✅", "Explore Modules", "See the available modules"],
            ["🚫", "No Payment Here", "No payment collected on this page"],
            ["🍽️", "Sample Data", "Clearly labelled examples"],
            ["🤝", "Guided Setup", "Review your workflow"],
          ].map(([emoji, title, description]) => (
            <div key={title} className="dz-card p-4">
              <div className="text-xl">{emoji}</div>

              <div className="mt-2 text-xs font-bold">{title}</div>

              <div className="mt-1 text-[10px] text-[var(--muted)]">
                {description}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn href="/login?demo=1" kind="green">
            Start Demo
          </Btn>

          <Btn
            href="#contact"
            kind="ghost"
            onClick={(event) => handleNavClick(event, "contact")}
          >
            <Mail size={14} />
            Request via Email
          </Btn>
        </div>
      </section>

      {/* =========================
          CONTACT CTA
      ========================= */}

      <section
        id="contact"
        className="mx-auto max-w-3xl px-4 pb-8 md:pb-12"
      >
        <div
          className="dz-card dz-contact-panel p-8 text-center sm:p-14"
          style={theme === "dark" ? {
            background:
              "radial-gradient(520px 220px at 50% 0%,rgba(236,72,153,.16),transparent), linear-gradient(160deg,#111525,#0e1120)",
          } : undefined}
        >
          <h2 className="text-3xl font-bold md:text-4xl">
            Your Restaurant Chain Deserves{" "}
            <span className="dz-g">Smarter Software.</span>
          </h2>

          <p className="mt-3 text-sm text-[var(--muted)]">
            Contact the DineOps team to discuss your restaurant management
            requirements.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Btn href="mailto:you@example.com?subject=DineOps%20Enquiry">
              <Mail size={14} />
              Send an Email
            </Btn>

            <Btn
              href="/get-started"
              kind="ghost"
            >
              <Building2 size={14} />
              Get Started
            </Btn>
          </div>

          <p className="mt-5 text-[11px] text-[var(--muted)]">
            Restaurant operations · Branch management · Inventory tracking
          </p>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="border-t border-white/5">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-xs text-[var(--muted)] sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}

          <div>
            <a
              href="#top"
              onClick={(event) => handleNavClick(event, "top")}
              className="hd inline-flex items-center gap-2 text-lg font-bold text-white"
            >
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              DineOps
            </a>

            <p className="mt-3 max-w-[240px] leading-6">
              A restaurant and franchise management platform designed to
              help businesses organise branch operations, inventory and
              reporting.
            </p>
          </div>

          {/* Product navigation */}

          <div>
            <h4 className="mb-3 text-[10px] font-bold tracking-wider text-white">
              PRODUCT
            </h4>

            {NAV.slice(0, 4).map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(event) => handleNavClick(event, id)}
                className="block py-1.5 transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}

            <a
              href="#download"
              onClick={(event) => handleNavClick(event, "download")}
              className="block py-1.5 transition-colors hover:text-white"
            >
              Download
            </a>
          </div>

          {/* Modules */}

          <div>
            <h4 className="mb-3 text-[10px] font-bold tracking-wider text-white">
              MODULES
            </h4>

            {[
              "Inventory Management",
              "Supply Requests",
              "Sales & Wastage",
              "Branch Comparison",
              "Demand Forecasting",
            ].map((item) => (
              <a
                key={item}
                href="#features"
                onClick={(event) => handleNavClick(event, "features")}
                className="block py-1.5 transition-colors hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Contact and account */}

          <div>
            <h4 className="mb-3 text-[10px] font-bold tracking-wider text-orange-400">
              GET IN TOUCH
            </h4>

            <a
              href="#contact"
              onClick={(event) => handleNavClick(event, "contact")}
              className="flex items-center gap-2 py-1.5 transition-colors hover:text-white"
            >
              <Mail size={13} />
              Contact DineOps
            </a>

            <a
              href="/get-started"
              className="flex items-center gap-2 py-1.5 transition-colors hover:text-white"
            >
              <Building2 size={13} />
              Get Started
            </a>

            <a
              href="/login-portal"
              className="flex items-center gap-2 py-1.5 transition-colors hover:text-white"
            >
              <LogIn size={13} />
              Login
            </a>

            <a
              href="#top"
              onClick={(event) => handleNavClick(event, "top")}
              className="mt-3 inline-flex items-center gap-2 text-orange-400 transition-colors hover:text-orange-300"
            >
              Back to top ↑
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 px-4 py-5 text-center text-[11px] text-[var(--muted)]">
          <p>
            © {new Date().getFullYear()} DineOps. All rights reserved.
          </p>

          <p className="mt-2">
            Restaurant operations, connected.
          </p>
        </div>
      </footer>
    </div>
  );
}