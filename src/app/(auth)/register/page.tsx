"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useRegister } from "@/hooks/useRegister";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  dateOfBirth: Yup.string().required("Date of birth is required"),
});

export default function RegisterPage() {
  const { mutate: register, isPending, error, isError, isSuccess } = useRegister();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      dateOfBirth: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // Convert date string to ISO format expected by the API
      const dateOfBirth = new Date(values.dateOfBirth).toISOString();
      register({ ...values, dateOfBirth });
    },
  });

  const field = (
    id: keyof typeof formik.values,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-300 mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...formik.getFieldProps(id)}
        placeholder={placeholder}
        className={`w-full rounded-lg bg-zinc-800/70 border px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/50 ${
          formik.touched[id] && formik.errors[id]
            ? "border-red-500/60"
            : "border-zinc-700/60"
        }`}
      />
      {formik.touched[id] && formik.errors[id] && (
        <p className="mt-1.5 text-xs text-red-400">{formik.errors[id]}</p>
      )}
    </div>
  );

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
          Create your account
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Join and start creating polls today
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
              ?.response?.data?.message ?? error?.message ?? "Registration failed. Please try again."}
          </motion.div>
        )}

        {/* Success */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400"
          >
            Account created! Redirecting to login…
          </motion.div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5" noValidate>
          {/* First + Last name row */}
          <div className="grid grid-cols-2 gap-4">
            {field("firstName", "First name", "text", "John")}
            {field("lastName", "Last name", "text", "Doe")}
          </div>

          {field("email", "Email address", "email", "you@example.com")}
          {field("password", "Password", "password", "••••••••")}
          {field("dateOfBirth", "Date of birth", "date")}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors mt-1"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create account
              </>
            )}
          </button>
        </form>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-zinc-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
