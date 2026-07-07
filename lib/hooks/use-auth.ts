import { authService } from "@/lib/services/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SESSION_KEY = ["auth", "session"];

export const useSession = () =>
  useQuery({
    queryKey: SESSION_KEY,
    queryFn: () => authService.getSession(),
    staleTime: 60 * 1000,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(SESSION_KEY, data);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(SESSION_KEY, data);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(SESSION_KEY, { user: null });
    },
  });
};
