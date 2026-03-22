"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown, Bell, Sparkles, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { removeToken } from "@/lib/auth";

export default function Navbar() {
  const { data: user, isLoading } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "??";

  const handleLogout = () => {
    removeToken();
    router.replace("/login");
  };

  return (
    <nav className="h-16 sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-[#07040f]/80 backdrop-blur-2xl">
      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-500 shadow-lg shadow-violet-500/30 animate-pulse-glow">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 animate-gradient">
            PollApp
          </span>
        </span>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all duration-200">
          <Bell className="h-4.5 w-4.5" />
          {/* Red dot */}
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 ring-2 ring-[#07040f]" />
        </button>

        {/* Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl hover:bg-white/[0.06] px-1.5 py-1 transition-all duration-200 group"
          >
            {isLoading ? (
              <div className="h-8 w-8 rounded-xl bg-white/10 animate-pulse" />
            ) : (
              <div className="relative h-8 w-8 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-violet-500/40 transition-all duration-200">
                {/* Gradient avatar */}
                <div className="h-full w-full bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-white select-none">
                  {initials}
                </div>
                {/* Shimmer overlay */}
                <div className="absolute inset-0 animate-shimmer opacity-50" />
              </div>
            )}
            <ChevronDown
              className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-300 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/[0.08] bg-[#0d0920]/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden"
              >
                {/* User info */}
                {user && (
                  <div className="px-4 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile link */}
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-150">
                  <div className="h-6 w-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  My Profile
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/[0.08] transition-all duration-150 border-t border-white/[0.04]"
                >
                  <div className="h-6 w-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <LogOut className="h-3.5 w-3.5" />
                  </div>
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
