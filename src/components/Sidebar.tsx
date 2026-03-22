"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "from-violet-500 to-indigo-500",
    glow: "shadow-violet-500/40",
    activeBg: "bg-violet-500/10",
    activeText: "text-violet-300",
    dot: "bg-violet-400",
  },
  {
    href: "/worlds",
    label: "Worlds",
    icon: Globe,
    color: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/40",
    activeBg: "bg-cyan-500/10",
    activeText: "text-cyan-300",
    dot: "bg-cyan-400",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0612]/60 backdrop-blur-2xl">
        {/* Nav links */}
        <nav className="flex flex-col gap-1.5 px-3 pt-5">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="group relative">
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className={`absolute inset-0 rounded-xl ${link.activeBg}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <div
                  className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 ${
                    isActive
                      ? `${link.activeText}`
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Icon with gradient when active */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-br ${link.color} shadow-lg ${link.glow}`
                        : "bg-white/[0.05] group-hover:bg-white/[0.08]"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                  {isActive && (
                    <div
                      className={`ml-auto h-1.5 w-1.5 rounded-full ${link.dot}`}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom decoration */}
        <div className="mt-auto px-4 pb-5">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">
              PollApp
            </p>
            <p className="text-[11px] text-zinc-700">
              Realtime polls &amp; insights
            </p>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] bg-[#0a0612]/90 backdrop-blur-2xl px-2 py-2 safe-b">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-1 px-5 py-1.5 group"
            >
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-br ${link.color} shadow-lg ${link.glow}`
                    : "bg-white/[0.05] group-active:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5 text-white" />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-blob"
                    className="absolute -inset-1 rounded-2xl bg-white/10 -z-10"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? link.activeText : "text-zinc-600"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
