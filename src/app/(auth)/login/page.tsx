"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useLogin } from "@/hooks/useLogin";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const { mutate: login, isPending, error, isError } = useLogin();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      login(values);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Logo / Title */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300 backdrop-blur-md mb-4">
          🗳️ PollApp
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Sign in to your account to continue
        </p>
      </div>

      {/* Card */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
        {/* API Error */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400"
          >
            {(error as Error & { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? error?.message ?? "Login failed. Please try again."}
          </motion.div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...formik.getFieldProps("email")}
              placeholder="you@example.com"
              className={`w-full rounded-lg bg-zinc-800/70 border px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none ring-offset-black transition focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/50 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500/60"
                  : "border-zinc-700/60"
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...formik.getFieldProps("password")}
              placeholder="••••••••"
              className={`w-full rounded-lg bg-zinc-800/70 border px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/50 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500/60"
                  : "border-zinc-700/60"
              }`}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1.5 text-xs text-red-400">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            )}
          </button>
        </form>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-zinc-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
