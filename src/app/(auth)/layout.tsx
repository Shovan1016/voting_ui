"use client";

import { motion } from "framer-motion";

const floatingShapes = [
  { size: 56, color: "from-violet-500/30 to-indigo-500/30", x: "10%", y: "15%", delay: 0, duration: 6 },
  { size: 40, color: "from-cyan-500/25 to-blue-500/25", x: "80%", y: "20%", delay: 1, duration: 7 },
  { size: 32, color: "from-indigo-500/20 to-violet-500/20", x: "70%", y: "70%", delay: 2, duration: 5 },
  { size: 48, color: "from-violet-500/20 to-cyan-500/20", x: "20%", y: "75%", delay: 0.5, duration: 8 },
  { size: 24, color: "from-cyan-400/30 to-indigo-400/30", x: "50%", y: "10%", delay: 1.5, duration: 6 },
  { size: 36, color: "from-indigo-400/25 to-cyan-400/25", x: "90%", y: "50%", delay: 3, duration: 7 },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0618] text-white selection:bg-violet-500/30 flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-violet-900/20 blur-[140px] animate-gradient" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-900/20 blur-[140px] animate-gradient" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-[20%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/15 blur-[120px] animate-gradient" style={{ animationDelay: "4s" }} />
      </div>

      {/* Floating decorative shapes */}
      {floatingShapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${shape.color} backdrop-blur-sm`}
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
          }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, -10, 5, 0],
            scale: [1, 1.15, 0.9, 1.05, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4 py-12">
        {children}
      </div>
    </div>
  );
}
