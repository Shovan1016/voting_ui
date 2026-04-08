"use client";

import { useParams, useSearchParams } from "next/navigation";
import { usePollSocket } from "@/hooks/usePollSocket";
import type { PollUpdatePayload } from "@/hooks/usePollSocket";
import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  CheckCircle2,
  Vote,
  BarChart3,
  Share2,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePollDetail } from "@/hooks/usePollDetail";
import type { PollTotals } from "@/hooks/usePollDetail";
import { useVote } from "@/hooks/useVote";
import { useMyVote } from "@/hooks/useMyVote";
import { useChangeVote } from "@/hooks/useChangeVote";
import { useWithdrawVote } from "@/hooks/useWithdrawVote";
import LiveResults, { OPTION_COLORS } from "@/components/LiveResults";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

export default function PollPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pollId = params?.id ? Number(params.id) : null;
  const pollIdStr = params?.id ? String(params.id) : null;
  const viewOnly = searchParams.get("viewOnly") === "true";

  const { data, isLoading, isError } = usePollDetail(pollId);
  const poll = data?.poll;

  const [totals, setTotals] = useState<PollTotals>({});
  useEffect(() => {
    if (data?.totals) setTotals(data.totals);
  }, [data?.totals]);

  const [closedOverride, setClosedOverride] = useState(false);

  const { data: myVote } = useMyVote(pollId);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<number | null>(null);
  useEffect(() => {
    if (myVote?.voted && myVote.optionId !== null) {
      setHasVoted(true);
      setSelectedOption(myVote.optionId);
      setVotedOptionId(myVote.optionId);
    }
  }, [myVote]);

  const [copied, setCopied] = useState(false);

  const handlePollUpdate = useCallback((update: PollUpdatePayload) => {
    const newTotals: PollTotals = {};
    for (const opt of update.options) {
      newTotals[`option_${opt.id}`] = opt.votes;
    }
    setTotals(newTotals);
  }, []);

  const handlePollClosed = useCallback(() => {
    setClosedOverride(true);
  }, []);

  usePollSocket(pollIdStr, {
    onPollUpdate: handlePollUpdate,
    onPollClosed: handlePollClosed,
  });

  const { mutate: submitVote, isPending: isVoting, isError: voteError, error: voteErrorData } = useVote();
  const { mutate: submitChange, isPending: isChanging } = useChangeVote();
  const { mutate: submitWithdraw, isPending: isWithdrawing } = useWithdrawVote();

  const isClosed = closedOverride || (poll ? poll.closed || new Date(poll.closedAt) < new Date() : false);

  const timeLeft = () => {
    if (!poll) return "";
    const diff = new Date(poll.closedAt).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const results = useMemo(() => {
    if (!poll) return [];
    return poll.options.map((opt) => ({
      ...opt,
      votes: totals[`option_${opt.id}`] ?? 0,
    }));
  }, [poll, totals]);

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  const handleShare = () => {
    const url = `${window.location.origin}/poll/${pollId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = () => {
    if (selectedOption === null || !pollId) return;
    submitVote({ pollId, optionId: selectedOption }, {
      onSuccess: () => {
        setHasVoted(true);
        setVotedOptionId(selectedOption);
      },
    });
  };

  const handleChangeVote = () => {
    if (selectedOption === null || !pollId) return;
    submitChange({ pollId, optionId: selectedOption }, {
      onSuccess: () => { setVotedOptionId(selectedOption); },
    });
  };

  const handleWithdrawVote = () => {
    if (!pollId) return;
    submitWithdraw(pollId, {
      onSuccess: () => {
        setHasVoted(false);
        setSelectedOption(null);
        setVotedOptionId(null);
      },
    });
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl animate-ping bg-violet-500/20" />
        </div>
        <p className="text-sm text-zinc-600 animate-pulse">Loading poll details…</p>
      </div>
    );
  }

  // ── Error ──
  if (isError || !poll) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7 text-rose-400" />
        </div>
        <p className="text-sm text-red-400 mb-4">Failed to load poll.</p>
        <button onClick={() => router.back()} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
          Go back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-6xl mx-auto"
    >
      {/* ── Nav bar ── */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:scale-105 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back
        </button>

        <button
          onClick={handleShare}
          className="relative group flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-400 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-500/10 group-hover:border-violet-500/30 group-hover:scale-105 transition-all">
            <Share2 className="h-4 w-4" />
          </div>
          Share
          <AnimatePresence>
            {copied && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="absolute right-full mr-3 text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md backdrop-blur-md whitespace-nowrap"
              >
                Copied!
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* ── Poll hero card ── */}
      <motion.div variants={itemVariants} className="relative glass-card rounded-2xl p-6 sm:p-8 mb-5 overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-[3px] ${isClosed ? "bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-700" : "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"}`} />
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-indigo-600/6 blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isClosed
                ? "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}>
              {!isClosed && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              {isClosed ? "Poll Ended" : "Live Poll"}
            </span>
            {!isClosed && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Zap className="h-3 w-3" />
                Real-time
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
            {poll.question}
          </h1>

          <div className="flex flex-wrap items-center gap-2.5">
            {poll.notes && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-xl">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-sm text-zinc-400">{poll.notes}</span>
              </div>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              isClosed ? "bg-white/5 border-white/[0.06]" : "bg-emerald-500/5 border-emerald-500/15"
            }`}>
              <Clock className={`h-3.5 w-3.5 ${isClosed ? "text-zinc-600" : "text-emerald-500"}`} />
              <span className={`text-sm font-semibold ${isClosed ? "text-red-400" : "text-emerald-400"}`}>
                {timeLeft()}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/[0.06] px-3 py-1.5 rounded-xl">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-300 tabular-nums">
                {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Two-column layout ── */}
      <div className={`grid gap-5 ${viewOnly ? "grid-cols-1 max-w-2xl mx-auto" : "grid-cols-1 lg:grid-cols-2 lg:items-start"}`}>

        {/* ── Vote Panel ── */}
        {!viewOnly && (
          <motion.div variants={itemVariants} className="relative glass-card rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                  <Vote className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-white">Cast Your Vote</h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Select one option below</p>
                </div>
                {hasVoted && !isClosed && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Voted
                  </motion.div>
                )}
              </div>

              {/* Banners */}
              <AnimatePresence mode="wait">
                {isClosed && (
                  <motion.div
                    key="closed"
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40"
                  >
                    <div className="h-7 w-7 rounded-full bg-zinc-700/60 flex items-center justify-center shrink-0">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <span className="text-sm text-zinc-400">This poll has ended. Voting is closed.</span>
                  </motion.div>
                )}
                {voteError && !isClosed && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <div className="h-7 w-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                    </div>
                    <span className="text-sm text-red-400">{(voteErrorData as Error)?.message ?? "Failed to submit vote."}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options */}
              <div className="space-y-2">
                {poll.options
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((option, i) => {
                    const isSelected = selectedOption === option.id;
                    const color = OPTION_COLORS[i % OPTION_COLORS.length];
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          if (!isClosed && !isVoting && !isChanging && !isWithdrawing)
                            setSelectedOption(option.id);
                        }}
                        disabled={isClosed || isVoting || isChanging || isWithdrawing}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 group flex items-center gap-3 relative overflow-hidden ${
                          isSelected
                            ? `${color.bg} ${color.border} shadow-lg ${color.glow} ring-1 ${color.ring}`
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                        } ${
                          isClosed || isVoting || isChanging || isWithdrawing
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer active:scale-[0.99]"
                        }`}
                      >
                        {isSelected && <div className="absolute inset-0 animate-shimmer pointer-events-none" />}

                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? `border-transparent bg-gradient-to-br ${color.bar}`
                            : "border-zinc-600 group-hover:border-zinc-500"
                        }`}>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-2 w-2 rounded-full bg-white"
                            />
                          )}
                        </div>

                        <span className={`text-sm font-medium flex-1 transition-colors ${
                          isSelected ? color.text : "text-zinc-300 group-hover:text-white"
                        }`}>
                          {option.option}
                        </span>

                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-all ${
                          isSelected ? `${color.bg} ${color.text}` : "bg-white/5 text-zinc-600"
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                      </motion.button>
                    );
                  })}
              </div>

              {/* Action buttons */}
              <div className="mt-5 space-y-2.5">
                {!isClosed && !hasVoted && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={handleVote}
                    disabled={selectedOption === null || isVoting}
                    className={`relative w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 overflow-hidden ${
                      selectedOption !== null && !isVoting
                        ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 animate-gradient text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.01] active:scale-[0.98]"
                        : "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    {selectedOption !== null && !isVoting && (
                      <div className="absolute inset-0 animate-shimmer" />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {isVoting
                        ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                        : <><Sparkles className="h-4 w-4" />Submit Vote</>
                      }
                    </span>
                  </motion.button>
                )}

                {!isClosed && hasVoted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2.5"
                  >
                    <button
                      onClick={handleChangeVote}
                      disabled={selectedOption === votedOptionId || selectedOption === null || isChanging || isWithdrawing}
                      className={`relative w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 overflow-hidden ${
                        selectedOption !== votedOptionId && selectedOption !== null && !isChanging && !isWithdrawing
                          ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 animate-gradient text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.01] active:scale-[0.98]"
                          : "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5"
                      }`}
                    >
                      {isChanging
                        ? <><Loader2 className="h-4 w-4 animate-spin" />Changing…</>
                        : <><Vote className="h-4 w-4" />Change Vote</>
                      }
                    </button>

                    <button
                      onClick={handleWithdrawVote}
                      disabled={isWithdrawing || isChanging}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 border ${
                        !isWithdrawing && !isChanging
                          ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 active:scale-[0.98]"
                          : "border-white/5 text-zinc-600 bg-white/5 cursor-not-allowed"
                      }`}
                    >
                      {isWithdrawing
                        ? <><Loader2 className="h-4 w-4 animate-spin" />Withdrawing…</>
                        : <><AlertCircle className="h-4 w-4" />Withdraw Vote</>
                      }
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Results Panel ── */}
        <motion.div variants={itemVariants} className="relative glass-card rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
          <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-cyan-600/5 blur-3xl pointer-events-none" />

          <div className="relative p-6">
            {/* Panel header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white">Live Results</h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">Updates in real-time</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-zinc-300 tabular-nums">
                  {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Chart component with view switcher */}
            <LiveResults
              results={results}
              totalVotes={totalVotes}
              isClosed={isClosed}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
