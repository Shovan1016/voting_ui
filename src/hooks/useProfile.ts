import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface ProfileResponse {
  user: User;
}

export function useProfile() {
  return useQuery<User>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get<ProfileResponse>("/users/profile");
      return data.user;
    },
    retry: false,
  });
}
