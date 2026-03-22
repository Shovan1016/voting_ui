import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

interface VotePayload {
  pollId: number;
  optionId: number;
}

/**
 * Submits a vote to POST /api/polls/:id/vote.
 * The backend returns 202 Accepted — the vote is queued via RabbitMQ,
 * so we do NOT optimistically increment counts here.
 * Real-time updates arrive via the "poll-update" socket event.
 */
export function useVote() {
  return useMutation({
    mutationFn: async ({ pollId, optionId }: VotePayload) => {
      const { data } = await api.post(`/polls/${pollId}/vote`, { optionId });
      return data;
    },
  });
}
