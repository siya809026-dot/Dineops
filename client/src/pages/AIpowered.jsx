import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  BrainCircuit,
  Utensils,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Package,
  IndianRupee,
  CloudRain,
  Sun,
  ShoppingBasket,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  RefreshCw,
  CookingPot,
  BarChart3,
  Clock,
  Lightbulb,
  ChevronRight,
  ShieldCheck,
  Moon,
} from "lucide-react";

/* ---------------- DEMO DATA ---------------- */

const branches = {
  Gurugram: { sales: 82000, orders: 324, wastage: 3.8, factor: 1 },
  Delhi: { sales: 76000, orders: 291, wastage: 5.1, factor: 0.85 },
  Noida: { sales: 91000, orders: 368, wastage: 2.9, factor: 1.12 },
  Faridabad: { sales: 68000, orders: 247, wastage: 4.3, factor: 0.72 },
};

const festivals = {
  Normal: { factor: 1, description: "Normal business day" },
  Diwali: { factor: 1.35, description: "Potentially higher festive demand" },
  Holi: { factor: 1.2, description: "Potentially higher festive demand" },
  Eid: { factor: 1.25, description: "Potentially higher festive demand" },
  "New Year": { factor: 1.4, description: "Potentially higher festive demand" },
};

const menuData = [
  { name: "Butter Chicken", baseDemand: 80, available: 70, unit: "portions" },
  { name: "Paneer Tikka", baseDemand: 65, available: 55, unit: "portions" },
  { name: "Dal Makhani", baseDemand: 60, available: 75, unit: "portions" },
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

/* ---------------- SMALL COMPONENTS ---------------- */

function SectionHeading({ label, title, description }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
        {label}
      </p>

      <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-[#0e1728] p-5 transition duration-300 hover:border-orange-400/30 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function IconBox({ children }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-400/10 text-orange-500">
      {children}
    </div>
  );
}

/* ---------------- NAVBAR ---------------- */

function Navbar({ isDark, setIsDark }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = `whitespace-nowrap text-sm transition hover:text-orange-500 ${
    isDark ? "text-slate-400" : "text-slate-500"
  }`;

  const ThemeButton = ({ mobile = false }) => (
    <button
      type="button"
      onClick={() => setIsDark((previous) => !previous)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light Mode" : "Dark Mode"}
      className={`flex h-10 items-center justify-center rounded-xl border transition hover:border-orange-500 ${
        mobile ? "w-full gap-2" : "w-10"
      } ${
        isDark
          ? "border-slate-700 bg-[#101421] text-yellow-400"
          : "border-slate-300 bg-white text-orange-500"
      }`}
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}

      {mobile && (
        <span className="text-sm font-medium">
          {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </span>
      )}
    </button>
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? "border-slate-800 bg-[#070910]/95"
          : "border-slate-200 bg-white/95"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
            <Utensils size={19} />
          </span>

          <span
            className={`text-xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Dine<span className="text-orange-500">Ops</span>
          </span>
        </Link>

        {/* Desktop Navigation */}

        <div className="hidden items-center gap-6 lg:flex">
          <Link to="/#features" className={navLinkClass}>
            Features
          </Link>

          <Link to="/pricing" className={navLinkClass}>
            Pricing
          </Link>

          <Link to="/about" className={navLinkClass}>
            About
          </Link>

          <Link
            to="/ai-powered"
            className="whitespace-nowrap text-sm font-semibold text-orange-500"
          >
            AI Powered
          </Link>

          <ThemeButton />

          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Get Started
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Mobile Menu Button */}

        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          className={`rounded-lg border p-2 transition hover:border-orange-500 lg:hidden ${
            isDark
              ? "border-slate-700 text-white"
              : "border-slate-300 text-slate-800"
          }`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {/* Mobile Navigation */}

      {menuOpen && (
        <div
          className={`border-t px-5 py-5 lg:hidden ${
            isDark
              ? "border-slate-800 bg-[#0b0e17]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-5">
            <Link to="/#features" onClick={closeMenu} className={navLinkClass}>
              Features
            </Link>

            <Link to="/pricing" onClick={closeMenu} className={navLinkClass}>
              Pricing
            </Link>

            <Link to="/about" onClick={closeMenu} className={navLinkClass}>
              About
            </Link>

            <Link
              to="/ai-powered"
              onClick={closeMenu}
              className="text-sm font-semibold text-orange-500"
            >
              AI Powered
            </Link>

            <ThemeButton mobile />

            <Link
              to="/get-started"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------- PROBLEM / SOLUTION CARD ---------------- */

function SolutionCard({ icon: Icon, problem, solution, benefit }) {
  return (
    <Card className="group h-full">
      <IconBox>
        <Icon size={21} />
      </IconBox>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-rose-400">
        The problem
      </p>

      <h3 className="mt-2 text-base font-semibold text-white">{problem}</h3>

      <div className="my-4 flex items-center gap-2 text-orange-500">
        <ArrowRight size={17} />
        <span className="text-xs font-bold">DineOps solution</span>
      </div>

      <p className="text-sm leading-6 text-slate-400">{solution}</p>

      <div className="mt-5 flex items-start gap-2 border-t border-slate-800 pt-4">
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />

        <p className="text-xs leading-5 text-emerald-500">{benefit}</p>
      </div>
    </Card>
  );
}

/* ---------------- INTERACTIVE DEMO ---------------- */

function PlanningDemo() {
  const [branch, setBranch] = useState("Gurugram");
  const [festival, setFestival] = useState("Diwali");
  const [weather, setWeather] = useState("Normal");
  const [showResult, setShowResult] = useState(false);

  const branchData = branches[branch];
  const festivalData = festivals[festival];

  const weatherFactor =
    weather === "Rainy" ? 0.9 : weather === "Hot" ? 1.08 : 1;

  const demandFactor = festivalData.factor * weatherFactor;

  const projectedOrders = Math.round(branchData.orders * demandFactor);
  const projectedSales = Math.round(branchData.sales * demandFactor);
  const demandPercent = Math.round((demandFactor - 1) * 100);

  const preparations = menuData.map((item) => {
    const expected = Math.ceil(
      item.baseDemand *
        branchData.factor *
        festivalData.factor *
        weatherFactor
    );

    const available = Math.round(item.available * branchData.factor);
    const shortage = Math.max(0, expected - available);

    return { ...item, expected, available, shortage };
  });

  const reset = () => {
    setBranch("Gurugram");
    setFestival("Diwali");
    setWeather("Normal");
    setShowResult(false);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      {/* INPUTS */}

      <Card>
        <div className="flex items-center gap-3">
          <IconBox>
            <BrainCircuit size={22} />
          </IconBox>

          <div>
            <h3 className="font-bold text-white">Try the AI Assistant</h3>
            <p className="mt-1 text-xs text-slate-400">
              Change the situation for your restaurant.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <MapPin size={15} className="text-orange-500" />
              Which branch?
            </span>

            <select
              value={branch}
              onChange={(event) => {
                setBranch(event.target.value);
                setShowResult(false);
              }}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
            >
              {Object.keys(branches).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <CalendarDays size={15} className="text-orange-500" />
              What kind of day?
            </span>

            <select
              value={festival}
              onChange={(event) => {
                setFestival(event.target.value);
                setShowResult(false);
              }}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
            >
              {Object.keys(festivals).map((name) => (
                <option key={name} value={name}>
                  {name === "Normal" ? "Normal day" : name}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Sun size={15} className="text-orange-500" />
              Weather conditions
            </span>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Normal", label: "Normal", icon: Sun },
                { name: "Rainy", label: "Rainy", icon: CloudRain },
                { name: "Hot", label: "Hot", icon: TrendingUp },
              ].map(({ name, label, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setWeather(name);
                    setShowResult(false);
                  }}
                  className={`flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-xs transition ${
                    weather === name
                      ? "border-orange-500 bg-orange-500/10 text-orange-500"
                      : "border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowResult(true)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            <Sparkles size={17} />
            Generate Planning Report
          </button>

          <button
            type="button"
            onClick={reset}
            className="flex min-h-10 w-full items-center justify-center gap-2 text-xs text-slate-400 transition hover:text-orange-500"
          >
            <RefreshCw size={13} />
            Reset example
          </button>
        </div>
      </Card>

      {/* RESULTS */}

      <div className="space-y-5">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Lightbulb size={22} />
              </div>

              <div>
                <h3 className="font-bold text-white">Your Restaurant Plan</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {branch} · {festival}
                </p>
              </div>
            </div>

            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[10px] font-semibold text-amber-500">
              DEMO RESULTS
            </span>
          </div>

          {showResult && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-500"
            >
              <CheckCircle2 size={17} className="mr-2 inline" />
              Planning report updated for your selected scenario.
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShoppingBasket size={15} className="text-orange-500" />
                Expected orders
              </div>

              <p className="mt-3 text-2xl font-bold text-white">
                {projectedOrders}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Illustrative estimate
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <IndianRupee size={15} className="text-orange-500" />
                Expected sales
              </div>

              <p className="mt-3 text-2xl font-bold text-white">
                {money(projectedSales)}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Illustrative estimate
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-start gap-3">
              {demandPercent >= 0 ? (
                <TrendingUp size={19} className="mt-0.5 text-emerald-500" />
              ) : (
                <TrendingDown size={19} className="mt-0.5 text-rose-500" />
              )}

              <div>
                <p className="text-sm font-semibold text-white">
                  {festival === "Normal"
                    ? "Regular-day planning"
                    : `${festival} demand scenario`}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {festival === "Normal"
                    ? "Use the branch's normal sales history to plan food, staffing and stock."
                    : `The demo assumes demand could be ${Math.abs(demandPercent)}% ${
                        demandPercent >= 0 ? "higher" : "lower"
                      } than its sample baseline. Use actual past sales to validate this.`}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <IconBox>
              <CookingPot size={21} />
            </IconBox>

            <div>
              <h3 className="font-bold text-white">
                What should the kitchen prepare?
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Example menu and stock requirements
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {preparations.map((item) => (
              <div key={item.name}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-200">
                    {item.name}
                  </span>

                  <span className="text-xs text-slate-400">
                    {item.available} available
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">
                    Suggested scenario quantity:{" "}
                    <span className="font-semibold text-white">
                      {item.expected} portions
                    </span>
                  </span>

                  {item.shortage > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                      <AlertTriangle size={13} />
                      Check {item.shortage} more portions
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                      <CheckCircle2 size={13} />
                      Sample stock sufficient
                    </span>
                  )}
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.shortage > 0 ? "bg-orange-500" : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (item.available / Math.max(1, item.expected)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
            <p className="text-xs leading-5 text-slate-300">
              <strong className="text-orange-500">What this means:</strong>{" "}
              An actual DineOps system could compare forecasted demand with
              live stock and help the manager decide what needs preparation
              or purchasing.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */

export default function AIpowered() {
  const [isDark, setIsDark] = useState(true);

  return (
    <main
      data-theme={isDark ? "dark" : "light"}
      className={`ai-page min-h-screen overflow-x-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[#080d18] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <style>{`
        .ai-page[data-theme="light"] {
          color: #0f172a;
          background-color: #f8fafc;
        }

        .ai-page[data-theme="light"] .text-white {
          color: #0f172a !important;
        }

        .ai-page[data-theme="light"] .text-slate-200 {
          color: #334155 !important;
        }

        .ai-page[data-theme="light"] .text-slate-300 {
          color: #475569 !important;
        }

        .ai-page[data-theme="light"] .text-slate-400 {
          color: #64748b !important;
        }

        .ai-page[data-theme="light"] .text-slate-500 {
          color: #64748b !important;
        }

        .ai-page[data-theme="light"] .text-slate-600 {
          color: #64748b !important;
        }

        .ai-page[data-theme="light"] [class*="border-slate-800"],
        .ai-page[data-theme="light"] [class*="border-slate-700"] {
          border-color: #e2e8f0 !important;
        }

        .ai-page[data-theme="light"] [class*="bg-[#080d18]"],
        .ai-page[data-theme="light"] [class*="bg-[#0a1120]"],
        .ai-page[data-theme="light"] [class*="bg-[#0e1728]"],
        .ai-page[data-theme="light"] [class*="bg-[#060a12]"],
        .ai-page[data-theme="light"] [class*="bg-[#0b1220]"] {
          background-color: #ffffff !important;
        }

        .ai-page[data-theme="light"] [class*="bg-slate-950"] {
          background-color: #f1f5f9 !important;
        }

        .ai-page[data-theme="light"] [class*="bg-slate-800"] {
          background-color: #e2e8f0 !important;
        }

        .ai-page[data-theme="light"] select {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }

        .ai-page[data-theme="light"] select option {
          background-color: #ffffff;
          color: #0f172a;
        }

        .ai-page[data-theme="light"] footer {
          background-color: #ffffff !important;
          border-color: #e2e8f0 !important;
        }

        .ai-page[data-theme="light"] section.border-y,
        .ai-page[data-theme="light"] section.border-b {
          border-color: #e2e8f0 !important;
        }

        .ai-page[data-theme="light"] .border-t {
          border-color: #e2e8f0;
        }

        .ai-page[data-theme="light"] .bg-gradient-to-br {
          background-image: linear-gradient(
            to bottom right,
            #fff7ed,
            #ffffff,
            #ffffff
          ) !important;
        }
      `}</style>

      <Navbar isDark={isDark} setIsDark={setIsDark} />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-500">
              <BrainCircuit size={16} />
              Smarter Restaurant Management
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Run your restaurant.
              <br />
              <span className="text-orange-500">
                Let AI help with the planning.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Stop guessing how much food to prepare, what stock to order and
              which branch needs attention. DineOps AI is designed to turn
              restaurant data into practical recommendations for your team.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#try-ai"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Try an AI Example
                <ArrowRight size={17} />
              </a>

              <a
                href="#how-it-helps"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-orange-500/50"
              >
                See How It Helps
                <ChevronRight size={17} />
              </a>
            </div>

            <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} className="text-emerald-500" />
              Designed for multi-branch restaurant operations
            </p>
          </div>

          {/* SIMPLE VISUAL EXPLANATION */}

          <Card className="relative overflow-hidden">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white">
                <BrainCircuit size={25} />
              </div>

              <div>
                <p className="text-lg font-bold text-white">Your AI Assistant</p>
                <p className="text-xs text-slate-400">
                  From data to daily decisions
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: BarChart3,
                  title: "Looks at past sales",
                  text: "What sold, when and at which branch?",
                },
                {
                  icon: CalendarDays,
                  title: "Understands the situation",
                  text: "Festival, weekday, weather and local demand.",
                },
                {
                  icon: CookingPot,
                  title: "Suggests the next steps",
                  text: "What to prepare, check, order or plan.",
                },
              ].map(({ icon: Icon, title, text }, index) => (
                <div key={title}>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="rounded-lg bg-orange-500/10 p-2.5 text-orange-500">
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {text}
                      </p>
                    </div>
                  </div>

                  {index < 2 && (
                    <div className="flex h-6 items-center pl-7">
                      <div className="h-full border-l border-dashed border-orange-500/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-600">
                    The result: clearer decisions
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Less guesswork, better preparation planning and more
                    visibility across branches.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* PROBLEMS AI SOLVES */}

      <section
        id="how-it-helps"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20"
      >
        <SectionHeading
          label="Why restaurant owners need AI"
          title="Every day, restaurant managers face these problems."
          description="DineOps is designed to help turn these everyday management challenges into clearer, data-informed decisions."
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <SolutionCard
            icon={CookingPot}
            problem="How much food should we prepare tomorrow?"
            solution="Use previous orders and demand patterns to estimate the quantity needed."
            benefit="Plan kitchen preparation with less guesswork."
          />

          <SolutionCard
            icon={CalendarDays}
            problem="A festival is coming. What should we do?"
            solution="Review previous festival sales and create a preparation plan for each branch."
            benefit="Prepare for busy periods in advance."
          />

          <SolutionCard
            icon={ShoppingBasket}
            problem="We keep running out of ingredients."
            solution="Compare required quantities against available stock and highlight potential shortages."
            benefit="Identify stock that needs attention."
          />

          <SolutionCard
            icon={TrendingDown}
            problem="We prepare too much and waste food."
            solution="Compare food prepared, food sold and leftovers to identify repeated over-preparation."
            benefit="Find opportunities to reduce avoidable waste."
          />

          <SolutionCard
            icon={BarChart3}
            problem="Which branch needs my attention?"
            solution="Compare branch sales, order trends and wastage using a common dashboard."
            benefit="Spot performance differences more easily."
          />

          <SolutionCard
            icon={CloudRain}
            problem="Weather and local demand keep changing."
            solution="Combine weather observations with past orders to study how demand changes."
            benefit="Make plans using more relevant information."
          />
        </div>
      </section>

      {/* INTERACTIVE EXAMPLE */}

      <section
        id="try-ai"
        className="scroll-mt-24 border-y border-slate-800 bg-[#0a1120]"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <SectionHeading
            label="See it in action"
            title="What would your restaurant need tomorrow?"
            description="Choose a branch, a festival and a weather scenario. The example will show how a future DineOps planning assistant could translate business data into preparation suggestions."
          />

          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertTriangle size={19} className="shrink-0 text-amber-500" />

            <p className="text-xs leading-5 text-slate-300">
              This is an interactive demonstration with fictional figures and
              rule-based calculations, not a connected AI model or actual
              restaurant data.
            </p>
          </div>

          <PlanningDemo />
        </div>
      </section>

      {/* MULTI BRANCH MANAGEMENT */}

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <SectionHeading
          label="Built for multi-branch businesses"
          title="One business. Multiple branches. Better visibility."
          description="The central management team can use shared reporting to compare branches and identify where support is needed."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <IconBox>
                <BarChart3 size={21} />
              </IconBox>

              <div>
                <h3 className="font-bold text-white">Branch comparison</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Illustrative sales and wastage data
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {Object.entries(branches).map(([name, data]) => (
                <div key={name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-300">{name}</span>
                    <span className="text-sm font-semibold text-white">
                      {money(data.sales)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-300"
                      style={{ width: `${(data.sales / 91000) * 100}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>{data.orders} sample orders</span>
                    <span>Wastage: {data.wastage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <div className="flex items-start gap-4">
                <IconBox>
                  <Users size={21} />
                </IconBox>

                <div>
                  <h3 className="font-semibold text-white">
                    For the central manager
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    See branch-wise performance, compare operations and
                    identify unusual changes without checking multiple reports
                    separately.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-4">
                <IconBox>
                  <Package size={21} />
                </IconBox>

                <div>
                  <h3 className="font-semibold text-white">
                    For the branch manager
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Review expected demand, stock availability and preparation
                    requirements for the branch.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-4">
                <IconBox>
                  <Clock size={21} />
                </IconBox>

                <div>
                  <h3 className="font-semibold text-white">
                    For daily operations
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Bring sales, inventory and planning information together so
                    teams can spend less time collecting reports and more time
                    acting on them.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FINAL FLOW */}

      <section className="border-y border-slate-800 bg-[#0a1120]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <SectionHeading
            label="Simple workflow"
            title="How DineOps AI would work in your business."
            description="The real system will need connected data and a tested forecasting model before it can generate reliable predictions."
          />

          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                step: "01",
                icon: BarChart3,
                title: "Collect",
                text: "Gather historical sales, orders, stock and branch data.",
              },
              {
                step: "02",
                icon: BrainCircuit,
                title: "Analyze",
                text: "Find patterns in dates, demand, festivals and weather.",
              },
              {
                step: "03",
                icon: Lightbulb,
                title: "Recommend",
                text: "Suggest what to prepare, review or purchase.",
              },
              {
                step: "04",
                icon: CheckCircle2,
                title: "Improve",
                text: "Compare recommendations with actual results and learn from errors.",
              },
            ].map(({ step, icon: Icon, title, text }) => (
              <Card key={step}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-orange-500/60">
                    {step}
                  </span>
                  <Icon size={23} className="text-orange-500" />
                </div>

                <h3 className="mt-5 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {text}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#0e1728] to-[#0e1728] p-6 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-2 text-orange-500">
                <BrainCircuit size={22} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  DineOps Intelligence
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Manage your branches with more clarity.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Explore the DineOps platform and build a more connected
                approach to restaurant management.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/pricing"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-500/50"
              >
                View Pricing
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/get-started"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Get Started
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="border-t border-slate-800 bg-[#060a12]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white">
              <Utensils size={18} />
            </span>

            <span className="text-lg font-extrabold text-white">
              Dine<span className="text-orange-500">Ops</span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-400">
            <Link to="/" className="hover:text-orange-500">
              Home
            </Link>

            <Link to="/#features" className="hover:text-orange-500">
              Features
            </Link>

            <Link to="/about" className="hover:text-orange-500">
              About
            </Link>

            <Link to="/pricing" className="hover:text-orange-500">
              Pricing
            </Link>

            <Link to="/ai-powered" className="text-orange-500">
              AI Powered
            </Link>

            <Link to="/get-started" className="hover:text-orange-500">
              Get Started
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DineOps. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}