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

export function usePollDetail(id: number | null) {
  return useQuery<PollDetail>({
    queryKey: ["pollDetail", id],
    queryFn: async () => {
      const { data } = await api.get(`/polls/getPoll/${id}`);
      return data?.pool;
    },
    enabled: id !== null,
  });
}
