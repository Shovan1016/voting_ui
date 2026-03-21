"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/lib/auth";

/**
 * Connects to the Socket.IO server, joins the poll room on mount,
 * and leaves the room + disconnects on unmount.
 */
export function usePollSocket(pollId: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!pollId) return;

    const token = getToken();
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { token }, // token without "Bearer" prefix
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join_poll_room", pollId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Cleanup: leave room and disconnect on unmount
    return () => {
      socket.emit("leave_poll_room", pollId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [pollId]);

  return socketRef;
}
