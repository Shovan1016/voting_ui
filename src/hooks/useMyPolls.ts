import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Poll {
  id: number;
  question: string;
  notes: string;
  closedAt: string;
  closed: boolean;
}

export function useMyPolls() {
  return useQuery<Poll[]>({
    queryKey: ["myPolls"],
    queryFn: async () => {
      const { data } = await api.get<Poll[]>("/polls/myPolls");
      return data?.pools
        ;
    },
  });
}
