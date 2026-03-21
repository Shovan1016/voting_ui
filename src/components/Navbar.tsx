"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { removeToken } from "@/lib/auth";

export default function Navbar() {
  const { data: user, isLoading } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
    <nav className="h-16 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left — Brand */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tracking-tight text-white">
          🗳️ <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">PollApp</span>
        </span>
      </div>

      {/* Right — Avatar */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full hover:bg-zinc-800/60 px-2 py-1.5 transition-colors"
        >
          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-zinc-800 animate-pulse" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white select-none">
              {initials}
            </div>
          )}
          <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800/60 shadow-2xl overflow-hidden"
            >
              {/* User info */}
              {user && (
                <div className="px-4 py-3 border-b border-zinc-800/60">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                </div>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-zinc-800/60 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
