"use client";

import { useQuery } from "@tanstack/react-query";
import { ServerCrash, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

type HealthResponse = {
  status: "healthy" | "degraded";
  services: {
    database: "ok" | "down";
    redis: "ok" | "down";
    rabbitmq: "ok" | "down";
  };
  timestamp: string;
};

const fetchHealth = async (): Promise<HealthResponse> => {
  const { data } = await api.get<HealthResponse>("/health");
  return data;
};

export default function HealthCheckAlert() {
  const { data, isError, error, isFetching } = useQuery({
    queryKey: ["serverHealth"],
    queryFn: fetchHealth,
    refetchInterval: 15000, // Poll every 15 seconds
    retry: 2,
  });

  const isDegraded = data?.status === "degraded";
  const isDown = isError || isDegraded;

  return (
    <AnimatePresence>
      {isDown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-red-500/50 shadow-2xl shadow-red-500/10"
          >
            {/* Header */}
            <div className="bg-red-500/10 p-6 flex flex-col items-center border-b border-red-500/20 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <ServerCrash className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Service Unavailable</h2>
              <p className="text-slate-300 text-sm">
                Our servers are currently experiencing issues. Please wait while we resolve this.
              </p>
            </div>

            {/* Loading / Error States */}
            <div className="p-6 bg-slate-800/50">
              <div className="flex flex-col items-center justify-center space-y-3">
                {isFetching && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking server health...</span>
                  </div>
                )}
                {isError && !data && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center w-full">
                    Failed to connect to backend API completely. Retrying automatically...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
