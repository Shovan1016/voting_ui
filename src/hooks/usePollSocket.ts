"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/lib/auth";
import type { PollTotals } from "./usePollDetail";

export interface PollUpdateOption {
  id: number;
  text: string;
  votes: number;
}

export interface PollUpdatePayload {
  pollId: number;
  options: PollUpdateOption[];
  total: number; // grand total count
}

interface UsePollSocketOptions {
  onPollUpdate?: (data: PollUpdatePayload) => void;
  onPollClosed?: () => void;
}

/**
 * Connects to the Socket.IO server, joins the poll room on mount,
 * and leaves the room + disconnects on unmount.
 *
 * Events:
 *  - emit  "join-poll"   → backend creates room "poll:<id>"
 *  - listen "poll-update" → { pollId, options, total } — new vote totals
 *  - listen "poll-closed" → poll has been closed by the author
 */
export function usePollSocket(
  pollId: string | null,
  { onPollUpdate, onPollClosed }: UsePollSocketOptions = {}
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!pollId) return;

    const token = getToken();
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-poll", pollId);
    });

    socket.on("poll-update", (data: PollUpdatePayload) => {
      console.log("poll-update received:", data);
      onPollUpdate?.(data);
    });

    socket.on("poll-closed", () => {
      console.log("poll-closed received");
      onPollClosed?.();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.emit("leave-poll", pollId);
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId]);

  return socketRef;
}
