import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Menu,
  X,
  Network,
  Package,
  Truck,
  ClipboardList,
  ArrowRight,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  CheckCircle2,
  Building2,
  TrendingUp,
  Leaf,
  RefreshCw,
  Store,
  CloudSun,
  Sparkles,
  Wallet,
  ChevronRight,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  CloudFog,
  CloudLightning,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

/* =========================================================
   SAMPLE DATA
========================================================= */

const branchData = [
  { name: "Gurugram", sales: 82000, wastage: 4200 },
  { name: "Delhi", sales: 76000, wastage: 6100 },
  { name: "Noida", sales: 91000, wastage: 3500 },
  { name: "Faridabad", sales: 68000, wastage: 5200 },
];

const requests = [
  {
    id: "REQ-1042",
    branch: "Gurugram",
    item: "Basmati Rice",
    requested: 50,
    delivered: 30,
    status: "Partial Delivery",
  },
  {
    id: "REQ-1043",
    branch: "Delhi",
    item: "Cooking Oil",
    requested: 25,
    delivered: 25,
    status: "Delivered",
  },
  {
    id: "REQ-1044",
    branch: "Noida",
    item: "Tomatoes",
    requested: 40,
    delivered: 0,
    status: "Pending Approval",
  },
];

const features = [
  {
    number: "01",
    title: "Supply Request Workflow",
    icon: Package,
    description:
      "Manage branch requirements through a centralised request, approval and delivery workflow.",
    points: [
      "Submit and review requests",
      "Approve or reject supplies",
      "Track dispatch and deliveries",
      "Monitor pending fulfilments",
    ],
  },
  {
    number: "02",
    title: "Demand Forecast + Weather",
    icon: CloudSun,
    description:
      "Plan inventory using sales history, weekday patterns, special occasions and local weather.",
    points: [
      "City-wise weather tracking",
      "Historical sales analysis",
      "Festival and weekday patterns",
      "Smarter demand planning",
    ],
  },
  {
    number: "03",
    title: "Wastage Intelligence",
    icon: Leaf,
    description:
      "Track food wastage, understand its financial impact and identify opportunities to reduce losses.",
    points: [
      "Record daily wastage",
      "Monitor financial losses",
      "Compare branch performance",
      "Improve inventory planning",
    ],
  },
  {
    number: "04",
    title: "Branch Performance",
    icon: Network,
    description:
      "Give central management a unified view of restaurant operations across multiple locations.",
    points: [
      "Compare branch sales",
      "Monitor wastage levels",
      "Track supply fulfilment",
      "Identify operational gaps",
    ],
  },
];

