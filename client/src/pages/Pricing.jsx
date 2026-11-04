import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Clock3,
  CloudSun,
  CookingPot,
  Database,
  GitCompareArrows,
  IndianRupee,
  LayoutDashboard,
  Leaf,
  LockKeyhole,
  Menu,
  Moon,
  Package,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
  Warehouse,
  Utensils,
  Wallet,
  Zap,
  X,
} from "lucide-react";

const billingPeriods = [
  { years: 1, label: "1 Year", discount: "Standard plan" },
  { years: 2, label: "2 Years", discount: "Save 10%" },
  { years: 3, label: "3 Years", discount: "Best value" },
];

const includedFeatures = [
  { label: "Point of Sale (POS)", icon: Utensils },
  { label: "Inventory & recipe costing", icon: Package },
  { label: "Food wastage tracking", icon: Leaf },
  { label: "Staff & attendance", icon: Users },
  { label: "Daily sales & profit reports", icon: TrendingUp },
  { label: "Central kitchen management", icon: CookingPot },
  { label: "Purchase & supplier management", icon: Warehouse },
  { label: "Multi-branch dashboard", icon: LayoutDashboard },
  { label: "Demand forecasting", icon: CloudSun },
  { label: "Secure cloud data", icon: Database },
];

const addOns = [
  {
    name: "Advanced Analytics",
    description:
      "Get deeper insights into sales, profit margins, branch performance and business trends.",
    price: "₹199",
    unit: "/branch/month",
    icon: TrendingUp,
    tag: "Insights",
  },
  {
    name: "Warehouse Module",
    description:
      "Manage central warehouse stock, inter-branch transfers and supplier purchases.",
    price: "₹299",
    unit: "/business/month",
    icon: Warehouse,
    tag: "Operations",
  },
  {
    name: "Demand Forecasting",
    description:
      "Estimate future demand using sales history, seasonal trends and available business data.",
    price: "₹399",
    unit: "/branch/month",
    icon: Sparkles,
    tag: "AI powered",
  },
];

const faqs = [
  {
    question: "What is DineOps?",
    answer:
      "DineOps is a restaurant management platform designed to help restaurant owners manage their operations, monitor branches, control inventory and track business performance from one central dashboard.",
  },
  {
    question: "Can I manage multiple restaurant branches?",
    answer:
      "Yes. DineOps is designed for multi-branch restaurant businesses. The central dashboard can help you monitor branch performance, inventory, wastage and sales in one place.",
  },
  {
    question: "How does branch-based pricing work?",
    answer:
      "Your subscription cost depends on the number of branches covered by your selected plan. The final subscription amount should be confirmed before checkout.",
  },
  {
    question: "Can I add more branches later?",
    answer:
      "Yes. You can design your subscription workflow to accommodate additional branches as your restaurant business grows. The applicable charges will depend on your subscription terms.",
  },
  {
    question: "Can I change my subscription period?",
    answer:
      "You can contact the DineOps team to discuss changing your subscription period or adjusting your plan.",
  },
];

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);

