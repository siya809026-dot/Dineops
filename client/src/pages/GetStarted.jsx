import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Store,
  UserRound,
  Building2,
  Boxes,
  Send,
  CheckCircle2,
  ClipboardList,
  BarChart3,
  Package,
  Utensils,
  Sparkles,
  Clock3,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";

const modules = [
  "Multi-Branch Management",
  "Inventory Management",
  "Central Warehouse & Supply",
  "POS & Billing",
  "Kitchen Management",
  "Food Wastage Tracking",
  "Reports & Analytics",
  "AI Demand Forecasting",
  "Weather-Based Insights",
];

const initialForm = {
  ownerName: "",
  email: "",
  phone: "",
  whatsapp: "",
  city: "",
  state: "",
  restaurantName: "",
  brandName: "",
  restaurantType: "",
  branches: "",
  centralKitchen: "",
  currentSoftware: "",
  modules: [],
  preferredPlan: "",
  onboardingDate: "",
  address: "",
  requirements: "",
};

export default function GetStarted() {
  // Independent theme state
  const [isDark, setIsDark] = useState(true);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark((previous) => !previous);
  };

  const closeMenu = () => setMenuOpen(false);

  // Theme styles
  const pageBg = isDark
    ? "bg-[#070910] text-white"
    : "bg-slate-50 text-slate-900";

  const cardBg = isDark
    ? "border-slate-800 bg-[#101421]"
    : "border-slate-200 bg-white shadow-sm";

  const navbarBg = isDark
    ? "border-slate-800 bg-[#070910]/95"
    : "border-slate-200 bg-white/95";

  const footerBg = isDark
    ? "border-slate-800 bg-[#090b12]"
    : "border-slate-200 bg-white";

  const primaryText = isDark ? "text-white" : "text-slate-900";

  const secondaryText = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const inputClass = `w-full rounded-lg border px-3 py-3 text-sm outline-none transition
    ${
      isDark
        ? "border-slate-700 bg-[#080b14] text-white placeholder:text-slate-600"
        : "border-slate-300 bg-white text-slate-800 placeholder:text-slate-400"
    }
    focus:border-orange-500 focus:ring-1 focus:ring-orange-500`;

  const labelClass = `mb-2 block text-xs font-medium ${
    isDark ? "text-slate-300" : "text-slate-700"
  }`;

  const navLinkClass = `whitespace-nowrap text-sm transition hover:text-orange-500 ${
    secondaryText
  }`;

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleModule = (module) => {
    setForm((previous) => ({
      ...previous,
      modules: previous.modules.includes(module)
        ? previous.modules.filter((item) => item !== module)
        : [...previous.modules, module],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (form.modules.length === 0) {
      setMessage("Please select at least one DineOps module.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit your enquiry. Please try again."
        );
      }

      setSuccess(true);
      setMessage(
        data.message || "Your enquiry has been submitted successfully!"
      );

      setForm({ ...initialForm, modules: [] });
    } catch (error) {
      setSuccess(false);
      setMessage(
        error.message ||
          "Could not connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const ThemeButton = ({ mobile = false }) => (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light Mode" : "Dark Mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition
        ${
          isDark
            ? "border-slate-700 bg-[#101421] text-yellow-400 hover:border-orange-500"
            : "border-slate-300 bg-white text-orange-500 hover:border-orange-500"
        }
        ${mobile ? "w-full gap-2" : ""}`}
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
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${pageBg}`}
    >
      {/* ================= NAVBAR ================= */}

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${navbarBg}`}
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
              <Store size={19} />
            </span>

            <span className="text-xl font-extrabold tracking-tight">
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

            <Link to="/ai-powered" className={navLinkClass}>
              AI Powered
            </Link>

            <ThemeButton />

            <a
              href="#enquiry-form"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Get Started
              <ArrowRight size={15} />
            </a>
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
              <Link
                to="/#features"
                onClick={closeMenu}
                className={navLinkClass}
              >
                Features
              </Link>

              <Link
                to="/pricing"
                onClick={closeMenu}
                className={navLinkClass}
              >
                Pricing
              </Link>

              <Link
                to="/about"
                onClick={closeMenu}
                className={navLinkClass}
              >
                About
              </Link>

              <Link
                to="/ai-powered"
                onClick={closeMenu}
                className={navLinkClass}
              >
                AI Powered
              </Link>

              <ThemeButton mobile />

              <a
                href="#enquiry-form"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Get Started
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ================= PAGE HEADING ================= */}

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 sm:text-xs">
            <Sparkles size={14} />
            Restaurant Management Made Smarter
          </span>

          <h1 className="mt-6 text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Get Started with{" "}
            <span className="text-orange-500">DineOps</span>
          </h1>

          <p
            className={`mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base ${secondaryText}`}
          >
            Tell us about your restaurant business and operational
            requirements. Our team can help you find the right solution
            for managing your restaurant, inventory and multiple branches.
          </p>
        </div>

        {/* ================= MAIN CONTENT ================= */}

        <div className="grid items-start gap-7 lg:grid-cols-[1.7fr_1fr]">
          {/* ================= ENQUIRY FORM ================= */}

          <section
            id="enquiry-form"
            className={`scroll-mt-28 overflow-hidden rounded-2xl border transition-colors duration-300 ${cardBg}`}
          >
            <div
              className={`flex items-center gap-3 border-b px-5 py-5 sm:px-7 ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-500">
                <ClipboardList size={21} />
              </div>

              <div>
                <h2 className={`font-semibold sm:text-lg ${primaryText}`}>
                  Restaurant Enquiry Form
                </h2>

                <p className={`mt-1 text-xs ${secondaryText}`}>
                  Share your business details and requirements.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 p-5 sm:p-7">
              {/* Contact Details */}

              <section>
                <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-orange-500">
                  01 — Contact Details
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ownerName" className={labelClass}>
                      Owner / Contact Name *
                    </label>

                    <input
                      id="ownerName"
                      required
                      name="ownerName"
                      value={form.ownerName}
                      onChange={updateField}
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Mobile Number *
                    </label>

                    <input
                      id="phone"
                      required
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={updateField}
                      pattern="[0-9+() -]{8,20}"
                      autoComplete="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Business Email *
                    </label>

                    <input
                      id="email"
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      autoComplete="email"
                      placeholder="you@restaurant.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className={labelClass}>
                      WhatsApp Number
                    </label>

                    <input
                      id="whatsapp"
                      type="tel"
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={updateField}
                      placeholder="WhatsApp contact number"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className={labelClass}>
                      City *
                    </label>

                    <input
                      id="city"
                      required
                      name="city"
                      value={form.city}
                      onChange={updateField}
                      autoComplete="address-level2"
                      placeholder="e.g. Faridabad"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className={labelClass}>
                      State *
                    </label>

                    <input
                      id="state"
                      required
                      name="state"
                      value={form.state}
                      onChange={updateField}
                      autoComplete="address-level1"
                      placeholder="e.g. Haryana"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Restaurant Details */}

              <section>
                <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-orange-500">
                  02 — Restaurant Details
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="restaurantName" className={labelClass}>
                      Restaurant / Business Name *
                    </label>

                    <input
                      id="restaurantName"
                      required
                      name="restaurantName"
                      value={form.restaurantName}
                      onChange={updateField}
                      placeholder="Legal business name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="brandName" className={labelClass}>
                      Brand Name
                    </label>

                    <input
                      id="brandName"
                      name="brandName"
                      value={form.brandName}
                      onChange={updateField}
                      placeholder="Restaurant brand"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="restaurantType" className={labelClass}>
                      Restaurant Type *
                    </label>

                    <select
                      id="restaurantType"
                      required
                      name="restaurantType"
                      value={form.restaurantType}
                      onChange={updateField}
                      className={inputClass}
                    >
                      <option value="">Select restaurant type</option>
                      <option value="QSR">Quick Service Restaurant</option>
                      <option value="Cafe">Cafe</option>
                      <option value="Fine Dining">Fine Dining</option>
                      <option value="Cloud Kitchen">Cloud Kitchen</option>
                      <option value="Casual Dining">Casual Dining</option>
                      <option value="Food Court">Food Court</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="branches" className={labelClass}>
                      Total Number of Branches *
                    </label>

                    <input
                      id="branches"
                      required
                      type="number"
                      min="1"
                      max="10000"
                      step="1"
                      name="branches"
                      value={form.branches}
                      onChange={updateField}
                      placeholder="e.g. 10"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="centralKitchen" className={labelClass}>
                      Central Kitchen Available? *
                    </label>

                    <select
                      id="centralKitchen"
                      required
                      name="centralKitchen"
                      value={form.centralKitchen}
                      onChange={updateField}
                      className={inputClass}
                    >
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Planning">
                        Planning to set one up
                      </option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className={labelClass}>
                      Business / Restaurant Address *
                    </label>

                    <textarea
                      id="address"
                      required
                      rows={3}
                      name="address"
                      value={form.address}
                      onChange={updateField}
                      autoComplete="street-address"
                      placeholder="Enter your restaurant or head office address"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Current Operations */}

              <section>
                <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-orange-500">
                  03 — Current Operations
                </h3>

                <label htmlFor="currentSoftware" className={labelClass}>
                  How do you currently manage operations?
                </label>

                <select
                  id="currentSoftware"
                  name="currentSoftware"
                  value={form.currentSoftware}
                  onChange={updateField}
                  className={inputClass}
                >
                  <option value="">Select current method</option>
                  <option value="Manual Records">Manual Records</option>
                  <option value="Excel">Excel / Spreadsheets</option>
                  <option value="POS Software">POS Software</option>
                  <option value="Restaurant ERP">Restaurant ERP</option>
                  <option value="Multiple Tools">
                    Multiple Different Tools
                  </option>
                  <option value="None">No Existing System</option>
                  <option value="Other">Other</option>
                </select>
              </section>

              {/* Required Modules */}

              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-500">
                  04 — Required Modules
                </h3>

                <p className={`mb-5 text-xs leading-5 ${secondaryText}`}>
                  Select the features you need. You can choose multiple
                  modules.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {modules.map((module) => {
                    const selected = form.modules.includes(module);

                    return (
                      <label
                        key={module}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                          selected
                            ? "border-orange-500/70 bg-orange-500/10 text-orange-500"
                            : isDark
                              ? "border-slate-800 bg-[#0b0e17] text-slate-300 hover:border-slate-600"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleModule(module)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
                        />

                        <span>{module}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Plan and Requirements */}

              <section>
                <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-orange-500">
                  05 — Plan &amp; Requirements
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="preferredPlan" className={labelClass}>
                      Preferred Plan
                    </label>

                    <select
                      id="preferredPlan"
                      name="preferredPlan"
                      value={form.preferredPlan}
                      onChange={updateField}
                      className={inputClass}
                    >
                      <option value="">Not sure yet</option>
                      <option value="Starter">Starter</option>
                      <option value="Growth">Growth</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="onboardingDate" className={labelClass}>
                      Preferred Onboarding Date
                    </label>

                    <input
                      id="onboardingDate"
                      type="date"
                      name="onboardingDate"
                      value={form.onboardingDate}
                      onChange={updateField}
                      min={new Date().toISOString().split("T")[0]}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="requirements" className={labelClass}>
                      Additional Requirements
                    </label>

                    <textarea
                      id="requirements"
                      rows={4}
                      name="requirements"
                      value={form.requirements}
                      onChange={updateField}
                      placeholder="Tell us about your operational challenges or specific needs..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Submission Message */}

              {message && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl border p-4 text-sm leading-6 ${
                    success
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : "border-red-500/30 bg-red-500/10 text-red-500"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {success && (
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    )}

                    <span>{message}</span>
                  </div>
                </div>
              )}

              <p className={`text-xs leading-6 ${secondaryText}`}>
                By submitting this form, you agree that the DineOps team
                may contact you about your enquiry.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting Enquiry...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={18} />
                    Enquiry Submitted
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Submit Restaurant Enquiry
                  </>
                )}
              </button>
            </form>
          </section>

          {/* ================= RIGHT INFORMATION PANEL ================= */}

          <aside className="space-y-5 lg:sticky lg:top-24">
            {/* Onboarding Steps */}

            <section className={`rounded-2xl border p-5 sm:p-6 ${cardBg}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <h3 className={`font-semibold ${primaryText}`}>
                    What Happens Next?
                  </h3>

                  <p className={`mt-1 text-xs ${secondaryText}`}>
                    Your onboarding journey
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {[
                  [
                    "01",
                    "Submit your enquiry",
                    "Tell us about your restaurant business.",
                  ],
                  [
                    "02",
                    "Requirements review",
                    "Review your operational needs.",
                  ],
                  [
                    "03",
                    "Product demonstration",
                    "Explore the relevant DineOps features.",
                  ],
                  [
                    "04",
                    "Business onboarding",
                    "Plan your account setup.",
                  ],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold text-orange-500 ${
                        isDark
                          ? "border-slate-700 bg-[#080b14]"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      {number}
                    </div>

                    <div>
                      <p className={`text-sm font-medium ${primaryText}`}>
                        {title}
                      </p>

                      <p className={`mt-1 text-xs leading-5 ${secondaryText}`}>
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* DineOps Modules */}

            <section className={`rounded-2xl border p-5 sm:p-6 ${cardBg}`}>
              <h3 className={`font-semibold ${primaryText}`}>
                Built for Restaurant Operations
              </h3>

              <p className={`mt-2 text-xs leading-6 ${secondaryText}`}>
                Manage your restaurant business through a connected
                operational platform.
              </p>

              <div className="mt-5 space-y-5">
                {[
                  {
                    icon: Building2,
                    title: "Multi-Branch Management",
                    description: "Monitor multiple branches centrally.",
                  },
                  {
                    icon: Package,
                    title: "Inventory & Supply",
                    description: "Track stock and supply requests.",
                  },
                  {
                    icon: BarChart3,
                    title: "Reports & Analytics",
                    description: "Compare branch performance.",
                  },
                  {
                    icon: Boxes,
                    title: "Wastage & Forecasting",
                    description: "Support smarter inventory decisions.",
                  },
                  {
                    icon: Utensils,
                    title: "Restaurant Operations",
                    description: "Connect day-to-day workflows.",
                  },
                ].map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="shrink-0 rounded-lg bg-orange-500/10 p-2 text-orange-500">
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className={`text-sm font-medium ${primaryText}`}>
                        {title}
                      </p>

                      <p className={`mt-1 text-xs leading-5 ${secondaryText}`}>
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/ai-powered"
                className="mt-6 flex items-center justify-between rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 transition hover:border-orange-500/60 hover:bg-orange-500/10"
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-orange-500" />

                  <span className={`text-sm font-medium ${primaryText}`}>
                    Explore AI Powered
                  </span>
                </div>

                <ArrowRight size={16} className="text-orange-500" />
              </Link>
            </section>

            {/* Help */}

            <section className={`rounded-2xl border p-5 sm:p-6 ${cardBg}`}>
              <div className="flex items-center gap-3">
                <Clock3 size={21} className="text-orange-500" />

                <h3 className={`font-semibold ${primaryText}`}>
                  Need Help?
                </h3>
              </div>

              <p className={`mt-3 text-sm leading-6 ${secondaryText}`}>
                Complete the enquiry form so your requirements can be
                reviewed and the appropriate DineOps solution identified.
              </p>

              <div className={`mt-4 flex items-start gap-2 text-xs leading-5 ${secondaryText}`}>
                <UserRound size={15} className="mt-0.5 shrink-0" />
                For restaurant owners and business teams.
              </div>

              <div
                className={`mt-5 border-t pt-4 ${
                  isDark ? "border-slate-800" : "border-slate-200"
                }`}
              >
                <div className={`flex items-center gap-2 text-xs ${secondaryText}`}>
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Your enquiry is handled through the DineOps system.
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className={`mt-16 border-t transition-colors duration-300 ${footerBg}`}>
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}

            <div>
              <Link
                to="/"
                onClick={closeMenu}
                className="inline-flex items-center gap-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
                  <Store size={19} />
                </span>

                <span className="text-xl font-extrabold">
                  Dine<span className="text-orange-500">Ops</span>
                </span>
              </Link>

              <p className={`mt-4 max-w-xs text-sm leading-7 ${secondaryText}`}>
                A connected restaurant operations platform for managing
                branches, inventory, supplies and business performance.
              </p>
            </div>

            {/* Quick Links */}

            <div>
              <h3 className={`text-sm font-bold ${primaryText}`}>
                Quick Links
              </h3>

              <ul className="mt-5 space-y-3">
                <li>
                  <Link to="/" className={navLinkClass}>
                    Home
                  </Link>
                </li>

                <li>
                  <Link to="/#features" className={navLinkClass}>
                    Features
                  </Link>
                </li>

                <li>
                  <Link to="/pricing" className={navLinkClass}>
                    Pricing
                  </Link>
                </li>

                <li>
                  <Link to="/about" className={navLinkClass}>
                    About DineOps
                  </Link>
                </li>
              </ul>
            </div>

            {/* Product */}

            <div>
              <h3 className={`text-sm font-bold ${primaryText}`}>
                Our Platform
              </h3>

              <ul className="mt-5 space-y-3">
                <li className={`flex items-center gap-2 text-sm ${secondaryText}`}>
                  <Building2 size={15} className="text-orange-500" />
                  Branch Management
                </li>

                <li className={`flex items-center gap-2 text-sm ${secondaryText}`}>
                  <Boxes size={15} className="text-orange-500" />
                  Inventory & Supply
                </li>

                <li className={`flex items-center gap-2 text-sm ${secondaryText}`}>
                  <BarChart3 size={15} className="text-orange-500" />
                  Reports & Analytics
                </li>

                <li className={`flex items-center gap-2 text-sm ${secondaryText}`}>
                  <Utensils size={15} className="text-orange-500" />
                  Restaurant Operations
                </li>

                <li>
                  <Link to="/ai-powered" className={navLinkClass}>
                    AI Demand Forecasting
                  </Link>
                </li>
              </ul>
            </div>

            {/* AI & Support */}

            <div>
              <h3 className={`text-sm font-bold ${primaryText}`}>
                AI &amp; Support
              </h3>

              <ul className="mt-5 space-y-3">
                <li>
                  <Link to="/ai-powered" className={navLinkClass}>
                    AI Powered
                  </Link>
                </li>

                <li>
                  <Link
                    to="/ai-powered#festival-intelligence"
                    className={navLinkClass}
                  >
                    Festival Intelligence
                  </Link>
                </li>

                <li>
                  <a href="#enquiry-form" className={navLinkClass}>
                    Contact / Get Started
                  </a>
                </li>

                <li>
                  <a
                    href="#enquiry-form"
                    className={`inline-flex items-center gap-2 text-sm transition hover:text-orange-500 ${secondaryText}`}
                  >
                    Submit an Enquiry
                    <ExternalLink size={13} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}

          <div
            className={`mt-10 flex flex-col gap-4 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between ${
              isDark
                ? "border-slate-800 text-slate-500"
                : "border-slate-200 text-slate-500"
            }`}
          >
            <p>
              © {new Date().getFullYear()} DineOps. All rights reserved.
            </p>

            <p className="leading-5">
              Restaurant operations, connected.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}