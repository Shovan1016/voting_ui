import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

export function useLogin() {
  const router = useRouter();

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<LoginResponse>("/users/login", payload);
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      router.push("/");
    },
  });
}
