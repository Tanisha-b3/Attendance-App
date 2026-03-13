import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface LoginFormInputs {
  email: string;
  password: string;
}

const DEMO = [
  { label: "Admin",    email: "admin@hrsystem.com", password: "admin123" },
  { label: "Employee", email: "john@example.com",   password: "Test2@"   },
];

const Login: React.FC = () => {
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<LoginFormInputs>({ mode: "onTouched" });

  const emailVal = watch("email", "");

  const fill = (email: string, password: string) => {
    setValue("email",    email,    { shouldValidate: true, shouldDirty: true });
    setValue("password", password, { shouldValidate: true, shouldDirty: true });
    setError("");
  };

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      setError("");
      setLoading(true);
      const user = await login(data.email, data.password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      const s = err?.response?.status;
      setError(
        s === 401 ? "Incorrect email or password." :
        s === 404 ? "No account found with this email." :
        s === 500 ? "Something went wrong on our end. Try again shortly." :
        err?.message === "Network Error" ? "Can't reach the server. Check your connection." :
        err?.response?.data?.message ?? "Sign in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">

      {/* ── Left branding panel ── */}
      <div className="hidden md:flex md:w-[42%] flex-col justify-between
                      bg-gray-950 dark:bg-gray-900 p-10 lg:p-14">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg
                          bg-white text-xs font-bold text-gray-900">
            AS
          </div>
          <span className="text-sm font-medium text-white">Attendance System</span>
        </div>

        <div>
          <p className="text-2xl font-medium leading-snug text-white lg:text-3xl">
            "Your team is your greatest asset. Manage them well."
          </p>
          <p className="mt-4 text-sm text-gray-400">Built for modern workplaces.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "99.9%", l: "Uptime"    },
            { n: "50k+",  l: "Employees" },
            { n: "4.9★",  l: "Rated"     },
          ].map(({ n, l }) => (
            <div key={l}>
              <p className="text-xl font-semibold text-white">{n}</p>
              <p className="text-xs text-gray-500">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg
                            bg-gray-900 text-xs font-bold text-white
                            dark:bg-white dark:text-gray-900">
              HR
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">HRSystem</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Sign in to your account to continue
          </p>

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200
                            bg-red-50 px-4 py-3 text-sm text-red-700
                            dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                Email address
              </label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={`h-10 rounded-lg text-sm transition
                  ${errors.email
                    ? "border-red-400 focus-visible:ring-red-400"
                    : dirtyFields.email && emailVal
                    ? "border-emerald-400 focus-visible:ring-emerald-400"
                    : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Password
                </label>
                {/* <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  Forgot password?
                </button> */}
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`h-10 rounded-lg pr-10 text-sm transition
                    ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                             hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye    className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg
                         bg-gray-900 py-2.5 text-sm font-medium text-white
                         transition hover:bg-gray-700 active:scale-[0.99] disabled:opacity-60
                         dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
            <span className="text-xs text-gray-400">demo accounts</span>
            <div className="h-px flex-1 bg-gray-100 dark:bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO.map(({ label, email, password }) => (
              <button
                key={label}
                type="button"
                onClick={() => fill(email, password)}
                className="rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs
                           font-medium text-gray-600 transition hover:bg-gray-100
                           dark:border-white/10 dark:bg-white/5 dark:text-gray-400
                           dark:hover:bg-white/10"
              >
                {label}
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            No account?{" "}
            <Link
              to="/register"
              className="font-medium text-gray-700 underline underline-offset-4
                         hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;