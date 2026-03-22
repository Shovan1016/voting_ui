import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

/**
 * Withdraws the user's existing vote.
 * DELETE /polls/:id/vote
 * Backend responds 202/200 — real-time update arrives via socket.
 */
export function useWithdrawVote() {
  return useMutation({
    mutationFn: async (pollId: number) => {
      const { data } = await api.delete(`/polls/${pollId}/vote`);
      return data;
    },
  });
}
