import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

interface ChangeVotePayload {
  pollId: number;
  optionId: number;
}

/**
 * Changes the user's existing vote.
 * PUT /polls/:id/vote  { optionId }
 * Backend responds 202 Accepted — real-time update arrives via socket.
 */
export function useChangeVote() {
  return useMutation({
    mutationFn: async ({ pollId, optionId }: ChangeVotePayload) => {
      const { data } = await api.put(`/polls/${pollId}/vote`, { optionId });
      return data;
    },
  });
}
