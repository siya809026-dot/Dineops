
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  LockKeyhole,
  LogIn,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../../api/client";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // const response = await api.post("/auth/login", {
      //   email: form.email.trim().toLowerCase(),
      //   password: form.password,
      // });
      // https://dineops-1.onrender.com

      const response = await axios.post("https://dineops-1.onrender.com/api/auth/login",  {
    email: form.email.trim().toLowerCase(),
    password: form.password,
  },{
        headers: {
    "Content-Type": "application/json",
  }
      })

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response received from the server.");
      }

      const allowedRoles = [
        "OWNER",
        "BRANCH_MANAGER",
        "FRANCHISE_MANAGER",
        "STAFF",
      ];

      if (!allowedRoles.includes(user.role)) {
        throw new Error("Your account does not have a valid role.");
      }

      sessionStorage.setItem("dineops_token", token);
      sessionStorage.setItem("dineops_user", JSON.stringify(user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 48%, #304f7d 0%, #203f70 38%, #10294e 75%, #091a32 100%)",
      }}
    >
      {/* Centre glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[580px] w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        style={{ background: "rgba(111, 151, 210, 0.18)" }}
      />

      {/* Login card */}
      <main className="relative z-10 w-full max-w-[426px] rounded-[21px] bg-[#f8f8f3] px-[38px] pb-[40px] pt-[42px] shadow-[0_15px_55px_rgba(0,0,0,0.16)]">

        {/* Logo */}
        <div className="mb-[22px] text-center">
          <h1 className="text-[30px] font-extrabold leading-9 tracking-tight text-[#5276c5]">
            DineOps
          </h1>
          <p className="mt-1 text-[13px] text-[#888888]">
            Manager Panel
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-[14px]">

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-[7px] flex items-center gap-[6px] text-[13px] font-medium text-[#777777]"
            >
              <Mail size={14} className="text-[#5276c5]" />
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={onChange}
              disabled={loading}
              placeholder="owner@restaurant.com"
              className="h-[46px] w-full rounded-[9px] border border-[#dededb] bg-white px-[14px] text-[14px] text-[#555555] outline-none transition focus:border-[#5276c5] focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-[7px] flex items-center gap-[6px] text-[13px] font-medium text-[#777777]"
            >
              <LockKeyhole size={14} className="text-[#5276c5]" />
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={form.password}
              onChange={onChange}
              disabled={loading}
              placeholder="Enter your password"
              className="h-[46px] w-full rounded-[9px] border border-[#dededb] bg-white px-[14px] text-[14px] text-[#555555] outline-none transition focus:border-[#5276c5] focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="mt-[2px] flex h-[49px] w-full items-center justify-center gap-[8px] rounded-[10px] bg-[#527bd0] text-[15px] font-semibold text-white transition hover:bg-[#456fc5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-[69px] left-0 w-full text-center text-[11px] text-[#d0d9e9]">
        A product of{" "}
        <span className="font-bold text-[#a78bfa]">
          DineOps
        </span>
      </footer>
    </div>
  );
}
