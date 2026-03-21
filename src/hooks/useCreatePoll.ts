import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface CreatePollPayload {
  question: string;
  notes: string;
  closedAt: string;
}

interface PollResponse {
  message: string;
  poll: Array<{
    id: number;
    question: string;
    notes: string;
    closedAt: string;
  }>;
}

interface AddOptionsPayload {
  pollId: number;
  options: Array<{
    option: string;
    displayOrder: number;
  }>;
}

// Create poll + add options in one seamless mutation
export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation<
    PollResponse,
    Error,
    { poll: CreatePollPayload; options: string[] }
  >({
    mutationFn: async ({ poll, options }) => {
      // Step 1: Create the poll
      const { data } = await api.post<PollResponse>("/polls/createPoll", poll);
      const pollId = data.poll[0].id;

      // Step 2: Add options using the returned poll ID
      const optionsPayload: AddOptionsPayload["options"] = options.map(
        (opt, i) => ({
          option: opt,
          displayOrder: i,
        })
      );

      await api.post(`/options/add-multiple-options/${pollId}`, {
        options: optionsPayload,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPolls"] });
    },
  });
}
