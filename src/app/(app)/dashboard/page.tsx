"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  BarChart3,
  Loader2,
  TrendingUp,
  Radio,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import CreatePollModal from "@/components/CreatePollModal";
import PollCard from "@/components/PollCard";
import { useMyPolls } from "@/hooks/useMyPolls";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: polls, isLoading, isError } = useMyPolls();

  const total = polls?.length ?? 0;
  const active = polls?.filter((p) => !p.closed && new Date(p.closedAt) > new Date()).length ?? 0;
  const ended = total - active;

  const stats = [
    {
      label: "Total Polls",
      value: total,
      icon: BarChart3,
      gradient: "from-violet-500 to-indigo-600",
      glow: "shadow-violet-500/30",
      bg: "bg-violet-500/10",
      text: "text-violet-300",
    },
    {
      label: "Live Now",
      value: active,
      icon: Radio,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-300",
    },
    {
      label: "Ended",
      value: ended,
      icon: CheckCircle2,
      gradient: "from-zinc-500 to-zinc-600",
      glow: "shadow-zinc-500/20",
      bg: "bg-zinc-500/10",
      text: "text-zinc-400",
    },
    {
      label: "Trending",
      value: active > 0 ? "🔥" : "—",
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/30",
      bg: "bg-amber-500/10",
      text: "text-amber-300",
    },
  ];

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        {/* ── Header ── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Create, manage and track your polls in real-time.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 animate-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden w-fit"
          >
            {/* Shimmer */}
            <div className="absolute inset-0 animate-shimmer" />
            <Plus className="h-4 w-4 relative z-10 transition-transform duration-200 group-hover:rotate-90" />
            <span className="relative z-10">Create Poll</span>
            <Sparkles className="h-3.5 w-3.5 relative z-10 opacity-70" />
          </button>
        </motion.div>

        {/* ── Stats Strip ── */}
        {!isLoading && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:border-white/10 transition-all duration-200 group hover:-translate-y-0.5"
                >
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 font-medium">
                      {stat.label}
                    </p>
                    <p className={`text-xl font-bold ${stat.text}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── Loading State ── */}
        {isLoading && (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-28 gap-3"
          >
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-2xl animate-ping bg-violet-500/20" />
            </div>
            <p className="text-sm text-zinc-600 animate-pulse">
              Loading your polls…
            </p>
          </motion.div>
        )}

        {/* ── Error State ── */}
        {isError && (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
              <BarChart3 className="h-7 w-7 text-rose-400" />
            </div>
            <p className="text-sm font-medium text-rose-400 mb-1">
              Failed to load polls
            </p>
            <p className="text-xs text-zinc-600">
              Please check your connection and try again.
            </p>
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !isError && polls && polls.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-6 animate-float">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/20 flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-violet-400" />
              </div>
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/40">
                <Plus className="h-3 w-3 text-white" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-zinc-300 mb-2">
              No polls yet!
            </h2>
            <p className="text-sm text-zinc-600 max-w-xs mb-6">
              Create your first poll and start gathering opinions from your
              community in real-time.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-violet-300 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Create your first poll
            </button>
          </motion.div>
        )}

        {/* ── Poll Grid ── */}
        {!isLoading && polls && polls.length > 0 && (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {polls.map((poll) => (
              <motion.div key={poll.id} variants={itemVariants}>
                <PollCard poll={poll} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <CreatePollModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
