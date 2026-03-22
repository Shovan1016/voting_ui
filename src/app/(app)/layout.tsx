"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07040f] text-white flex flex-col">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[15%] w-[80vw] h-[80vw] rounded-full bg-violet-900/12 blur-[140px]" />
        <div className="absolute top-[30%] -right-[20%] w-[65vw] h-[65vw] rounded-full bg-indigo-900/10 blur-[130px]" />
        <div className="absolute bottom-[0%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-cyan-900/8 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Body: sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          {/* Add bottom padding on mobile so content clears the bottom nav */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
