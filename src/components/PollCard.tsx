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
} from "lucide-react";
import type { Poll } from "@/hooks/useMyPolls";

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isClosed =
    poll.closed || new Date(poll.closedAt) < new Date();

  const timeLeft = () => {
    const diff = new Date(poll.closedAt).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/poll/${poll.id}`;
    navigator.clipboard.writeText(url);
    // TODO: show toast
  };

  const handleDelete = () => {
    // TODO: wire to DELETE API
    setMenuOpen(false);
  };

  const handleEdit = () => {
    // TODO: wire to edit flow
    setMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-xl rounded-xl overflow-hidden hover:border-zinc-700/60 transition-colors group"
    >
      {/* Top section */}
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-white leading-snug line-clamp-2">
            {poll.question}
          </h3>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-purple-400 transition-colors"
              title="Copy share link"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* 3-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-1 w-36 rounded-lg bg-zinc-800 border border-zinc-700/60 shadow-xl overflow-hidden z-20"
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700/60 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:bg-zinc-700/60 transition-colors"
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

        {/* Notes */}
        {poll.notes && (
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-600 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-500 line-clamp-2">{poll.notes}</p>
          </div>
        )}

        {/* Time badge */}
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

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800/50 bg-zinc-950/30">
        {/* Vote count */}
        <div className="flex items-center gap-1.5 text-zinc-400">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">5k votes</span>
        </div>

        {/* Result button */}
        <button
          onClick={() =>
            router.push(`/poll/${poll.id}?tab=results&viewOnly=true`)
          }
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            isClosed
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
          }`}
        >
          {isClosed ? (
            <>
              <BarChart3 className="h-3.5 w-3.5" />
              View Result
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
