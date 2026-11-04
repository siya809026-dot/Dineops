
import { useCallback, useEffect, useState } from "react";

import {
  Wallet,
  TrendingUp,
  Store,
  Package,
  AlertTriangle,
  RefreshCw,
  Activity,
  CalendarDays,
  ShoppingCart,
  Clock3,
  ArrowUpRight,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  CircleAlert,
  BarChart3,
  Trash2,
  Leaf,
  IndianRupee,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import api from "../../api/client";
import DemandForecasting from "./DemandForecasting";

const currency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const numberFormat = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatShortDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "blue",
}) {
  const accents = {
    green: {
      icon: "bg-emerald-500/10 text-emerald-400",
      border: "hover:border-emerald-500/30",
    },
    blue: {
      icon: "bg-blue-500/10 text-blue-400",
      border: "hover:border-blue-500/30",
    },
    orange: {
      icon: "bg-orange-500/10 text-orange-400",
      border: "hover:border-orange-500/30",
    },
    pink: {
      icon: "bg-pink-500/10 text-pink-400",
      border: "hover:border-pink-500/30",
    },
    red: {
      icon: "bg-rose-500/10 text-rose-400",
      border: "hover:border-rose-500/30",
    },
  };

  const style = accents[accent] || accents.blue;

  return (
    <div
      className={`group rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-1 hover:bg-slate-900/90 ${style.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <h3 className="mt-4 break-words text-2xl font-bold tracking-tight text-white">
            {value}
          </h3>
        </div>

        <span className={`shrink-0 rounded-xl p-3 ${style.icon}`}>
          <Icon size={20} />
        </span>
      </div>

      <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className = "",
  action,
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/10 ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center">
      <div className="rounded-2xl bg-slate-800 p-3">
        <Icon size={25} className="text-slate-400" />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-300">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-32 rounded-2xl bg-slate-900" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-2xl bg-slate-900"
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="h-80 rounded-2xl bg-slate-900 xl:col-span-2" />
        <div className="h-80 rounded-2xl bg-slate-900" />
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 shadow-xl">
      <p className="mb-1 text-xs text-slate-400">{label}</p>

      <p className="text-sm font-semibold text-rose-400">
        {currency(payload[0].value)}
      </p>
    </div>
  );
}

function WastageAnalytics() {
  const [period, setPeriod] = useState("daily");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/wastage/analytics?period=${period}`
      );

      if (
        !response.data?.success ||
        !response.data?.analytics
      ) {
        throw new Error("Invalid wastage analytics response.");
      }

      setAnalytics(response.data.analytics);
    } catch (err) {
      console.error("Wastage Analytics Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load wastage analytics."
      );

      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = analytics?.summary || {};

  const mostWastedItems = Array.isArray(
    analytics?.mostWastedItems
  )
    ? analytics.mostWastedItems
    : [];

  const reasons = Array.isArray(analytics?.reasonBreakdown)
    ? analytics.reasonBreakdown
    : [];

  const trend = Array.isArray(analytics?.trend)
    ? analytics.trend
    : [];

  const branchComparison = Array.isArray(
    analytics?.branchComparison
  )
    ? analytics.branchComparison
    : [];

  const totalLoss = Number(summary.totalLoss || 0);
  const previousLoss = Number(summary.previousPeriodLoss || 0);
  const lossChange = Number(summary.lossChange || 0);

  const hasPreviousData = previousLoss > 0;
  const hasTrendData = trend.length > 0;

  const periodLabels = {
    daily: "Last 7 days",
    weekly: "Last 8 weeks",
    monthly: "Last 12 months",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-rose-500/10 p-2">
              <Trash2 size={18} className="text-rose-400" />
            </span>

            <h2 className="text-lg font-bold text-white">
              Food Waste Analytics
            </h2>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Monitor wastage, identify losses and track waste patterns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-rose-500"
          >
            <option value="daily">Daily · 7 days</option>
            <option value="weekly">Weekly · 8 weeks</option>
            <option value="monthly">Monthly · 12 months</option>
          </select>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-300 transition hover:border-rose-500/40 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-slate-900"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertTriangle size={19} />
            <p className="text-sm font-semibold">
              Wastage analytics could not be loaded
            </p>
          </div>

          <p className="mt-2 text-xs text-rose-200/70">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchAnalytics}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && analytics && (
        <>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="flex items-start gap-2">
              <CircleAlert
                size={16}
                className="mt-0.5 shrink-0 text-amber-400"
              />

              <p className="text-xs leading-5 text-amber-200/80">
                Analytics are based on recorded wastage entries.
                Demo and test records, if present, are included in
                these figures and should not be treated as actual
                restaurant performance.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Wastage Loss"
              value={currency(totalLoss)}
              subtitle={periodLabels[period]}
              icon={IndianRupee}
              accent="red"
            />

            <StatCard
              title="Wastage Records"
              value={numberFormat(summary.totalRecords)}
              subtitle="Recorded wastage entries"
              icon={Trash2}
              accent="orange"
            />

            <StatCard
              title="Wasted Items"
              value={numberFormat(summary.totalItems)}
              subtitle="Items across all records"
              icon={Package}
              accent="pink"
            />

            <StatCard
              title="Loss Change"
              value={
                hasPreviousData
                  ? `${lossChange > 0 ? "+" : ""}${currency(lossChange)}`
                  : "N/A"
              }
              subtitle={
                hasPreviousData
                  ? "Compared with previous period"
                  : "No previous-period baseline"
              }
              icon={TrendingUp}
              accent={
                hasPreviousData && lossChange > 0
                  ? "red"
                  : "green"
              }
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <Panel
              title="Wastage Trend"
              subtitle={`Financial loss · ${periodLabels[period]}`}
              className="xl:col-span-2"
            >
              {!hasTrendData ? (
                <EmptyState
                  icon={BarChart3}
                  title="No wastage trend available"
                  description="Wastage trends will appear after entries are recorded."
                />
              ) : (
                <div className="h-72 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trend}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 5,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#334155"
                      />

                      <XAxis
                        dataKey="date"
                        tickFormatter={formatShortDate}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tickFormatter={(value) =>
                          value >= 1000
                            ? `₹${value / 1000}k`
                            : `₹${value}`
                        }
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />

                      <Tooltip content={<ChartTooltip />} />

                      <Bar
                        dataKey="totalLoss"
                        name="Wastage Loss"
                        fill="#f43f5e"
                        radius={[7, 7, 0, 0]}
                        maxBarSize={45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel
              title="Wastage by Reason"
              subtitle="Reasons contributing to financial loss"
            >
              {reasons.length === 0 ? (
                <EmptyState
                  icon={Leaf}
                  title="No wastage reasons"
                  description="Reason-wise analysis will appear here."
                />
              ) : (
                <div className="space-y-5">
                  {reasons.map((item) => {
                    const percentage =
                      totalLoss > 0
                        ? Math.min(
                            100,
                            (Number(item.totalLoss || 0) /
                              totalLoss) *
                              100
                          )
                        : 0;

                    return (
                      <div key={item.reason}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-200">
                              {item.reason}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-500">
                              {numberFormat(item.occurrences)} occurrences
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-rose-400">
                            {currency(item.totalLoss)}
                          </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-rose-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="mt-1 text-right text-[10px] text-slate-500">
                          {percentage.toFixed(1)}% of total loss
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>

          <Panel
            title="Most Wasted Items"
            subtitle="Products and raw materials ranked by financial loss"
            action={
              <span className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                Top 10
              </span>
            }
          >
            {mostWastedItems.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No wasted items found"
                description="Items will appear here when wastage is recorded."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="pb-4 pr-4 font-semibold">Item</th>
                      <th className="pb-4 pr-4 font-semibold">Type</th>
                      <th className="pb-4 pr-4 font-semibold">Reason</th>
                      <th className="pb-4 pr-4 text-right font-semibold">
                        Quantity
                      </th>
                      <th className="pb-4 pr-4 text-right font-semibold">
                        Occurrences
                      </th>
                      <th className="pb-4 text-right font-semibold">
                        Total Loss
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {mostWastedItems.map((item, index) => (
                      <tr
                        key={`${item.itemId || item.name}-${index}`}
                        className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/40"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-rose-500/10 p-2">
                              <Package
                                size={16}
                                className="text-rose-400"
                              />
                            </div>

                            <span className="font-semibold text-slate-200">
                              {item.name || "Unknown item"}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 pr-4">
                          <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] text-slate-300">
                            {item.itemType === "RAW_MATERIAL"
                              ? "Raw Material"
                              : "Product"}
                          </span>
                        </td>

                        <td className="py-4 pr-4 text-slate-400">
                          {item.reason || "—"}
                        </td>

                        <td className="py-4 pr-4 text-right text-slate-300">
                          {numberFormat(item.quantity)}
                        </td>

                        <td className="py-4 pr-4 text-right text-slate-300">
                          {numberFormat(item.occurrences)}
                        </td>

                        <td className="py-4 text-right font-semibold text-rose-400">
                          {currency(item.totalLoss)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            title="Branch-wise Wastage"
            subtitle="Financial loss comparison across branches"
            action={
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Store size={14} />
                {numberFormat(branchComparison.length)} Branches
              </div>
            }
          >
            {branchComparison.length === 0 ? (
              <EmptyState
                icon={Store}
                title="No branch comparison available"
                description="Branch-wise wastage will appear here when records exist."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="pb-4 pr-4 font-semibold">Branch</th>
                      <th className="pb-4 pr-4 font-semibold">City</th>
                      <th className="pb-4 pr-4 text-right font-semibold">
                        Records
                      </th>
                      <th className="pb-4 text-right font-semibold">
                        Total Loss
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {branchComparison.map((branch) => (
                      <tr
                        key={branch.branchId}
                        className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/40"
                      >
                        <td className="py-4 pr-4 font-semibold text-slate-200">
                          {branch.branchName}
                        </td>

                        <td className="py-4 pr-4 text-slate-400">
                          {branch.city || "—"}
                        </td>

                        <td className="py-4 pr-4 text-right text-slate-300">
                          {numberFormat(branch.records)}
                        </td>

                        <td className="py-4 text-right font-semibold text-rose-400">
                          {currency(branch.totalLoss)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400">
                Previous equivalent period
              </p>

              <p className="mt-3 text-2xl font-bold text-white">
                {currency(previousLoss)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Previous period recorded financial loss
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400">
                Current period change
              </p>

              <p
                className={`mt-3 text-2xl font-bold ${
                  lossChange > 0
                    ? "text-rose-400"
                    : lossChange < 0
                      ? "text-emerald-400"
                      : "text-white"
                }`}
              >
                {hasPreviousData
                  ? `${lossChange > 0 ? "+" : ""}${currency(lossChange)}`
                  : "No baseline"}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {hasPreviousData
                  ? lossChange > 0
                    ? "Wastage loss increased compared with the previous period."
                    : lossChange < 0
                      ? "Wastage loss decreased compared with the previous period."
                      : "Wastage loss remained unchanged."
                  : "A percentage comparison is unavailable because previous-period loss is zero."}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/dashboard/overview");

      if (
        !response.data?.success ||
        !response.data?.dashboard
      ) {
        throw new Error("Unexpected dashboard response.");
      }

      setDashboard(response.data.dashboard);
    } catch (err) {
      console.error("Owner Dashboard Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  if (loading && !dashboard) {
    return <LoadingSkeleton />;
  }

  if (!dashboard) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-rose-400" size={22} />

          <h3 className="font-semibold text-rose-300">
            Dashboard could not be loaded
          </h3>
        </div>

        <p className="mt-3 text-sm text-rose-200/80">
          {error || "No dashboard data available."}
        </p>

        <button
          onClick={() => fetchDashboard(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    );
  }

  const overview = dashboard.overview || {};
  const inventory = dashboard.inventory || {};
  const operations = dashboard.operations || {};
  const branches = dashboard.branches || {};

  const performance = Array.isArray(branches.performance)
    ? branches.performance
    : [];

  const activities = Array.isArray(dashboard.recentActivities)
    ? dashboard.recentActivities
    : [];

  const lowStock = Number(inventory.lowStockProducts || 0);
  const outOfStock = Number(inventory.outOfStockProducts || 0);

  const hasSalesData = performance.some(
    (branch) => Number(branch.totalSales || 0) > 0
  );

  const totalOrders = Number(overview.todayOrders || 0);
  const totalLocations = Number(branches.totalBranches || 0);

  return (
    <div className="min-h-full space-y-6 bg-slate-950 pb-8 text-slate-100">
      {/* Welcome heading */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-500/5 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400">
                Pindi Junction · Head Office
              </p>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Business Overview
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Monitor your restaurant network, sales, inventory
              and daily business performance from one place.
            </p>
          </div>

          <button
            onClick={() => fetchDashboard(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-amber-500/40 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh data"}
          </button>
        </div>
      </div>

      {/* Refresh error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0 text-rose-400"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-rose-300">
              Could not refresh dashboard
            </p>

            <p className="mt-1 text-xs text-rose-200/70">
              {error}
            </p>
          </div>

          <button
            onClick={() => fetchDashboard(false)}
            className="shrink-0 text-xs font-semibold text-rose-300 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main statistics */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Business Snapshot
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your key business numbers
            </p>
          </div>

          <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
            Today & This Week
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Sales Today"
            value={currency(overview.todaySales)}
            subtitle={`${numberFormat(totalOrders)} orders today`}
            icon={Wallet}
            accent="green"
          />

          <StatCard
            title="Weekly Sales"
            value={currency(overview.weeklySales)}
            subtitle={`${numberFormat(overview.weeklyOrders)} orders this week`}
            icon={TrendingUp}
            accent="blue"
          />

          <StatCard
            title="Total Locations"
            value={numberFormat(totalLocations)}
            subtitle="Branches and franchise outlets"
            icon={Store}
            accent="pink"
          />

          <StatCard
            title="Stock Value"
            value={currency(inventory.inventoryValue)}
            subtitle={`${numberFormat(inventory.totalProducts)} products`}
            icon={Package}
            accent="orange"
          />
        </div>
      </div>

      {/* Secondary statistics */}
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white">
            Monthly Performance
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Revenue, purchases and inventory health
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Monthly Revenue"
            value={currency(overview.monthlySales)}
            subtitle={`${numberFormat(overview.monthlyOrders)} monthly orders`}
            icon={CalendarDays}
            accent="green"
          />

          <StatCard
            title="Monthly Purchases"
            value={currency(operations.monthlyPurchases)}
            subtitle="Recorded this month"
            icon={ShoppingCart}
            accent="blue"
          />

          <StatCard
            title="Low Stock Items"
            value={numberFormat(lowStock)}
            subtitle="Items requiring attention"
            icon={AlertTriangle}
            accent="orange"
          />

          <StatCard
            title="Wastage Loss"
            value={currency(operations.monthlyWastageLoss)}
            subtitle="Recorded this month"
            icon={Activity}
            accent="pink"
          />
        </div>
      </div>

      {/* Food Waste Analytics */}
      <WastageAnalytics />

      {/* Demand Forecasting */}
      <DemandForecasting branches={performance} />

      {/* Branch performance and alerts */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          title="Branch Performance"
          subtitle="Monthly sales comparison across your restaurant locations"
          className="xl:col-span-2"
          action={
            <span className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
              This Month
            </span>
          }
        >
          {!hasSalesData ? (
            <EmptyState
              icon={BarChart3}
              title="No sales recorded yet"
              description="Branch performance will appear here after sales are recorded."
            />
          ) : (
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performance}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 5,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="branchName"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 10,
                    }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={55}
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `₹${Number(value / 1000).toLocaleString("en-IN")}k`
                        : `₹${value}`
                    }
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 10,
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={65}
                  />

                  <Tooltip
                    formatter={(value) => [
                      currency(value),
                      "Monthly Sales",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                    labelStyle={{
                      color: "#f8fafc",
                      marginBottom: "5px",
                    }}
                    itemStyle={{
                      color: "#fbbf24",
                    }}
                    cursor={{
                      fill: "rgba(148,163,184,0.08)",
                    }}
                  />

                  <Bar
                    dataKey="totalSales"
                    name="Sales"
                    fill="#f59e0b"
                    radius={[7, 7, 0, 0]}
                    maxBarSize={52}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* Attention required */}
        <Panel
          title="Attention Required"
          subtitle="Inventory alerts that need your attention"
          action={
            <span className="rounded-lg bg-orange-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-orange-400">
              {numberFormat(lowStock + outOfStock)} Alerts
            </span>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 transition hover:bg-orange-500/15">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl bg-orange-500/15 p-2.5">
                  <AlertTriangle
                    size={19}
                    className="text-orange-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-orange-300">
                    Low stock
                  </p>

                  <p className="mt-1 text-xs text-orange-200/60">
                    Below minimum quantity
                  </p>
                </div>
              </div>

              <span className="text-2xl font-bold text-orange-400">
                {numberFormat(lowStock)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 transition hover:bg-rose-500/15">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl bg-rose-500/15 p-2.5">
                  <CircleAlert
                    size={19}
                    className="text-rose-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-rose-300">
                    Out of stock
                  </p>

                  <p className="mt-1 text-xs text-rose-200/60">
                    Replenishment required
                  </p>
                </div>
              </div>

              <span className="text-2xl font-bold text-rose-400">
                {numberFormat(outOfStock)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">
                    Total inventory units
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {numberFormat(inventory.totalUnits)}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-500/10 p-3">
                  <Package
                    size={21}
                    className="text-blue-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-2.5">
              <CheckCircle2
                size={15}
                className="shrink-0 text-emerald-400"
              />

              <p className="text-xs text-slate-400">
                Alerts are based on current inventory records.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Location overview */}
      <Panel
        title="Location Overview"
        subtitle="Monthly sales and order details for your restaurant network"
        action={
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin size={14} />
            {numberFormat(performance.length)} Locations
          </div>
        }
      >
        {performance.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No location records available"
            description="Your accessible restaurant locations will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="pb-4 pr-4 font-semibold">Location</th>
                  <th className="pb-4 pr-4 font-semibold">City</th>
                  <th className="pb-4 pr-4 text-right font-semibold">
                    Orders
                  </th>
                  <th className="pb-4 text-right font-semibold">
                    Monthly Sales
                  </th>
                </tr>
              </thead>

              <tbody>
                {performance.map((branch, index) => (
                  <tr
                    key={branch.branchId || index}
                    className="border-b border-slate-800/70 transition last:border-0 hover:bg-slate-800/40"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-slate-800 p-2">
                          <Store
                            size={16}
                            className="text-amber-400"
                          />
                        </div>

                        <span className="font-semibold text-slate-200">
                          {branch.branchName || "Unnamed location"}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 pr-4 text-slate-400">
                      {branch.city || "—"}
                    </td>

                    <td className="py-4 pr-4 text-right text-slate-300">
                      {numberFormat(branch.totalOrders)}
                    </td>

                    <td className="py-4 text-right font-semibold text-emerald-400">
                      {currency(branch.totalSales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Recent activities */}
      <Panel
        title="Recent Activity"
        subtitle="Latest updates from your restaurant network"
        action={
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Activity size={14} />
            Latest updates
          </div>
        }
      >
        {activities.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title="No recent activity"
            description="Sales, purchases, wastage and stock transfer updates will appear here."
          />
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 6).map((activity, index) => {
              const activityStyles = {
                SALE: "bg-emerald-500/10 text-emerald-400",
                PURCHASE: "bg-blue-500/10 text-blue-400",
                WASTAGE: "bg-rose-500/10 text-rose-400",
                STOCK_TRANSFER: "bg-orange-500/10 text-orange-400",
              };

              const activityIcons = {
                SALE: Wallet,
                PURCHASE: ShoppingBag,
                WASTAGE: AlertTriangle,
                STOCK_TRANSFER: Package,
              };

              const Icon =
                activityIcons[activity.type] || Activity;

              const iconStyle =
                activityStyles[activity.type] ||
                "bg-pink-500/10 text-pink-400";

              return (
                <div
                  key={activity._id || activity.id || index}
                  className="flex items-start gap-3 border-b border-slate-800 pb-4 last:border-0 last:pb-0"
                >
                  <div className={`rounded-xl p-2.5 ${iconStyle}`}>
                    <Icon size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-200">
                      {activity.title || "A new activity was recorded."}
                    </p>

                    {activity.branch && (
                      <p className="mt-1 text-xs text-slate-400">
                        {activity.branch}
                      </p>
                    )}

                    {activity.source && activity.destination && (
                      <p className="mt-1 text-xs text-slate-400">
                        {activity.source} → {activity.destination}
                      </p>
                    )}

                    {activity.status && (
                      <p className="mt-1 text-xs text-amber-400">
                        Status: {activity.status}
                      </p>
                    )}

                    {activity.date && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 size={12} />
                        {formatDate(activity.date)}
                      </p>
                    )}
                  </div>

                  {activity.amount !== undefined &&
                    activity.amount !== null && (
                      <span className="shrink-0 text-sm font-semibold text-slate-300">
                        {currency(activity.amount)}
                      </span>
                    )}

                  <ArrowUpRight
                    size={16}
                    className="mt-1 shrink-0 text-slate-600"
                  />
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5 text-xs text-slate-500">
        <p>DineOps · Dashboard</p>
        <p>Business timezone: Asia/Kolkata</p>
      </div>
    </div>
  );
}
