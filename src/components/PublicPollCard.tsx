"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Share2,
  Clock,
  MessageSquare,
  Vote,
  BarChart3,
  User,
  Radio,
  Check,
} from "lucide-react";
import type { PublicPoll } from "@/hooks/usePublicPolls";

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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative glass-card rounded-2xl overflow-hidden group hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 flex flex-col h-full"
    >
      {/* Gradient top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          isClosed
            ? "bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700"
            : "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500"
        }`}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Top Header: Badge and Share */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              isClosed
                ? "bg-zinc-800/80 text-zinc-400"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {!isClosed && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {isClosed ? "Ended" : "Live"}
          </span>

          <button
            onClick={handleShare}
            className="relative p-1.5 rounded-lg text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-200"
            title="Copy share link"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check className="h-4 w-4 text-emerald-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="share"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Share2 className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Question */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-3 group-hover:text-violet-100 transition-colors duration-200">
          {poll.question}
        </h3>

        {/* Notes */}
        {poll.notes && (
          <div className="flex items-start gap-2 mb-4">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-700 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-500 line-clamp-2">{poll.notes}</p>
          </div>
        )}

        {/* User and Time (Bottom of top section) */}
        <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <User className="h-3 w-3" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Creator</span>
            </div>
            <div className="text-xs font-medium text-zinc-300 truncate">
              {poll.creator.firstName} {poll.creator.lastName}
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Time left</span>
            </div>
            <div className={`text-xs font-medium ${isClosed ? "text-zinc-500" : "text-emerald-400"}`}>
              {timeLeft()}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-white/[0.04] bg-white/[0.02]">
        <button
          onClick={() => router.push(`/poll/${poll.id}?tab=vote`)}
          disabled={isClosed}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all duration-200 border-r border-white/[0.04] ${
            isClosed
              ? "text-zinc-600 bg-black/20 cursor-not-allowed"
              : "text-violet-300 hover:text-white hover:bg-violet-500/10 group-hover:bg-violet-500/5 active:bg-violet-500/20"
          }`}
        >
          {isClosed ? <BarChart3 className="h-3.5 w-3.5" /> : <Vote className="h-3.5 w-3.5" />}
          {isClosed ? "Closed" : "Vote Now"}
        </button>

        <button
          onClick={() => router.push(`/poll/${poll.id}?tab=results`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200 active:bg-white/10"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Live Results
        </button>
      </div>
    </motion.div>
  );
}
