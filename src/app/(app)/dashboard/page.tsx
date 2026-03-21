"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BarChart3, Loader2 } from "lucide-react";
import CreatePollModal from "@/components/CreatePollModal";
import PollCard from "@/components/PollCard";
import { useMyPolls } from "@/hooks/useMyPolls";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: polls, isLoading, isError } = useMyPolls();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage and create your polls
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-purple-500/20"
          >
            <Plus className="h-4 w-4" />
            Create Poll
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-red-400">
              Failed to load polls. Please try again.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && polls && polls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center mb-5">
              <BarChart3 className="h-8 w-8 text-zinc-500" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-300 mb-2">
              No polls yet
            </h2>
            <p className="text-sm text-zinc-500 max-w-sm mb-6">
              Create your first poll and start gathering opinions from your
              audience.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-800/50 hover:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first poll
            </button>
          </div>
        )}

        {/* Poll grid */}
        {!isLoading && polls && polls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {polls.map((poll, i) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PollCard poll={poll} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <CreatePollModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