const BRANCH_COLORS = [
  { main: "#F97316", glow: "rgba(249,115,22,0.35)" },
  { main: "#A78BFA", glow: "rgba(167,139,250,0.35)" },
  { main: "#22D3EE", glow: "rgba(34,211,238,0.35)" },
  { main: "#34D399", glow: "rgba(52,211,153,0.35)" },
];

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatCompactCurrency = (value) => {
  const number = Number(value || 0);

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)}L`;
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return formatCurrency(number);
};

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
  };

  return weatherCodes[code] || "Weather unavailable";
}

function getWeatherIcon(code, size = 26) {
  if (code === 0 || code === 1) return <Sun size={size} />;
  if (code === 2 || code === 3) return <Cloud size={size} />;

  if ([45, 48].includes(code)) {
    return <CloudFog size={size} />;
  }

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return <CloudRain size={size} />;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <Snowflake size={size} />;
  }

  if ([95, 96, 99].includes(code)) {
    return <CloudLightning size={size} />;
  }

  return <CloudSun size={size} />;
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar({ theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isLight = theme === "light";

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "AI Powered", href: "/ai-powered" },
  ];

  const linkClass = isLight
    ? "text-slate-600 hover:text-orange-500"
    : "text-slate-400 hover:text-orange-300";

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        isLight
          ? "border-slate-200 bg-white/95"
          : "border-white/[0.07] bg-[#080910]/90"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2.5"
          aria-label="DineOps home"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20 transition duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
            <Store size={19} />
          </span>

          <span
            className={`text-lg font-bold tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            Dine<span className="text-orange-400">Ops</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`text-xs font-medium transition ${linkClass}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
            title={`Switch to ${isLight ? "dark" : "light"} mode`}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              isLight
                ? "border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-300 hover:text-orange-500"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-orange-400/40 hover:text-orange-300"
            }`}
          >
            {isLight ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          <Link
            to="/get-started"
            className="group inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition duration-300 hover:bg-orange-400 hover:shadow-lg hover:shadow-orange-500/20"
          >
            Get Started
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              isLight
                ? "border-slate-200 text-slate-700 hover:text-orange-500"
                : "border-white/10 text-slate-300 hover:text-orange-300"
            }`}
          >
            {isLight ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              isLight
                ? "border-slate-200 text-slate-700"
                : "border-white/10 text-slate-300"
            }`}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav
          className={`border-t px-5 py-4 md:hidden ${
            isLight
              ? "border-slate-200 bg-white"
              : "border-white/[0.07] bg-[#0b0d16]"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-3 py-3 text-sm transition ${
                  isLight
                    ? "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                    : "text-slate-300 hover:bg-white/[0.04] hover:text-orange-300"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              to="/get-started"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white"
            >
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}) {
  const isLeft = align === "left";

  return (
    <div
      className={`mb-10 max-w-2xl ${
        isLeft ? "text-left" : "mx-auto text-center"
      }`}
    >
      {eyebrow && (
        <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-orange-400">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          {eyebrow}
        </span>
      )}

      <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-[13px]">
          {description}
        </p>
      )}
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101321] p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-400/30 hover:bg-[#121625] hover:shadow-xl hover:shadow-orange-950/10 sm:p-6"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-500/[0.04] blur-2xl transition duration-500 group-hover:bg-orange-500/[0.12]" />

      <div className="relative flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/15 bg-orange-400/[0.08] text-orange-400 transition duration-300 group-hover:scale-110 group-hover:border-orange-400/30 group-hover:bg-orange-400/[0.14]">
          <Icon size={19} />
        </span>

        <span className="text-[10px] font-semibold tracking-widest text-slate-600 transition group-hover:text-orange-400/70">
          {feature.number}
        </span>
      </div>

      <h3 className="relative mt-5 text-base font-semibold text-white">
        {feature.title}
      </h3>

      <p className="relative mt-2 text-xs leading-6 text-slate-400">
        {feature.description}
      </p>

      <ul className="relative mt-5 space-y-2.5">
        {feature.points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-2 text-xs text-slate-300"
          >
            <CheckCircle2
              size={14}
              className="mt-0.5 shrink-0 text-orange-400"
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-orange-500/60 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
    </article>
  );
}

/* =========================================================
   WEATHER TRACKER
========================================================= */

function WeatherTracker() {
  const [city, setCity] = useState("Delhi");
  const [inputCity, setInputCity] = useState("Delhi");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  async function fetchWeather(event, requestedCity = inputCity) {
    event?.preventDefault();

    const searchCity = requestedCity.trim();

    if (!searchCity) {
      setError("Enter a city name to check its weather.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geocodingUrl = new URL(
        "https://geocoding-api.open-meteo.com/v1/search"
      );

      geocodingUrl.searchParams.set("name", searchCity);
      geocodingUrl.searchParams.set("count", "1");
      geocodingUrl.searchParams.set("language", "en");
      geocodingUrl.searchParams.set("format", "json");

      const geoResponse = await fetch(geocodingUrl);

      if (!geoResponse.ok) {
        throw new Error("Unable to find the requested location.");
      }

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];

      if (!place) {
        throw new Error("City not found. Try another city name.");
      }

      const forecastUrl = new URL(
        "https://api.open-meteo.com/v1/forecast"
      );

      forecastUrl.searchParams.set("latitude", place.latitude);
      forecastUrl.searchParams.set("longitude", place.longitude);

      forecastUrl.searchParams.set(
        "current",
        [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "is_day",
          "precipitation",
          "weather_code",
          "wind_speed_10m",
        ].join(",")
      );

      forecastUrl.searchParams.set(
        "daily",
        [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_probability_max",
        ].join(",")
      );

      forecastUrl.searchParams.set("forecast_days", "3");
      forecastUrl.searchParams.set("timezone", "auto");

      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        throw new Error("Unable to load weather information.");
      }

      const forecastData = await forecastResponse.json();

      setWeather({
        place,
        current: forecastData.current,
        daily: forecastData.daily,
        units: forecastData.current_units,
      });

      setCity(place.name);
      setInputCity(place.name);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading weather."
      );
    } finally {
      setLoading(false);
    }
  }

  const current = weather?.current;
  const daily = weather?.daily;

  return (
    <section
      id="weather"
      className="relative overflow-hidden border-y border-white/[0.06] bg-[#0b0d16] py-16 sm:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-500/[0.035] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Weather intelligence"
          title="Plan ahead with local weather."
          description="Explore live weather conditions for a city and use them as one input in your restaurant demand-planning decisions."
        />

        <div className="grid items-stretch gap-5 lg:grid-cols-[0.8fr_1.4fr]">
          {/* Search panel */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#101321] p-5 sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/15 bg-orange-400/[0.08] text-orange-400">
              <MapPin size={19} />
            </span>

            <h3 className="mt-5 text-base font-semibold text-white">
              Check a location
            </h3>

            <p className="mt-2 text-xs leading-6 text-slate-400">
              Search a city to see current conditions and the next three days
              of weather.
            </p>

            <form onSubmit={fetchWeather} className="mt-6 space-y-3">
              <label
                htmlFor="weather-city"
                className="block text-[11px] font-medium text-slate-300"
              >
                City or location
              </label>

              <input
                id="weather-city"
                value={inputCity}
                onChange={(event) => setInputCity(event.target.value)}
                placeholder="e.g. Delhi, Mumbai, Jaipur"
                className="weather-input w-full rounded-xl border border-white/10 bg-[#080910] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/10"
              />

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-xs font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Loading weather...
                  </>
                ) : (
                  <>
                    <CloudSun size={15} />
                    Get weather
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Delhi", "Mumbai", "Jaipur"].map((presetCity) => (
                <button
                  key={presetCity}
                  type="button"
                  onClick={() => {
                    setInputCity(presetCity);
                    fetchWeather(undefined, presetCity);
                  }}
                  className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] text-slate-400 transition hover:border-orange-400/30 hover:bg-orange-400/[0.06] hover:text-orange-300"
                >
                  {presetCity}
                </button>
              ))}
            </div>

            <p
              role="status"
              aria-live="polite"
              className={`mt-4 text-xs leading-5 ${
                error ? "text-red-400" : "text-slate-500"
              }`}
            >
              {error ||
                (loading
                  ? "Fetching current conditions..."
                  : "Weather supplied by Open-Meteo. Internet access is required.")}
            </p>
          </div>

          {/* Weather results */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#141827] via-[#101321] to-[#0d101b] p-5 sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-orange-500/[0.07] blur-3xl"
            />

            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">
                  Current conditions
                </span>

                <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                  <MapPin size={16} className="text-orange-400" />
                  {weather
                    ? `${weather.place.name}, ${weather.place.country}`
                    : "Weather overview"}
                </h3>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1.5 text-[10px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {weather ? "Live conditions" : "Ready to search"}
              </span>
            </div>

            {weather && current ? (
              <>
                <div className="relative mt-7 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      {getWeatherDescription(current.weather_code)}
                    </p>

                    <div className="mt-2 flex items-start">
                      <span className="text-5xl font-light tracking-tight text-white sm:text-6xl">
                        {Math.round(current.temperature_2m)}
                      </span>
                      <span className="mt-1 text-2xl font-light text-orange-300">
                        °C
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Feels like{" "}
                      {Math.round(current.apparent_temperature)}°C
                    </p>
                  </div>

                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-orange-300/15 bg-orange-300/[0.05] text-orange-300 sm:h-28 sm:w-28">
                    <div className="absolute inset-2 rounded-full border border-orange-300/10" />
                    <div className="animate-pulse">
                      {getWeatherIcon(current.weather_code, 40)}
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-2">
                  <WeatherMetric
                    icon={Droplets}
                    label="Humidity"
                    value={`${current.relative_humidity_2m}%`}
                  />

                  <WeatherMetric
                    icon={Wind}
                    label="Wind speed"
                    value={`${current.wind_speed_10m} km/h`}
                  />

                  <WeatherMetric
                    icon={Thermometer}
                    label="Feels like"
                    value={`${Math.round(current.apparent_temperature)}°C`}
                  />
                </div>

                <div className="mt-7 border-t border-white/[0.07] pt-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className="text-xs font-semibold text-white">
                      3-day forecast
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Daily outlook
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {daily.time.map((date, index) => {
                      const forecastDate = new Date(`${date}T12:00:00`);

                      const dayLabel = forecastDate.toLocaleDateString(
                        "en-IN",
                        { weekday: "short" }
                      );

                      return (
                        <div
                          key={date}
                          className="group rounded-xl border border-white/[0.06] bg-black/15 p-3 text-center transition duration-300 hover:-translate-y-1 hover:border-orange-400/20 hover:bg-orange-400/[0.04]"
                        >
                          <p className="text-[10px] text-slate-400">
                            {index === 0 ? "Today" : dayLabel}
                          </p>

                          <div className="my-3 flex justify-center text-orange-300 transition-transform duration-300 group-hover:scale-110">
                            {getWeatherIcon(
                              daily.weather_code[index],
                              21
                            )}
                          </div>

                          <p className="text-xs font-semibold text-white">
                            {Math.round(daily.temperature_2m_max[index])}°
                            <span className="ml-1 font-normal text-slate-500">
                              {Math.round(daily.temperature_2m_min[index])}°
                            </span>
                          </p>

                          <p className="mt-2 text-[9px] text-slate-500">
                            Rain{" "}
                            {daily.precipitation_probability_max?.[index] ??
                              0}
                            %
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {updatedAt && (
                  <p className="mt-4 text-right text-[9px] text-slate-600">
                    Updated at{" "}
                    {updatedAt.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </>
            ) : (
              <div className="relative flex min-h-[330px] flex-col items-center justify-center text-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-orange-400/15 bg-orange-400/[0.05] text-orange-300">
                  <div className="absolute inset-2 rounded-full border border-orange-400/10" />
                  <CloudSun size={42} />
                </div>

                <h4 className="mt-6 text-sm font-semibold text-white">
                  Your weather dashboard
                </h4>

                <p className="mt-2 max-w-xs text-xs leading-6 text-slate-400">
                  Search a city to see temperature, humidity, wind and a
                  three-day forecast.
                </p>

                <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-black/20 px-3 py-2 text-[10px] text-slate-500">
                  <MapPin size={12} />
                  {city}
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-center text-[10px] leading-5 text-slate-500">
          Weather can influence restaurant demand, but this tracker does not
          independently forecast food sales. Demand predictions require
          historical sales and other operational data.
        </p>
      </div>
    </section>
  );
}

function WeatherMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/15 p-3 transition duration-300 hover:border-orange-400/20 hover:bg-orange-400/[0.03]">
      <Icon size={15} className="text-orange-300" />
      <p className="mt-3 text-[10px] text-slate-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-white">{value}</p>
    </div>
  );
}

/* =========================================================
   SUPPLY WORKFLOW
========================================================= */

function SupplyWorkflow() {
  const steps = [
    {
      number: "01",
      title: "Request",
      icon: ClipboardList,
      description:
        "A branch submits the items and quantities it needs.",
    },
    {
      number: "02",
      title: "Review & Approve",
      icon: CheckCircle2,
      description:
        "Central management reviews availability and approves requests.",
    },
    {
      number: "03",
      title: "Dispatch & Track",
      icon: Truck,
      description:
        "Supplies are dispatched and their delivery status is monitored.",
    },
  ];

  const statusClasses = {
    Delivered: "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300",
    "Partial Delivery":
      "border-amber-400/20 bg-amber-400/[0.07] text-amber-300",
    "Pending Approval":
      "border-orange-400/20 bg-orange-400/[0.07] text-orange-300",
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Centralised operations"
          title="From request to delivery."
          description="A structured workflow helps restaurant branches coordinate requirements with central management."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101321] p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-400/30 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/[0.08] text-orange-400 transition duration-300 group-hover:scale-110 group-hover:bg-orange-400/[0.14]">
                    <Icon size={19} />
                  </span>

                  <span className="text-[10px] font-semibold tracking-widest text-slate-600">
                    STEP {step.number}
                  </span>
                </div>

                <h3 className="mt-5 text-sm font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="absolute right-5 top-[29px] hidden text-slate-700 md:block">
                    <ChevronRight size={17} />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101321]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Supply request overview
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Example branch requests and fulfilment statuses
              </p>
            </div>

            <span className="rounded-lg border border-orange-400/15 bg-orange-400/[0.06] px-3 py-2 text-[10px] font-medium text-orange-300">
              {requests.length} sample requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-white/[0.05] bg-black/10">
                  {[
                    "Request ID",
                    "Branch",
                    "Item",
                    "Quantity",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.02] last:border-0"
                  >
                    <td className="px-5 py-4 text-xs font-medium text-orange-300">
                      {request.id}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-300">
                      {request.branch}
                    </td>

                    <td className="px-5 py-4 text-xs text-white">
                      {request.item}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {request.delivered}/{request.requested}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                          statusClasses[request.status] ||
                          "border-white/10 bg-white/[0.03] text-slate-300"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-white/[0.05] px-5 py-3 text-[10px] text-slate-600 sm:px-6">
            Demonstration data only. Connect your backend to display live
            requests.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   INTERACTIVE DONUT CHART
========================================================= */

function InteractiveSalesChart({ branchData }) {
  const [activeBranch, setActiveBranch] = useState(null);
  const [metric, setMetric] = useState("sales");

  const chartData = branchData.map((branch, index) => ({
    name: branch.name,
    value: Number(branch[metric]) || 0,
    color: BRANCH_COLORS[index % BRANCH_COLORS.length].main,
    glow: BRANCH_COLORS[index % BRANCH_COLORS.length].glow,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const selectedBranch =
    chartData.find((item) => item.name === activeBranch) || null;

  const displayValue = selectedBranch ? selectedBranch.value : total;

  const percentage = (value) =>
    total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101321] p-5 transition duration-300 hover:border-white/[0.12] sm:p-7">
      <style>{`
        @keyframes dineopsDonutEntrance {
          from { opacity: 0; transform: scale(.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes dineopsGlow {
          0%, 100% { opacity: .3; }
          50% { opacity: .65; }
        }

        .dineops-donut-enter {
          animation: dineopsDonutEntrance .8s cubic-bezier(.2,.8,.2,1) both;
        }

        .dineops-glow {
          animation: dineopsGlow 3s ease-in-out infinite;
        }

        .dineops-branch {
          transition: background .25s ease, border-color .25s ease, transform .25s ease;
        }

        .dineops-branch:hover {
          transform: translateY(-2px);
        }

        @media (prefers-reduced-motion: reduce) {
          .dineops-donut-enter,
          .dineops-glow {
            animation: none;
          }

          .dineops-branch {
            transition: none;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="dineops-glow pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/[0.12] blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-lg border border-orange-400/20 bg-orange-400/10 p-2 text-orange-400">
              <TrendingUp size={17} />
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-orange-300">
              Performance analytics
            </span>
          </div>

          <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Branch distribution
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Explore the contribution of each branch.
          </p>
        </div>

        <div
          className="flex rounded-xl border border-white/[0.08] bg-black/20 p-1"
          aria-label="Select chart metric"
        >
          {[
            { key: "sales", label: "Sales" },
            { key: "wastage", label: "Wastage" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMetric(item.key);
                setActiveBranch(null);
              }}
              aria-pressed={metric === item.key}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                metric === item.key
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-5 h-[260px] max-w-[340px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[15%] rounded-full blur-2xl transition-colors duration-300"
          style={{
            background: selectedBranch
              ? selectedBranch.glow
              : "radial-gradient(circle, rgba(249,115,22,.12), transparent 70%)",
          }}
        />

        <div className="dineops-donut-enter relative h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="88%"
                paddingAngle={4}
                cornerRadius={6}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                isAnimationActive
                animationDuration={1000}
                onMouseEnter={(entry) => setActiveBranch(entry.name)}
                onMouseLeave={() => setActiveBranch(null)}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={
                      !selectedBranch || selectedBranch.name === entry.name
                        ? 1
                        : 0.3
                    }
                    style={{
                      cursor: "pointer",
                      filter:
                        selectedBranch?.name === entry.name
                          ? `drop-shadow(0 0 9px ${entry.glow})`
                          : "none",
                      transition: "opacity .25s ease, filter .25s ease",
                      outline: "none",
                    }}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value),
                  name,
                ]}
                contentStyle={{
                  background: "#080910",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                  boxShadow: "0 12px 35px rgba(0,0,0,.35)",
                }}
                itemStyle={{ color: "#E2E8F0" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <span className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.2em] text-slate-500">
            {selectedBranch ? (
              <Sparkles size={12} className="text-orange-400" />
            ) : (
              <Wallet size={12} className="text-orange-400" />
            )}
            {selectedBranch ? "Selected branch" : "Total overview"}
          </span>

          <span className="max-w-[150px] truncate text-sm font-medium text-slate-300">
            {selectedBranch?.name || "All branches"}
          </span>

          <strong className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {formatCurrency(displayValue)}
          </strong>

          <span className="mt-1 text-[10px] text-slate-500">
            {selectedBranch
              ? `${percentage(selectedBranch.value)}% of total`
              : metric === "sales"
                ? "Combined sales"
                : "Combined wastage"}
          </span>
        </div>
      </div>

      <div className="relative mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {chartData.map((branch) => {
          const isSelected = activeBranch === branch.name;

          return (
            <button
              key={branch.name}
              type="button"
              onClick={() =>
                setActiveBranch((current) =>
                  current === branch.name ? null : branch.name
                )
              }
              onMouseEnter={() => setActiveBranch(branch.name)}
              onMouseLeave={() => setActiveBranch(null)}
              aria-pressed={isSelected}
              className={`dineops-branch flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 text-left ${
                isSelected
                  ? "border-white/15 bg-white/[0.07]"
                  : "border-white/[0.05] bg-black/10 hover:border-white/10 hover:bg-white/[0.03]"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: branch.color,
                    boxShadow: isSelected
                      ? `0 0 12px ${branch.glow}`
                      : "none",
                  }}
                />

                <span className="truncate text-xs font-medium text-slate-300">
                  {branch.name}
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="block text-xs font-semibold text-white">
                  {formatCurrency(branch.value)}
                </span>

                <span className="text-[10px] text-slate-500">
                  {percentage(branch.value)}%
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
        <span className="text-[10px] leading-5 text-slate-500">
          Select a branch to inspect its contribution.
        </span>

        <button
          type="button"
          onClick={() => setActiveBranch(null)}
          className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-medium text-slate-300 transition hover:border-orange-400/40 hover:text-orange-300"
        >
          Reset view
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   PERFORMANCE OVERVIEW
========================================================= */

function PerformanceOverview() {
  const totalSales = branchData.reduce(
    (sum, branch) => sum + branch.sales,
    0
  );

  const totalWastage = branchData.reduce(
    (sum, branch) => sum + branch.wastage,
    0
  );

  const branchCount = branchData.length;

  const bestBranch = branchData.reduce((best, branch) =>
    branch.sales > best.sales ? branch : best
  );

  const metrics = [
    {
      label: "Combined branch sales",
      value: formatCompactCurrency(totalSales),
      icon: Wallet,
      description: "Across all sample branches",
      color: "text-orange-400",
      bg: "bg-orange-400/[0.08]",
      border: "border-orange-400/15",
    },
    {
      label: "Recorded wastage",
      value: formatCompactCurrency(totalWastage),
      icon: Leaf,
      description: "Sample financial impact",
      color: "text-rose-400",
      bg: "bg-rose-400/[0.07]",
      border: "border-rose-400/15",
    },
    {
      label: "Branches represented",
      value: String(branchCount).padStart(2, "0"),
      icon: Building2,
      description: "Locations in this example",
      color: "text-cyan-400",
      bg: "bg-cyan-400/[0.07]",
      border: "border-cyan-400/15",
    },
  ];

  return (
    <section
      id="performance"
      className="border-y border-white/[0.06] bg-[#0b0d16] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Business intelligence"
          title="One view. Multiple branches."
          description="Bring branch-level sales and wastage into one place to help central management understand operational performance."
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;

            return (
              <article
                key={metric.label}
                className="group rounded-2xl border border-white/[0.07] bg-[#101321] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[0.13] hover:shadow-xl hover:shadow-black/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      {metric.label}
                    </p>

                    <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      {metric.value}
                    </p>
                  </div>

                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${metric.bg} ${metric.border} ${metric.color} transition duration-300 group-hover:scale-110`}
                  >
                    <Icon size={18} />
                  </span>
                </div>

                <p className="mt-4 text-[10px] text-slate-500">
                  {metric.description}
                </p>

                <div className="mt-4 h-px bg-gradient-to-r from-white/[0.08] to-transparent">
                  <div className="h-px w-0 bg-orange-400 transition-all duration-500 group-hover:w-2/3" />
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <InteractiveSalesChart branchData={branchData} />

          <div className="rounded-3xl border border-white/[0.07] bg-[#101321] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-orange-400">
                  Branch insights
                </span>

                <h3 className="mt-2 text-lg font-semibold text-white">
                  Performance snapshot
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-400">
                  Compare sales and recorded wastage across the sample
                  locations.
                </p>
              </div>

              <span className="rounded-xl border border-orange-400/15 bg-orange-400/[0.07] p-2.5 text-orange-400">
                <TrendingUp size={18} />
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {branchData
                .slice()
                .sort((a, b) => b.sales - a.sales)
                .map((branch, index) => {
                  const salesShare =
                    totalSales > 0 ? (branch.sales / totalSales) * 100 : 0;

                  const wastageRate =
                    branch.sales > 0
                      ? (branch.wastage / branch.sales) * 100
                      : 0;

                  return (
                    <div
                      key={branch.name}
                      className="group rounded-xl border border-white/[0.05] bg-black/10 p-4 transition duration-300 hover:border-white/[0.1] hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[10px] font-semibold text-slate-400">
                            0{index + 1}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-white">
                              {branch.name}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-500">
                              {salesShare.toFixed(1)}% of sales
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs font-semibold text-white">
                            {formatCurrency(branch.sales)}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-500">
                            Wastage: {formatCurrency(branch.wastage)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-all duration-700 group-hover:brightness-125"
                          style={{
                            width: `${salesShare}%`,
                            background:
                              BRANCH_COLORS[
                                branchData.findIndex(
                                  (item) => item.name === branch.name
                                ) % BRANCH_COLORS.length
                              ].main,
                          }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">
                          Wastage / sales
                        </span>

                        <span
                          className={
                            wastageRate > 6
                              ? "text-amber-300"
                              : "text-emerald-300"
                          }
                        >
                          {wastageRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-5 rounded-xl border border-orange-400/10 bg-orange-400/[0.04] p-4">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-orange-400/10 p-2 text-orange-400">
                  <Sparkles size={15} />
                </span>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Highest sample sales
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {bestBranch.name} has the highest sales total in this
                    example at {formatCurrency(bestBranch.sales)}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] leading-5 text-slate-600">
          All figures shown are sample data for demonstrating the interface.
          They are not live business records.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN ABOUT PAGE
========================================================= */

export default function About() {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [theme, setTheme] = useState("dark");

  const isLight = theme === "light";

  return (
    <main
      data-theme={theme}
      className="about-page min-h-screen overflow-hidden bg-[#080910] font-sans text-slate-200 selection:bg-orange-500/30 selection:text-white"
    >
      <style>{`
        @keyframes aboutFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aboutFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .about-fade-up {
          animation: aboutFadeUp .7s ease both;
        }

        .about-float {
          animation: aboutFloat 5s ease-in-out infinite;
        }

        /* LIGHT THEME */
        .about-page[data-theme="light"] {
          background: #f8fafc !important;
          color: #1e293b !important;
        }

        .about-page[data-theme="light"] [class*="bg-[#"] {
          background-color: #ffffff !important;
        }

        .about-page[data-theme="light"] [class*="from-[#"],
        .about-page[data-theme="light"] [class*="via-[#"],
        .about-page[data-theme="light"] [class*="to-[#"] {
          background-image: none !important;
        }

        .about-page[data-theme="light"] [class*="text-white"] {
          color: #172033 !important;
        }

        .about-page[data-theme="light"] [class*="text-slate-200"],
        .about-page[data-theme="light"] [class*="text-slate-300"] {
          color: #334155 !important;
        }

        .about-page[data-theme="light"] [class*="text-slate-400"],
        .about-page[data-theme="light"] [class*="text-slate-500"] {
          color: #64748b !important;
        }

        .about-page[data-theme="light"] [class*="text-slate-600"],
        .about-page[data-theme="light"] [class*="text-slate-700"] {
          color: #64748b !important;
        }

        .about-page[data-theme="light"] [class*="border-white"] {
          border-color: #e2e8f0 !important;
        }

        .about-page[data-theme="light"] [class*="bg-white/"] {
          background-color: rgba(241,245,249,.8) !important;
        }

        .about-page[data-theme="light"] [class*="bg-black/"] {
          background-color: rgba(241,245,249,.8) !important;
        }

        .about-page[data-theme="light"] [class*="border-orange-400"] {
          border-color: rgba(249,115,22,.25) !important;
        }

        .about-page[data-theme="light"] .weather-input {
          background: #ffffff !important;
          color: #172033 !important;
          border-color: #cbd5e1 !important;
        }

        .about-page[data-theme="light"] .weather-input::placeholder {
          color: #94a3b8 !important;
        }

        .about-page[data-theme="light"] .about-gradient-heading {
          background-image: linear-gradient(
            to right,
            #ea580c,
            #f97316,
            #d97706
          ) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          color: transparent !important;
        }

        .about-page[data-theme="light"] footer {
          background: #f1f5f9 !important;
          border-color: #e2e8f0 !important;
        }

        .about-page[data-theme="light"] input {
          color: #172033;
        }

        .about-page[data-theme="light"] .recharts-tooltip-wrapper {
          color: #ffffff !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .about-fade-up,
          .about-float {
            animation: none;
          }
        }
      `}</style>

      <Navbar theme={theme} setTheme={setTheme} />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-180px] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-orange-500/[0.09] blur-[110px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-100px] top-20 h-64 w-64 rounded-full bg-violet-500/[0.035] blur-[100px]"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-24">
          <div className="about-fade-up inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/[0.06] px-3.5 py-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />

            <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-orange-300 sm:text-[10px]">
              Built for multi-outlet restaurants
            </span>
          </div>

          <h1
            className="about-fade-up mx-auto mt-7 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl"
            style={{ animationDelay: "100ms" }}
          >
            Bringing every restaurant branch
            <span className="about-gradient-heading mt-1 block bg-gradient-to-r from-orange-300 via-orange-500 to-amber-300 bg-clip-text text-transparent">
              into one connected system.
            </span>
          </h1>

          <p
            className="about-fade-up mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-[13px]"
            style={{ animationDelay: "200ms" }}
          >
            DineOps is designed to help restaurant businesses coordinate
            branch operations, supply requests, inventory, wastage and
            performance from a centralised platform.
          </p>

          <div
            className="about-fade-up mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "300ms" }}
          >
            <a
              href="#modules"
              className="group inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-lg hover:shadow-orange-500/20"
            >
              Explore the platform
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>

            <Link
              to="/get-started"
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-semibold transition duration-300 ${
                isLight
                  ? "border-slate-300 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600"
                  : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-orange-400/30 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              Get started
            </Link>
          </div>

          <div
            className="about-fade-up mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
            style={{ animationDelay: "400ms" }}
          >
            {[
              {
                value: "Centralised",
                label: "Operations management",
              },
              {
                value: "Multi-branch",
                label: "Business visibility",
              },
              {
                value: "Data-driven",
                label: "Better planning",
              },
            ].map((item) => (
              <div
                key={item.value}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 transition duration-300 hover:border-orange-400/20 hover:bg-orange-400/[0.025]"
              >
                <p className="text-sm font-semibold text-white">
                  {item.value}
                </p>

                <p className="mt-1.5 text-[10px] text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}

      <section id="modules" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="The DineOps ecosystem"
            title="Everything connected. Nothing overlooked."
            description="A unified operational approach for restaurant businesses that need visibility and coordination across multiple locations."
          />

          <div id="features" className="grid gap-4 sm:grid-cols-2">
            {(showAllFeatures ? features : features.slice(0, 4)).map(
              (feature, index) => (
                <FeatureCard
                  key={feature.number}
                  feature={feature}
                  index={index}
                />
              )
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllFeatures((current) => !current)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:border-orange-400/30 hover:text-orange-300"
            >
              {showAllFeatures ? "Show less" : "Explore all modules"}
              <ArrowRight
                size={14}
                className={`transition-transform ${
                  showAllFeatures ? "rotate-[-90deg]" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* WEATHER TRACKER */}

      <WeatherTracker />

      {/* SUPPLY WORKFLOW */}

      <SupplyWorkflow />

      {/* PERFORMANCE + DONUT CHART */}

      <PerformanceOverview />

      {/* MISSION / CTA */}

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/[0.08] blur-[100px]"
        />

        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-orange-400/15 bg-gradient-to-br from-[#17121a] via-[#111321] to-[#0d0f18] p-7 text-center sm:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-orange-500/[0.06] blur-3xl"
            />

            <span className="about-float mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/[0.08] text-orange-400">
              <Store size={23} />
            </span>

            <span className="mt-6 block text-[10px] font-semibold uppercase tracking-[.22em] text-orange-400">
              Our mission
            </span>

            <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
              Better visibility.
              <span className="mt-1 block text-orange-400">
                Smarter restaurant operations.
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-slate-400 sm:text-sm">
              DineOps aims to make multi-branch restaurant management more
              organised, transparent and data-driven through connected
              workflows and operational insights.
            </p>

            <Link
              to="/get-started"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-xl hover:shadow-orange-500/20"
            >
              Start with DineOps
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="border-t border-white/[0.07] bg-[#07080e]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <Link to="/" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white transition group-hover:rotate-[-6deg]">
                <Store size={18} />
              </span>

              <div>
                <p className="text-sm font-bold text-white">
                  Dine<span className="text-orange-400">Ops</span>
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  Connected restaurant operations
                </p>
              </div>
            </Link>

            <nav className="flex flex-wrap gap-x-6 gap-y-3">
              {[
                { label: "Features", to: "/#features" },
                { label: "Pricing", to: "/pricing" },
                { label: "About", to: "/about" },
                { label: "AI Powered", to: "/ai-powered" },
                { label: "Get Started", to: "/get-started" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[11px] text-slate-500 transition hover:text-orange-300"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-7 flex flex-col gap-2 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-slate-600">
              © {new Date().getFullYear()} DineOps. All rights reserved.
            </p>

            <p className="text-[10px] text-slate-600">
              Designed for connected restaurant operations.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}