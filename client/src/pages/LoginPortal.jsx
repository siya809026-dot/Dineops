
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  Store,
  ShoppingCart,
  ChefHat,
  BarChart3,
  Warehouse,
  ShieldCheck,
  Network,
  Sun,
  Moon,
} from "lucide-react";

const portals = [
  {
    title: "Main Branch / Super Admin",
    tag: "ADMIN",
    description:
      "Manage all restaurant brands, branches, franchises, inventory, supply chains and overall business performance.",
    role: "Business Owner / Super Admin",
    button: "Enter Dashboard",
    icon: ShieldCheck,
    color: "#fb923c",
    path: "/login/admin",
  },
  {
    title: "Franchise Manager",
    tag: "FRANCHISE",
    description:
      "Manage franchise operations, daily sales, inventory, food wastage and branch performance.",
    role: "Franchise Manager",
    button: "Open Franchise Portal",
    icon: Store,
    color: "#3b82f6",
    path: "/login/franchise",
  },
  {
    title: "POS Billing",
    tag: "BILLING",
    description:
      "Manage customer orders, dine-in, takeaway orders, billing and payments from one place.",
    role: "Cashier / Counter Staff",
    button: "Open POS",
    icon: ShoppingCart,
    color: "#8b5cf6",
    path: "/login/pos",
  },
  {
    title: "Kitchen Display System",
    tag: "KITCHEN",
    description:
      "View incoming orders, update preparation status and manage your kitchen workflow.",
    role: "Chef / Kitchen Staff",
    button: "Open Kitchen",
    icon: ChefHat,
    color: "#22c55e",
    path: "/login/kitchen",
  },
  {
    title: "Reports & Analytics",
    tag: "REPORTS",
    description:
      "Analyze sales, compare branches, monitor wastage and explore business performance reports.",
    role: "Owner / Authorized Analyst",
    button: "View Reports",
    icon: BarChart3,
    color: "#a78bfa",
    path: "/login/reports",
  },
  {
    title: "Central Warehouse",
    tag: "WAREHOUSE",
    description:
      "Manage central stock, process supply requests, dispatch products and track deliveries to outlets.",
    role: "Warehouse Manager",
    button: "Open Warehouse",
    icon: Warehouse,
    color: "#06b6d4",
    path: "/login/warehouse",
  },
  {
    title: "Branch Manager",
    tag: "BRANCH",
    description:
      "Manage your assigned branch, review supply requests, track inventory and monitor daily wastage.",
    role: "Branch Manager",
    button: "Open Branch Portal",
    icon: Network,
    color: "#f59e0b",
    path: "/login/branch",
  },
];

export default function LoginPortal() {
  const [theme, setTheme] = useState("dark");

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <div
      data-theme={theme}
      className={`login-portal min-h-screen overflow-x-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[#080910] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
          isDark
            ? "border-white/[0.08] bg-[#080910]/95"
            : "border-slate-200 bg-white/95"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 font-bold">
            <span className="h-2 w-2 rounded-full bg-[#ff5367]" />
            <span className="text-lg">DineOps</span>
          </a>

          <div className="flex items-center gap-4">
            {/* Back to Home */}
            <a
              href="/"
              className={`flex items-center gap-2 text-xs transition ${
                isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-orange-600"
              }`}
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </a>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition duration-300 ${
                isDark
                  ? "border-white/10 bg-white/[0.06] text-amber-300 hover:bg-white/10"
                  : "border-slate-200 bg-slate-100 text-orange-600 hover:bg-orange-100"
              }`}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:pt-16">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500">
            <LayoutDashboard size={13} />
            Portal Access
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">
              Login Portal
            </span>
          </h1>

          <p
            className={`mx-auto mt-4 max-w-md text-sm leading-7 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Select the panel that matches your role to continue managing your
            restaurant operations with DineOps.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {portals.map((portal) => {
            const Icon = portal.icon;

            return (
              <article
                key={portal.title}
                className={`group flex min-h-[280px] flex-col rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isDark
                    ? "border-[#272938] bg-gradient-to-br from-[#191b2b] to-[#10121e] hover:border-white/20 hover:shadow-black/30"
                    : "border-slate-200 bg-white shadow-sm hover:border-orange-200 hover:shadow-slate-200/70"
                }`}
              >
                {/* Icon and Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      color: portal.color,
                      backgroundColor: `${portal.color}20`,
                    }}
                  >
                    <Icon size={21} />
                  </div>

                  <span
                    className="rounded-full border px-2 py-1 text-[8px] font-bold tracking-wider"
                    style={{
                      color: portal.color,
                      backgroundColor: `${portal.color}12`,
                      borderColor: `${portal.color}45`,
                    }}
                  >
                    {portal.tag}
                  </span>
                </div>

                {/* Title */}
                <h2
                  className={`mt-4 text-base font-bold leading-6 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {portal.title}
                </h2>

                {/* Description */}
                <p
                  className={`mt-2 text-xs leading-[1.8] ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {portal.description}
                </p>

                {/* Role */}
                <div
                  className={`mt-4 flex items-start gap-2 text-[10px] ${
                    isDark ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  <ShieldCheck size={13} className="mt-0.5 shrink-0" />
                  <span>{portal.role}</span>
                </div>

                {/* Action */}
                <a
                  href={portal.path}
                  className="mt-auto inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2.5 text-[10px] font-bold transition hover:brightness-125"
                  style={{
                    color: portal.color,
                    backgroundColor: `${portal.color}19`,
                  }}
                >
                  {portal.button}
                  <ArrowRight size={13} />
                </a>
              </article>
            );
          })}
        </div>

        {/* Security Note */}
        <div
          className={`mt-10 flex items-center justify-center gap-2 text-center text-xs ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          <ShieldCheck size={15} className="text-green-500" />
          Secure access based on assigned roles and permissions.
        </div>
      </main>
    </div>
  );
}

