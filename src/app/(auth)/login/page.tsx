"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useLogin } from "@/hooks/useLogin";
import { Loader2, LogIn, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function LoginPage() {
  const { mutate: login, isPending, error, isError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo / Title */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300 backdrop-blur-md mb-5"
          whileHover={{ scale: 1.05, borderColor: "rgba(139, 92, 246, 0.5)" }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          PollApp
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Sign in to your account to continue
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl p-7 sm:p-8 shadow-2xl shadow-violet-500/5"
      >
        {/* API Error */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2"
          >
            <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs">!</span>
            </div>
            {(error as Error & { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? error?.message ?? "Login failed. Please try again."}
          </motion.div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Email address
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...formik.getFieldProps("email")}
                placeholder="you@example.com"
                className={`w-full rounded-xl bg-white/[0.04] border pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 focus:bg-white/[0.06] hover:bg-white/[0.06] ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500/50"
                    : "border-white/10"
                }`}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-xs text-red-400"
              >
                {formik.errors.email}
              </motion.p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...formik.getFieldProps("password")}
                placeholder="••••••••"
                className={`w-full rounded-xl bg-white/[0.04] border pl-10 pr-11 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 focus:bg-white/[0.06] hover:bg-white/[0.06] ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500/50"
                    : "border-white/10"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-violet-400 transition-colors p-0.5"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-xs text-red-400"
              >
                {formik.errors.password}
              </motion.p>
            )}
          </motion.div>

          {/* Submit */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isPending}
              whileHover={{ scale: isPending ? 1 : 1.01 }}
              whileTap={{ scale: isPending ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200"
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
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>

      {/* Register link */}
      <motion.p
        variants={itemVariants}
        className="text-center text-sm text-zinc-400"
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-violet-400 hover:text-violet-300 font-semibold transition-colors underline decoration-violet-400/30 hover:decoration-violet-400/60 underline-offset-2"
        >
          Create one
        </Link>
      </motion.p>
    </motion.div>
  );
}