export default function Pricing() {
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [openFAQ, setOpenFAQ] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  const isDark = theme === "dark";

  // Illustrative starting price; finalize before accepting payments.
  const monthlyPrice = 799;

  const discount =
    selectedPeriod === 3 ? 0.2 : selectedPeriod === 2 ? 0.1 : 0;

  const totalPrice = Math.round(
    monthlyPrice * 12 * selectedPeriod * (1 - discount)
  );

  const savings = monthlyPrice * 12 * selectedPeriod - totalPrice;

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleTheme() {
    setTheme((previous) => (previous === "dark" ? "light" : "dark"));
  }

  const navLinkClass = (active = false) =>
    `text-sm transition ${
      active
        ? "font-semibold text-orange-400"
        : isDark
          ? "text-zinc-300 hover:text-orange-400"
          : "text-slate-600 hover:text-orange-500"
    }`;

  const mobileLinkClass = (active = false) =>
    `rounded-lg px-4 py-3 text-sm transition ${
      active
        ? "bg-orange-400/10 font-semibold text-orange-500"
        : isDark
          ? "text-zinc-300 hover:bg-white/5 hover:text-orange-400"
          : "text-slate-600 hover:bg-slate-100 hover:text-orange-500"
    }`;

  return (
    <main
      data-theme={theme}
      className={`pricing-page min-h-screen overflow-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[#101012] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* THEME STYLES */}
      <style>{`
        .pricing-page[data-theme="light"] {
          background: #f8fafc;
          color: #172033;
        }

        .pricing-page[data-theme="light"] .text-white {
          color: #172033 !important;
        }

        .pricing-page[data-theme="light"] .text-zinc-200,
        .pricing-page[data-theme="light"] .text-zinc-300 {
          color: #334155 !important;
        }

        .pricing-page[data-theme="light"] .text-zinc-400 {
          color: #64748b !important;
        }

        .pricing-page[data-theme="light"] .text-zinc-500,
        .pricing-page[data-theme="light"] .text-zinc-600 {
          color: #64748b !important;
        }

        .pricing-page[data-theme="light"] header {
          background: rgba(255,255,255,.95) !important;
          border-color: #e2e8f0 !important;
        }

        .pricing-page[data-theme="light"] header .text-white {
          color: #172033 !important;
        }

        .pricing-page[data-theme="light"] #pricing-mobile-navigation {
          background: #ffffff !important;
          border-color: #e2e8f0 !important;
        }

        .pricing-page[data-theme="light"] .bg-\\[\\#111426\\],
        .pricing-page[data-theme="light"] .bg-\\[\\#17171c\\],
        .pricing-page[data-theme="light"] .bg-\\[\\#19191f\\],
        .pricing-page[data-theme="light"] .bg-\\[\\#141417\\] {
          background-color: #ffffff !important;
        }

        .pricing-page[data-theme="light"] .bg-\\[\\#19151a\\] {
          background-color: #fff7f2 !important;
        }

        .pricing-page[data-theme="light"] .bg-white\\/\\[0\\.025\\],
        .pricing-page[data-theme="light"] .bg-white\\/\\[0\\.02\\] {
          background-color: #f1f5f9 !important;
        }

        .pricing-page[data-theme="light"] .bg-white\\/\\[0\\.05\\] {
          background-color: #f1f5f9 !important;
        }

        .pricing-page[data-theme="light"] .border-white\\/10,
        .pricing-page[data-theme="light"] [class*="border-white/"] {
          border-color: #e2e8f0 !important;
        }

        .pricing-page[data-theme="light"] .border-b,
        .pricing-page[data-theme="light"] .border-t,
        .pricing-page[data-theme="light"] .border-r {
          border-color: #e2e8f0;
        }

        .pricing-page[data-theme="light"] footer {
          border-color: #e2e8f0 !important;
        }

        .pricing-page[data-theme="light"] select {
          background-color: #ffffff;
          color: #172033;
        }
      `}</style>

      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/[0.07] blur-[130px]" />

        <div className="absolute right-[-180px] top-[650px] h-[400px] w-[400px] rounded-full bg-blue-600/[0.06] blur-[120px]" />
      </div>

      <div className="relative">
        {/* NAVBAR */}
        <header
          className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
            isDark
              ? "border-white/10 bg-[#101012]/95"
              : "border-slate-200 bg-white/95"
          }`}
        >
          <nav
            className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8"
            aria-label="Main navigation"
          >
            {/* LOGO */}
            <Link
              to="/"
              onClick={closeMenu}
              className={`flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              aria-label="DineOps home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400 text-[#17110e]">
                <Utensils size={19} />
              </span>

              <span>
                Dine<span className="text-orange-400">Ops</span>
              </span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <div className="hidden items-center gap-6 md:flex lg:gap-8">
              <a href="/#features" className={navLinkClass()}>
                Features
              </a>

              <Link
                to="/pricing"
                onClick={closeMenu}
                aria-current="page"
                className={navLinkClass(true)}
              >
                Pricing
              </Link>

              <Link
                to="/about"
                onClick={closeMenu}
                className={navLinkClass()}
              >
                About
              </Link>

              <Link
                to="/contact"
                onClick={closeMenu}
                className={navLinkClass()}
              >
                Contact
              </Link>

              {/* THEME TOGGLE */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                title={`Switch to ${isDark ? "light" : "dark"} mode`}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                  isDark
                    ? "border-white/10 text-yellow-300 hover:border-orange-400/50 hover:bg-white/5"
                    : "border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                {isDark ? <Sun size={19} /> : <Moon size={19} />}
              </button>

              <Link
                to="/get-started"
                onClick={closeMenu}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ff895f] px-4 py-2.5 text-sm font-semibold text-[#19110e] transition hover:bg-[#ffa17e]"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* MOBILE CONTROLS */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                  isDark
                    ? "border-white/10 text-yellow-300"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                {isDark ? <Sun size={19} /> : <Moon size={19} />}
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen((previous) => !previous)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${
                  isDark
                    ? "border-white/10 text-white hover:border-orange-400/50"
                    : "border-slate-200 text-slate-800 hover:border-orange-400"
                }`}
                aria-label={
                  menuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={menuOpen}
                aria-controls="pricing-mobile-navigation"
              >
                {menuOpen ? <X size={23} /> : <Menu size={23} />}
              </button>
            </div>
          </nav>

          {/* MOBILE NAVIGATION */}
          {menuOpen && (
            <div
              id="pricing-mobile-navigation"
              className={`border-t px-5 py-4 md:hidden ${
                isDark
                  ? "border-white/10 bg-[#101012]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-1">
                <a
                  href="/#features"
                  onClick={closeMenu}
                  className={mobileLinkClass()}
                >
                  Features
                </a>

                <Link
                  to="/pricing"
                  onClick={closeMenu}
                  aria-current="page"
                  className={mobileLinkClass(true)}
                >
                  Pricing
                </Link>

                <Link
                  to="/about"
                  onClick={closeMenu}
                  className={mobileLinkClass()}
                >
                  About
                </Link>

                <Link
                  to="/contact"
                  onClick={closeMenu}
                  className={mobileLinkClass()}
                >
                  Contact
                </Link>

                <Link
                  to="/get-started"
                  onClick={closeMenu}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#ff895f] px-4 py-3 text-sm font-semibold text-[#19110e] transition hover:bg-[#ffa17e]"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* PRICING HERO */}
        <section className="px-5 pb-10 pt-16 sm:px-8 sm:pt-24">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/[0.07] px-4 py-2 text-xs font-medium tracking-wide text-orange-300">
              <Sparkles size={14} />
              SIMPLE, TRANSPARENT PRICING
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.12] tracking-[-0.045em] sm:text-5xl md:text-6xl">
              One platform.
              <br className="sm:hidden" />{" "}
              <span className="text-[#ff9568]">
                Every branch under control.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Simplify restaurant operations, reduce food wastage and monitor
              every branch from one powerful dashboard.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-zinc-400 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-emerald-400" />
                Multi-branch management
              </span>

              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-emerald-400" />
                Centralized reporting
              </span>

              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-emerald-400" />
                Transparent pricing
              </span>
            </div>
          </div>
        </section>

        {/* MAIN PRICING CARD */}
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[28px] border border-orange-400/70 bg-[#111426] shadow-[0_0_70px_rgba(249,115,22,0.07)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent" />

              <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                {/* PRICE */}
                <div className="border-b border-white/[0.08] p-7 sm:p-10 lg:border-b-0 lg:border-r">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">
                    <Zap size={15} />
                    DineOps Complete
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Everything your restaurant needs.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    One connected workspace for restaurant owners, branch
                    managers and central operations teams.
                  </p>

                  <div className="mt-8 flex flex-wrap items-end gap-2">
                    <span className="pb-1 text-2xl text-orange-300">₹</span>

                    <span className="text-6xl font-semibold tracking-[-0.06em] sm:text-7xl">
                      {formatINR(monthlyPrice)}
                    </span>

                    <span className="pb-2 text-sm text-zinc-400">
                      / branch / month
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-zinc-500">
                    Illustrative starting price · Final pricing to be confirmed
                  </p>

                  <Link
                    to="/get-started"
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff895f] px-5 py-3.5 text-sm font-semibold text-[#19110e] transition hover:bg-[#ffa17e]"
                  >
                    Get Started
                    <ArrowRight size={17} />
                  </Link>

                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">
                    <ShieldCheck size={15} className="text-emerald-400" />
                    Talk to our team before subscribing
                  </div>
                </div>

                {/* INCLUDED FEATURES */}
                <div className="p-7 sm:p-10">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Check size={18} />
                    </div>

                    <div>
                      <h3 className="font-semibold">What's included</h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        Core restaurant management tools
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                    {includedFeatures.map((feature) => {
                      const Icon = feature.icon;

                      return (
                        <div
                          key={feature.label}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-300">
                            <Icon size={15} />
                          </div>

                          <div className="flex items-start gap-2 pt-1">
                            <Check
                              size={14}
                              className="mt-0.5 shrink-0 text-emerald-400"
                            />

                            <span className="text-sm leading-5 text-zinc-300">
                              {feature.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* BILLING PERIOD */}
            <div className="mx-auto mt-14 max-w-3xl">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                  Flexible billing
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Choose your period
                </h2>

                <p className="mt-3 text-sm text-zinc-500">
                  Select a subscription period to preview the estimated cost.
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {billingPeriods.map((period) => {
                  const active = selectedPeriod === period.years;

                  const periodDiscount =
                    period.years === 3
                      ? 0.2
                      : period.years === 2
                        ? 0.1
                        : 0;

                  const amount = Math.round(
                    monthlyPrice * 12 * period.years * (1 - periodDiscount)
                  );

                  return (
                    <button
                      key={period.years}
                      type="button"
                      onClick={() => setSelectedPeriod(period.years)}
                      aria-pressed={active}
                      className={`relative rounded-2xl border p-5 text-left transition duration-200 ${
                        active
                          ? "border-orange-400 bg-orange-400/[0.07] shadow-[0_0_25px_rgba(249,115,22,0.07)]"
                          : isDark
                            ? "border-white/[0.09] bg-[#17171c] hover:border-white/20"
                            : "border-slate-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      {period.years === 3 && (
                        <span className="absolute right-3 top-3 rounded-full bg-orange-400/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-orange-300">
                          Best value
                        </span>
                      )}

                      <div className="text-xs font-medium text-zinc-400">
                        {period.label}
                      </div>

                      <div className="mt-4 text-3xl font-semibold tracking-tight">
                        ₹{formatINR(amount)}
                      </div>

                      <div className="mt-1 text-xs text-zinc-500">
                        for {period.years}{" "}
                        {period.years === 1 ? "year" : "years"}
                      </div>

                      <div
                        className={`mt-4 text-xs font-medium ${
                          active ? "text-orange-300" : "text-zinc-400"
                        }`}
                      >
                        {period.discount}
                      </div>

                      {active && (
                        <div className="absolute bottom-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-[#17110e]">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-center text-xs ${
                  isDark
                    ? "border-white/[0.07] bg-white/[0.025]"
                    : "border-slate-200 bg-white"
                } text-zinc-400`}
              >
                <IndianRupee
                  size={14}
                  className="mr-1 inline text-orange-300"
                />

                Estimated subscription:{" "}
                <span className="font-semibold text-white">
                  ₹{formatINR(totalPrice)}
                </span>

                {savings > 0 && (
                  <span className="ml-2 text-emerald-400">
                    · Estimated savings ₹{formatINR(savings)}
                  </span>
                )}

                <p className="mt-2 text-[11px] text-zinc-600">
                  Illustrative calculations, not a binding offer. Taxes,
                  billing terms and discounts require confirmation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ADD-ON MODULES */}
        <section
          className={`border-y px-5 py-20 sm:px-8 ${
            isDark
              ? "border-white/[0.06] bg-[#141417]/80"
              : "border-slate-200 bg-slate-100"
          }`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                  Extend your workspace
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Add more power when you need it.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                  Optional modules for businesses that need more visibility,
                  control and operational insights.
                </p>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs text-zinc-400 ${
                  isDark ? "border-white/10" : "border-slate-200 bg-white"
                }`}
              >
                <CircleHelp size={14} />
                Optional modules
              </span>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {addOns.map((addon) => {
                const Icon = addon.icon;

                return (
                  <article
                    key={addon.name}
                    className={`group rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/40 ${
                      isDark
                        ? "border-white/[0.08] bg-[#19191f]"
                        : "border-slate-200 bg-white shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-300/10 bg-orange-300/[0.08] text-orange-300 transition group-hover:bg-orange-300/[0.13]">
                        <Icon size={22} />
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-medium text-zinc-400 ${
                          isDark ? "border-white/[0.08]" : "border-slate-200"
                        }`}
                      >
                        {addon.tag}
                      </span>
                    </div>

                    <h3 className="mt-6 text-lg font-semibold">
                      {addon.name}
                    </h3>

                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-zinc-400">
                      {addon.description}
                    </p>

                    <div className="mt-6 border-t border-white/[0.07] pt-5">
                      <div className="flex flex-wrap items-baseline gap-1">
                        <span className="text-2xl font-semibold text-orange-300">
                          {addon.price}
                        </span>

                        <span className="text-xs text-zinc-500">
                          {addon.unit}
                        </span>
                      </div>

                      <Link
                        to="/get-started"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-orange-300"
                      >
                        Explore module

                        <ArrowRight
                          size={15}
                          className="transition group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="mt-5 text-xs leading-5 text-zinc-600">
              Add-on prices are illustrative placeholders and must be finalized
              before the pricing page is published.
            </p>
          </div>
        </section>

        {/* BRANCH COMPARISON */}
        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                Built for growing businesses
              </p>

              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Every branch.
                <br />
                One clear picture.
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">
                Compare restaurant locations using consistent operational
                metrics. Understand where your business is performing well and
                where your team needs to take action.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Compare sales and operating costs",
                  "Monitor food wastage across branches",
                  "Review inventory and stock movement",
                  "Identify performance trends",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                      <Check size={13} />
                    </div>

                    <span className="text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/about"
                className={`mt-9 inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition hover:border-orange-400/40 hover:text-orange-300 ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                Explore DineOps
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* DASHBOARD PREVIEW */}
            <div
              className={`rounded-3xl border p-5 shadow-2xl sm:p-7 ${
                isDark
                  ? "border-white/[0.09] bg-[#17171c]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-5">
                <div>
                  <div className="text-sm font-semibold">Branch overview</div>

                  <div className="mt-1 text-xs text-zinc-500">
                    Sample dashboard preview
                  </div>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300">
                  <GitCompareArrows size={19} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div
                  className={`rounded-2xl border border-white/[0.07] p-4 ${
                    isDark ? "bg-white/[0.025]" : "bg-slate-50"
                  }`}
                >
                  <div className="text-xs text-zinc-500">Sales</div>

                  <div className="mt-3 text-2xl font-semibold">₹4.8L</div>

                  <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp size={13} />
                    Sample metric
                  </div>
                </div>

                <div
                  className={`rounded-2xl border border-white/[0.07] p-4 ${
                    isDark ? "bg-white/[0.025]" : "bg-slate-50"
                  }`}
                >
                  <div className="text-xs text-zinc-500">Food wastage</div>

                  <div className="mt-3 text-2xl font-semibold">3.2%</div>

                  <div className="mt-2 text-xs text-zinc-500">
                    Sample metric
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {[
                  { name: "Branch A", value: 88, amount: "₹2.1L" },
                  { name: "Branch B", value: 67, amount: "₹1.6L" },
                  { name: "Branch C", value: 45, amount: "₹1.1L" },
                ].map((branch) => (
                  <div key={branch.name}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                      <span className="text-zinc-300">{branch.name}</span>

                      <span className="font-medium text-zinc-400">
                        {branch.amount}
                      </span>
                    </div>

                    <div
                      className={`h-2 overflow-hidden rounded-full ${
                        isDark ? "bg-white/[0.07]" : "bg-slate-100"
                      }`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-[#ffad7c]"
                        style={{ width: `${branch.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`mt-6 flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-3 text-xs leading-5 text-zinc-500 ${
                  isDark ? "bg-white/[0.02]" : "bg-slate-50"
                }`}
              >
                <Clock3 size={15} className="shrink-0 text-orange-300" />

                Illustrative data only — connect actual branch data for live
                reporting.
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className={`border-t px-5 py-20 sm:px-8 ${
            isDark
              ? "border-white/[0.06] bg-[#141417]/70"
              : "border-slate-200 bg-slate-100"
          }`}
        >
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-300/10 bg-orange-300/[0.07] text-orange-300">
                <CircleHelp size={23} />
              </div>

              <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                Frequently asked questions
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Everything you need to know before getting started.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFAQ === index;

                return (
                  <div
                    key={faq.question}
                    className={`overflow-hidden rounded-2xl border transition ${
                      isOpen
                        ? "border-orange-400/25 bg-orange-400/[0.035]"
                        : isDark
                          ? "border-white/[0.08] bg-[#19191f]"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFAQ(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <span className="text-sm font-medium leading-6 text-zinc-200">
                        {faq.question}
                      </span>

                      {isOpen ? (
                        <ChevronUp
                          size={18}
                          className="shrink-0 text-orange-300"
                        />
                      ) : (
                        <ChevronDown
                          size={18}
                          className="shrink-0 text-zinc-500"
                        />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6">
                        <p className="border-t border-white/[0.07] pt-4 text-sm leading-7 text-zinc-400">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-5 py-20 sm:px-8">
          <div
            className={`relative mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-orange-300/20 px-6 py-12 text-center sm:px-12 sm:py-16 ${
              isDark ? "bg-[#19151a]" : "bg-orange-50"
            }`}
          >
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 max-w-full -translate-x-1/2 rounded-full bg-orange-500/[0.09] blur-[80px]" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-400/10 text-orange-300">
                <Wallet size={23} />
              </div>

              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to bring every branch together?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400">
                Talk to our team about your restaurant operations, branch
                requirements and the right DineOps setup for your business.
              </p>

              <Link
                to="/get-started"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff895f] px-6 py-3.5 text-sm font-semibold text-[#19110e] transition hover:bg-[#ffa17e]"
              >
                Talk to our team
                <ArrowRight size={17} />
              </Link>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <LockKeyhole size={13} />
                No commitment required to discuss your needs
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/[0.07] px-5 py-7 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-zinc-500 sm:flex-row">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-orange-300"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-400 text-[#17110e]">
                <Utensils size={15} />
              </span>

              DineOps
            </Link>

            <p className="text-center">
              Restaurant operations, connected in one place.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/about" className="transition hover:text-orange-300">
                About
              </Link>

              <Link to="/contact" className="transition hover:text-orange-300">
                Contact
              </Link>

              <Link
                to="/get-started"
                className="transition hover:text-orange-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}