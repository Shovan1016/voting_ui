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
    "from-purple-500 to-purple-600",
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
    "from-rose-500 to-rose-600",
    "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
  ];

  const BG_COLORS = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-pink-500",
    "bg-indigo-500",
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
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Error
  if (isError || !poll) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-sm text-red-400 mb-4">Failed to load poll.</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
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
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleShare}
          className="relative flex items-center gap-2 text-sm text-zinc-400 hover:text-purple-400 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share
          {copied && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] text-purple-400 bg-zinc-800 px-2 py-0.5 rounded-md"
            >
              Copied!
            </motion.span>
          )}
        </button>
      </div>

      {/* Poll header card */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-xl rounded-2xl p-6 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
          {poll.question}
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          {poll.notes && (
            <div className="flex items-center gap-1.5 text-zinc-500">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs">{poll.notes}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-600" />
            <span
              className={`text-xs font-medium ${isClosed ? "text-red-400" : "text-emerald-400"
                }`}
            >
              {timeLeft()}
            </span>
          </div>
        </div>
      </div>

      {/* Tab switcher — hidden in viewOnly mode */}
      {!viewOnly && (
        <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800/50 rounded-xl mb-6 w-fit">
          <button
            onClick={() => setActiveTab("vote")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "vote"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "text-zinc-400 hover:text-white"
              }`}
          >
            <Vote className="h-3.5 w-3.5" />
            Vote
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "results"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "text-zinc-400 hover:text-white"
              }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Results
          </button>
        </div>
      )}

      {/* Two-column layout — vote panel hidden in viewOnly mode */}
      <div className={`grid gap-6 ${viewOnly ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        {/* Vote Panel — hidden in viewOnly mode */}
        {!viewOnly && (
          <div className="bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-xl rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Vote className="h-4 w-4 text-purple-400" />
              Cast Your Vote
            </h2>

            {/* Success banner — only when just voted or vote confirmed */}
            {hasVoted && !isClosed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">
                  You voted! Select a different option to change, or withdraw below.
                </span>
              </motion.div>
            )}

            {/* Error banner */}
            {voteError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">
                  {(voteErrorData as Error)?.message ?? "Failed to submit vote. Please try again."}
                </span>
              </motion.div>
            )}

            {/* Closed banner */}
            {isClosed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <Clock className="h-4 w-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">
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
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => {
                          if (!isClosed && !isVoting && !isChanging && !isWithdrawing)
                            setSelectedOption(option.id);
                        }}
                        disabled={isClosed || isVoting || isChanging || isWithdrawing}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 ${isSelected
                            ? "border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/5"
                            : "border-zinc-800/50 bg-zinc-800/20 hover:border-zinc-700/60 hover:bg-zinc-800/40"
                          } ${isClosed || isVoting || isChanging || isWithdrawing
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Radio indicator */}
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected
                                ? "border-purple-500 bg-purple-500"
                                : "border-zinc-600"
                              }`}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-2 w-2 rounded-full bg-white"
                              />
                            )}
                          </div>

                          <span
                            className={`text-sm font-medium ${isSelected ? "text-purple-200" : "text-zinc-300"
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
              // First-time vote button
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={handleVote}
                disabled={selectedOption === null || isVoting}
                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${selectedOption !== null && !isVoting
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
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
                {/* Change vote — only active when a DIFFERENT option is selected */}
                <button
                  onClick={handleChangeVote}
                  disabled={selectedOption === votedOptionId || selectedOption === null || isChanging || isWithdrawing}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    selectedOption !== votedOptionId && selectedOption !== null && !isChanging && !isWithdrawing
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  {isChanging ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Changing…</>
                  ) : (
                    <><Vote className="h-4 w-4" />Change Vote</>
                  )}
                </button>

                {/* Withdraw vote */}
                <button
                  onClick={handleWithdrawVote}
                  disabled={isWithdrawing || isChanging}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all border ${
                    !isWithdrawing && !isChanging
                      ? "border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60"
                      : "border-zinc-700 text-zinc-600 cursor-not-allowed"
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
        <div className="bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-xl rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            Live Results
          </h2>
          <p className="text-xs text-zinc-600 mb-5">
            {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
          </p>

          <div className="space-y-4">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${BG_COLORS[i % BG_COLORS.length]
                          }`}
                      />
                      <span className="text-sm text-zinc-300 font-medium">
                        {result.option}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        {result.votes} vote{result.votes !== 1 ? "s" : ""}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-3 rounded-full bg-zinc-800/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full bg-gradient-to-r ${COLORS[i % COLORS.length]
                        }`}
                    />
                  </div>
                </motion.div>
              );
            })}

            {totalVotes === 0 && (
              <p className="text-xs text-zinc-600 text-center py-6">
                No votes yet — be the first!
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-3">
            {sortedResults.map((result, i) => (
              <div key={result.id} className="flex items-center gap-1.5">
                <div
                  className={`h-2 w-2 rounded-full ${BG_COLORS[i % BG_COLORS.length]
                    }`}
                />
                <span className="text-[11px] text-zinc-500">
                  {result.option}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
