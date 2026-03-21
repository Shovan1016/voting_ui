"use client";

import { motion } from "framer-motion";
import { Globe, Loader2, Search } from "lucide-react";
import { usePublicPolls } from "@/hooks/usePublicPolls";
import PublicPollCard from "@/components/PublicPollCard";
import { useState, useMemo } from "react";

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-purple-400" />
            Worlds
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Explore and vote on public polls from everyone
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search polls..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/50 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-red-400">
            Failed to load polls. Please try again.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center mb-5">
            <Globe className="h-8 w-8 text-zinc-500" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">
            {search ? "No matching polls" : "No public polls yet"}
          </h2>
          <p className="text-sm text-zinc-500 max-w-sm">
            {search
              ? "Try a different search term."
              : "Be the first to create a poll and share it with the world!"}
          </p>
        </div>
      )}

      {/* Poll grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((poll, i) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PublicPollCard poll={poll} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
