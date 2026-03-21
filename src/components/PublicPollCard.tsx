"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Share2,
  Clock,
  MessageSquare,
  Vote,
  BarChart3,
  User,
} from "lucide-react";
import type { PublicPoll } from "@/hooks/usePublicPolls";
import { useState } from "react";

interface PublicPollCardProps {
  poll: PublicPoll;
}

export default function PublicPollCard({ poll }: PublicPollCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const isClosed = poll.closed || new Date(poll.closedAt) < new Date();

  const timeLeft = () => {
    const diff = new Date(poll.closedAt).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/poll/${poll.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 group flex flex-col"
    >
      {/* Top section */}
      <div className="p-5 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-white leading-snug line-clamp-2 group-hover:text-purple-200 transition-colors">
            {poll.question}
          </h3>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="relative p-2 rounded-lg text-zinc-500 hover:bg-purple-500/10 hover:text-purple-400 transition-all shrink-0"
            title="Copy share link"
          >
            <Share2 className="h-4 w-4" />
            {copied && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-medium text-purple-400 bg-zinc-800 px-2 py-0.5 rounded-md whitespace-nowrap"
              >
                Copied!
              </motion.span>
            )}
          </button>
        </div>

        {/* Notes */}
        {poll.notes && (
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-600 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-500 line-clamp-2">{poll.notes}</p>
          </div>
        )}

        {/* Creator + Time */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-zinc-400 truncate max-w-[120px]">
              {poll.creator.firstName} {poll.creator.lastName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-600" />
            <span
              className={`text-xs font-medium ${
                isClosed ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {timeLeft()}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-t border-zinc-800/50 bg-zinc-950/40">
        <button
          onClick={() => router.push(`/poll/${poll.id}?tab=vote`)}
          disabled={isClosed}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
            isClosed
              ? "bg-zinc-800/60 text-zinc-600 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20"
          }`}
        >
          <Vote className="h-3.5 w-3.5" />
          {isClosed ? "Closed" : "Vote"}
        </button>

        <button
          onClick={() => router.push(`/poll/${poll.id}?tab=results`)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white transition-all"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Results
        </button>
      </div>
    </motion.div>
  );
}
