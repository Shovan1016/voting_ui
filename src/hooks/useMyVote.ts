import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface MyVoteResponse {
  voted: boolean;
  optionId: number | null;
}

/**
 * Fetches whether the current user has already voted on a given poll,
 * and which option they selected.
 * GET /polls/:id/myVote
 */
export function useMyVote(pollId: number | null) {
  return useQuery<MyVoteResponse>({
    queryKey: ["myVote", pollId],
    queryFn: async () => {
      const { data } = await api.get(`/polls/${pollId}/myVote`);
      return data as MyVoteResponse;
    },
    enabled: pollId !== null,
  });
}
