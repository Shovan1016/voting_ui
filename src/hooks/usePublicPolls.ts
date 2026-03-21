import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface PublicPollCreator {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PublicPoll {
  id: number;
  question: string;
  notes: string;
  closedAt: string;
  closed: boolean;
  creator: PublicPollCreator;
}

export function usePublicPolls() {
  return useQuery<PublicPoll[]>({
    queryKey: ["publicPolls"],
    queryFn: async () => {
      const { data } = await api.get("/polls/publicPolls");
      return data?.pools;
    },
  });
}
