
import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  BrainCircuit,
  AlertTriangle,
  Building2,
  CalendarDays,
} from "lucide-react";
import api from "../../api/client";

export default function DemandForecasting() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [forecast, setForecast] = useState(null);

  const [branchesLoading, setBranchesLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);

  const [error, setError] = useState("");
  const [forecastError, setForecastError] = useState("");

  const fetchBranches = useCallback(async () => {
    try {
      setBranchesLoading(true);
      setError("");

      const response = await api.get("/branches");
      const payload = response?.data;

      const branchList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.branches)
          ? payload.branches
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.branches)
              ? payload.data.branches
              : [];

      const formattedBranches = branchList.map((branch) => ({
        ...branch,
        branchId: branch._id || branch.branchId,
        branchName: branch.name || branch.branchName,
      }));

      setBranches(formattedBranches);

      if (formattedBranches.length > 0) {
        setSelectedBranch((current) => {
          const exists = formattedBranches.some(
            (branch) => branch.branchId === current
          );

          return exists ? current : formattedBranches[0].branchId;
        });
      } else {
        setSelectedBranch("");
      }
    } catch (err) {
      console.error("Branches API error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load branches."
      );
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  const fetchForecast = useCallback(async () => {
    if (!selectedBranch) return;

    try {
      setForecastLoading(true);
      setForecastError("");

      const response = await api.get("/dashboard/forecast", {
        params: {
          branchId: selectedBranch,
        },
      });

      const payload = response?.data;

      setForecast(payload?.forecast ?? payload?.data ?? payload);
    } catch (err) {
      console.error("Forecast API error:", err);
      setForecastError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load demand forecast."
      );
      setForecast(null);
    } finally {
      setForecastLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  if (branchesLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-gray-400">
        <RefreshCw size={30} className="animate-spin text-orange-500" />
        <p>Loading branches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertTriangle size={36} className="text-red-400" />
        <p className="text-red-400">{error}</p>

        <button
          onClick={fetchBranches}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#17171D] p-8 text-center">
        <Building2 size={36} className="mx-auto mb-3 text-orange-400" />
        <h2 className="text-xl font-semibold text-white">
          No branches available
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Add a branch before generating its demand forecast.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-orange-400" size={28} />
            <h1 className="text-2xl font-bold text-white">
              Demand Forecasting
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-400">
            AI-powered demand intelligence for your restaurant.
          </p>
        </div>

        <button
          onClick={fetchForecast}
          disabled={forecastLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={forecastLoading ? "animate-spin" : ""}
          />
          Refresh Forecast
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#17171D] p-4">
        <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Building2 size={16} />
          Select Branch
        </label>

        <select
          value={selectedBranch}
          onChange={(event) => setSelectedBranch(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#22222A] px-4 py-3 text-white outline-none focus:border-orange-500 md:max-w-md"
        >
          {branches.map((branch) => (
            <option key={branch.branchId} value={branch.branchId}>
              {branch.branchName || "Unnamed Branch"}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#17171D] p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={20} className="text-orange-400" />
          <h2 className="text-lg font-semibold text-white">
            Forecast Overview
          </h2>
        </div>

        {forecastLoading && (
          <div className="flex items-center gap-3 py-8 text-gray-400">
            <RefreshCw size={20} className="animate-spin text-orange-400" />
            Loading demand forecast...
          </div>
        )}

        {!forecastLoading && forecastError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{forecastError}</p>
            <button
              onClick={fetchForecast}
              className="mt-3 text-sm font-medium text-orange-400 hover:text-orange-300"
            >
              Try again
            </button>
          </div>
        )}

        {!forecastLoading && !forecastError && forecast && (
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[#101015] p-4 text-sm text-gray-300">
            {JSON.stringify(forecast, null, 2)}
          </pre>
        )}

        {!forecastLoading && !forecastError && !forecast && (
          <p className="py-6 text-sm text-gray-400">
            No forecast data is currently available for this branch.
          </p>
        )}
      </div>
    </div>
  );
}
