import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface PollOption {
  id: number;
  pollId: number;
  option: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Vote totals keyed by "option_<id>", e.g. { "option_1": 10, "option_2": 5 } */
export type PollTotals = Record<string, number>;

export interface PollDetail {
  id: number;
  question: string;
  notes: string;
  createdBy: number;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  options: PollOption[];
}

export interface PollDetailResponse {
  poll: PollDetail;
  totals: PollTotals;
}

export function usePollDetail(id: number | null) {
  return useQuery<PollDetailResponse>({
    queryKey: ["pollDetail", id],
    queryFn: async () => {
      const { data } = await api.get(`/polls/getPoll/${id}`);
      return {
        poll: data?.pool as PollDetail,
        totals: (data?.totals ?? {}) as PollTotals,
      };
    },
    enabled: id !== null,
  });
}
