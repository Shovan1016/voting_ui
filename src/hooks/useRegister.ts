import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
}

export function useRegister() {
  const router = useRouter();

  return useMutation<void, Error, RegisterPayload>({
    mutationFn: async (payload) => {
      await api.post("/users/register", payload);
    },
    onSuccess: () => {
      router.push("/login");
    },
  });
}
