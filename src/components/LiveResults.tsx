"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlignLeft, PieChart, BarChart2, Sparkles, Radio } from "lucide-react";

// Shared color palette — exported so the vote panel can use the same colors
export const OPTION_COLORS = [
  { bar: "from-violet-500 to-indigo-600",  bg: "bg-violet-500/10",  border: "border-violet-500/40",  ring: "ring-violet-500/30",  text: "text-violet-300",  dot: "bg-violet-400",  glow: "shadow-violet-500/30",  hex: "#7c3aed" },
  { bar: "from-cyan-500 to-blue-600",      bg: "bg-cyan-500/10",    border: "border-cyan-500/40",    ring: "ring-cyan-500/30",    text: "text-cyan-300",    dot: "bg-cyan-400",    glow: "shadow-cyan-500/30",    hex: "#06b6d4" },
  { bar: "from-emerald-500 to-teal-600",   bg: "bg-emerald-500/10", border: "border-emerald-500/40", ring: "ring-emerald-500/30", text: "text-emerald-300", dot: "bg-emerald-400", glow: "shadow-emerald-500/30", hex: "#10b981" },
  { bar: "from-amber-500 to-orange-500",   bg: "bg-amber-500/10",   border: "border-amber-500/40",   ring: "ring-amber-500/30",   text: "text-amber-300",   dot: "bg-amber-400",   glow: "shadow-amber-500/30",   hex: "#f59e0b" },
  { bar: "from-rose-500 to-pink-600",      bg: "bg-rose-500/10",    border: "border-rose-500/40",    ring: "ring-rose-500/30",    text: "text-rose-300",    dot: "bg-rose-400",    glow: "shadow-rose-500/30",    hex: "#f43f5e" },
  { bar: "from-fuchsia-500 to-purple-600", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/40", ring: "ring-fuchsia-500/30", text: "text-fuchsia-300", dot: "bg-fuchsia-400", glow: "shadow-fuchsia-500/30", hex: "#d946ef" },
  { bar: "from-lime-500 to-emerald-600",   bg: "bg-lime-500/10",    border: "border-lime-500/40",    ring: "ring-lime-500/30",    text: "text-lime-300",    dot: "bg-lime-400",    glow: "shadow-lime-500/30",    hex: "#84cc16" },
  { bar: "from-sky-500 to-indigo-600",     bg: "bg-sky-500/10",     border: "border-sky-500/40",     ring: "ring-sky-500/30",     text: "text-sky-300",     dot: "bg-sky-400",     glow: "shadow-sky-500/30",     hex: "#0ea5e9" },
];

export interface ResultItem {
  id: number;
  option: string;
  votes: number;
  displayOrder: number;
}

type ColoredItem = ResultItem & { colorIndex: number };
type ViewType = "bars" | "donut" | "columns";

// ─── Bars View ────────────────────────────────────────────────────────────────
function BarsView({
  items,
  totalVotes,
  leaderId,
}: {
  items: ColoredItem[];
  totalVotes: number;
  leaderId: number | null;
}) {
  return (
    <div className="space-y-4">
      {items.map((result, i) => {
        const pct = totalVotes > 0 ? Math.round((result.votes / totalVotes) * 100) : 0;
        const isLeader = result.id === leaderId;
        const color = OPTION_COLORS[result.colorIndex % OPTION_COLORS.length];
        return (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${color.dot}`} />
                <span className={`text-sm font-medium truncate ${isLeader ? "text-white" : "text-zinc-300"}`}>
                  {result.option}
                </span>
                {isLeader && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 shrink-0">
                    <Sparkles className="h-2.5 w-2.5" />
                    Leading
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-[11px] font-semibold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md tabular-nums">
                  {result.votes}
                </span>
                <span className={`text-sm font-bold w-9 text-right tabular-nums ${isLeader && totalVotes > 0 ? color.text : "text-zinc-400"}`}>
                  {pct}%
                </span>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-black/40 border border-white/[0.04] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.85, delay: i * 0.09, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${color.bar} relative`}
              >
                <div className="absolute inset-0 animate-shimmer" />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Donut View ───────────────────────────────────────────────────────────────
function DonutView({
  items,
  totalVotes,
}: {
  items: ColoredItem[];
  totalVotes: number;
}) {
  const CX = 60, CY = 60, R = 44;
  const C = 2 * Math.PI * R; // ≈ 276.46

  // Two-frame trick: render at 0 first, then transition to final values
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Compute segment offsets based on final values so positions are always correct
  const segments = useMemo(() => {
    let offset = 0;
    return items.map((result) => {
      const segLen = totalVotes > 0 ? (result.votes / totalVotes) * C : 0;
      const dashOffset = -offset;
      offset += segLen;
      return { ...result, segLen, dashOffset };
    });
  }, [items, totalVotes, C]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* SVG Donut */}
      <div className="relative">
        <svg viewBox="0 0 120 120" className="w-48 h-48">
          {/* Track ring */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={20}
          />
          <g transform={`rotate(-90, ${CX}, ${CY})`}>
            {segments.map((seg) => {
              const color = OPTION_COLORS[seg.colorIndex % OPTION_COLORS.length];
              return (
                <circle
                  key={seg.id}
                  cx={CX} cy={CY} r={R}
                  fill="none"
                  stroke={color.hex}
                  strokeWidth={20}
                  strokeLinecap="butt"
                  strokeDasharray={ready ? `${seg.segLen} ${C - seg.segLen}` : `0 ${C}`}
                  strokeDashoffset={seg.dashOffset}
                  style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.23,1,0.32,1)" }}
                />
              );
            })}
          </g>
          {/* Inner glow ring */}
          <circle cx={CX} cy={CY} r={R - 10} fill="rgba(0,0,0,0.35)" />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white tabular-nums"
          >
            {totalVotes}
          </motion.span>
          <span className="text-[11px] text-zinc-500 font-medium">votes</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 w-full">
        {items.map((result) => {
          const pct = totalVotes > 0 ? Math.round((result.votes / totalVotes) * 100) : 0;
          const color = OPTION_COLORS[result.colorIndex % OPTION_COLORS.length];
          return (
            <div key={result.id} className="flex items-center gap-2 min-w-0">
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${color.dot}`} />
              <span className="text-xs text-zinc-400 truncate flex-1">{result.option}</span>
              <span className={`text-xs font-bold tabular-nums shrink-0 ${color.text}`}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Columns View ─────────────────────────────────────────────────────────────
const BAR_MAX_H = 140;

function ColumnsView({
  items,
  totalVotes,
  leaderId,
}: {
  items: ColoredItem[];
  totalVotes: number;
  leaderId: number | null;
}) {
  const maxVotes = useMemo(() => items.reduce((m, r) => Math.max(m, r.votes), 0), [items]);

  return (
    <div className="w-full overflow-x-auto pb-2 -mb-1">
      <div
        className="flex items-end justify-center gap-3 px-2 mx-auto"
        style={{ minWidth: `${items.length * 64}px`, height: `${BAR_MAX_H + 72}px` }}
      >
        {items.map((result, i) => {
          const pct = totalVotes > 0 ? Math.round((result.votes / totalVotes) * 100) : 0;
          const barH = maxVotes > 0 ? Math.round((result.votes / maxVotes) * BAR_MAX_H) : 0;
          const isLeader = result.id === leaderId;
          const color = OPTION_COLORS[result.colorIndex % OPTION_COLORS.length];

          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="flex flex-col items-center gap-1 flex-1"
              style={{ maxWidth: "72px", minWidth: "48px" }}
            >
              {/* Percentage */}
              <span className={`text-xs font-bold tabular-nums ${isLeader && totalVotes > 0 ? color.text : "text-zinc-500"}`}>
                {pct}%
              </span>

              {/* Bar + container */}
              <div className="flex items-end w-full" style={{ height: `${BAR_MAX_H}px` }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(barH, barH > 0 ? 6 : 0) }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                  className={`w-full rounded-t-xl bg-gradient-to-t ${color.bar} relative overflow-hidden shadow-lg ${isLeader && totalVotes > 0 ? color.glow : ""}`}
                >
                  <div className="absolute inset-0 animate-shimmer" />
                  {isLeader && totalVotes > 0 && barH > 20 && (
                    <div className="absolute top-2 inset-x-0 flex justify-center">
                      <Sparkles className="h-3 w-3 text-white/60" />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Vote count */}
              <span className="text-[11px] font-semibold text-zinc-500 tabular-nums">{result.votes}</span>

              {/* Label */}
              <span
                className="text-[10px] text-zinc-600 text-center leading-tight w-full truncate px-0.5"
                title={result.option}
              >
                {result.option}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface LiveResultsProps {
  results: ResultItem[];
  totalVotes: number;
  isClosed: boolean;
}

const VIEWS: { key: ViewType; icon: React.ReactNode; label: string }[] = [
  { key: "bars",    icon: <AlignLeft className="h-3.5 w-3.5" />, label: "Bars"    },
  { key: "donut",   icon: <PieChart  className="h-3.5 w-3.5" />, label: "Donut"   },
  { key: "columns", icon: <BarChart2 className="h-3.5 w-3.5" />, label: "Columns" },
];

export default function LiveResults({ results, totalVotes }: LiveResultsProps) {
  const [view, setView] = useState<ViewType>("bars");

  // Stable color index based on displayOrder so colors never jump around
  const coloredResults = useMemo(
    () =>
      [...results]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((r, i) => ({ ...r, colorIndex: i })),
    [results]
  );

  // Sort by votes descending for display
  const sortedItems = useMemo(
    () => [...coloredResults].sort((a, b) => b.votes - a.votes),
    [coloredResults]
  );

  const leaderId = totalVotes > 0 ? (sortedItems[0]?.id ?? null) : null;

  return (
    <div>
      {/* View switcher */}
      <div className="flex items-center gap-1 p-1 bg-black/30 rounded-xl border border-white/[0.06] w-fit">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              view === v.key
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-5">
        <AnimatePresence mode="wait">
          {totalVotes === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <div className="animate-float">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/5 flex items-center justify-center">
                  <Radio className="h-7 w-7 text-zinc-600" />
                </div>
              </div>
              <p className="text-sm font-semibold text-zinc-500">No votes yet</p>
              <p className="text-xs text-zinc-700">Be the first to vote!</p>
            </motion.div>
          ) : view === "bars" ? (
            <motion.div
              key="bars"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <BarsView items={sortedItems} totalVotes={totalVotes} leaderId={leaderId} />
            </motion.div>
          ) : view === "donut" ? (
            <motion.div
              key="donut"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <DonutView items={sortedItems} totalVotes={totalVotes} />
            </motion.div>
          ) : (
            <motion.div
              key="columns"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <ColumnsView items={sortedItems} totalVotes={totalVotes} leaderId={leaderId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
