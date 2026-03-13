import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

interface RegisterFormInputs {
  name: string;
  email: string;
  dateOfJoining: string;
  password: string;
  confirmPassword: string;
}

/* ─── password strength ──────────────────────────────────────── */
const rules = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "Contains a number",     test: (p: string) => /\d/.test(p)   },
  { label: "Contains a letter",     test: (p: string) => /[a-zA-Z]/.test(p) },
];

const PasswordRule: React.FC<{ passed: boolean; label: string }> = ({ passed, label }) => (
  <div className="flex items-center gap-1.5">
    {passed
      ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
      : <XCircle      className="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-600" />}
    <span className={`text-xs transition-colors ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
      {label}
    </span>
  </div>
);

/* ─── field wrapper ──────────────────────────────────────────── */
const Field: React.FC<{
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, hint, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
    {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   REGISTER
═══════════════════════════════════════════════════════════════ */
const Register: React.FC = () => {
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<RegisterFormInputs>({ mode: "onTouched" });

  const passwordVal = watch("password", "");

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      setError("");
      setLoading(true);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        dateOfJoining: data.dateOfJoining,
        role: "employee",
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrengthCount = rules.filter((r) => r.test(passwordVal)).length;

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

        {/* Steps */}
        <div className="space-y-6">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            Get started in minutes
          </p>
          {[
            { n: "01", title: "Create your account",   desc: "Fill in your basic details below" },
            { n: "02", title: "Your profile is live",  desc: "Access your employee dashboard"   },
            { n: "03", title: "Track & manage",        desc: "Attendance, leaves, and more"      },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex gap-4">
              <span className="mt-0.5 text-xs font-mono text-gray-600">{n}</span>
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-400 underline underline-offset-4 hover:text-white">
            Sign in
          </Link>
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg
                            bg-gray-900 text-xs font-bold text-white
                            dark:bg-white dark:text-gray-900">
            AS
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Attendance System</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Get started with your employee profile
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

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>

            {/* Name */}
            <Field label="Full name" error={errors.name?.message}>
              <Input
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                className={`h-10 rounded-lg text-sm ${errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "At least 2 characters" },
                })}
              />
            </Field>

            {/* Email */}
            <Field label="Email address" error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={`h-10 rounded-lg text-sm transition ${
                  errors.email
                    ? "border-red-400 focus-visible:ring-red-400"
                    : dirtyFields.email
                    ? "border-emerald-400 focus-visible:ring-emerald-400"
                    : ""
                }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Enter a valid email address",
                  },
                })}
              />
            </Field>

            {/* Date of joining */}
            <Field
              label="Date of joining"
              error={errors.dateOfJoining?.message}
              hint="The date you joined the organisation"
            >
              <Input
                type="date"
                className={`h-10 rounded-lg text-sm ${errors.dateOfJoining ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                max={new Date().toISOString().split("T")[0]}
                {...register("dateOfJoining", {
                  required: "Date of joining is required",
                  validate: (v) =>
                    new Date(v) <= new Date() || "Cannot be a future date",
                })}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`h-10 rounded-lg pr-10 text-sm ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar + rules */}
              {passwordVal.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrengthCount
                            ? passwordStrengthCount === 1 ? "bg-red-400"
                            : passwordStrengthCount === 2 ? "bg-amber-400"
                            : "bg-emerald-500"
                            : "bg-gray-100 dark:bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {rules.map((r) => (
                      <PasswordRule key={r.label} passed={r.test(passwordVal)} label={r.label} />
                    ))}
                  </div>
                </div>
              )}
            </Field>

            {/* Confirm password */}
            <Field label="Confirm password" error={errors.confirmPassword?.message}>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`h-10 rounded-lg pr-10 text-sm ${errors.confirmPassword ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (v) => v === passwordVal || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                             hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg
                         bg-gray-900 py-2.5 text-sm font-medium text-white
                         transition hover:bg-gray-700 active:scale-[0.99] disabled:opacity-60
                         dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-gray-700 underline underline-offset-4
                         hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;