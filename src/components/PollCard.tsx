"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  MoreVertical,
  Trash2,
  Pencil,
  BarChart3,
  Radio,
  Clock,
  MessageSquare,
  Check,
} from "lucide-react";
import type { Poll } from "@/hooks/useMyPolls";

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const handleShare = () => {
    const url = `${window.location.origin}/poll/${poll.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    setMenuOpen(false);
  };

  const handleEdit = () => {
    setMenuOpen(false);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative glass-card rounded-2xl overflow-hidden group hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5"
    >
      {/* Gradient top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          isClosed
            ? "bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700"
            : "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500"
        }`}
      />

      {/* Card body */}
      <div className="p-5 pt-5">
        {/* Status badge */}
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

          {/* Actions */}
          <div className="flex items-center gap-0.5">
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

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute right-0 mt-1 w-38 rounded-xl border border-white/[0.08] bg-[#0d0920]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden z-20"
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-all duration-150"
                    >
                      <Pencil className="h-3.5 w-3.5 text-indigo-400" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/[0.08] transition-all duration-150"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Question */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-3 group-hover:text-violet-100 transition-colors duration-200">
          {poll.question}
        </h3>

        {/* Notes */}
        {poll.notes && (
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-700 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-600 line-clamp-2">{poll.notes}</p>
          </div>
        )}

        {/* Time left */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-zinc-700" />
          <span
            className={`text-xs font-medium ${
              isClosed ? "text-zinc-600" : "text-emerald-400"
            }`}
          >
            {timeLeft()}
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04] bg-white/[0.02]">
        {/* Vote count */}
        <div className="flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-zinc-700" />
          <span className="text-xs font-medium text-zinc-500">5k votes</span>
        </div>

        {/* CTA button */}
        <button
          onClick={() =>
            router.push(`/poll/${poll.id}?tab=results&viewOnly=true`)
          }
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
            isClosed
              ? "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 border border-zinc-700/50"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          }`}
        >
          {isClosed ? (
            <>
              <BarChart3 className="h-3.5 w-3.5" />
              Results
            </>
          ) : (
            <>
              <Radio className="h-3.5 w-3.5" />
              Live Result
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
