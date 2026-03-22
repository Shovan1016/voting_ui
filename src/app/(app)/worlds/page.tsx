"use client";

import { motion } from "framer-motion";
import { Globe, Loader2, Search, Sparkles } from "lucide-react";
import { usePublicPolls } from "@/hooks/usePublicPolls";
import PublicPollCard from "@/components/PublicPollCard";
import { useState, useMemo } from "react";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

export default function WorldsPage() {
  const { data: polls, isLoading, isError } = usePublicPolls();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!polls) return [];
    if (!search.trim()) return polls;
    const q = search.toLowerCase();
    return polls.filter(
      (p) =>
        p.question.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q) ||
        `${p.creator.firstName} ${p.creator.lastName}`
          .toLowerCase()
          .includes(q)
    );
  }, [polls, search]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            Worlds
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Explore and vote on public polls from everyone.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl blur-md opacity-20 group-focus-within:opacity-40 transition-opacity duration-300" />
          <div className="relative flex items-center glass-card rounded-xl px-3 py-2 border-white/5 focus-within:border-violet-500/50 transition-colors">
            <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search polls..."
              className="w-full bg-transparent border-none text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0 px-2.5 py-0.5"
            />
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-28 gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping bg-violet-500/20" />
          </div>
          <p className="text-sm text-zinc-600 animate-pulse">Loading amazing public polls…</p>
        </motion.div>
      )}

      {/* Error */}
      {isError && (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
            <Globe className="h-7 w-7 text-rose-400" />
          </div>
          <p className="text-sm font-medium text-rose-400 mb-1">Failed to load public polls</p>
          <p className="text-xs text-zinc-600">Please check your connection and try again.</p>
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6 animate-float">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/20 flex items-center justify-center">
              <Globe className="h-10 w-10 text-violet-400" />
            </div>
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/40">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">
            {search ? "No matching polls" : "No public polls yet"}
          </h2>
          <p className="text-sm text-zinc-500 max-w-sm">
            {search
              ? "Try a different search term to find what you're looking for."
              : "Be the first to create a poll and share it with the world!"}
          </p>
        </motion.div>
      )}

      {/* Poll grid */}
      {!isLoading && filtered.length > 0 && (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((poll) => (
            <motion.div key={poll.id} variants={itemVariants} className="h-full">
              <PublicPollCard poll={poll} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
