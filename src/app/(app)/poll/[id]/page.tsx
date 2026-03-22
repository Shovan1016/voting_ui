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
  Radio,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePollDetail } from "@/hooks/usePollDetail";
import type { PollTotals } from "@/hooks/usePollDetail";
import { useVote } from "@/hooks/useVote";
import { useMyVote } from "@/hooks/useMyVote";
import { useChangeVote } from "@/hooks/useChangeVote";
import { useWithdrawVote } from "@/hooks/useWithdrawVote";

export default function PollPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pollId = params?.id ? Number(params.id) : null;
  const pollIdStr = params?.id ? String(params.id) : null;
  const initialTab = searchParams.get("tab") === "results" ? "results" : "vote";
  const viewOnly = searchParams.get("viewOnly") === "true";

  const { data, isLoading, isError } = usePollDetail(pollId);
  const poll = data?.poll;

  // Real vote totals state — seeded from API, updated live via socket
  const [totals, setTotals] = useState<PollTotals>({});
  useEffect(() => {
    if (data?.totals) setTotals(data.totals);
  }, [data?.totals]);

  const [closedOverride, setClosedOverride] = useState(false);

  // Check if the current user already voted on this poll
  const { data: myVote } = useMyVote(pollId);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  // votedOptionId tracks which option the user last confirmed (for detecting a change)
  const [votedOptionId, setVotedOptionId] = useState<number | null>(null);
  // Sync prior vote state once the myVote query resolves
  useEffect(() => {
    if (myVote?.voted && myVote.optionId !== null) {
      setHasVoted(true);
      setSelectedOption(myVote.optionId);
      setVotedOptionId(myVote.optionId);
    }
  }, [myVote]);

  const [activeTab, setActiveTab] = useState<"vote" | "results">(initialTab);
  const [copied, setCopied] = useState(false);

  // Socket.IO — join poll room, listen for live updates and poll-closed
  const handlePollUpdate = useCallback(
    (update: PollUpdatePayload) => {
      // Convert options array [{id, votes}] → PollTotals map { option_5: 1, ... }
      const newTotals: PollTotals = {};
      for (const opt of update.options) {
        newTotals[`option_${opt.id}`] = opt.votes;
      }
      setTotals(newTotals);
    },
    []
  );

  const handlePollClosed = useCallback(() => {
    setClosedOverride(true);
  }, []);

  usePollSocket(pollIdStr, {
    onPollUpdate: handlePollUpdate,
    onPollClosed: handlePollClosed,
  });

  // Vote mutation (first-time)
  const {
    mutate: submitVote,
    isPending: isVoting,
    isError: voteError,
    error: voteErrorData,
  } = useVote();

  // Change vote mutation
  const { mutate: submitChange, isPending: isChanging } = useChangeVote();

  // Withdraw vote mutation
  const { mutate: submitWithdraw, isPending: isWithdrawing } = useWithdrawVote();

  const isClosed =
    closedOverride ||
    (poll ? poll.closed || new Date(poll.closedAt) < new Date() : false);

  const timeLeft = () => {
    if (!poll) return "";
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

  // Derive sorted results from real totals
  const results = useMemo(() => {
    if (!poll) return [];
    return poll.options.map((opt) => ({
      ...opt,
      votes: totals[`option_${opt.id}`] ?? 0,
    }));
  }, [poll, totals]);

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  const COLORS = [
    "from-violet-500 to-indigo-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-600",
    "from-fuchsia-500 to-purple-600",
    "from-lime-500 to-emerald-600",
    "from-sky-500 to-indigo-600",
  ];

  const BG_COLORS = [
    "bg-violet-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-fuchsia-500",
    "bg-lime-500",
    "bg-sky-500",
  ];

  const handleShare = () => {
    const url = `${window.location.origin}/poll/${pollId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = () => {
    if (selectedOption === null || !pollId) return;
    submitVote(
      { pollId, optionId: selectedOption },
      {
        onSuccess: () => {
          setHasVoted(true);
          setVotedOptionId(selectedOption);
          setActiveTab("results");
        },
      }
    );
  };

  const handleChangeVote = () => {
    if (selectedOption === null || !pollId) return;
    submitChange(
      { pollId, optionId: selectedOption },
      {
        onSuccess: () => {
          setVotedOptionId(selectedOption);
        },
      }
    );
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

  // Loading
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

  // Error
  if (isError || !poll) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7 text-rose-400" />
        </div>
        <p className="text-sm text-red-400 mb-4">Failed to load poll.</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  // Sort results by vote count descending for the results panel
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto"
    >
      {/* Back + Share */}
      <div className="flex items-center justify-between mb-6">
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
          <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-500/10 group-hover:border-violet-500/20 group-hover:scale-105 transition-all">
            <Share2 className="h-4 w-4" />
          </div>
          Share
          {copied && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-3 text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md backdrop-blur-md"
            >
              Copied!
            </motion.span>
          )}
        </button>
      </div>

      {/* Poll header card */}
      <div className="relative glass-card rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isClosed
              ? "bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700"
              : "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500"
          }`}
        />
        
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isClosed
                ? "bg-zinc-800/80 text-zinc-400"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {!isClosed && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {isClosed ? "Ended" : "Live Poll"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
          {poll.question}
        </h1>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {poll.notes && (
            <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <MessageSquare className="h-4 w-4 text-zinc-500" />
              <span className="text-sm">{poll.notes}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <Clock className="h-4 w-4 text-zinc-500" />
            <span
              className={`text-sm font-medium ${
                isClosed ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {timeLeft()}
            </span>
          </div>
        </div>
      </div>

      {/* Tab switcher — hidden in viewOnly mode */}
      {!viewOnly && (
        <div className="flex gap-1 p-1.5 glass-card rounded-xl mb-6 w-fit border-white/5 bg-black/20">
          <button
            onClick={() => setActiveTab("vote")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "vote"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                : "text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95"
            }`}
          >
            <Vote className="h-4 w-4" />
            Vote
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "results"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                : "text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Results
          </button>
        </div>
      )}

      {/* Two-column layout — vote panel hidden in viewOnly mode */}
      <div className={`grid gap-6 ${viewOnly ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 lg:items-start"}`}>
        
        {/* Vote Panel */}
        {!viewOnly && (
          <div className={`relative glass-card rounded-2xl p-6 overflow-hidden transition-all duration-300 ${activeTab === 'vote' ? 'opacity-100 scale-100' : 'hidden lg:block lg:opacity-50 lg:scale-[0.98]'}`}>
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <Vote className="h-3.5 w-3.5" />
              </div>
              Cast Your Vote
            </h2>

            {/* Success banner */}
            {hasVoted && !isClosed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm text-emerald-400 font-medium">
                  You voted! Select a different option to change, or withdraw below.
                </span>
              </motion.div>
            )}

            {/* Error banner */}
            {voteError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
                <span className="text-sm text-red-400 font-medium">
                  {(voteErrorData as Error)?.message ?? "Failed to submit vote."}
                </span>
              </motion.div>
            )}

            {/* Closed banner */}
            {isClosed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-red-400" />
                </div>
                <span className="text-sm text-red-400 font-medium">
                  This poll is closed. Voting is no longer available.
                </span>
              </motion.div>
            )}

            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {poll.options
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((option, i) => {
                    const isSelected = selectedOption === option.id;
                    return (
                      <motion.button // Add motion button here for layout animations
                        key={option.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          if (!isClosed && !isVoting && !isChanging && !isWithdrawing)
                            setSelectedOption(option.id);
                        }}
                        disabled={isClosed || isVoting || isChanging || isWithdrawing}
                        className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 group flex items-center justify-between ${
                          isSelected
                            ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/5 ring-1 ring-violet-500/20"
                            : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                          } ${
                            isClosed || isVoting || isChanging || isWithdrawing
                              ? "opacity-60 cursor-not-allowed"
                              : "cursor-pointer active:scale-[0.99]"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              isSelected
                                ? "border-violet-400 bg-violet-400"
                                : "border-zinc-600 group-hover:border-zinc-500"
                              }`}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-2 w-2 rounded-full bg-[#0d0920]"
                              />
                            )}
                          </div>

                          <span
                            className={`text-sm font-medium transition-colors ${
                              isSelected ? "text-violet-200" : "text-zinc-300 group-hover:text-white"
                              }`}
                          >
                            {option.option}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            {!isClosed && !hasVoted && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={handleVote}
                disabled={selectedOption === null || isVoting}
                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  selectedOption !== null && !isVoting
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 active:scale-[0.98]"
                    : "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5"
                  }`}
              >
                {isVoting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                ) : (
                  <><Vote className="h-4 w-4" />Submit Vote</>
                )}
              </motion.button>
            )}

            {!isClosed && hasVoted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex flex-col gap-3"
              >
                <button
                  onClick={handleChangeVote}
                  disabled={selectedOption === votedOptionId || selectedOption === null || isChanging || isWithdrawing}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                    selectedOption !== votedOptionId && selectedOption !== null && !isChanging && !isWithdrawing
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 active:scale-[0.98]"
                      : "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5"
                  }`}
                >
                  {isChanging ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Changing…</>
                  ) : (
                    <><Vote className="h-4 w-4" />Change Vote</>
                  )}
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
                  {isWithdrawing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Withdrawing…</>
                  ) : (
                    <><AlertCircle className="h-4 w-4" />Withdraw Vote</>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Results Panel */}
        <div className={`relative glass-card rounded-2xl p-6 overflow-hidden transition-all duration-300 ${activeTab === 'results' || viewOnly ? 'opacity-100 scale-100' : 'hidden lg:block lg:opacity-50 lg:scale-[0.98]'}`}>
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5" />
              </div>
              Live Results
            </div>
            
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium normal-case">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
            </div>
          </h2>

          <div className="mt-6 space-y-5">
            {sortedResults.map((result, i) => {
              const pct =
                totalVotes > 0
                  ? Math.round((result.votes / totalVotes) * 100)
                  : 0;
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-3 w-3 rounded-full shadow-lg ${BG_COLORS[i % BG_COLORS.length]
                          } shadow-${BG_COLORS[i % BG_COLORS.length].replace('bg-', '')}/50`}
                      />
                      <span className="text-sm text-zinc-200 font-medium">
                        {result.option}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md">
                        {result.votes}
                      </span>
                      <span className="text-sm font-bold text-white w-9 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-3.5 rounded-full bg-black/40 border border-white/5 overflow-hidden p-[1px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full bg-gradient-to-r relative ${COLORS[i % COLORS.length]
                        }`}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-shimmer" style={{ maskImage: 'linear-gradient(to right, transparent, black, transparent)' }} />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}

            {totalVotes === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <Radio className="h-10 w-10 text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-500">
                  No votes cast yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
